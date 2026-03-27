import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    console.log("[PAYFAST-ITN] Received:", JSON.stringify(data));

    const paymentStatus = data.payment_status;
    const userId = data.custom_str1;
    const plan = data.custom_str2 || "premium";
    const mPaymentId = data.m_payment_id;
    const token = data.token; // Subscription token for recurring
    const amount = data.amount_gross;

    if (!userId) {
      console.error("[PAYFAST-ITN] No user_id in custom_str1");
      return new Response("OK", { status: 200 });
    }

    // Verify signature
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || "";
    const paramString = Object.keys(data)
      .filter((key) => key !== "signature" && data[key] !== "")
      .sort()
      .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
      .join("&");

    const signatureInput = passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
      : paramString;

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("MD5", encoder.encode(signatureInput));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (computedSignature !== data.signature) {
      console.error("[PAYFAST-ITN] Signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    // Verify with PayFast server
    const verifyUrl = "https://www.payfast.co.za/eng/query/validate";
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: paramString,
    });
    const verifyResult = await verifyResponse.text();
    
    if (verifyResult !== "VALID") {
      console.error("[PAYFAST-ITN] Validation failed:", verifyResult);
      return new Response("Validation failed", { status: 400 });
    }

    console.log("[PAYFAST-ITN] Payment status:", paymentStatus, "for user:", userId);

    if (paymentStatus === "COMPLETE") {
      // Calculate end date (1 month from now)
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + 1);

      // Upsert subscription
      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          plan,
          status: "active",
          payfast_token: token || null,
          payment_id: mPaymentId,
          amount: parseFloat(amount || "99"),
          started_at: new Date().toISOString(),
          ends_at: endsAt.toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        console.error("[PAYFAST-ITN] DB error:", error);
      } else {
        console.log("[PAYFAST-ITN] Subscription activated for user:", userId);
      }
    } else if (paymentStatus === "CANCELLED") {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) console.error("[PAYFAST-ITN] Cancel error:", error);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[PAYFAST-ITN] Error:", error);
    return new Response("Error", { status: 500 });
  }
});
