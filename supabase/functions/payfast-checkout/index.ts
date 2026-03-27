import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const params = Object.keys(data)
    .filter((key) => data[key] !== "")
    .sort()
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const withPassphrase = `${params}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  const encoder = new TextEncoder();
  const hashBuffer = new Uint8Array(
    // deno-lint-ignore no-explicit-any
    (crypto as any).subtle ? [] : []
  );
  // Use MD5 for PayFast signature
  const md5 = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    // PayFast requires proper MD5 - use crypto
    return "";
  };

  // We need to compute MD5 - Deno doesn't have built-in MD5
  // Use a simple implementation
  return withPassphrase;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { type } = await req.json();
    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID");
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY");
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE");

    if (!merchantId || !merchantKey || !passphrase) {
      throw new Error("PayFast credentials not configured");
    }

    const origin = req.headers.get("origin") || "https://cuddles-smart-budtender-ai.lovable.app";
    const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-itn`;

    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium?canceled=true`,
      notify_url: notifyUrl,
      email_address: user.email,
      m_payment_id: `sub_${user.id}_${Date.now()}`,
      amount: "99.00",
      item_name: "Cuddles Premium Subscription",
      item_description: "Monthly premium access to Cuddles AI",
      custom_str1: user.id,
      custom_str2: "premium",
    };

    // For subscription (recurring billing)
    if (type === "subscription") {
      paymentData.subscription_type = "1";
      paymentData.recurring_amount = "99.00";
      paymentData.frequency = "3"; // Monthly
      paymentData.cycles = "0"; // Indefinite
    }

    // Generate MD5 signature
    const paramString = Object.keys(paymentData)
      .filter((key) => paymentData[key] !== "")
      .sort()
      .map((key) => `${key}=${encodeURIComponent(paymentData[key]).replace(/%20/g, "+")}`)
      .join("&");

    const signatureInput = `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;

    // Compute MD5 using crypto.subtle
    const encoder = new TextEncoder();
    const data2 = encoder.encode(signatureInput);
    const hashBuffer = await crypto.subtle.digest("MD5", data2);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    paymentData.signature = signature;

    // Build the redirect URL
    const pfHost = "https://www.payfast.co.za/eng/process";
    const queryString = Object.keys(paymentData)
      .map((key) => `${key}=${encodeURIComponent(paymentData[key])}`)
      .join("&");

    const redirectUrl = `${pfHost}?${queryString}`;

    return new Response(JSON.stringify({ url: redirectUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
