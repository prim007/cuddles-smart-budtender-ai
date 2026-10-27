import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { createParser } from "npm:eventsource-parser@3";
import { generateImage } from "./gateway-request.ts";
import { isPremiumUser } from "../_shared/premium.ts";
import { imageDailyLimit } from "../_shared/premium-limits.ts";
import { IMAGE_MODEL, shouldPause, composeImagePrompt } from "./policy.ts";

const schema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  mode: z.enum(["image", "meme"]),
  style: z.enum(["Illustration", "Cartoon", "Photographic", "Poster"]),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  topText: z.string().max(120).optional(), bottomText: z.string().max(120).optional(),
  stream: z.boolean().default(true),
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: { message: "Use POST." } }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!url || !serviceKey || !apiKey) return json({ error: { message: "Image creation is not configured yet." } }, 503);
  const admin = createClient(url, serviceKey);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: { message: "Sign in to create an image." } }, 401);
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return json({ error: { message: "Please sign in again to create an image." } }, 401);
  const input = schema.safeParse(await req.json().catch(() => null));
  if (!input.success) return json({ error: { message: "Enter a description of 3–2,000 characters and valid image options." } }, 400);
  const { data: state, error: stateError } = await admin.from("image_gateway_state").select("paused,status,reason").eq("id", "image-studio").maybeSingle();
  if (stateError) return json({ error: { message: "Image creation is temporarily unavailable." } }, 503);
  if (state?.paused) return json({ error: { message: state.reason || "Image creation is paused. The site owner needs to restore access." } }, state.status || 403);
  // Fail closed: signed-in accounts cannot evade the shared daily spend ceiling.
  // Free: 5 images a day. Premium: 20 a day.
  const premium = await isPremiumUser(admin, auth.user.id, auth.user.email);
  for (const rule of [{ bucket: `images:user:${auth.user.id}`, limit: imageDailyLimit(premium) }, { bucket: "images:global", limit: 100 }]) {
    const { data: allowed, error } = await admin.rpc("consume_ai_quota", { p_bucket: rule.bucket, p_limit: rule.limit, p_window_seconds: 86400 });
    if (error) return json({ error: { message: "Image creation is temporarily unavailable." } }, 503);
    if (allowed !== true) return json({ error: { message: `${premium ? "Today's image creation limit has been reached. Please come back tomorrow." : "You've used today's 5 free images. Come back tomorrow, or go Premium for 20 a day."}` } }, 429);
  }
  const persistBlock = async (status: number, message: string) => {
    const { error } = await admin.from("image_gateway_state").upsert({ id: "image-studio", paused: true, status, reason: message, updated_at: new Date().toISOString() });
    if (error) console.error("Could not save image access pause");
  };
  try {
    const upstream = await generateImage({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: IMAGE_MODEL, format: "openai" }, composeImagePrompt(input.data), input.data.stream, undefined, input.data.size);
    if (!upstream.ok) {
      const body = await upstream.text();
      let message = "Image creation failed.";
      let code = "";
      try { const parsed = JSON.parse(body); message = parsed.error?.message || parsed.message || message; code = parsed.error?.code || parsed.error?.type || ""; } catch { /* no private provider response logs */ }
      if (shouldPause(upstream.status, code)) await persistBlock(upstream.status, message);
      return json({ error: { message } }, upstream.status);
    }
    if (input.data.stream && upstream.body && upstream.headers.get("Content-Type")?.includes("text/event-stream")) {
      // Inspect only error metadata while forwarding every original byte unchanged.
      const [clientBody, monitorBody] = upstream.body.tee();
      const monitor = async () => {
        const pending: Promise<void>[] = [];
        const parser = createParser({ onEvent(event) {
          try {
            const p = JSON.parse(event.data);
            if (event.event !== "error" && p.type !== "error") return;
            const status = Number(p.error?.status || p.status || 0);
            const code = String(p.error?.code || p.error?.type || "");
            if (shouldPause(status, code)) pending.push(persistBlock(status || 403, p.error?.message || "Image access is paused."));
          } catch { /* ignore non-JSON SSE sentinels */ }
        } });
        const reader = monitorBody.pipeThrough(new TextDecoderStream()).getReader();
        try { while (true) { const chunk = await reader.read(); if (chunk.done) break; parser.feed(chunk.value); } } finally { reader.releaseLock(); await Promise.all(pending); }
      };
      EdgeRuntime.waitUntil(monitor().catch(() => console.error("Image stream monitor stopped")));
      return new Response(clientBody, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
    }
    return new Response(upstream.body, { status: upstream.status, headers: { ...corsHeaders, "Content-Type": upstream.headers.get("Content-Type") || "application/json", "Cache-Control": "no-cache" } });
  } catch {
    return json({ error: { message: "Image creation couldn't connect. Please try again later." } }, 503);
  }
});