// Premium-only personal insights: journal patterns, T-break check-in, grow schedule.
// Data comes from the signed-in user's own saved records, never the browser.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { buildClaudeRequest, parseClaudeMessage } from "../_shared/claude.ts";
import { isPremiumUser } from "../_shared/premium.ts";

const schema = z.object({ kind: z.enum(["journal", "tbreak", "grow"]), plantId: z.string().uuid().optional() });
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM = `You are Cuddles, a friendly cannabis and plant education assistant. Use plain, short language.
Start with a 2-sentence summary, then up to 5 short bullet points, then one friendly question checking the user understood.
Education only, not medical advice — say so in one short line at the end.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !apiKey) return json({ error: "Please sign in first." }, 401);
  const { data: auth } = await admin.auth.getUser(token);
  if (!auth?.user) return json({ error: "Please sign in again." }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request." }, 400);
  const uid = auth.user.id;

  if (!(await isPremiumUser(admin, uid, auth.user.email))) {
    return json({ error: "This is a Premium feature.", upgrade: true }, 402);
  }
  const { data: ok } = await admin.rpc("consume_ai_quota", { p_bucket: `insights:user:${uid}`, p_limit: 20, p_window_seconds: 86400 });
  if (ok !== true) return json({ error: "You've reached today's insight limit. Try again tomorrow." }, 429);

  let prompt = "";
  if (parsed.data.kind === "journal") {
    const { data } = await admin.from("strain_journal")
      .select("strain_name, strain_type, consumption_method, dosage, mood_before, mood_after, effects, rating, notes, session_date")
      .eq("user_id", uid).order("session_date", { ascending: false }).limit(40);
    if (!data?.length) return json({ insight: "Log a few sessions in your journal first, then I can spot what works for you." });
    prompt = `Here are my recent journal sessions as JSON:\n${JSON.stringify(data)}\nWhat patterns do you see? Which strains, types or methods gave my best mood lift and ratings, and which to avoid?`;
  } else if (parsed.data.kind === "tbreak") {
    const { data } = await admin.from("tolerance_breaks")
      .select("start_date, target_days, status, reason, daily_logs").eq("user_id", uid).eq("status", "active")
      .order("start_date", { ascending: false }).limit(1).maybeSingle();
    if (!data) return json({ insight: "Start a T-break first and I'll check in with you each day." });
    const day = Math.max(1, Math.ceil((Date.now() - new Date(data.start_date).getTime()) / 86400000));
    prompt = `I'm on day ${day} of a ${data.target_days}-day tolerance break. Reason: ${data.reason ?? "not given"}. My logs: ${JSON.stringify(data.daily_logs ?? []).slice(0, 3000)}\nGive me today's personal check-in: what to expect today, 2 coping tips, and encouragement.`;
  } else {
    if (!parsed.data.plantId) return json({ error: "Choose a plant first." }, 400);
    const { data: plant } = await admin.from("plants").select("plant_name, strain_name, growth_stage, planted_date, notes")
      .eq("id", parsed.data.plantId).eq("user_id", uid).maybeSingle();
    if (!plant) return json({ error: "Plant not found." }, 404);
    const { data: env } = await admin.from("plant_environment_logs")
      .select("temperature, humidity, ph_level, light_hours, nutrient_ppm, logged_at")
      .eq("plant_id", parsed.data.plantId).eq("user_id", uid).order("logged_at", { ascending: false }).limit(10);
    prompt = `My plant: ${JSON.stringify(plant)}. Recent readings: ${JSON.stringify(env ?? [])}.\nGive me a personal weekly feeding and climate schedule for this stage (temperature, humidity/VPD, light hours, pH, feeding strength), and flag any reading that looks off.`;
  }

  const r = buildClaudeRequest(apiKey, { model: "anthropic/claude-haiku-4-5", system: SYSTEM, messages: [{ role: "user", content: prompt }], maxTokens: 900 });
  const res = await fetch(r.url, { method: "POST", headers: r.headers, body: JSON.stringify(r.body) });
  if (!res.ok) {
    if (res.status === 402) return json({ error: "Our groovy engineers are cooking up something — please try again soon." }, 503);
    if (res.status === 429) return json({ error: "Cuddles is busy right now. Please try again in a minute." }, 429);
    return json({ error: "Insights are unavailable right now." }, 502);
  }
  const text = parseClaudeMessage(await res.json()).text;
  if (!text) return json({ error: "Insights are unavailable right now." }, 502);
  return json({ insight: text });
});
