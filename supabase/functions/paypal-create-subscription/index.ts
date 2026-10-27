// Creates a PayPal subscription for the Cuddles Premium software plan only.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { ensurePlan, paypalFetch, paypalToken } from "../_shared/paypal.ts";

const ALLOWED_RETURN = ["https://cuddles-ai.com", "https://www.cuddles-ai.com", "https://cuddles-ai.lovable.app", "https://id-preview--16082a8c-a109-49a8-a05d-987a18f90c7d.lovable.app", "http://localhost:8080"];
const schema = z.object({ plan: z.enum(["monthly", "yearly"]) });
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Please sign in first." }, 401);
  const { data: auth } = await admin.auth.getUser(token);
  if (!auth?.user) return json({ error: "Please sign in again." }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Choose monthly or yearly." }, 400);

  const origin = req.headers.get("origin") ?? "";
  const base = ALLOWED_RETURN.includes(origin) ? origin : "https://cuddles-ai.com";
  try {
    const pp = await paypalToken();
    const planId = await ensurePlan(admin, pp, parsed.data.plan);
    const sub = await paypalFetch(pp, "/v1/billing/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        custom_id: auth.user.id,
        application_context: {
          brand_name: "Cuddles AI",
          user_action: "SUBSCRIBE_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: `${base}/premium?paypal=success`,
          cancel_url: `${base}/premium?canceled=true`,
        },
      }),
    });
    await admin.from("paypal_subscriptions").insert({ user_id: auth.user.id, paypal_subscription_id: sub.id, plan_key: parsed.data.plan, status: sub.status ?? "APPROVAL_PENDING" });
    const approve = (sub.links ?? []).find((l: { rel: string }) => l.rel === "approve")?.href;
    if (!approve) return json({ error: "PayPal did not return a payment link." }, 502);
    return json({ url: approve });
  } catch (e) {
    console.error("[paypal-create]", (e as Error).message);
    return json({ error: "PayPal checkout couldn't start. Please try again or pay by card." }, 502);
  }
});
