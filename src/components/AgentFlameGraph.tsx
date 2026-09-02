import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

export interface FlameTrace {
  created_at: string;
  agent_role: string | null;
  tool_called: string | null;
  latency_ms: number | null;
  error?: string | null;
  session_id?: string | null;
  step_index?: number | null;
}

interface FlameNode {
  key: string;
  label: string;
  value: number;
  calls: number;
  errors: number;
  depth: number;
  offset: number;
  children: FlameNode[];
}

const fmt = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`);

const ROW_H = 26;

function buildAggregate(traces: FlameTrace[]): FlameNode {
  const total = traces.reduce((s, t) => s + (t.latency_ms ?? 0), 0);
  const root: FlameNode = {
    key: "root",
    label: "all agent steps",
    value: total,
    calls: traces.length,
    errors: traces.filter((t) => t.error).length,
    depth: 0,
    offset: 0,
    children: [],
  };

  const roles = new Map<string, FlameTrace[]>();
  traces.forEach((t) => {
    const role = t.agent_role || "unknown";
    roles.set(role, [...(roles.get(role) ?? []), t]);
  });

  let roleOffset = 0;
  Array.from(roles.entries())
    .map(([role, items]) => ({ role, items, value: items.reduce((s, t) => s + (t.latency_ms ?? 0), 0) }))
    .sort((a, b) => b.value - a.value)
    .forEach(({ role, items, value }) => {
      const roleNode: FlameNode = {
        key: `role:${role}`,
        label: role,
        value,
        calls: items.length,
        errors: items.filter((t) => t.error).length,
        depth: 1,
        offset: roleOffset,
        children: [],
      };

      const tools = new Map<string, FlameTrace[]>();
      items.forEach((t) => {
        const tool = t.tool_called || "(no tool)";
        tools.set(tool, [...(tools.get(tool) ?? []), t]);
      });

      let toolOffset = roleOffset;
      Array.from(tools.entries())
        .map(([tool, list]) => ({ tool, list, value: list.reduce((s, t) => s + (t.latency_ms ?? 0), 0) }))
        .sort((a, b) => b.value - a.value)
        .forEach(({ tool, list, value: tv }) => {
          roleNode.children.push({
            key: `role:${role}|tool:${tool}`,
            label: tool,
            value: tv,
            calls: list.length,
            errors: list.filter((t) => t.error).length,
            depth: 2,
            offset: toolOffset,
            children: [],
          });
          toolOffset += tv;
        });

      root.children.push(roleNode);
      roleOffset += value;
    });

  return root;
}

const flatten = (node: FlameNode, acc: FlameNode[] = []) => {
  acc.push(node);
  node.children.forEach((c) => flatten(c, acc));
  return acc;
};

const AgentFlameGraph = ({
  traces,
  title = "Latency flame graph",
  description = "Where the time actually goes, by agent role and tool call.",
}: {
  traces: FlameTrace[];
  title?: string;
  description?: string;
}) => {
  const [mode, setMode] = useState<"aggregate" | "session">("aggregate");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const sessions = useMemo(() => {
    const map = new Map<string, FlameTrace[]>();
    traces.forEach((t) => {
      if (!t.session_id) return;
      map.set(t.session_id, [...(map.get(t.session_id) ?? []), t]);
    });
    return Array.from(map.entries())
      .map(([id, items]) => ({
        id,
        items: [...items].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
            (a.step_index ?? 0) - (b.step_index ?? 0),
        ),
        total: items.reduce((s, t) => s + (t.latency_ms ?? 0), 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25);
  }, [traces]);

  const activeSession = sessions.find((s) => s.id === sessionId) ?? sessions[0] ?? null;

  const rows = useMemo(() => {
    if (mode === "aggregate") {
      const root = buildAggregate(traces);
      return { total: root.value, nodes: flatten(root) };
    }
    if (!activeSession) return { total: 0, nodes: [] as FlameNode[] };
    const start = new Date(activeSession.items[0].created_at).getTime();
    const end = activeSession.items.reduce(
      (max, t) => Math.max(max, new Date(t.created_at).getTime() + (t.latency_ms ?? 0)),
      start + 1,
    );
    const span = Math.max(1, end - start);
    const nodes: FlameNode[] = [
      {
        key: "session-root",
        label: `session ${activeSession.id.slice(0, 8)}…`,
        value: span,
        calls: activeSession.items.length,
        errors: activeSession.items.filter((t) => t.error).length,
        depth: 0,
        offset: 0,
        children: [],
      },
      ...activeSession.items.map((t, i) => ({
        key: `span-${i}`,
        label: t.tool_called || t.agent_role || "step",
        value: Math.max(1, t.latency_ms ?? 1),
        calls: 1,
        errors: t.error ? 1 : 0,
        depth: 1 + (t.tool_called ? 1 : 0),
        offset: new Date(t.created_at).getTime() - start,
        children: [],
      })),
    ];
    return { total: span, nodes };
  }, [mode, traces, activeSession]);

  const maxDepth = rows.nodes.reduce((m, n) => Math.max(m, n.depth), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={mode === "aggregate" ? "default" : "outline"}
              onClick={() => setMode("aggregate")}
            >
              Aggregate
            </Button>
            <Button
              size="sm"
              variant={mode === "session" ? "default" : "outline"}
              onClick={() => setMode("session")}
              disabled={sessions.length === 0}
            >
              Per session
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mode === "session" && sessions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sessions.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={activeSession?.id === s.id ? "secondary" : "ghost"}
                className="shrink-0 font-mono text-xs"
                onClick={() => setSessionId(s.id)}
              >
                {s.id.slice(0, 8)}… · {fmt(s.total)}
              </Button>
            ))}
          </div>
        )}

        {rows.nodes.length === 0 || rows.total <= 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No traced latency in this window yet.
          </p>
        ) : (
          <div
            className="relative w-full"
            style={{ height: (maxDepth + 1) * ROW_H + 4 }}
            onMouseLeave={() => setHovered(null)}
          >
            {rows.nodes.map((n) => {
              const widthPct = Math.max(0.4, (n.value / rows.total) * 100);
              const leftPct = Math.min(99.6, (n.offset / rows.total) * 100);
              const isHot = hovered === n.key;
              return (
                <div
                  key={n.key}
                  className={`absolute overflow-hidden rounded-sm border text-[11px] leading-none px-1.5 flex items-center transition-opacity ${
                    n.errors > 0
                      ? "bg-destructive/25 border-destructive/50"
                      : "bg-primary/25 border-primary/40"
                  } ${hovered && !isHot ? "opacity-60" : "opacity-100"}`}
                  style={{
                    top: n.depth * ROW_H,
                    height: ROW_H - 4,
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                  title={`${n.label} · ${fmt(n.value)} · ${n.calls} call${n.calls === 1 ? "" : "s"}${
                    n.errors ? ` · ${n.errors} error${n.errors === 1 ? "" : "s"}` : ""
                  }`}
                  onMouseEnter={() => setHovered(n.key)}
                >
                  <span className="truncate font-medium">{n.label}</span>
                  <span className="ml-1.5 text-muted-foreground truncate">{fmt(n.value)}</span>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {mode === "aggregate"
            ? "Width = share of total measured latency. Rows: all steps → agent role → tool."
            : "Width = step duration, position = start offset within the session timeline."}
          {" Red bars carry errors."}
        </p>
      </CardContent>
    </Card>
  );
};

export default AgentFlameGraph;
