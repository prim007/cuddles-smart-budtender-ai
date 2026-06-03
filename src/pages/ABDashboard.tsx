import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";

interface AbRow {
  experiment: string;
  variant: string;
  event_name: string;
  created_at: string;
  session_id: string;
}

interface VariantStats {
  variant: string;
  sessions: number;
  views: number;
  starts: number;
  messages: number;
  startRate: number; // starts / views
  msgsPerStart: number;
}

const WINDOWS: { label: string; days: number }[] = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
];

const ABDashboard = () => {
  const [rows, setRows] = useState<AbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(7);
  const [experiment, setExperiment] = useState<string>("chat_fab_v1");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - windowDays * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("ab_events")
        .select("experiment, variant, event_name, created_at, session_id")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50000);
      if (cancelled) return;
      if (error) console.error(error);
      setRows((data ?? []) as AbRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [windowDays]);

  const experiments = useMemo(
    () => Array.from(new Set(rows.map((r) => r.experiment))).sort(),
    [rows]
  );

  const stats: VariantStats[] = useMemo(() => {
    const byVariant = new Map<string, { sessions: Set<string>; views: Set<string>; starts: Set<string>; messages: number }>();
    for (const r of rows) {
      if (r.experiment !== experiment) continue;
      const bucket = byVariant.get(r.variant) ?? {
        sessions: new Set<string>(), views: new Set<string>(), starts: new Set<string>(), messages: 0,
      };
      bucket.sessions.add(r.session_id);
      if (r.event_name === "chat_view") bucket.views.add(r.session_id);
      if (r.event_name === "chat_start") bucket.starts.add(r.session_id);
      if (r.event_name === "chat_message") bucket.messages += 1;
      byVariant.set(r.variant, bucket);
    }
    return Array.from(byVariant.entries()).map(([variant, b]) => {
      const views = b.views.size || b.sessions.size; // fallback if chat_view wasn't fired
      const starts = b.starts.size;
      return {
        variant,
        sessions: b.sessions.size,
        views,
        starts,
        messages: b.messages,
        startRate: views > 0 ? starts / views : 0,
        msgsPerStart: starts > 0 ? b.messages / starts : 0,
      };
    }).sort((a, b) => b.startRate - a.startRate);
  }, [rows, experiment]);

  const best = stats[0];
  const baseline = stats.find((s) => s.variant === "control") ?? stats[stats.length - 1];
  const lift = best && baseline && baseline.startRate > 0
    ? ((best.startRate - baseline.startRate) / baseline.startRate) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <SEO title="A/B Test Dashboard — Cuddles" description="Internal A/B testing dashboard" noIndex />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">A/B Test Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chat-start conversion rate by variant — measure which UI tweaks lift engagement.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={experiment}
              onChange={(e) => setExperiment(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-card text-sm"
            >
              {experiments.length === 0 && <option value="chat_fab_v1">chat_fab_v1</option>}
              {experiments.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <div className="flex rounded-md border border-border overflow-hidden">
              {WINDOWS.map((w) => (
                <button
                  key={w.days}
                  onClick={() => setWindowDays(w.days)}
                  className={`px-3 py-2 text-sm ${windowDays === w.days ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : stats.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No data yet for <span className="font-mono">{experiment}</span> in the last {windowDays}d.
              Events start landing as soon as visitors interact with the chat.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Best variant</p>
                <p className="text-2xl font-bold mt-1">{best?.variant ?? "—"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(best?.startRate * 100).toFixed(1)}% chat-start rate
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Lift vs control</p>
                <p className={`text-2xl font-bold mt-1 ${lift >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {lift >= 0 ? "+" : ""}{lift.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs {baseline?.variant ?? "—"}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total sessions</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.reduce((s, r) => s + r.sessions, 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Last {windowDays}d</p>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Variant</th>
                      <th className="text-right px-4 py-3">Sessions</th>
                      <th className="text-right px-4 py-3">Chat views</th>
                      <th className="text-right px-4 py-3">Chat starts</th>
                      <th className="text-right px-4 py-3">Start rate</th>
                      <th className="text-right px-4 py-3">Messages</th>
                      <th className="text-right px-4 py-3">Msgs / start</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s) => (
                      <tr key={s.variant} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{s.variant}</td>
                        <td className="px-4 py-3 text-right">{s.sessions}</td>
                        <td className="px-4 py-3 text-right">{s.views}</td>
                        <td className="px-4 py-3 text-right">{s.starts}</td>
                        <td className="px-4 py-3 text-right font-semibold">{(s.startRate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">{s.messages}</td>
                        <td className="px-4 py-3 text-right">{s.msgsPerStart.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <p className="text-xs text-muted-foreground mt-4">
              <strong>Start rate</strong> = unique sessions firing <code>chat_start</code> ÷ unique sessions firing <code>chat_view</code>.
              <code>chat_start</code> fires when a user clicks the chat FAB / quick prompt or sends the first message.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ABDashboard;
