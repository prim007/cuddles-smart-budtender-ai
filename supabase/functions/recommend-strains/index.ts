// recommend-strains: vector similarity search over tenant_strains.embedding
// Stub: accepts either a precomputed `embedding` (number[]) OR a `query` string.
// When only `query` is provided, returns 501 until your Python embedding pipeline
// is wired in (or you swap in an embedding API call here).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMBED_DIM = 768;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { embedding, query, tenant_id, match_count } = body ?? {};

    // Validate match_count
    const k = Math.min(Math.max(Number(match_count) || 5, 1), 20);

    // Validate tenant_id (optional)
    if (tenant_id && typeof tenant_id !== "string") {
      return json({ error: "tenant_id must be a UUID string" }, 400);
    }

    let vec: number[] | null = null;

    if (Array.isArray(embedding)) {
      if (embedding.length !== EMBED_DIM || !embedding.every((n) => typeof n === "number")) {
        return json({ error: `embedding must be a number[] of length ${EMBED_DIM}` }, 400);
      }
      vec = embedding;
    } else if (typeof query === "string" && query.trim().length > 0) {
      // TODO: call your embedding model here (e.g. local Python service, OpenAI, Gemini embed).
      // For now return 501 so the contract is clear.
      return json(
        {
          error: "Server-side embedding not configured yet",
          hint: "POST { embedding: number[768] } from your Python job, or wire an embed model here.",
        },
        501,
      );
    } else {
      return json({ error: "Provide either `embedding` (number[768]) or `query` (string)" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("match_strains", {
      query_embedding: vec,
      p_tenant_id: tenant_id ?? null,
      match_count: k,
    });

    if (error) {
      console.error("match_strains error:", error);
      return json({ error: "Similarity search failed" }, 500);
    }

    return json({ results: data ?? [] }, 200);
  } catch (err) {
    console.error("recommend-strains error:", err);
    return json({ error: "Internal error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
