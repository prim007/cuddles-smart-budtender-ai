// learn-from-chats: admin-only. Turns recent user chats into anonymised Q&A
// entries in the knowledge library so Cuddles can retrieve them later.
// Bounded batch per run; dedup by content hash; stops on 402/403.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { embedTexts, sha256Hex } from "../_shared/rag.ts";

const MAX_PER_RUN = 40;
const BATCH = 20;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function redact(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/(\+?\d[\d\s-]{7,}\d)/g, "[phone]")
    .replace(/https?:\/\/\S+/g, "[link]")
    .replace(/\b(my name is|i am|i'm)\s+[A-Z][a-z]+/g, "$1 [name]")
    .trim();
}

const SKIP = /(being upgraded|cooking up something|not medical advice only|try again)/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (isAdmin !== true) return json({ error: "Forbidden" }, 403);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Service temporarily unavailable" }, 503);

    const since = new Date(Date.now() - 90 * 864e5).toISOString();
    const { data: chats, error } = await admin
      .from("chat_conversations")
      .select("user_message, assistant_message, intent")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return json({ error: "Could not read chats" }, 500);

    const { data: existing } = await admin.from("knowledge_documents").select("content_hash").eq("category", "community-qa");
    const known = new Set((existing ?? []).map((r: { content_hash: string }) => r.content_hash));

    const candidates: { title: string; content: string; content_hash: string }[] = [];
    for (const c of chats ?? []) {
      const q = redact(c.user_message ?? "");
      const a = redact(c.assistant_message ?? "");
      if (q.length < 15 || a.length < 200 || SKIP.test(a) || c.intent === "complaint") continue;
      const title = `Visitor asked: ${q.slice(0, 120)}`;
      const content = `Question: ${q.slice(0, 600)}\n\nCuddles answer: ${a.slice(0, 2500)}`;
      const content_hash = await sha256Hex(`${title}::${content}`);
      if (known.has(content_hash)) continue;
      known.add(content_hash);
      candidates.push({ title, content, content_hash });
      if (candidates.length >= MAX_PER_RUN) break;
    }
    if (candidates.length === 0) return json({ ok: true, added: 0, message: "Nothing new to learn" });

    let added = 0;
    for (let i = 0; i < candidates.length; i += BATCH) {
      const slice = candidates.slice(i, i + BATCH);
      let vectors: number[][];
      try {
        vectors = await embedTexts(apiKey, slice.map((d) => `${d.title}. ${d.content}`));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const status = /\((402|403|429)\)/.exec(msg)?.[1];
        return json({ error: status === "402" ? "AI credits are used up — top up, then try again." : "Learning paused by the AI service.", added }, status ? Number(status) : 502);
      }
      const rows = slice.map((d, idx) => ({
        category: "community-qa", title: d.title, content: d.content,
        tags: ["community", "user-chats"], source: "Anonymised user chats",
        content_hash: d.content_hash, embedding: vectors[idx], updated_at: new Date().toISOString(),
      }));
      const { error: upErr } = await admin.from("knowledge_documents").upsert(rows, { onConflict: "content_hash" });
      if (upErr) return json({ error: "Failed to store knowledge", added }, 500);
      added += rows.length;
    }
    return json({ ok: true, added });
  } catch (e) {
    console.error("learn-from-chats error:", e instanceof Error ? e.message : e);
    return json({ error: "Unable to learn from chats" }, 500);
  }
});
