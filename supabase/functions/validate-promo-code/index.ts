import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code, action } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Promo code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedCode = code.trim().toUpperCase();

    // Validate format: must start with CUDDLES-
    if (!sanitizedCode.startsWith("CUDDLES-") || sanitizedCode.length !== 16) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid promo code format" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up the code
    const { data: lead, error: lookupError } = await supabase
      .from("email_leads")
      .select("id, promo_code, used, used_at, email")
      .eq("promo_code", sanitizedCode)
      .maybeSingle();

    if (lookupError) {
      console.error("DB lookup error:", lookupError);
      throw new Error("Database error during validation");
    }

    // Code not found
    if (!lead) {
      return new Response(
        JSON.stringify({ valid: false, error: "Promo code not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already used
    if (lead.used) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "This promo code has already been used",
          used_at: lead.used_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: "validate" just checks, "redeem" marks as used
    if (action === "redeem") {
      const { error: updateError } = await supabase
        .from("email_leads")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("id", lead.id);

      if (updateError) {
        console.error("Failed to redeem code:", updateError);
        throw new Error("Failed to redeem promo code");
      }

      return new Response(
        JSON.stringify({
          valid: true,
          discount_percent: 15,
          redeemed: true,
          message: "Promo code redeemed successfully!",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: validate only
    return new Response(
      JSON.stringify({
        valid: true,
        discount_percent: 15,
        redeemed: false,
        message: "Promo code is valid",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error validating promo code:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
