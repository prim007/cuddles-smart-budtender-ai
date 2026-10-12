// Runs hourly (cron). Every alert is recorded in push_sent_log with a unique
// dedupe key, so repeated or unauthorised triggers can never send duplicates.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendToUser, type PushPayload } from "../_shared/web-push.ts";

const DAY = 86_400_000;
const MILESTONES = new Set([1, 3, 5, 14, 21, 30]);
const TZ_OFFSET_HOURS = 2; // South Africa (SAST)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: subs } = await admin.from("push_subscriptions").select("user_id");
  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];
  if (!userIds.length) return new Response(JSON.stringify({ sent: 0 }), { headers: corsHeaders });

  const [{ data: prefs }, { data: breaks }] = await Promise.all([
    admin.from("push_preferences").select("*").in("user_id", userIds),
    admin.from("tolerance_breaks").select("id,user_id,start_date,target_days,daily_logs").eq("status", "active").in("user_id", userIds),
  ]);

  const now = Date.now();
  const local = new Date(now + TZ_OFFSET_HOURS * 3_600_000);
  const localHour = local.getUTCHours();
  const today = local.toISOString().slice(0, 10);
  let sent = 0;

  async function once(userId: string, key: string, payload: PushPayload) {
    const { error } = await admin.from("push_sent_log").insert({ user_id: userId, dedupe_key: key });
    if (error) return; // already sent
    sent += await sendToUser(admin, userId, payload);
  }

  for (const userId of userIds) {
    const p = prefs?.find((x) => x.user_id === userId) ?? { tbreak_alerts: true, daily_checkin: true, checkin_hour: 19, smoke_break_hours: null };
    const brk = breaks?.find((b) => b.user_id === userId);

    if (brk && p.tbreak_alerts) {
      const day = Math.floor((now - new Date(brk.start_date).getTime()) / DAY);
      if (day >= brk.target_days) {
        await once(userId, `done-${brk.id}`, {
          title: "Congratulations, you made it! 🎉",
          body: `You finished your ${brk.target_days}-day T-break. Open Cuddles to log it and claim your reward.`,
          url: "/t-break",
          tag: "tbreak",
        });
      } else if (MILESTONES.has(day)) {
        await once(userId, `ms-${brk.id}-${day}`, {
          title: `Day ${day} done 💪`,
          body: `${brk.target_days - day} day${brk.target_days - day === 1 ? "" : "s"} to go. Your tolerance is resetting.`,
          url: "/t-break",
          tag: "tbreak",
        });
      }
    }

    if (brk && p.daily_checkin && localHour >= p.checkin_hour) {
      const logged = JSON.stringify(brk.daily_logs ?? []).includes(today);
      if (!logged) {
        await once(userId, `checkin-${today}`, {
          title: "Quick check-in? 📝",
          body: "How are you feeling today? It takes 10 seconds.",
          url: "/t-break",
          tag: "checkin",
        });
      }
    }

    // Smoke-break reminders only between 08:00 and 21:59 local time.
    if (p.smoke_break_hours && localHour >= 8 && localHour < 22) {
      const slot = Math.floor(now / (p.smoke_break_hours * 3_600_000));
      await once(userId, `smoke-${p.smoke_break_hours}-${slot}`, {
        title: "Time for a break 🌿",
        body: "Step away, stretch, drink some water. Take it slow.",
        url: "/dashboard",
        tag: "smoke",
      });
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
