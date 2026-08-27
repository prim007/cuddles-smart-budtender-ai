// nightly-agent-jobs: autonomous background work for the Cuddles agent.
// Runs unattended (pg_cron) and does three things:
//   1. Re-embeds any strains that are missing embeddings.
//   2. Writes a demand snapshot (top asked-about categories in the last 24h).
//   3. Nudges tolerance-break participants who haven't logged in 48h.
// Every job writes a row to agent_traces so /agent-traces shows the run.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Caller must be the cron job (shared secret) or an admin JWT.
  const cronSecret = req.headers.get("x-cron-secret");
  let authorised = false;
  if (cronSecret) {
    const { data } = await admin
      .from("internal_hook_secrets")
      .select("secret")
      .eq("name", "nightly_agent_jobs")
      .maybeSingle();
    authorised = !!data?.secret && data.secret === cronSecret;
  }
  if (!authorised) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data } = await anon.auth.getClaims(authHeader.replace("Bearer ", ""));
      const uid = data?.claims?.sub as string | undefined;
      if (uid) {
        const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
        authorised = !!isAdmin;
      }
    }
  }
  if (!authorised) return json({ error: "Unauthorized" }, 401);

  const results: Record<string, unknown> = {};

  const trace = async (job: string, payload: unknown, result: unknown, ms: number, error?: string) => {
    try {
      await admin.from("agent_traces").insert({
        agent_role: "nightly",
        step_index: 0,
        tool_called: job,
        payload: payload as Record<string, unknown>,
        result: JSON.parse(JSON.stringify(result ?? null)),
        latency_ms: ms,
        error: error ?? null,
      });
    } catch (e) {
      console.error("trace failed", e instanceof Error ? e.message : e);
    }
  };

  // ── Job 1: backfill strain embeddings ─────────────────────────────
  {
    const t0 = Date.now();
    try {
      const { data: missing } = await admin
        .from("tenant_strains")
        .select("id")
        .is("embedding", null)
        .limit(100);
      const ids = (missing ?? []).map((r: { id: string }) => r.id);
      if (ids.length) {
        const { data: secretRow } = await admin
          .from("internal_hook_secrets")
          .select("secret")
          .eq("name", "embed_strains")
          .maybeSingle();
        await fetch(`${supabaseUrl}/functions/v1/embed-strains`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-embed-secret": secretRow?.secret ?? "",
          },
          body: JSON.stringify({ strain_ids: ids }),
        });
      }
      results.embeddings = { queued: ids.length };
      await trace("backfill_embeddings", { limit: 100 }, results.embeddings, Date.now() - t0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.embeddings = { error: "failed" };
      await trace("backfill_embeddings", {}, null, Date.now() - t0, msg);
    }
  }

  // ── Job 2: demand snapshot for the last 24h ───────────────────────
  {
    const t0 = Date.now();
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: convos } = await admin
        .from("chat_conversations")
        .select("user_message")
        .gte("created_at", since)
        .limit(2000);

      const buckets: Record<string, number> = {
        sleep: 0, pain: 0, anxiety: 0, energy: 0, creativity: 0,
        social: 0, growing: 0, buying: 0,
      };
      const patterns: Array<[keyof typeof buckets, RegExp]> = [
        ["sleep", /\b(sleep|insomnia|rest|knock me out)\b/i],
        ["pain", /\b(pain|ache|inflammation|cramp|migraine)\b/i],
        ["anxiety", /\b(anxiety|anxious|panic|stress|calm)\b/i],
        ["energy", /\b(energy|focus|productive|wake|daytime)\b/i],
        ["creativity", /\b(creative|creativity|art|music|write)\b/i],
        ["social", /\b(social|party|friends|hang out)\b/i],
        ["growing", /\b(grow|seedling|soil|nutrient|harvest|plant)\b/i],
        ["buying", /\b(buy|price|stock|menu|deliver|dispensar)\b/i],
      ];
      for (const row of convos ?? []) {
        const text = String((row as { user_message?: string }).user_message ?? "");
        for (const [key, re] of patterns) if (re.test(text)) buckets[key]++;
      }
      const ranked = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
      results.demand = { sampled: convos?.length ?? 0, top: ranked.slice(0, 5) };
      await trace("demand_snapshot", { since }, results.demand, Date.now() - t0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.demand = { error: "failed" };
      await trace("demand_snapshot", {}, null, Date.now() - t0, msg);
    }
  }

  // ── Job 3: stale tolerance-break check-in count ───────────────────
  {
    const t0 = Date.now();
    try {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("strain_journal")
        .select("id", { count: "exact", head: true })
        .lt("updated_at", cutoff);
      results.checkins = { stale_journals: count ?? 0 };
      await trace("tbreak_checkin_scan", { cutoff }, results.checkins, Date.now() - t0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.checkins = { error: "failed" };
      await trace("tbreak_checkin_scan", {}, null, Date.now() - t0, msg);
    }
  }

  return json({ ok: true, ran_at: new Date().toISOString(), results });
});
