import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { consumeQuotas, DAY_SECONDS } from "../_shared/ai-quota.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID" };
const json = (error: string, status: number) => new Response(JSON.stringify({ error }), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json("Method not allowed", 405);
  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authorization = req.headers.get("authorization") ?? "";
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return json("Please sign in again.", 401);
    const { roomId } = await req.json();
    if (typeof roomId !== "string" || !/^[0-9a-f-]{36}$/i.test(roomId)) return json("Choose a conversation.", 400);
    const { data: room } = await client.from("companion_rooms").select("id,friend_id").eq("id", roomId).maybeSingle();
    if (!room) return json("This conversation is unavailable or your connection has ended.", 403);
    const { data: history, error } = await client.from("companion_messages").select("role,content,sender_id").eq("room_id", roomId).order("created_at").order("id");
    if (error || !history?.length) return json("Send a message first.", 400);
    if (history.length > 48) return json("Please start a new conversation to continue with Cuddles.", 400);
    if (room.friend_id) {
      const exhausted = await consumeQuotas([{ bucket: `sb:user:${auth.user.id}`, limit: 300, windowSeconds: DAY_SECONDS }]);
      if (exhausted) return json("Cuddles is busy. Please try again later.", 429);
    }
    const messages = history.map((m) => ({ role: m.role, content: room.friend_id && m.role === "user" ? `[Participant ${m.sender_id === auth.user.id ? "A" : "B"}] ${m.content}` : m.content }));
    messages.push({ role: "user", content: room.friend_id
      ? "Cuddles, please help us with this shared conversation. Use only what we intentionally wrote here. Do not access personal records. Keep it short, educational, not medical advice. Suggest next steps but never claim to save tasks or send reminders."
      : "Cuddles, help me plan the next step. Keep it short and educational, not medical advice. You may use my own history. Suggest tasks, but do not claim to save tasks or set reminders; I will approve and save them myself." });
    // Shared turns deliberately omit the user's JWT: the existing agent cannot
    // load a participant's private journal, grow records or personal memory.
    const upstream = await fetch(`${url}/functions/v1/smart-budtender`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: anon, Authorization: room.friend_id ? `Bearer ${anon}` : authorization },
      body: JSON.stringify({ messages, sessionId: `companion:${roomId}`, language: "en" }), signal: req.signal,
    });
    if (!upstream.ok || !upstream.body) {
      if (upstream.status === 402) return json("Our Groovy engineers are cooking up something, apologies.", 402);
      const body = await upstream.json().catch(() => ({}));
      return json(typeof body.error === "string" ? body.error : "Cuddles is unavailable right now. Please try again later.", upstream.status || 503);
    }
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let content = "", buffer = "", complete = false;
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader();
        if (!reader) { controller.close(); return; }
        const emit = (event: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            buffer += decoder.decode(chunk.value, { stream: true });
            let end: number;
            while ((end = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1);
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (data === "[DONE]") { complete = true; continue; }
              let parsed;
              try { parsed = JSON.parse(data); } catch { continue; }
              if (parsed.error) throw new Error("Cuddles could not finish this reply.");
              const text = parsed.choices?.[0]?.delta?.content;
              if (typeof text === "string") { content += text; emit({ text }); }
            }
          }
          if (!complete || !content.trim()) throw new Error("Cuddles could not finish this reply. Nothing was saved.");
          const { data: allowed } = await client.rpc("can_access_companion_room", { p_room: roomId });
          if (!allowed) throw new Error("Your connection has ended. Nothing was saved.");
          const { error: saveError } = await admin.from("companion_messages").insert({ room_id: roomId, role: "assistant", content: content.slice(0, 4500) });
          if (saveError) throw new Error("The reply could not be saved.");
          emit({ done: true });
        } catch (error) {
          if (!req.signal.aborted) emit({ error: error instanceof Error ? error.message : "Cuddles could not finish this reply." });
        } finally { await reader.cancel().catch(() => {}); controller.close(); }
      },
    });
    return new Response(stream, { headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch { return json("Cuddles could not start this reply. Please try again.", 500); }
});