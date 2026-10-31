// shop-weekly-report: "Your shop this week" for a signed-in shop owner.
//
// Uses only topic labels recorded from the shop's own website chat
// (widget_topic_events) — never message text, visitor IDs or IPs.
// Topics seen fewer than SHOP_MIN_COHORT times are withheld.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { countTopics, SHOP_MIN_COHORT } from "../_shared/insight-report.ts";
import { TOPIC_TO_MENU } from "../_shared/question-topics.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAY_MS = 86_400_000;
const TRIAL_CUTOFF_START = Date.parse("2026-10-22T00:00:00Z");
const TRIAL_DAYS = 14;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    const userId = claims?.claims?.sub as string | undefined;
    if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    const body = await req.json().catch(() => ({}));
    const requestedTenant = typeof body?.tenant_id === "string" ? body.tenant_id : null;

    const tenantQuery = admin
      .from("tenants")
      .select("id, business_name, status, plan, website, created_at");
    const { data: tenant } = isAdmin && requestedTenant
      ? await tenantQuery.eq("id", requestedTenant).maybeSingle()
      : await tenantQuery.eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();

    if (!tenant) return json({ error: "No shop is linked to this account." }, 404);

    const now = Date.now();
    const weekStart = new Date(now - 7 * DAY_MS).toISOString();
    const prevStart = new Date(now - 14 * DAY_MS).toISOString();

    const [{ data: events }, { count: everCount }, { data: menu }] = await Promise.all([
      admin
        .from("widget_topic_events")
        .select("topics, created_at")
        .eq("tenant_id", tenant.id)
        .gte("created_at", prevStart)
        .order("created_at", { ascending: false })
        .limit(5000),
      admin
        .from("widget_topic_events")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenant.id),
      admin
        .from("tenant_strains")
        .select("strain_name, primary_effect, category, strain_type, notes, in_stock")
        .eq("tenant_id", tenant.id)
        .limit(1000),
    ]);

    const rows = events ?? [];
    const thisWeek = rows.filter((r) => r.created_at >= weekStart);
    const lastWeek = rows.filter((r) => r.created_at < weekStart);
    const activeDays = new Set(thisWeek.map((r) => String(r.created_at).slice(0, 10))).size;
    const topics = countTopics(thisWeek.map((r) => (r.topics ?? []) as string[]), SHOP_MIN_COHORT);

    const menuItems = menu ?? [];
    const inStock = menuItems.filter((m) => m.in_stock !== false);
    const haystacks = inStock.map((s) =>
      [s.strain_name, s.primary_effect, s.category, s.strain_type, s.notes].filter(Boolean).join(" ")
    );
    const menuGaps = topics
      .filter((t) => TOPIC_TO_MENU[t.label] && !haystacks.some((h) => TOPIC_TO_MENU[t.label].test(h)))
      .map((t) => ({ label: t.label, count: t.count }));

    const created = Date.parse(tenant.created_at);
    const trialDaysLeft =
      tenant.status === "trial" && created >= TRIAL_CUTOFF_START
        ? Math.max(0, Math.ceil((created + TRIAL_DAYS * DAY_MS - now) / DAY_MS))
        : null;

    const checklist = [
      { key: "menu", label: "Add your product menu", done: menuItems.length > 0, href: "/manage-strains" },
      { key: "stock", label: "Mark what is in stock", done: inStock.length > 0, href: "/manage-strains" },
      { key: "website", label: "Add your website address", done: !!tenant.website, href: "/dispensary-onboarding" },
      { key: "live", label: "Chat box answering on your website", done: (everCount ?? 0) > 0, href: "/dispensary-onboarding" },
    ];

    return json(
      {
        generated_at: new Date(now).toISOString(),
        min_cohort: SHOP_MIN_COHORT,
        shop: {
          name: tenant.business_name,
          status: tenant.status,
          trial_days_left: trialDaysLeft,
          menu_items: menuItems.length,
          in_stock_items: inStock.length,
        },
        checklist,
        this_week: { chats: thisWeek.length, active_days: activeDays, topics },
        last_week: { chats: lastWeek.length },
        menu_gaps: menuGaps,
      },
      200,
    );
  } catch (err) {
    console.error("shop-weekly-report: unexpected error", err);
    return json({ error: "Something went wrong" }, 500);
  }
});
