import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, BarChart3, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Group = "need" | "format" | "plant" | "law";

interface Report {
  month: string;
  complete: boolean;
  months: string[];
  min_cohort: number;
  conversations: number;
  topics: { label: string; count: number; share: number; group: Group | null }[];
  change_vs_previous: Record<string, number>;
  generated_at: string;
}

const GROUPS: { key: Group; title: string; description: string }[] = [
  { key: "plant", title: "Growing & plant care", description: "Houseplants, veg, herbs and cannabis growing" },
  { key: "need", title: "What people want help with", description: "The outcome people asked about" },
  { key: "format", title: "Product types", description: "Formats people mentioned" },
  { key: "law", title: "Law & rules", description: "Questions about what is allowed" },
];

const monthName = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" });

const MonthlyReport = () => {
  const [month, setMonth] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    supabase.functions
      .invoke("monthly-insight-report", { body: month ? { month } : {} })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data || (data as { error?: string }).error) setError(true);
        else setReport(data as Report);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const title = report ? `What South Africans asked Cuddles — ${monthName(report.month)}` : "Monthly question report";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="What South Africans Ask About Plants & Cannabis — Monthly Report | Cuddles AI"
        description="A free, anonymised monthly report of the plant-care, growing, cannabis and law questions South Africans asked Cuddles AI."
        url="/reports/plant-questions"
      />
      <main className="container mx-auto max-w-4xl px-4 pt-28 pb-12 space-y-8">
        <header className="space-y-4">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <BarChart3 className="w-4 h-4" /> Cuddles monthly report
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-bold">{title}</h1>
          <p className="text-muted-foreground max-w-2xl">
            Every month we count the topics people ask Cuddles about — plants, growing, cannabis and the law — so
            growers, shops and journalists can see what South Africans actually want to know.
          </p>
          {report && (
            <div className="flex flex-wrap gap-2">
              {report.months.map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={m === report.month ? "default" : "outline"}
                  onClick={() => setMonth(m)}
                >
                  {monthName(m)}
                </Button>
              ))}
            </div>
          )}
        </header>

        {error && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              This report couldn't load right now. Please try again in a few minutes.
            </CardContent>
          </Card>
        )}

        {!report && !error && <Skeleton className="h-80 w-full" />}

        {report && (
          <>
            <Card>
              <CardContent className="py-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Conversations counted</p>
                  <p className="text-3xl font-semibold">About {report.conversations}</p>
                  {!report.complete && <p className="text-xs text-muted-foreground">Month still in progress</p>}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Most asked about</p>
                  <p className="text-2xl font-semibold">{report.topics[0]?.label ?? "—"}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {GROUPS.map((g) => {
                const items = report.topics.filter((t) => t.group === g.key);
                return (
                  <Card key={g.key}>
                    <CardHeader>
                      <CardTitle className="text-lg">{g.title}</CardTitle>
                      <CardDescription>{g.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {items.length === 0 && (
                        <p className="text-sm text-muted-foreground">Not enough questions this month to report.</p>
                      )}
                      {items.map((t) => {
                        const change = report.change_vs_previous[t.label];
                        return (
                          <div key={t.label} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{t.label}</span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                {t.share}% of chats
                                {change !== undefined && change !== 0 && (
                                  <span className="flex items-center text-xs">
                                    {change > 0 ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {Math.abs(change)}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(4, t.share)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <ShareButtons
              path="/reports/plant-questions"
              campaign="monthly_report"
              text={`What South Africans asked Cuddles in ${monthName(report.month)}:`}
            />

            <Card className="border-primary/30">
              <CardContent className="py-5 flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>
                  How we keep this private: we only count topics, never what anyone wrote or who they are. A topic is
                  shown only when at least {report.min_cohort} conversations mention it, and totals are rounded. Arrows
                  show the change in percentage points from the month before. One conversation can touch several
                  topics. General education only — not medical or legal advice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6 space-y-3">
                <h2 className="text-xl font-semibold">Run a shop or grow store?</h2>
                <p className="text-sm text-muted-foreground">
                  Add Cuddles to your website and get a weekly report of what your own customers ask. We can also
                  write your shop's story for our blog.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to="/dispensary-onboarding">Add Cuddles to my shop</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/share-your-story">Tell us your story</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default MonthlyReport;
