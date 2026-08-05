// demand-insights: aggregated, anonymised demand signal derived from chat conversations.
//
// POPIA notes:
//  - No raw chat text, session ids, IPs or user ids ever leave this function.
//  - Only bucket counts are returned, and buckets below MIN_COHORT are suppressed.
//  - Test traffic (user_metadata.is_test) is excluded from all aggregates.
//
// Callers: an authenticated tenant owner (scoped to their own stock coverage) or
// an admin (may pass tenant_id, or omit it for the platform-wide index).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_COHORT = 3;
const MAX_ROWS = 5000;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Bucket = { label: string; patterns: RegExp };

const NEED_BUCKETS: Bucket[] = [
  { label: "Sleep", patterns: /\b(sleep|insomnia|sleepless|knock me out|bedtime|rest)\b/i },
  { label: "Anxiety & Stress", patterns: /\b(anxiety|anxious|stress|stressed|panic|calm|overwhelm)\b/i },
  { label: "Pain Relief", patterns: /\b(pain|ache|aching|cramp|inflammation|sore|migraine)\b/i },
  { label: "Focus & Productivity", patterns: /\b(focus|concentrate|productive|work|study|clarity)\b/i },
  { label: "Energy & Uplift", patterns: /\b(energy|energetic|uplift|daytime|motivat)\b/i },
  { label: "Creativity", patterns: /\b(creative|creativity|art|music|writing)\b/i },
  { label: "Relaxation & Chill", patterns: /\b(relax|chill|unwind|wind down|mellow)\b/i },
  { label: "Appetite", patterns: /\b(appetite|hungry|munchies|nausea|eat)\b/i },
  { label: "Social & Fun", patterns: /\b(social|party|friends|fun|laugh|giggl)\b/i },
  { label: "Low Tolerance / Beginner", patterns: /\b(beginner|first time|new to|low dose|microdose|mild|gentle)\b/i },
];

const FORMAT_BUCKETS: Bucket[] = [
  { label: "Flower", patterns: /\b(flower|bud|buds|joint|smoke|smoking)\b/i },
  { label: "Edibles", patterns: /\b(edible|edibles|gummy|gummies|brownie|chocolate)\b/i },
  { label: "Vapes", patterns: /\b(vape|vapes|cart|cartridge|disposable|pen)\b/i },
  { label: "Concentrates", patterns: /\b(concentrate|rosin|hash|dab|wax|shatter)\b/i },
  { label: "Oils & Tinctures", patterns: /\b(oil|tincture|drops|capsule)\b/i },
  { label: "CBD / Non-psychoactive", patterns: /\b(cbd|non psychoactive|no high|cbg|cbn)\b/i },
  { label: "Topicals", patterns: /\b(topical|balm|cream|salve)\b/i },
];

const TERPENE_BUCKETS: Bucket[] = [
  { label: "Myrcene", patterns: /\bmyrcene\b/i },
  { label: "Limonene", patterns: /\blimonene\b/i },
  { label: "Caryophyllene", patterns: /\bcaryophyllene\b/i },
  { label: "Pinene", patterns: /\bpinene\b/i },
  { label: "Linalool", patterns: /\blinalool\b/i },
  { label: "Terpinolene", patterns: /\bterpinolene\b/i },
  { label: "Humulene", patterns: /\bhumulene\b/i },
];

const TYPE_BUCKETS: Bucket[] = [
  { label: "Indica", patterns: /\bindica\b/i },
  { label: "Sativa", patterns: /\bsativa\b/i },
  { label: "Hybrid", patterns: /\bhybrid\b/i },
];

function tally(messages: string[], buckets: Bucket[]) {
  const counts = new Map<string, number>();
  for (const msg of messages) {
    for (const b of buckets) {
      if (b.patterns.test(msg)) counts.set(b.label, (counts.get(b.label) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= MIN_COHORT)
    .map(([label, count]) => ({
      label,
      count,
      share: messages.length ? Math.round((count / messages.length) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Which stock attribute satisfies which demand bucket.
const NEED_TO_STOCK: Record<string, RegExp> = {
  Sleep: /sleep|sedat|relax|night/i,
  "Anxiety & Stress": /calm|anxiet|stress|relax|soothe/i,
  "Pain Relief": /pain|relief|body|inflam/i,
  "Focus & Productivity": /focus|clear|clarity|product/i,
  "Energy & Uplift": /energ|uplift|euphor|day/i,
  Creativity: /creat|inspir/i,
  "Relaxation & Chill": /relax|chill|mellow|calm/i,
  Appetite: /appetite|hunger|nausea/i,
  "Social & Fun": /social|happy|giggl|euphor|fun/i,
  "Low Tolerance / Beginner": /mild|gentle|light|balanced|cbd/i,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });

    const body = await req.json().catch(() => ({}));
    const days = Math.min(Math.max(Number(body?.days) || 30, 1), 365);
    const requestedTenant = typeof body?.tenant_id === "string" ? body.tenant_id : null;

    // Resolve the tenant the caller is allowed to see stock coverage for.
    let tenant: { id: string; business_name: string } | null = null;
    if (isAdmin && requestedTenant) {
      const { data } = await admin
        .from("tenants")
        .select("id, business_name")
        .eq("id", requestedTenant)
        .maybeSingle();
      tenant = data ?? null;
    } else {
      const { data } = await admin
        .from("tenants")
        .select("id, business_name")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      tenant = data ?? null;
    }

    // Proprietary analytics: only admins or dispensary tenant owners may read.
    if (!isAdmin && !tenant) {
      return json(
        { error: "This dashboard is available to dispensary partners only." },
        403,
      );
    }


    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data: rows, error: rowsError } = await admin
      .from("chat_conversations")
      .select("user_message, user_metadata, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS);

    if (rowsError) {
      console.error("demand-insights: query failed", rowsError);
      return json({ error: "Could not load demand data" }, 500);
    }

    const real = (rows ?? []).filter((r) => {
      const meta = (r.user_metadata ?? {}) as Record<string, unknown>;
      return meta.is_test !== true && meta.is_test !== "true";
    });
    const messages = real.map((r) => String(r.user_message ?? ""));

    const needs = tally(messages, NEED_BUCKETS);
    const formats = tally(messages, FORMAT_BUCKETS);
    const terpenes = tally(messages, TERPENE_BUCKETS);
    const types = tally(messages, TYPE_BUCKETS);

    // Daily volume series
    const dayMap = new Map<string, number>();
    for (let i = Math.min(days, 60) - 1; i >= 0; i--) {
      dayMap.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), 0);
    }
    for (const r of real) {
      const key = new Date(r.created_at as string).toISOString().slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
    const series = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

    // Stock coverage: for each demand bucket, how many of the tenant's in-stock
    // products plausibly serve that need.
    let coverage: { need: string; demand: number; skus: number; gap: boolean }[] = [];
    let stockCount = 0;
    if (tenant) {
      const { data: strains } = await admin
        .from("tenant_strains")
        .select("strain_name, primary_effect, category, notes, strain_type, in_stock")
        .eq("tenant_id", tenant.id)
        .limit(1000);
      const inStock = (strains ?? []).filter((s) => s.in_stock !== false);
      stockCount = inStock.length;
      const haystacks = inStock.map((s) =>
        [s.strain_name, s.primary_effect, s.category, s.strain_type, s.notes].filter(Boolean).join(" "),
      );
      coverage = needs.map((n) => {
        const re = NEED_TO_STOCK[n.label];
        const skus = re ? haystacks.filter((h) => re.test(h)).length : 0;
        return { need: n.label, demand: n.count, skus, gap: skus === 0 && n.count >= MIN_COHORT };
      });
    }

    return json(
      {
        window_days: days,
        generated_at: new Date().toISOString(),
        min_cohort: MIN_COHORT,
        total_conversations: real.length,
        suppressed_note:
          `Buckets with fewer than ${MIN_COHORT} conversations are withheld to protect user privacy.`,
        tenant: tenant ? { id: tenant.id, name: tenant.business_name, in_stock_skus: stockCount } : null,
        is_admin: !!isAdmin,
        needs,
        formats,
        terpenes,
        types,
        series,
        coverage,
      },
      200,
    );
  } catch (err) {
    console.error("demand-insights: unexpected error", err);
    return json({ error: "Something went wrong" }, 500);
  }
});
