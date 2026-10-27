import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function LearnFromChats() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("learn-from-chats", { body: {} });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = (await error.context.json())?.error ?? msg; } catch { /* keep */ }
      }
      setResult(msg);
    } else {
      setResult(data?.added ? `Added ${data.added} new answers to Cuddles' knowledge.` : "Nothing new to learn right now.");
    }
    setBusy(false);
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16 space-y-6">
      <h1 className="font-display text-3xl text-foreground">Learn from chats</h1>
      <p className="text-muted-foreground">
        Takes up to 40 recent visitor questions and Cuddles' answers, removes emails, phone numbers,
        links and names, and adds them to the knowledge library so Cuddles can draw on them.
      </p>
      <Button onClick={run} disabled={busy}>{busy ? "Learning…" : "Learn from recent chats"}</Button>
      {result && <p role="status" className="text-foreground">{result}</p>}
    </main>
  );
}
