import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, AlertCircle, Zap } from "lucide-react";
import SEO from "@/components/SEO";

interface Trace {
  id: string;
  session_id: string | null;
  user_id: string | null;
  agent_role: string;
  step_index: number;
  tool_called: string | null;
  payload: Record<string, unknown>;
  tokens_in: number | null;
  tokens_out: number | null;
  latency_ms: number | null;
  error: string | null;
  created_at: string;
}

const AgentTraces = () => {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("agent_traces" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setTraces(data as unknown as Trace[]);
      setLoading(false);
    };
    load();
  }, []);

  // Group by session
  const sessions = traces.reduce<Record<string, Trace[]>>((acc, t) => {
    const key = t.session_id ?? "no-session";
    (acc[key] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <SEO title="Agent Traces — Cuddles Admin" description="Shadow-mode observability for agentic workflows" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Agent Traces
          </h1>
          <p className="text-muted-foreground mt-2">
            Shadow-mode logs from the Personalized Recommendation agent. Compare against the user-visible smart-budtender reply to gauge accuracy.
          </p>
        </div>

        {loading && <p className="text-muted-foreground">Loading traces…</p>}

        {!loading && traces.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No agent traces yet. Send a chat message to generate one.
          </Card>
        )}

        <div className="space-y-6">
          {Object.entries(sessions).map(([sid, items]) => {
            const totalTokens = items.reduce((s, t) => s + (t.tokens_in ?? 0) + (t.tokens_out ?? 0), 0);
            const totalLatency = items.reduce((s, t) => s + (t.latency_ms ?? 0), 0);
            const hasError = items.some((t) => t.error);
            return (
              <Card key={sid} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-xs text-muted-foreground truncate">{sid}</div>
                  <div className="flex gap-2">
                    {hasError && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />error</Badge>}
                    <Badge variant="secondary"><Zap className="w-3 h-3 mr-1" />{totalTokens} tokens</Badge>
                    <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{totalLatency}ms</Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items.sort((a, b) => a.step_index - b.step_index).map((t) => (
                    <div key={t.id} className="text-sm flex items-start gap-2 py-1 border-l-2 border-muted pl-3">
                      <Badge variant="outline" className="shrink-0">step {t.step_index}</Badge>
                      {t.tool_called && <span className="font-mono text-primary">{t.tool_called}</span>}
                      {t.latency_ms !== null && <span className="text-muted-foreground">· {t.latency_ms}ms</span>}
                      {t.error && <span className="text-destructive">· {t.error}</span>}
                      {t.payload && Object.keys(t.payload).length > 0 && (
                        <code className="text-xs text-muted-foreground truncate">
                          {JSON.stringify(t.payload).slice(0, 120)}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentTraces;
