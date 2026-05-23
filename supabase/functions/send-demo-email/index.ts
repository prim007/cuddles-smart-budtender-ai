import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RECIPIENT_EMAIL = "primncube55@gmail.com";

// Escape user-provided strings before embedding into HTML email bodies.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, phone, message } = await req.json();

    // Validate required fields
    if (!name || !email || !company) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, company" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate field lengths
    if (name.length > 100 || email.length > 255 || company.length > 100 ||
        (phone && phone.length > 50) || (message && message.length > 2000)) {
      return new Response(
        JSON.stringify({ error: "Field length exceeds maximum" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side rate limit (bypasses spoofable RLS-only enforcement)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseKey);
    const normalizedEmail = email.trim().toLowerCase();
    const { data: allowed, error: rateErr } = await adminClient.rpc("check_demo_rate_limit", {
      p_email: normalizedEmail,
    });
    if (rateErr) {
      console.error("Rate-limit check failed:", rateErr);
    }
    if (allowed === false) {
      return new Response(
        JSON.stringify({ error: "Too many demo requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      // Fallback: store in database if no email API key
      console.log("No RESEND_API_KEY found. Logging demo request.");
      console.log(`Demo request from: ${name} (${email}), Company: ${company}, Phone: ${phone || "N/A"}, Message: ${message || "N/A"}`);

      // Use Supabase to store the request
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/demo_requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name,
          email,
          company,
          phone: phone || null,
          message: message || null,
          store_count: "unknown",
          current_systems: "From Why Cuddles page",
        }),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error("DB insert error:", errText);
        throw new Error("Failed to store demo request");
      }

      return new Response(
        JSON.stringify({ success: true, method: "database" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend
    const emailHtml = `
      <h2>New Demo Request from Cuddles AI</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${company}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || "Not provided"}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Message</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${message || "No message"}</td></tr>
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">Sent from the Cuddles AI "Why Cuddles" page</p>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Cuddles AI <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        subject: `New Demo Request: ${company} - ${name}`,
        html: emailHtml,
        reply_to: email,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      throw new Error("Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, method: "email" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
