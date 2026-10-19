// Claude (Anthropic) on the Lovable AI Gateway.
//
// The gateway serves Claude models ONLY on `/v1/messages` with the native
// Anthropic request/response format — `/v1/chat/completions` rejects them.
// This module adapts the project's OpenAI-shaped call sites to that format
// and converts Anthropic streaming SSE back into the OpenAI chunk format the
// browser already parses (ChatDemo and widget.js both read
// `choices[0].delta.content`), so client code stays untouched.

const MESSAGES_URL = "https://ai.gateway.lovable.dev/v1/messages";

export function claudeHeaders(apiKey: string): Record<string, string> {
  return {
    "Lovable-API-Key": apiKey,
    "X-Lovable-AIG-SDK": "supabase-edge-function",
    "Content-Type": "application/json",
  };
}

type OpenAIMessage = {
  role: string;
  content?: unknown;
  tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[];
  tool_call_id?: string;
};

export type OpenAITool = {
  type: "function";
  function: { name: string; description?: string; parameters: unknown };
};

export type ClaudeRequestOptions = {
  model: string;
  /** System prompt (extracted from messages is also supported). */
  system?: string;
  messages: OpenAIMessage[];
  tools?: OpenAITool[];
  /** "auto" (default) or force a specific tool. */
  toolChoice?: "auto" | { toolName: string };
  maxTokens?: number;
  stream?: boolean;
  /** Add prompt caching on the system prompt (large, reused prompts). */
  cacheSystem?: boolean;
};

/**
 * Build a native Anthropic `/v1/messages` request from OpenAI-shaped inputs.
 * Converts system messages, assistant tool_calls and tool results into the
 * Anthropic block format. Never throws on malformed tool arguments.
 */
export function buildClaudeRequest(
  apiKey: string,
  opts: ClaudeRequestOptions,
): { url: string; headers: Record<string, string>; body: Record<string, unknown> } {
  const systemParts: string[] = [];
  if (opts.system) systemParts.push(opts.system);

  type AnthMsg = { role: "user" | "assistant"; content: unknown };
  const messages: AnthMsg[] = [];

  const pushUserText = (text: string) => {
    const last = messages[messages.length - 1];
    // Merge consecutive user text turns (Anthropic expects clean alternation).
    if (
      last &&
      last.role === "user" &&
      Array.isArray(last.content) &&
      last.content.every((b) => (b as { type?: string }).type === "text")
    ) {
      (last.content as { type: string; text: string }[]).push({ type: "text", text });
    } else {
      messages.push({ role: "user", content: [{ type: "text", text }] });
    }
  };

  for (const m of opts.messages) {
    if (m.role === "system") {
      if (typeof m.content === "string" && m.content) systemParts.push(m.content);
      continue;
    }
    if (m.role === "user") {
      pushUserText(typeof m.content === "string" ? m.content : String(m.content ?? ""));
      continue;
    }
    if (m.role === "assistant") {
      const blocks: Record<string, unknown>[] = [];
      if (typeof m.content === "string" && m.content) {
        blocks.push({ type: "text", text: m.content });
      }
      for (const call of m.tool_calls ?? []) {
        let input: unknown = {};
        try {
          input = JSON.parse(call.function?.arguments || "{}");
        } catch {
          input = {};
        }
        blocks.push({ type: "tool_use", id: call.id ?? "", name: call.function?.name ?? "", input });
      }
      if (blocks.length) messages.push({ role: "assistant", content: blocks });
      continue;
    }
    if (m.role === "tool") {
      const block = { type: "tool_result", tool_use_id: m.tool_call_id ?? "", content: String(m.content ?? "") };
      const last = messages[messages.length - 1];
      if (
        last &&
        last.role === "user" &&
        Array.isArray(last.content) &&
        last.content.every((b) => (b as { type?: string }).type === "tool_result")
      ) {
        (last.content as Record<string, unknown>[]).push(block);
      } else {
        messages.push({ role: "user", content: [block] });
      }
      continue;
    }
    pushUserText(typeof m.content === "string" ? m.content : String(m.content ?? ""));
  }

  const body: Record<string, unknown> = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4096,
    messages,
  };
  if (systemParts.length) {
    const text = systemParts.join("\n\n");
    body.system = opts.cacheSystem
      ? [{ type: "text", text, cache_control: { type: "ephemeral" } }]
      : text;
  }
  if (opts.tools && opts.tools.length) {
    body.tools = opts.tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
    body.tool_choice =
      typeof opts.toolChoice === "object"
        ? { type: "tool", name: opts.toolChoice.toolName }
        : { type: "auto" };
  }
  if (opts.stream) body.stream = true;

  return { url: MESSAGES_URL, headers: claudeHeaders(apiKey), body };
}

export type ParsedClaudeToolCall = { id: string; function: { name: string; arguments: string } };

export type ParsedClaudeMessage = {
  text: string;
  /** OpenAI-shaped tool calls so downstream tool loops need no changes. */
  toolCalls: ParsedClaudeToolCall[];
  stopReason: string | null;
};

/** Parse a non-streaming Anthropic response into text + OpenAI-style tool calls. */
export function parseClaudeMessage(data: unknown): ParsedClaudeMessage {
  const d = data as { content?: Array<Record<string, unknown>>; stop_reason?: string } | null;
  const text: string[] = [];
  const toolCalls: ParsedClaudeToolCall[] = [];
  for (const block of d?.content ?? []) {
    if (block?.type === "text" && typeof block.text === "string") text.push(block.text);
    else if (block?.type === "tool_use") {
      toolCalls.push({
        id: String(block.id ?? ""),
        function: {
          name: String(block.name ?? ""),
          arguments: JSON.stringify(block.input ?? {}),
        },
      });
    }
  }
  return { text: text.join(""), toolCalls, stopReason: d?.stop_reason ?? null };
}

/**
 * Convert an Anthropic streaming response (SSE events) into the OpenAI chunk
 * SSE format (`data: {"choices":[{"delta":{"content":...}}]}`, ending with
 * `data: [DONE]`) so existing browser parsers keep working unchanged.
 */
export function anthropicSseToOpenAiStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const openAiChunk = (delta: Record<string, unknown>) =>
    encoder.encode(`data: ${JSON.stringify({ choices: [{ delta }] })}\n\n`);

  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).replace(/\r$/, "");
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt?.type === "content_block_delta" && evt.delta?.type === "text_delta" && evt.delta.text) {
              controller.enqueue(openAiChunk({ content: evt.delta.text }));
            } else if (evt?.type === "message_stop") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          } catch {
            // Non-JSON or partial line — ignore.
          }
        }
      },
    }),
  );
}
