import { useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Loader2, Sparkles } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";

type Kind = "journal" | "tbreak" | "grow";

const COPY: Record<Kind, { title: string; button: string }> = {
  journal: { title: "What works for me", button: "Show my patterns" },
  tbreak: { title: "Today's personal check-in", button: "Check in with Cuddles" },
  grow: { title: "My feeding & climate schedule", button: "Make my schedule" },
};

export default function PremiumInsightCard({ kind, plantId }: { kind: Kind; plantId?: string }) {
  const { isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");
  const copy = COPY[kind];

  const run = async () => {
    setLoading(true);
    setError("");
    const { data, error: fnError } = await supabase.functions.invoke("premium-insights", { body: { kind, plantId } });
    if (fnError) {
      let msg = "Insights are unavailable right now.";
      if (fnError instanceof FunctionsHttpError) {
        try { msg = (await fnError.context.json()).error ?? msg; } catch { /* keep default */ }
      }
      setError(msg);
    } else {
      setInsight(data?.insight ?? "");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-3">
      <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-foreground">
        <Sparkles className="w-5 h-5 text-primary" /> {copy.title}
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          <Crown className="w-3 h-3" /> Premium
        </span>
      </h3>
      {isPremium ? (
        <>
          <Button onClick={run} disabled={loading || (kind === "grow" && !plantId)}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Thinking…</> : copy.button}
          </Button>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {insight && <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{insight}</div>}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Personal insights are part of Premium. The chat stays free for everyone.{" "}
          <Link to="/premium" className="text-primary underline">See Premium</Link>
        </p>
      )}
    </div>
  );
}
