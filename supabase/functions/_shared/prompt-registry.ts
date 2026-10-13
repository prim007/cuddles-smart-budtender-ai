// ── Prompt management (AdalFlow-style, in TypeScript) ──────────────────
// One versioned place where every prompt block lives, so prompts can be
// changed, versioned and measured without touching orchestration code.
//
// Bump PROMPT_VERSION whenever any block below changes. The version is
// stamped on responses (X-Cuddles-Prompt-Version) and logged with block
// sizes, so traces can be attributed to an exact prompt build.

export const PROMPT_VERSION = "2026-10-13.1";

/** Named block that can be toggled/ordered when composing a system prompt. */
export type PromptBlock = { name: string; content: string };

export const ANSWER_QUALITY_DIRECTIVES = `

═══════════════════════════════════════
ANSWER QUALITY DIRECTIVES (apply to every response)
═══════════════════════════════════════
1. SUMMARISE FIRST — open with a 1–2 sentence plain-language summary that directly answers the question. Never open with background or disclaimers.
2. KEEP IT SHORT — default to under 120 words. Use short bullets (one idea each, max ~15 words) instead of paragraphs. No paragraph longer than 2 sentences. Only go longer if the user asks for more detail.
3. BE SPECIFIC — use a useful number, observation, or example when the knowledge base supports it. Never add precision just to sound expert.
4. CORRECT MYTHS gently: (a) indica/sativa is horticultural shorthand — chemotype + terpene profile predicts effect; (b) hemp SEED oil ≠ CBD oil; (c) CBN's sedation is weaker than marketing claims.
5. MAKE IT EASY TO SCAN — at most three short markdown sections. For practical questions, prefer **What to do now**, **What to watch for**, and **When to get help**. Use a table only for a genuinely useful comparison (max four columns).
6. EXPLAIN IN LAYERS — everyday explanation first; add a short **Why this matters** only when the science improves the decision. Offer depth instead of dumping it.
7. GROUND health-adjacent claims in evidence tiers ("strong evidence base", "emerging evidence") — never fabricate studies, authors, or p-values.
8. DEFAULT TO SAFETY: start low / go slow, never encourage BHO at home, no medical/legal advice, add "general education, not medical advice" once for health or dosing questions.
9. IF UNCERTAIN, say so plainly. Separate known facts, reasonable possibilities, and missing information.
10. FOR ANY strain request phrased as a feeling, symptom, occasion or vibe, run the STRAIN MATCHING ENGINE protocol and answer in its presentation shape.
11. USE THE KNOWLEDGE BASES actively. Pull the specific mechanism or number instead of paraphrasing generically.
12. ACCESSIBLE CHAT STYLE — no walls of text, all-caps emphasis, emoji chains, or repeated disclaimers. Define an acronym the first time.
13. CHECK UNDERSTANDING — end every explanatory answer with ONE short, friendly check-in on its own line, e.g. "Does that make sense, or would you like me to explain it more simply?" or "Want an example, or a shorter version?" Skip it for greetings, one-line factual replies, or when the user just said they understood. If the user says they don't understand, re-explain more simply with an everyday analogy and fewer words — never repeat the same wording.
`;


/**
 * Compose a system prompt from named blocks.
 * Empty blocks are dropped; a compact size report is logged so prompt
 * bloat (a top cost/latency driver) is visible in edge function logs.
 */
export function composeSystemPrompt(
  blocks: PromptBlock[],
  meta: Record<string, unknown> = {},
): { prompt: string; version: string; chars: number } {
  const used = blocks.filter((b) => b.content && b.content.trim().length > 0);
  const prompt = used.map((b) => b.content).join("");
  const report = Object.fromEntries(used.map((b) => [b.name, b.content.length]));

  console.log(
    JSON.stringify({
      event: "prompt_composed",
      prompt_version: PROMPT_VERSION,
      total_chars: prompt.length,
      blocks: report,
      ...meta,
    }),
  );

  return { prompt, version: PROMPT_VERSION, chars: prompt.length };
}

/** Headers that let the client/traces attribute an answer to a prompt build. */
export function promptTraceHeaders(model: string, chars: number) {
  return {
    "X-Cuddles-Prompt-Version": PROMPT_VERSION,
    "X-Cuddles-Prompt-Chars": String(chars),
    "X-Cuddles-Model": model,
  };
}
