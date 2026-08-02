// embed-strains: admin-only backfill of tenant_strains.embedding
// Embeds strains that have no embedding yet (or all, when force=true) using the
// Lovable AI Gateway (openai/text-embedding-3-small @ 768 dims to match pgvector).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-embed-secret",
};

const EMBED_DIM = 768;
const MODEL = "openai/text-embedding-3-small";
const MAX_BATCH = 100;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type StrainRow = {
  id: string;
  strain_name: string | null;
  strain_type: string | null;
  category: string | null;
  primary_effect: string | null;
  primary_terpene: string | null;
  secondary_terpene: string | null;
  notes: string | null;
};

function toText(s: StrainRow): string {
  return [
    s.strain_name,
    s.strain_type,
    s.category ? `category: ${s.category}` : null,
    s.primary_effect ? `effect: ${s.primary_effect}` : null,
    [s.primary_terpene, s.secondary_terpene].filter(Boolean).join(", ") || null,
    s.notes,
  ]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 4000);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Two callers are allowed:
    //  1. The database trigger, which presents a shared hook secret stored in
    //     public.internal_hook_secrets (readable only by the service role).
    //  2. An admin user with a valid JWT (manual backfill).
    const hookSecret = req.headers.get("x-embed-secret");
    let authorized = false;

    if (hookSecret) {
      const { data: secretRow } = await admin
        .from("internal_hook_secrets")
        .select("secret")
        .eq("name", "embed_strains")
        .maybeSingle();
      authorized = !!secretRow?.secret && secretRow.secret === hookSecret;
      if (!authorized) return json({ error: "Unauthorized" }, 401);
    } else {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
      const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(
        authHeader.replace("Bearer ", ""),
      );
      const userId = claimsData?.claims?.sub as string | undefined;
      if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

      const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (roleErr || !isAdmin) return json({ error: "Forbidden" }, 403);
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;
    const tenantId = typeof body?.tenant_id === "string" ? body.tenant_id : null;
    const strainIds: string[] | null = Array.isArray(body?.strain_ids)
      ? body.strain_ids.filter((v: unknown) => typeof v === "string").slice(0, MAX_BATCH)
      : null;
    const limit = Math.min(Math.max(Number(body?.limit) || MAX_BATCH, 1), MAX_BATCH);

    let q = admin
      .from("tenant_strains")
      .select(
        "id, strain_name, strain_type, category, primary_effect, primary_terpene, secondary_terpene, notes",
      )
      .limit(limit);
    if (strainIds && strainIds.length > 0) {
      q = q.in("id", strainIds);
    } else {
      if (!force) q = q.is("embedding", null);
      if (tenantId) q = q.eq("tenant_id", tenantId);
    }


    const { data: rows, error: fetchErr } = await q;
    if (fetchErr) {
      console.error("fetch strains error:", fetchErr);
      return json({ error: "Failed to load strains" }, 500);
    }
    if (!rows || rows.length === 0) return json({ embedded: 0, remaining: 0 }, 200);

    const inputs = (rows as StrainRow[]).map(toText);

    const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": lovableKey },
      body: JSON.stringify({ model: MODEL, input: inputs, dimensions: EMBED_DIM }),
    });

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      console.error("Embedding API error:", embedRes.status, errText);
      if (embedRes.status === 429) return json({ error: "Rate limit exceeded, please retry" }, 429);
      if (embedRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: "Failed to generate embeddings" }, 502);
    }

    const embedData = await embedRes.json();
    const vectors: { index: number; embedding: number[] }[] = embedData?.data ?? [];
    if (vectors.length !== rows.length) {
      console.error("Embedding count mismatch", { got: vectors.length, want: rows.length });
      return json({ error: "Embedding provider returned unexpected result count" }, 502);
    }

    let embedded = 0;
    for (const item of vectors) {
      const row = (rows as StrainRow[])[item.index];
      if (!row || !Array.isArray(item.embedding) || item.embedding.length !== EMBED_DIM) continue;
      const { error: updErr } = await admin
        .from("tenant_strains")
        .update({ embedding: item.embedding as unknown as string })
        .eq("id", row.id);
      if (updErr) {
        console.error("update embedding error:", row.id, updErr);
        continue;
      }
      embedded++;
    }

    const { count: remaining } = await admin
      .from("tenant_strains")
      .select("id", { count: "exact", head: true })
      .is("embedding", null);

    return json({ embedded, remaining: remaining ?? 0, model: MODEL, dimensions: EMBED_DIM }, 200);
  } catch (err) {
    console.error("embed-strains error:", err);
    return json({ error: "Internal error" }, 500);
  }
});
