import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Clock,
  AlertCircle,
  Zap,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import SEO from "@/components/SEO";
import AgentFlameGraph from "@/components/AgentFlameGraph";
import { toast } from "sonner";


interface Trace {
  id: string;
  session_id: string | null;
  user_id: string | null;
  agent_role: string;
  step_index: number;
  tool_called: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  tokens_in: number | null;
  tokens_out: number | null;
  latency_ms: number | null;
  error: string | null;
  created_at: string;
}

interface Feedback {
  session_id: string;
  rating: number;
  notes: string | null;
}

// Gemini 2.5 Flash pricing (USD per 1M tokens)
const PRICE_IN_PER_M = 0.3;
const PRICE_OUT_PER_M = 2.5;

const calcCostUSD = (tokensIn: number, tokensOut: number) =>
  (tokensIn / 1_000_000) * PRICE_IN_PER_M + (tokensOut / 1_000_000) * PRICE_OUT_PER_M;

const percentile = (arr: number[], p: number) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
};

const RANGES: { label: string; value: string; hours: number | null }[] = [
  { label: "Last hour", value: "1h", hours: 1 },
  { label: "Last 24 hours", value: "24h", hours: 24 },
  { label: "Last 7 days", value: "7d", hours: 24 * 7 },
  { label: "Last 30 days", value: "30d", hours: 24 * 30 },
  { label: "All time", value: "all", hours: null },
];

const AgentTraces = () => {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [reviewerId, setReviewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userFilter, setUserFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("all");
  const [errorsOnly, setErrorsOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: session }, tracesRes, feedbackRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase
          .from("agent_traces" as never)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("agent_trace_feedback" as never).select("session_id, rating, notes"),
      ]);
      setReviewerId(session.session?.user?.id ?? null);
      if (tracesRes.data) setTraces(tracesRes.data as unknown as Trace[]);
      if (feedbackRes.data) {
        const map: Record<string, Feedback> = {};
        (feedbackRes.data as unknown as Feedback[]).forEach((f) => (map[f.session_id] = f));
        setFeedback(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const roleOptions = useMemo(
    () => Array.from(new Set(traces.map((t) => t.agent_role).filter(Boolean))).sort(),
    [traces],
  );
  const toolOptions = useMemo(
    () => Array.from(new Set(traces.map((t) => t.tool_called).filter(Boolean) as string[])).sort(),
    [traces],
  );

  const filtered = useMemo(() => {
    const hours = RANGES.find((r) => r.value === rangeFilter)?.hours ?? null;
    const cutoff = hours ? Date.now() - hours * 3600_000 : null;
    const q = userFilter.trim().toLowerCase();
    return traces.filter((t) => {
      if (cutoff && new Date(t.created_at).getTime() < cutoff) return false;
      if (roleFilter !== "all" && t.agent_role !== roleFilter) return false;
      if (toolFilter !== "all" && t.tool_called !== toolFilter) return false;
      if (errorsOnly && !t.error) return false;
      if (q) {
        const hay = `${t.user_id ?? ""} ${t.session_id ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [traces, userFilter, roleFilter, toolFilter, rangeFilter, errorsOnly]);

  const resetFilters = () => {
    setUserFilter("");
    setRoleFilter("all");
    setToolFilter("all");
    setRangeFilter("all");
    setErrorsOnly(false);
  };

  // Group traces by session
  const sessions = useMemo(() => {
    return filtered.reduce<Record<string, Trace[]>>((acc, t) => {
      const key = t.session_id ?? "no-session";
      (acc[key] ||= []).push(t);
      return acc;
    }, {});
  }, [filtered]);


  // Aggregate metrics
  const metrics = useMemo(() => {
    const sessionIds = Object.keys(sessions).filter((s) => s !== "no-session");
    const sessionLatencies: number[] = [];
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let toolCalls = 0;
    let toolErrors = 0;
    let sessionsWithError = 0;

    sessionIds.forEach((sid) => {
      const items = sessions[sid];
      const lat = items.reduce((s, t) => s + (t.latency_ms ?? 0), 0);
      sessionLatencies.push(lat);
      items.forEach((t) => {
        totalTokensIn += t.tokens_in ?? 0;
        totalTokensOut += t.tokens_out ?? 0;
        if (t.tool_called) toolCalls++;
        if (t.error) toolErrors++;
      });
      if (items.some((t) => t.error)) sessionsWithError++;
    });

    const totalCost = calcCostUSD(totalTokensIn, totalTokensOut);
    const numSessions = sessionIds.length || 1;

    const ratings = Object.values(feedback);
    const upVotes = ratings.filter((f) => f.rating === 1).length;
    const downVotes = ratings.filter((f) => f.rating === -1).length;
    const accuracyPct = ratings.length > 0 ? Math.round((upVotes / ratings.length) * 100) : null;

    return {
      sessionCount: sessionIds.length,
      avgTokensPerSession: Math.round((totalTokensIn + totalTokensOut) / numSessions),
      avgCostPerSession: totalCost / numSessions,
      totalCost,
      p95Latency: Math.round(percentile(sessionLatencies, 95)),
      avgLatency: Math.round(sessionLatencies.reduce((s, n) => s + n, 0) / numSessions),
      toolSuccessRate:
        toolCalls > 0 ? Math.round(((toolCalls - toolErrors) / toolCalls) * 100) : 100,
      errorRate: Math.round((sessionsWithError / numSessions) * 100),
      upVotes,
      downVotes,
      accuracyPct,
      reviewedCount: ratings.length,
    };
  }, [sessions, feedback]);

  const submitFeedback = async (sessionId: string, rating: 1 | -1) => {
    if (!reviewerId) {
      toast.error("Sign in as admin to rate");
      return;
    }
    const { error } = await supabase
      .from("agent_trace_feedback" as never)
      .upsert(
        { session_id: sessionId, reviewer_id: reviewerId, rating } as never,
        { onConflict: "session_id,reviewer_id" } as never,
      );
    if (error) {
      toast.error("Could not save rating");
      return;
    }
    setFeedback((prev) => ({
      ...prev,
      [sessionId]: { session_id: sessionId, rating, notes: prev[sessionId]?.notes ?? null },
    }));
    toast.success(rating === 1 ? "Marked accurate" : "Marked inaccurate");
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <SEO
        title="Agent Traces — Cuddles Admin"
        description="Internal shadow-mode observability for Cuddles AI agentic workflows."
        url="/agent-traces"
        noindex
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Agent Observability
          </h1>
          <p className="text-muted-foreground mt-2">
            Shadow-mode metrics for the Personalized Recommendation agent. Rate sessions to track
            accuracy before promoting to production.
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-3">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="User or session ID…"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              aria-label="Filter by user or session ID"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger aria-label="Filter by specialist">
                <SelectValue placeholder="Specialist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All specialists</SelectItem>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={toolFilter} onValueChange={setToolFilter}>
              <SelectTrigger aria-label="Filter by tool">
                <SelectValue placeholder="Tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tools</SelectItem>
                {toolOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rangeFilter} onValueChange={setRangeFilter}>
              <SelectTrigger aria-label="Filter by time range">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Button
              size="sm"
              variant={errorsOnly ? "destructive" : "outline"}
              onClick={() => setErrorsOnly((v) => !v)}
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
              Errors only
            </Button>
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              <X className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {traces.length} trace events ·{" "}
              {Object.keys(sessions).length} sessions
            </span>
          </div>
        </Card>


        {/* Metrics dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
              <Activity className="w-4 h-4" /> Sessions
            </div>
            <div className="text-2xl font-bold mt-1">{metrics.sessionCount}</div>
            <div className="text-xs text-muted-foreground mt-1">last 500 trace events</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
              <DollarSign className="w-4 h-4" /> Cost / session
            </div>
            <div className="text-2xl font-bold mt-1">
              ${metrics.avgCostPerSession.toFixed(5)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              total ${metrics.totalCost.toFixed(4)} · {metrics.avgTokensPerSession} tok avg
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
              <Clock className="w-4 h-4" /> Latency
            </div>
            <div className="text-2xl font-bold mt-1">{metrics.p95Latency}ms</div>
            <div className="text-xs text-muted-foreground mt-1">
              p95 · avg {metrics.avgLatency}ms
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" /> Tool success
            </div>
            <div className="text-2xl font-bold mt-1">{metrics.toolSuccessRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.errorRate}% session error rate
            </div>
          </Card>
        </div>

        {/* Accuracy panel */}
        <Card className="p-4 mb-8 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <TrendingUp className="w-4 h-4" /> Reviewer accuracy score
              </div>
              <div className="text-3xl font-bold mt-1">
                {metrics.accuracyPct !== null ? `${metrics.accuracyPct}%` : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.reviewedCount} of {metrics.sessionCount} sessions rated · target ≥ 85%
                before production
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="secondary" className="text-base px-3 py-1">
                <ThumbsUp className="w-4 h-4 mr-1.5 text-emerald-500" /> {metrics.upVotes}
              </Badge>
              <Badge variant="secondary" className="text-base px-3 py-1">
                <ThumbsDown className="w-4 h-4 mr-1.5 text-rose-500" /> {metrics.downVotes}
              </Badge>
            </div>
          </div>
        </Card>

        {!loading && filtered.length > 0 && (
          <div className="mb-8">
            <AgentFlameGraph traces={filtered} />
          </div>
        )}

        {loading && <p className="text-muted-foreground">Loading traces…</p>}

        {!loading && filtered.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            {traces.length === 0
              ? "No agent traces yet. Send a chat message to generate one."
              : "No traces match these filters."}
          </Card>

        )}

        <div className="space-y-6">
          {Object.entries(sessions).map(([sid, items]) => {
            const tokensIn = items.reduce((s, t) => s + (t.tokens_in ?? 0), 0);
            const tokensOut = items.reduce((s, t) => s + (t.tokens_out ?? 0), 0);
            const totalTokens = tokensIn + tokensOut;
            const cost = calcCostUSD(tokensIn, tokensOut);
            const totalLatency = items.reduce((s, t) => s + (t.latency_ms ?? 0), 0);
            const hasError = items.some((t) => t.error);
            const fb = feedback[sid];

            return (
              <Card key={sid} className="p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                    {sid}
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {hasError && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        error
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      <Zap className="w-3 h-3 mr-1" />
                      {totalTokens} tok
                    </Badge>
                    <Badge variant="secondary">
                      <DollarSign className="w-3 h-3 mr-1" />${cost.toFixed(5)}
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {totalLatency}ms
                    </Badge>
                    {sid !== "no-session" && (
                      <div className="flex gap-1 ml-2 border-l border-border pl-2">
                        <Button
                          size="sm"
                          variant={fb?.rating === 1 ? "default" : "ghost"}
                          className="h-7 px-2"
                          onClick={() => submitFeedback(sid, 1)}
                          aria-label="Mark accurate"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={fb?.rating === -1 ? "destructive" : "ghost"}
                          className="h-7 px-2"
                          onClick={() => submitFeedback(sid, -1)}
                          aria-label="Mark inaccurate"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items
                    .sort((a, b) => a.step_index - b.step_index)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="text-sm flex items-start gap-2 py-1 border-l-2 border-muted pl-3"
                      >
                        <Badge variant="outline" className="shrink-0">
                          step {t.step_index}
                        </Badge>
                        {t.tool_called && (
                          <span className="font-mono text-primary">{t.tool_called}</span>
                        )}
                        {t.latency_ms !== null && (
                          <span className="text-muted-foreground">· {t.latency_ms}ms</span>
                        )}
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
