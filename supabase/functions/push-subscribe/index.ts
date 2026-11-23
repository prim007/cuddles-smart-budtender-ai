import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@4.6.7";
import { isAllowedPushEndpoint, sendToUser } from "../_shared/web-push.ts";

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("subscribe"),
    subscription: z.object({
      endpoint: z.string().url().max(1000).refine(isAllowedPushEndpoint),
      keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
    }),
  }),
  z.object({ action: z.literal("unsubscribe"), endpoint: z.string().max(1000) }),
  z.object({ action: z.literal("test") }),
]);

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: claims, error } = await anon.auth.getClaims(auth.slice(7));
  const userId = claims?.claims?.sub;
  if (error || !userId || claims.claims.role !== "authenticated") return json({ error: "Unauthorized" }, 401);

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!parsed.success) return json({ error: "Invalid request" }, 400);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const b = parsed.data;

  try {
    if (b.action === "subscribe") {
      // Only the browser that owns this endpoint knows its keys. An endpoint
      // already registered to someone else may only move to the caller when
      // they present the same keys (same device, different account).
      const { data: existing } = await admin
        .from("push_subscriptions")
        .select("user_id, p256dh, auth")
        .eq("endpoint", b.subscription.endpoint)
        .maybeSingle();
      if (
        existing && existing.user_id !== userId &&
        (existing.p256dh !== b.subscription.keys.p256dh || existing.auth !== b.subscription.keys.auth)
      ) {
        return json({ error: "Could not update alerts. Please try again." }, 409);
      }
      const { error: e } = await admin.from("push_subscriptions").upsert(
        { user_id: userId, endpoint: b.subscription.endpoint, p256dh: b.subscription.keys.p256dh, auth: b.subscription.keys.auth },
        { onConflict: "endpoint" },
      );
      if (e) throw e;
      await admin.from("push_preferences").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
      return json({ ok: true });
    }
    if (b.action === "unsubscribe") {
      await admin.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", b.endpoint);
      return json({ ok: true });
    }
    const n = await sendToUser(admin, userId, {
      title: "Cuddles alerts are on 🌿",
      body: "This is how your T-break and smoke-break alerts will look.",
      url: "/t-break",
      tag: "test",
    });
    return json({ ok: true, delivered: n });
  } catch (e) {
    console.error("push-subscribe error", e);
    return json({ error: "Could not update alerts. Please try again." }, 500);
  }
});
