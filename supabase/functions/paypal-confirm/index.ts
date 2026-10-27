// Confirms a returning PayPal subscriber by asking PayPal directly.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { paypalFetch, paypalToken } from "../_shared/paypal.ts";

const schema = z.object({ subscriptionId: z.string().regex(/^I-[A-Z0-9]{6,40}$/) });
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Please sign in first." }, 401);
  const { data: auth } = await admin.auth.getUser(token);
  if (!auth?.user) return json({ error: "Please sign in again." }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid subscription reference." }, 400);

  const { data: row } = await admin.from("paypal_subscriptions").select("user_id")
    .eq("paypal_subscription_id", parsed.data.subscriptionId).maybeSingle();
  if (!row || row.user_id !== auth.user.id) return json({ error: "Subscription not found." }, 404);
  try {
    const pp = await paypalToken();
    const sub = await paypalFetch(pp, `/v1/billing/subscriptions/${parsed.data.subscriptionId}`);
    if (sub.custom_id !== auth.user.id) return json({ error: "Subscription not found." }, 404);
    await admin.from("paypal_subscriptions").update({
      status: sub.status, next_billing_at: sub.billing_info?.next_billing_time ?? null, updated_at: new Date().toISOString(),
    }).eq("paypal_subscription_id", parsed.data.subscriptionId);
    return json({ active: sub.status === "ACTIVE", status: sub.status });
  } catch (e) {
    console.error("[paypal-confirm]", (e as Error).message);
    return json({ error: "We couldn't confirm your PayPal payment yet. Please refresh in a minute." }, 502);
  }
});
