// Static referral campaign copy, pasted into Brevo's campaign code editor.
// Sunset palette + Space Grotesk / Outfit to match Cuddles branding.

export const REFERRAL_CAMPAIGN_SUBJECT =
  "Unlock Cuddles AI — refer a friend, earn your first badge 🏅";

export const REFERRAL_CAMPAIGN_HTML = `
<div style="margin:0;padding:0;background:#fdf6f0;font-family:'Outfit',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="background:linear-gradient(135deg,#ff7a59,#ffb26b);border-radius:20px;padding:32px;text-align:center;">
      <h1 style="margin:0;font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:28px;line-height:1.2;color:#ffffff;">
        Unlock Cuddles AI
      </h1>
      <p style="margin:12px 0 0;font-size:16px;color:#fff4ec;">
        Refer one person who signs up and you both hit your first milestone.
      </p>
    </div>

    <div style="background:#ffffff;border-radius:20px;padding:28px;margin-top:20px;">
      <p style="font-size:16px;line-height:1.6;color:#3d2b23;margin:0 0 16px;">
        Hi there,
      </p>
      <p style="font-size:16px;line-height:1.6;color:#3d2b23;margin:0 0 16px;">
        Cuddles is your plant and cannabis intelligence companion — strain matching, label scanning,
        dispensary menus and grow guidance, all in one chat.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#3d2b23;margin:0 0 16px;">
        <strong>Here's the deal:</strong> invite a friend to sign up. When they create their account,
        you both unlock the <strong>First Sprout badge</strong> 🏅 — your first milestone on the way to
        premium Cuddles memory, personalised strain profiles and early feature access.
      </p>

      <div style="background:#fff4ec;border-radius:14px;padding:18px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#7a5a49;text-transform:uppercase;letter-spacing:.06em;">
          How it works
        </p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#3d2b23;">
          1. Share your link below.<br/>
          2. They sign up free.<br/>
          3. Badge unlocked for both of you — instantly.
        </p>
      </div>

      <div style="text-align:center;margin:28px 0 8px;">
        <a href="https://cuddles-ai.com/auth"
           style="display:inline-block;background:#ff7a59;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:999px;">
          Invite a friend &amp; claim your badge
        </a>
      </div>
      <p style="text-align:center;font-size:13px;color:#8a7369;margin:8px 0 0;">
        Or share this link: https://cuddles-ai.com
      </p>
    </div>

    <p style="font-size:12px;line-height:1.6;color:#9c8578;text-align:center;margin:20px 0 0;">
      Cuddles AI provides general plant and cannabis education only. This is not medical advice.<br/>
      You're receiving this because you signed up at cuddles-ai.com.
      <a href="{{ unsubscribe }}" style="color:#9c8578;">Unsubscribe</a>
    </p>
  </div>
</div>
`.trim();
