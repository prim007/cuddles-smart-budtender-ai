// Newsletter opt-in campaign, pasted into Brevo's campaign code editor.
// Sunset palette + Space Grotesk / Outfit to match Cuddles branding.

export const NEWSLETTER_CAMPAIGN_SUBJECT =
  "🌱 Get the Cuddles newsletter — strain drops, grow tips & plant care";

export const NEWSLETTER_CAMPAIGN_HTML = `
<div style="margin:0;padding:0;background:#fdf6f0;font-family:'Outfit',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

    <div style="background:linear-gradient(135deg,#ff7a59,#ffb26b);border-radius:24px;padding:36px 28px;text-align:center;">
      <div style="font-size:40px;line-height:1;">🌿</div>
      <h1 style="margin:12px 0 0;font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:28px;line-height:1.25;color:#ffffff;">
        Want the good stuff in your inbox?
      </h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:#fff4ec;">
        Join the Cuddles newsletter — one short, useful email. No spam, ever.
      </p>
    </div>

    <div style="background:#ffffff;border-radius:24px;padding:28px;margin-top:20px;">
      <p style="font-size:16px;line-height:1.6;color:#3d2b23;margin:0 0 16px;">
        Hi there 👋
      </p>
      <p style="font-size:16px;line-height:1.6;color:#3d2b23;margin:0 0 20px;">
        You already chat with Cuddles — your plant and cannabis intelligence companion.
        The newsletter is where we send the things that don't fit in a chat window.
      </p>

      <div style="background:#fff4ec;border-radius:16px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;font-size:13px;color:#7a5a49;text-transform:uppercase;letter-spacing:.08em;">
          What you'll get
        </p>
        <p style="margin:0;font-size:15px;line-height:1.9;color:#3d2b23;">
          🍃 &nbsp;New strain profiles &amp; effect matches<br/>
          🪴 &nbsp;Plant care and grow tips that actually work<br/>
          📍 &nbsp;Dispensary menu drops near you<br/>
          ✨ &nbsp;Early access to new Cuddles features
        </p>
      </div>

      <div style="text-align:center;margin:0 0 12px;">
        <a href="https://cuddles-ai.com/#newsletter"
           style="display:inline-block;background:#ff7a59;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:15px 32px;border-radius:999px;">
          Subscribe to the newsletter
        </a>
      </div>
      <p style="text-align:center;font-size:13px;color:#8a7369;margin:8px 0 0;">
        Takes 5 seconds. Unsubscribe any time, one click.
      </p>
    </div>

    <div style="background:#ffffff;border-radius:24px;padding:22px 28px;margin-top:16px;text-align:center;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:#3d2b23;">
        Not ready for email? Just come chat 🌱<br/>
        <a href="https://cuddles-ai.com/chat" style="color:#ff7a59;font-weight:600;text-decoration:none;">
          Ask Cuddles something
        </a>
      </p>
    </div>

    <p style="font-size:12px;line-height:1.6;color:#9c8578;text-align:center;margin:22px 0 0;">
      Cuddles AI provides general plant and cannabis education only. This is not medical advice.<br/>
      You're receiving this because you signed up at cuddles-ai.com.
      <a href="{{ unsubscribe }}" style="color:#9c8578;">Unsubscribe</a>
    </p>
  </div>
</div>
`.trim();
