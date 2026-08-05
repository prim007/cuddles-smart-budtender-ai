// Shared RAG helpers: embed text via the Lovable AI Gateway and retrieve
// curated knowledge from public.knowledge_documents.

export const EMBED_MODEL = "openai/text-embedding-3-small";
export const EMBED_DIM = 768;

// ── In-isolate caches ────────────────────────────────────────────────
// Edge isolates stay warm between requests, so caching embeddings and
// retrieval results removes a gateway round-trip (cost) and a pgvector
// scan (latency) for repeated / similar questions.
const EMBED_TTL_MS = 60 * 60 * 1000; // 1h — embeddings are deterministic
const RETRIEVAL_TTL_MS = 10 * 60 * 1000; // 10m — corpus can change
const EMBED_MAX = 500;
const RETRIEVAL_MAX = 300;

type Entry<T> = { value: T; expires: number };

class TtlCache<T> {
  private map = new Map<string, Entry<T>>();
  constructor(private max: number, private ttl: number) {}

  get(key: string): T | undefined {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    // refresh LRU recency
    this.map.delete(key);
    this.map.set(key, hit);
    return hit.value;
  }

  set(key: string, value: T) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + this.ttl });
    while (this.map.size > this.max) {
      const oldest = this.map.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }
}

const embedCache = new TtlCache<number[]>(EMBED_MAX, EMBED_TTL_MS);
const retrievalCache = new TtlCache<RetrievedDoc[]>(RETRIEVAL_MAX, RETRIEVAL_TTL_MS);
/** De-dupes concurrent identical retrievals (same question from many users). */
const inFlight = new Map<string, Promise<RetrievedDoc[]>>();

/** Normalize a query so trivial variations share a cache slot. */
export function cacheKeyFor(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").replace(/[?!.,;:'"]+/g, "").trim();
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


/**
 * Embed one or more strings. Returns vectors in input order.
 * Cached per-input: only the strings we have never embedded (or whose cache
 * entry expired) are sent to the gateway, so repeats cost nothing.
 */
export async function embedTexts(
  apiKey: string,
  inputs: string[],
): Promise<number[][]> {
  const out: (number[] | undefined)[] = inputs.map((t) => embedCache.get(cacheKeyFor(t)));
  const missIdx = out.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

  if (missIdx.length > 0) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: missIdx.map((i) => inputs[i].slice(0, 6000)),
        dimensions: EMBED_DIM,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Embedding failed (${res.status}): ${detail.slice(0, 300)}`);
    }

    const json = await res.json();
    const data = (json?.data ?? []) as { index: number; embedding: number[] }[];
    for (const d of data) {
      const originalIdx = missIdx[d.index];
      if (originalIdx === undefined || !Array.isArray(d.embedding)) continue;
      out[originalIdx] = d.embedding;
      embedCache.set(cacheKeyFor(inputs[originalIdx]), d.embedding);
    }
  }

  return out.filter((v): v is number[] => Array.isArray(v));
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
 * Results are cached (and concurrent identical lookups de-duped) so common
 * questions skip both the embedding call and the pgvector scan.
 */
export async function retrieveKnowledge(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  apiKey: string,
  query: string,
  matchCount = 6,
): Promise<RetrievedDoc[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  const key = `${matchCount}::${cacheKeyFor(cleaned)}`;
  const cached = retrievalCache.get(key);
  if (cached) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const task = (async (): Promise<RetrievedDoc[]> => {
    try {
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
      const docs = (data ?? []) as RetrievedDoc[];
      retrievalCache.set(key, docs);
      return docs;
    } catch (err) {
      console.error("retrieveKnowledge failed:", err instanceof Error ? err.message : err);
      return [];
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, task);
  return task;
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
