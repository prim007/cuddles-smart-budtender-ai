import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stripe price IDs created via the Stripe MCP tool
const PRICES = {
  premium: "price_1TeefcGD6Z27Vz01XYKSVOd1", // Cuddles Premium - R99/mo ZAR
  pro: "price_1Teeg2GD6Z27Vz01R4oWfQi9",     // Cuddles Pro (Dispensary) - $1,500/mo USD
} as const;

const ALLOWED_RETURN_PATHS = ["/premium", "/dispensary-onboarding"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const body = await req.json().catch(() => ({}));
    const plan = (body?.plan === "pro" ? "pro" : "premium") as keyof typeof PRICES;
    const returnPath =
      typeof body?.return_path === "string" && ALLOWED_RETURN_PATHS.includes(body.return_path)
        ? body.return_path
        : plan === "pro"
        ? "/dispensary-onboarding"
        : "/premium";

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Reuse customer if it already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://cuddles-ai.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}${returnPath}?subscribed=true`,
      cancel_url: `${origin}${returnPath}?canceled=true`,
      metadata: { user_id: user.id, plan },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-CHECKOUT] Error:", (error as Error).message);
    return new Response(JSON.stringify({ error: "Unable to process checkout. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
