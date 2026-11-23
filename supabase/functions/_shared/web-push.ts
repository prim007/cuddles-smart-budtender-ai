import webpush from "npm:web-push@3.6.7";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

let configured = false;
function configure() {
  if (configured) return;
  const pub = Deno.env.get("VAPID_PUBLIC_KEY");
  const priv = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!pub || !priv) throw new Error("VAPID keys are not configured");
  webpush.setVapidDetails("mailto:admin@cuddles-ai.com", pub, priv);
  configured = true;
}

// Only real browser push services may receive signed push requests.
const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com",
  "android.googleapis.com",
  "updates.push.services.mozilla.com",
  "push.services.mozilla.com",
  "notify.windows.com",
  "push.apple.com",
];
export function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const u = new URL(endpoint);
    if (u.protocol !== "https:" || u.port) return false;
    const h = u.hostname.toLowerCase();
    return PUSH_HOST_SUFFIXES.some((s) => h === s || h.endsWith("." + s));
  } catch {
    return false;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/** Sends to every device of a user. Removes subscriptions the browser has expired. Returns count delivered. */
export async function sendToUser(admin: SupabaseClient, userId: string, payload: PushPayload): Promise<number> {
  configure();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);
  let delivered = 0;
  for (const s of subs ?? []) {
    if (!isAllowedPushEndpoint(s.endpoint)) {
      await admin.from("push_subscriptions").delete().eq("id", s.id);
      continue;
    }
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 12 },
      );
      delivered++;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("id", s.id);
      } else {
        console.error("push send failed", status, (e as Error).message);
      }
    }
  }
  return delivered;
}
