import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Activity, AlertTriangle, Gauge, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

type TraceRow = {
  created_at: string;
  agent_role: string | null;
  tool_called: string | null;
  latency_ms: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  error: string | null;
};

type EmailRow = { created_at: string; status: string; template_name: string };

const WINDOWS = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
];

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Math.round(sorted[idx]);
}

const fmtMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

const PipelineHealth = () => {
  const [hours, setHours] = useState(24);
  const [traces, setTraces] = useState<TraceRow[]>([]);
  const [chats, setChats] = useState<{ created_at: string }[]>([]);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    try {
      const [t, c, e] = await Promise.all([
        supabase
          .from("agent_traces")
          .select("created_at, agent_role, tool_called, latency_ms, tokens_in, tokens_out, error")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase
          .from("chat_conversations")
          .select("created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase
          .from("email_send_log")
          .select("created_at, status, template_name")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(2000),
      ]);

      if (t.error) throw t.error;
      setTraces((t.data ?? []) as TraceRow[]);
      setChats(c.data ?? []);
      setEmails((e.data ?? []) as EmailRow[]);
    } catch (err) {
      console.error("pipeline health fetch failed", err);
      toast({
        title: "Could not load pipeline metrics",
        description: "Check that you have admin access, then retry.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hours, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const metrics = useMemo(() => {
    const latencies = traces.map((t) => t.latency_ms ?? 0).filter((n) => n > 0);
    const errors = traces.filter((t) => t.error);
    const tokens = traces.reduce((sum, t) => sum + (t.tokens_in ?? 0) + (t.tokens_out ?? 0), 0);

    // latency by stage (tool or agent role)
    const stageMap = new Map<string, number[]>();
    traces.forEach((t) => {
      const key = t.tool_called || t.agent_role || "unknown";
      if (!t.latency_ms) return;
      stageMap.set(key, [...(stageMap.get(key) ?? []), t.latency_ms]);
    });
    const stages = Array.from(stageMap.entries())
      .map(([stage, vals]) => ({
        stage,
        calls: vals.length,
        p50: percentile(vals, 50),
        p95: percentile(vals, 95),
      }))
      .sort((a, b) => b.p95 - a.p95)
      .slice(0, 10);

    // timeline buckets
    const bucketMs = hours <= 24 ? 3600 * 1000 : 24 * 3600 * 1000;
    const bucketCount = hours <= 24 ? hours : hours / 24;
    const now = Date.now();
    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const start = now - (bucketCount - i) * bucketMs;
      return {
        key: start,
        label:
          hours <= 24
            ? new Date(start).toLocaleTimeString("en-ZA", { hour: "2-digit" })
            : new Date(start).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
        chats: 0,
        errors: 0,
        latencies: [] as number[],
      };
    });
    const bucketFor = (iso: string) => {
      const idx = Math.floor((new Date(iso).getTime() - (now - bucketCount * bucketMs)) / bucketMs);
      return buckets[idx];
    };
    chats.forEach((c) => {
      const b = bucketFor(c.created_at);
      if (b) b.chats += 1;
    });
    traces.forEach((t) => {
      const b = bucketFor(t.created_at);
      if (!b) return;
      if (t.error) b.errors += 1;
      if (t.latency_ms) b.latencies.push(t.latency_ms);
    });
    const timeline = buckets.map((b) => ({
      label: b.label,
      chats: b.chats,
      errors: b.errors,
      p95: percentile(b.latencies, 95),
    }));

    const emailFailures = emails.filter((e) => e.status !== "sent" && e.status !== "delivered");

    return {
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      calls: traces.length,
      errorRate: traces.length ? (errors.length / traces.length) * 100 : 0,
      errorCount: errors.length,
      tokens,
      chatCount: chats.length,
      stages,
      timeline,
      recentErrors: errors.slice(0, 8),
      emailFailures: emailFailures.length,
      emailTotal: emails.length,
    };
  }, [traces, chats, emails, hours]);

  const health =
    metrics.errorRate > 5 || metrics.p95 > 8000
      ? { label: "Degraded", tone: "destructive" as const }
      : metrics.errorRate > 1 || metrics.p95 > 5000
        ? { label: "Watch", tone: "secondary" as const }
        : { label: "Healthy", tone: "default" as const };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pipeline Health"
        description="Internal Cuddles AI pipeline health and latency dashboard."
        url="/pipeline-health"
        noindex
      />
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {WINDOWS.map((w) => (
              <Button
                key={w.label}
                size="sm"
                variant={hours === w.hours ? "default" : "outline"}
                onClick={() => setHours(w.hours)}
              >
                {w.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Pipeline Health</h1>
          <Badge variant={health.tone}>{health.label}</Badge>
        </div>
        <p className="text-muted-foreground -mt-4">
          Chat, edge function, LLM and data-layer latency over the last {WINDOWS.find((w) => w.hours === hours)?.label}.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Chats</CardDescription>
              <CardTitle className="text-2xl">{metrics.chatCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Agent steps</CardDescription>
              <CardTitle className="text-2xl">{metrics.calls}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>p50 latency</CardDescription>
              <CardTitle className="text-2xl">{fmtMs(metrics.p50)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>p95 latency</CardDescription>
              <CardTitle className="text-2xl">{fmtMs(metrics.p95)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Error rate</CardDescription>
              <CardTitle className="text-2xl">{metrics.errorRate.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tokens used</CardDescription>
              <CardTitle className="text-2xl">{metrics.tokens.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Throughput & errors
              </CardTitle>
              <CardDescription>Chat volume vs failed agent steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.timeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="chats" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="errors" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                p95 latency trend
              </CardTitle>
              <CardDescription>Milliseconds per bucket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.timeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="p95" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Slowest stages
            </CardTitle>
            <CardDescription>Ranked by p95 — your bottlenecks</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.stages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No traced steps in this window.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {metrics.stages.map((s) => (
                  <div key={s.stage} className="flex items-center justify-between py-2 gap-4">
                    <span className="font-medium truncate">{s.stage}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {s.calls} calls · p50 {fmtMs(s.p50)} · p95 {fmtMs(s.p95)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Recent failures
              </CardTitle>
              <CardDescription>{metrics.errorCount} failed steps in window</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.recentErrors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No errors recorded. 🎉</p>
              ) : (
                metrics.recentErrors.map((e, i) => (
                  <div key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleString("en-ZA")} · {e.tool_called || e.agent_role || "unknown"}
                    </div>
                    <div className="text-sm break-words">{e.error}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery & data layer</CardTitle>
              <CardDescription>Email pipeline outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Emails logged</span>
                <span className="font-medium">{metrics.emailTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Failed / pending</span>
                <span className="font-medium">{metrics.emailFailures}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg tokens per step</span>
                <span className="font-medium">
                  {metrics.calls ? Math.round(metrics.tokens / metrics.calls) : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">p99 latency</span>
                <span className="font-medium">{fmtMs(metrics.p99)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PipelineHealth;
