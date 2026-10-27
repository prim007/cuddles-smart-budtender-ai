import { supabase } from "@/integrations/supabase/client";
import { createParser } from "eventsource-parser";

export function canShareConversation(owner: string, friend: string | null, viewer: string, connected: boolean) {
  return (viewer === owner || viewer === friend) && (friend === null || connected);
}

export async function askCompanion(roomId: string, onText: (text: string) => void, signal: AbortSignal) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/companion-chat`, {
    method: "POST", headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ roomId }), signal,
  });
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Cuddles is unavailable right now.");
  }
  let text = "", done = false, failure = "";
  const parser = createParser({ onEvent(event) {
    const data = JSON.parse(event.data);
    if (data.error) failure = data.error;
    if (data.text) { text += data.text; onText(text); }
    if (data.done) done = true;
  } });
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try { while (true) { const chunk = await reader.read(); if (chunk.done) break; parser.feed(chunk.value); } }
  finally { await reader.cancel().catch(() => {}); }
  if (failure) throw new Error(failure);
  if (!done) throw new Error("The reply was interrupted. Nothing was saved.");
}