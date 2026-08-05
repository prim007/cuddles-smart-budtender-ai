// Shared RAG helpers: embed text via the Lovable AI Gateway and retrieve
// curated knowledge from public.knowledge_documents.

export const EMBED_MODEL = "openai/text-embedding-3-small";
export const EMBED_DIM = 768;

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Embed one or more strings. Returns vectors in input order. */
export async function embedTexts(
  apiKey: string,
  inputs: string[],
): Promise<number[][]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: inputs.map((t) => t.slice(0, 6000)),
      dimensions: EMBED_DIM,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Embedding failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const json = await res.json();
  const data = (json?.data ?? []) as { index: number; embedding: number[] }[];
  return data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export type RetrievedDoc = {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string | null;
  similarity: number;
};

/**
 * Retrieve the most relevant curated knowledge for a query.
 * Never throws — retrieval failures degrade to "no extra context" so the
 * model still answers from its own knowledge.
 */
export async function retrieveKnowledge(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  apiKey: string,
  query: string,
  matchCount = 6,
): Promise<RetrievedDoc[]> {
  try {
    const cleaned = query.trim();
    if (cleaned.length < 3) return [];
    const [embedding] = await embedTexts(apiKey, [cleaned]);
    if (!embedding) return [];

    const { data, error } = await supabase.rpc("match_knowledge", {
      query_embedding: embedding,
      match_count: matchCount,
      min_similarity: 0.15,
    });
    if (error) {
      console.error("match_knowledge failed:", error.message);
      return [];
    }
    return (data ?? []) as RetrievedDoc[];
  } catch (err) {
    console.error("retrieveKnowledge failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Format retrieved docs as a system-prompt block. */
export function buildRetrievalContext(docs: RetrievedDoc[]): string {
  if (!docs.length) return "";
  const body = docs
    .map(
      (d, i) =>
        `[${i + 1}] (${d.category}) ${d.title}\n${d.content}${d.source ? `\nSource: ${d.source}` : ""}`,
    )
    .join("\n\n");

  return `

═══════════════════════════════════════
RETRIEVED CURATED KNOWLEDGE (highest authority for this question)
═══════════════════════════════════════
These passages were pulled from Cuddles' curated knowledge base because they
match the user's current question. Treat them as the source of truth: prefer
their numbers, ranges, and wording over anything you recall from training.
If a passage contradicts your own memory, follow the passage. If the passages
don't cover the question, answer from your general knowledge and say when the
evidence is thin — never invent a citation.

${body}
`;
}
