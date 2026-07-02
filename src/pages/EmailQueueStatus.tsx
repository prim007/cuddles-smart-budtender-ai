import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Mail, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QueueMetric {
  queue_name: string;
  queue_length: number;
  newest_msg_age_sec: number | null;
  oldest_msg_age_sec: number | null;
  total_messages: number;
}

interface LogRow {
  id: string;
  message_id: string | null;
  template_name: string | null;
  recipient_email: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface StatusCounts {
  sent: number;
  failed: number;
  dlq: number;
  rate_limited: number;
  pending: number;
}

const statusColor = (s: string): string => {
  switch (s) {
    case "sent": return "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30";
    case "failed": return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
    case "dlq": return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
    case "rate_limited": return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30";
    case "suppressed": return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const EmailQueueStatus = () => {
  const [metrics, setMetrics] = useState<QueueMetric[]>([]);
  const [counts24h, setCounts24h] = useState<StatusCounts>({ sent: 0, failed: 0, dlq: 0, rate_limited: 0, pending: 0 });
  const [recentErrors, setRecentErrors] = useState<LogRow[]>([]);
  const [recentSends, setRecentSends] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [metricsRes, logsRes, errorsRes, sentRes] = await Promise.all([
        supabase.rpc("get_email_queue_metrics" as never),
        supabase
          .from("email_send_log")
          .select("status")
          .gte("created_at", since),
        supabase
          .from("email_send_log")
          .select("id, message_id, template_name, recipient_email, status, error_message, created_at")
          .in("status", ["failed", "dlq", "rate_limited"])
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("email_send_log")
          .select("id, message_id, template_name, recipient_email, status, error_message, created_at")
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data as QueueMetric[]);

      const c: StatusCounts = { sent: 0, failed: 0, dlq: 0, rate_limited: 0, pending: 0 };
      (logsRes.data ?? []).forEach((r: { status: string }) => {
        if (r.status in c) (c as Record<string, number>)[r.status]++;
      });
      setCounts24h(c);
      setRecentErrors((errorsRes.data ?? []) as LogRow[]);
      setRecentSends((sentRes.data ?? []) as LogRow[]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const queue = (name: string) => metrics.find((m) => m.queue_name === name);

  const primaryQueues = [
    { key: "auth_emails", label: "Auth Emails" },
    { key: "transactional_emails", label: "Transactional Emails" },
    { key: "auth_emails_dlq", label: "Auth DLQ", dlq: true },
    { key: "transactional_emails_dlq", label: "Transactional DLQ", dlq: true },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              Email Queue Status
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Live view of pending emails and recent dispatch errors.
              {lastUpdated && ` Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}.`}
            </p>
          </div>
          <Button onClick={load} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Queue depths */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryQueues.map(({ key, label, dlq }) => {
            const m = queue(key);
            const len = m?.queue_length ?? 0;
            const oldest = m?.oldest_msg_age_sec;
            return (
              <Card key={key} className={dlq && len > 0 ? "border-destructive/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {dlq ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{len}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {oldest != null && len > 0
                      ? `Oldest: ${Math.round(oldest)}s ago`
                      : "No pending messages"}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Last 24h counters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last 24 hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Stat label="Sent" value={counts24h.sent} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} />
              <Stat label="Failed" value={counts24h.failed} icon={<AlertCircle className="h-4 w-4 text-orange-600" />} />
              <Stat label="DLQ" value={counts24h.dlq} icon={<AlertCircle className="h-4 w-4 text-red-600" />} />
              <Stat label="Rate limited" value={counts24h.rate_limited} icon={<Clock className="h-4 w-4 text-yellow-600" />} />
              <Stat label="Pending" value={counts24h.pending} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
            </div>
          </CardContent>
        </Card>

        {/* Recent errors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Latest dispatch errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentErrors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No recent errors. 🎉</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentErrors.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor(r.status)}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.template_name ?? "—"}</TableCell>
                        <TableCell className="text-sm font-mono text-xs">{r.recipient_email ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-md truncate" title={r.error_message ?? ""}>
                          {r.error_message ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent sends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent dispatch log</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSends.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No email activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipient</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSends.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor(r.status)}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.template_name ?? "—"}</TableCell>
                        <TableCell className="text-sm font-mono text-xs">{r.recipient_email ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="p-4 rounded-lg border bg-card">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">{icon}{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default EmailQueueStatus;
