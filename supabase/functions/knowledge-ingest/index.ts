// knowledge-ingest: seeds and embeds the curated Cuddles knowledge corpus into
// public.knowledge_documents. Admin-only (JWT) or callable with the shared
// internal hook secret.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { KNOWLEDGE_CORPUS, CORPUS_VERSION } from "../_shared/knowledge-corpus.ts";
import { embedTexts, sha256Hex } from "../_shared/rag.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-embed-secret",
};

const BATCH = 20;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Authorization: shared hook secret OR an admin JWT ---
    let authorized = false;
    const hookSecret = req.headers.get("x-embed-secret");
    if (hookSecret) {
      const { data } = await admin
        .from("internal_hook_secrets")
        .select("secret")
        .eq("name", "embed_strains")
        .maybeSingle();
      authorized = !!data?.secret && data.secret === hookSecret;
    }

    if (!authorized) {
      const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
      if (token.length > 100) {
        const { data: userData } = await admin.auth.getUser(token);
        const uid = userData?.user?.id;
        if (uid) {
          const { data: isAdmin } = await admin.rpc("has_role", {
            _user_id: uid,
            _role: "admin",
          });
          authorized = isAdmin === true;
        }
      }
    }

    if (!authorized) return json({ error: "Forbidden" }, 403);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const force = body?.force === true;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Service temporarily unavailable" }, 503);

    // Existing hashes, so re-runs only embed what changed.
    const { data: existing } = await admin
      .from("knowledge_documents")
      .select("content_hash");
    const known = new Set((existing ?? []).map((r: { content_hash: string }) => r.content_hash));

    const prepared = await Promise.all(
      KNOWLEDGE_CORPUS.map(async (doc) => ({
        ...doc,
        content_hash: await sha256Hex(`${doc.title}::${doc.content}`),
      })),
    );

    const todo = force ? prepared : prepared.filter((d) => !known.has(d.content_hash));
    if (todo.length === 0) {
      return json({ ok: true, version: CORPUS_VERSION, inserted: 0, message: "Up to date" }, 200);
    }

    let inserted = 0;
    for (let i = 0; i < todo.length; i += BATCH) {
      const slice = todo.slice(i, i + BATCH);
      const vectors = await embedTexts(
        apiKey,
        slice.map((d) => `${d.title}. ${d.content}`),
      );

      const rows = slice.map((d, idx) => ({
        category: d.category,
        title: d.title,
        content: d.content,
        tags: d.tags,
        source: d.source ?? "Cuddles curated knowledge base",
        content_hash: d.content_hash,
        embedding: vectors[idx],
        updated_at: new Date().toISOString(),
      }));

      const { error } = await admin
        .from("knowledge_documents")
        .upsert(rows, { onConflict: "content_hash" });
      if (error) {
        console.error("knowledge upsert failed:", error.message);
        return json({ error: "Failed to store knowledge" }, 500);
      }
      inserted += rows.length;
    }

    return json({ ok: true, version: CORPUS_VERSION, inserted, total: prepared.length }, 200);
  } catch (err) {
    console.error("knowledge-ingest error:", err instanceof Error ? err.stack : err);
    return json({ error: "Unable to ingest knowledge" }, 500);
  }
});
