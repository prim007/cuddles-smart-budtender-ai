import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Master rotation pool — popular & varied strains
const STRAIN_POOL = [
  "Blue Dream", "Wedding Cake", "Gelato", "OG Kush", "Granddaddy Purple",
  "Sour Diesel", "Girl Scout Cookies", "Pineapple Express", "Northern Lights",
  "White Widow", "Jack Herer", "AK-47", "Bubba Kush", "Trainwreck",
  "Durban Poison", "Strawberry Cough", "Blueberry", "Green Crack", "Cherry Pie",
  "Skywalker OG", "Zkittlez", "Runtz", "Purple Punch", "Do-Si-Dos",
  "MAC", "GMO Cookies", "Mimosa", "London Pound Cake", "Sunset Sherbet",
  "Forbidden Fruit", "Banana Kush", "Lemon Haze", "Amnesia Haze", "Maui Wowie",
  "Cheese", "Blue Cheese", "Critical Kush", "Hindu Kush", "Headband",
  "Tangie", "Chemdawg", "Bruce Banner", "Gorilla Glue #4", "Lemon OG",
  "Platinum OG", "Master Kush", "Wedding Crashers", "Apple Fritter",
];

function getMonday(d: Date) {
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}

function pickWeekly(weekStart: string, count = 10): string[] {
  // Deterministic shuffle by week
  const seed = weekStart.split("-").reduce((a, b) => a + parseInt(b), 0);
  const arr = [...STRAIN_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Restrict to trusted callers (cron scheduler or internal services) via shared secret.
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );


    const weekStart = getMonday(new Date());

    // Already exists?
    const { data: existing } = await supabase
      .from("weekly_featured_strains")
      .select("*")
      .eq("week_start", weekStart)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ week_start: weekStart, strains: existing.strain_slugs, created: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const names = pickWeekly(weekStart, 10);
    const slugs = names.map((n) => ({ name: n, slug: slugify(n) }));

    const { error } = await supabase.from("weekly_featured_strains").insert({
      week_start: weekStart,
      strain_slugs: slugs,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ week_start: weekStart, strains: slugs, created: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rotate-weekly-strains:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
