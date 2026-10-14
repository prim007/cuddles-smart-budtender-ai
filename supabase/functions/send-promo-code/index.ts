import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendLovableEmail } from "npm:@lovable.dev/email-js";
import { rateLimitResponse } from "../_shared/rate-limit.ts";

const SITE_NAME = "cuddles-ai";
const FROM_DOMAIN = "cuddles-ai.com";
const SENDER_DOMAIN = "notify.cuddles-ai.com";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generatePromoCode(): string {
  // Use cryptographically secure RNG so codes can't be predicted from
  // a recovered Math.random() seed. Rejection-sample to avoid modulo bias.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars => 5 bits/char
  const length = 8;
  const out: string[] = [];
  const buf = new Uint8Array(length * 2); // extra room for rejections
  while (out.length < length) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && out.length < length; i++) {
      const b = buf[i];
      // 256 % 32 === 0, so no bias, but keep the guard for future char-set changes.
      if (b < 256 - (256 % chars.length)) {
        out.push(chars[b % chars.length]);
      }
    }
  }
  return "CUDDLES-" + out.join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Per-IP send-specific rate limit to prevent flooding an existing lead's inbox.
  const rl = rateLimitResponse(req, { scope: "send-promo-code", max: 3, windowMs: 60 * 60_000 }, corsHeaders);
  if (rl) return rl;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }


    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit per email to prevent spam / enumeration
    const { data: allowed, error: rateErr } = await supabase.rpc("check_email_rate_limit", {
      p_email: normalizedEmail,
    });
    if (rateErr) {
      console.error("Rate-limit check failed:", rateErr);
    }
    if (allowed === false) {
      // Generic response — do not reveal registration state
      return new Response(
        JSON.stringify({ success: true, message: "If this email is registered, a code will be sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ALLOWED_SOURCES = ["chat_widget", "inline_banner", "signup_promo_modal"];
    const source = ALLOWED_SOURCES.includes(body?.source) ? body.source : "chat_widget";

    // The lead row and its promo code are created together in this request.
    // A caller can never attach a code to a lead someone else created: if the
    // email already exists, the insert conflicts and nothing is written.
    const promoCode = generatePromoCode();
    const { data: created, error: insertError } = await supabase
      .from("email_leads")
      .insert({ email: normalizedEmail, source, promo_code: promoCode })
      .select("id")
      .maybeSingle();

    if (insertError || !created) {
      if (insertError && insertError.code !== "23505") {
        console.error("Failed to create lead:", insertError.code);
        throw new Error("Failed to create lead");
      }
      // Existing lead — generic response, no writes, no email.
      return new Response(
        JSON.stringify({ success: true, message: "If this email is registered, a code will be sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via the Lovable email service (verified sender domain)
    const emailHtml = `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Outfit',Arial,Helvetica,sans-serif;color:#5c4a6b;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding:0 28px 24px;">
              <img src="https://rcigcarkcpinnniddxcm.supabase.co/storage/v1/object/public/email-assets/cuddles-logo.png" alt="Cuddles" width="48" height="48" style="border-radius:12px;display:block;margin-bottom:8px;" />
              <span style="font-family:'Space Grotesk',Arial,sans-serif;font-size:20px;font-weight:bold;color:hsl(350,65%,55%);">Cuddles</span>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 28px 20px;">
              <h1 style="margin:0;font-family:'Space Grotesk',Arial,sans-serif;font-size:24px;font-weight:bold;color:hsl(270,30%,15%);">
                Hey there! ✌️
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 28px 20px;font-size:15px;color:#5c4a6b;">
              We noticed you signed up on <strong>Cuddles AI</strong> — thank you for checking us out! We really appreciate you being part of the community.
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;font-size:15px;color:#5c4a6b;">
              As a thank you, here's an exclusive <strong>15% discount code</strong> just for you to use on the <strong>Tripple Four shop</strong>:
            </td>
          </tr>

          <!-- Promo Code Box -->
          <tr>
            <td style="padding:0 28px 24px;">
              <div style="background:linear-gradient(135deg,hsl(350,65%,55%),hsl(25,90%,60%));border-radius:16px;padding:24px;text-align:center;">
                <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.85);font-family:'Outfit',Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Your Promo Code</p>
                <p style="margin:0;font-family:'Space Grotesk',monospace;font-size:32px;font-weight:bold;color:#ffffff;letter-spacing:3px;">${promoCode}</p>
              </div>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding:0 28px 24px;font-size:15px;color:#5c4a6b;">
              <strong style="color:hsl(270,30%,15%);">How to use it:</strong><br/>
              1. Head over to <a href="https://tripplefourshophub.online" style="color:hsl(350,65%,55%);text-decoration:underline;">tripplefourshophub.online</a><br/>
              2. Browse and add items to your cart<br/>
              3. Enter the code above at checkout<br/>
              4. Enjoy 15% off your order! 🌿
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 28px 16px;">
              <a href="https://cuddles-ai.com/claim?email=${encodeURIComponent(normalizedEmail)}&code=${encodeURIComponent(promoCode)}" style="display:inline-block;background-color:hsl(350,65%,55%);color:#ffffff;font-family:'Space Grotesk',Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;border-radius:12px;padding:14px 28px;">
                Claim My Free Account →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;font-size:13px;color:#999;">
              Claim your account in one click to save this code, unlock your AI budtender, and track your favourite strains. Or <a href="https://tripplefourshophub.online" style="color:hsl(350,65%,55%);text-decoration:underline;">shop now</a> without an account.
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 28px 28px;font-size:14px;color:#999;">
              This code is unique to you and can be used once. No expiry — use it whenever you're ready!
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 28px;">
              <hr style="border:none;border-top:1px solid #ede8f0;margin:0 0 24px;" />
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 28px 8px;font-size:15px;color:#5c4a6b;">Stay lifted,</td>
          </tr>
          <tr>
            <td style="padding:0 28px 32px;">
              <strong style="color:hsl(270,30%,15%);font-family:'Space Grotesk',Arial,sans-serif;">Primrose Maseko</strong><br/>
              <span style="font-size:13px;color:#999;">Founder, Cuddles AI &amp; Tripple444</span>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 28px 16px;">
              <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                You're receiving this because you signed up at <a href="https://cuddles-ai.com" style="color:hsl(350,65%,55%);text-decoration:underline;">cuddles-ai.com</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

    const emailText = [
      "Your 15% discount code from Cuddles",
      "",
      `Discount code: ${promoCode}`,
      "",
      "Use it at checkout on the Tripple Four Shop: https://tripplefourshophub.online",
      "",
      `Claim your free Cuddles account: https://cuddles-ai.com/claim?email=${encodeURIComponent(normalizedEmail)}&code=${encodeURIComponent(promoCode)}`,
      "",
      "This code is unique to you and can be used once. No expiry.",
      "",
      "Stay lifted,",
      "Primrose Maseko - Founder, Cuddles AI & Tripple444",
      "",
      "You're receiving this because you signed up at https://cuddles-ai.com.",
    ].join("\n");

    await sendLovableEmail(
      {
        to: normalizedEmail,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: "Your 15% Discount Code from Cuddles! ✌️",
        html: emailHtml,
        text: emailText,
        purpose: "transactional",

        label: "promo-code",
        idempotency_key: `promo-${normalizedEmail}-${promoCode}`,
      },
      { apiKey: LOVABLE_API_KEY, sendUrl: Deno.env.get("LOVABLE_SEND_URL") },
    );


    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending promo code:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
