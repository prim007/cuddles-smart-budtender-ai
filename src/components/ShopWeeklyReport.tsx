import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CheckCircle2, Circle, MessageSquare, PackageX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyReport {
  generated_at: string;
  min_cohort: number;
  shop: { name: string; status: string; trial_days_left: number | null; menu_items: number; in_stock_items: number };
  checklist: { key: string; label: string; done: boolean; href: string }[];
  this_week: { chats: number; active_days: number; topics: { label: string; count: number; share: number }[] };
  last_week: { chats: number };
  menu_gaps: { label: string; count: number }[];
}

const ShopWeeklyReport = () => {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "none">("loading");

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke("shop-weekly-report", { body: {} })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data || (data as { error?: string }).error) setState("none");
        else {
          setReport(data as WeeklyReport);
          setState("ready");
        }
      })
      .catch(() => !cancelled && setState("none"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") return <Skeleton className="h-56 w-full" />;
  if (state === "none" || !report) return null;

  const { shop, checklist, this_week, last_week, menu_gaps } = report;
  const doneCount = checklist.filter((c) => c.done).length;
  const diff = this_week.chats - last_week.chats;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarCheck className="w-5 h-5 text-primary" />
            {shop.name} — this week
          </CardTitle>
          {shop.trial_days_left !== null && (
            <Badge variant={shop.trial_days_left <= 3 ? "destructive" : "secondary"}>
              {shop.trial_days_left} trial day{shop.trial_days_left === 1 ? "" : "s"} left
            </Badge>
          )}
        </div>
        <CardDescription>
          What your own website visitors asked Cuddles in the last 7 days. Only topics are counted — never what
          anyone wrote or who they are.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Questions this week</p>
            <p className="text-2xl font-semibold">{this_week.chats}</p>
            <p className="text-xs text-muted-foreground">
              {diff === 0 ? "Same as last week" : `${diff > 0 ? "+" : ""}${diff} vs last week`}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Days with questions</p>
            <p className="text-2xl font-semibold">{this_week.active_days} / 7</p>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Products in stock</p>
            <p className="text-2xl font-semibold">{shop.in_stock_items}</p>
            <p className="text-xs text-muted-foreground">of {shop.menu_items} on your menu</p>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Setup</p>
            <p className="text-2xl font-semibold">
              {doneCount} / {checklist.length}
            </p>
          </div>
        </div>

        {doneCount < checklist.length && (
          <div>
            <h3 className="font-medium mb-2">Finish setting up</h3>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c.key} className="flex items-center gap-2 text-sm">
                  {c.done ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  {c.done ? (
                    <span className="text-muted-foreground line-through">{c.label}</span>
                  ) : (
                    <Link to={c.href} className="text-primary underline underline-offset-4">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> What your customers asked about
            </h3>
            {this_week.topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not enough questions yet. Topics show once at least {report.min_cohort} visitors ask about them.
              </p>
            ) : (
              <ul className="space-y-2">
                {this_week.topics.slice(0, 8).map((t) => (
                  <li key={t.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t.label}</span>
                      <span className="text-muted-foreground">{t.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(4, t.share)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <PackageX className="w-4 h-4 text-primary" /> Asked for, but not on your menu
            </h3>
            {menu_gaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gaps spotted this week.</p>
            ) : (
              <ul className="space-y-2">
                {menu_gaps.map((g) => (
                  <li key={g.label} className="flex items-center justify-between text-sm rounded-md border border-border/60 px-3 py-2">
                    <span>{g.label}</span>
                    <Badge variant="outline">{g.count} asked</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/manage-strains" className="inline-block mt-3 text-sm text-primary underline underline-offset-4">
              Update your menu
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopWeeklyReport;
