import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, TrendingUp, PackageSearch, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

interface Bucket {
  label: string;
  count: number;
  share: number;
}

interface Coverage {
  need: string;
  demand: number;
  skus: number;
  gap: boolean;
}

interface Insights {
  window_days: number;
  generated_at: string;
  min_cohort: number;
  total_conversations: number;
  suppressed_note: string;
  tenant: { id: string; name: string; in_stock_skus: number } | null;
  is_admin: boolean;
  needs: Bucket[];
  formats: Bucket[];
  terpenes: Bucket[];
  types: Bucket[];
  series: { date: string; count: number }[];
  coverage: Coverage[];
}

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const BucketList = ({ title, description, buckets }: { title: string; description: string; buckets: Bucket[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {buckets.length === 0 && (
        <p className="text-sm text-muted-foreground">Not enough conversations yet to report this safely.</p>
      )}
      {buckets.map((b) => (
        <div key={b.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{b.label}</span>
            <span className="text-muted-foreground">
              {b.count} · {b.share}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(4, b.share))}%` }}
            />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const TenantInsights = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data: result, error } = await supabase.functions.invoke("demand-insights", {
        body: { days },
      });
      if (error) throw error;
      setData(result as Insights);
    } catch (err) {
      console.error("Failed to load demand insights", err);
      setErrorMessage(
        "We couldn't load your demand insights. This dashboard is available to dispensary accounts.",
      );
      toast({
        title: "Insights unavailable",
        description: "Only dispensary (tenant) accounts can view demand insights.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [days, toast]);

  useEffect(() => {
    if (!authLoading && user) load();
    if (!authLoading && !user) setIsLoading(false);
  }, [authLoading, user, load]);

  const gaps = (data?.coverage ?? []).filter((c) => c.gap);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Demand Insights"
        description="Aggregated cannabis demand signals for Cuddles dispensary partners."
        url="/insights"
        noindex
      />
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/">
            <Button variant="ghost" className="gap-2" aria-label="Back to home">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.days}
                size="sm"
                variant={days === r.days ? "default" : "outline"}
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={load} disabled={isLoading} aria-label="Refresh insights">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Demand Insights</h1>
          <p className="text-muted-foreground max-w-2xl">
            What shoppers are actually asking Cuddles for — aggregated, anonymised, and matched against your
            live stock so you can buy to demand instead of guessing.
          </p>
        </div>

        {!authLoading && !user && (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <p className="text-muted-foreground">Sign in with your dispensary account to view demand insights.</p>
              <Link to="/auth">
                <Button>Sign in</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}

        {!isLoading && errorMessage && user && (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <p className="text-muted-foreground">{errorMessage}</p>
              <Link to="/dispensary-onboarding">
                <Button>Register your dispensary</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isLoading && data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Conversations analysed</CardDescription>
                  <CardTitle className="text-2xl">{data.total_conversations}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top need</CardDescription>
                  <CardTitle className="text-2xl">{data.needs[0]?.label ?? "—"}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Your in-stock SKUs</CardDescription>
                  <CardTitle className="text-2xl">{data.tenant?.in_stock_skus ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Unserved demand buckets</CardDescription>
                  <CardTitle className="text-2xl text-destructive">{gaps.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PackageSearch className="w-5 h-5 text-primary" />
                  Demand vs. your stock
                </CardTitle>
                <CardDescription>
                  {data.tenant
                    ? `Matched against ${data.tenant.name}'s live catalogue.`
                    : "No dispensary catalogue linked to this account yet."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.coverage.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add products to your catalogue to see coverage gaps.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.coverage.map((c) => (
                      <div
                        key={c.need}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.need}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.demand} requests · {c.skus} matching SKUs
                          </p>
                        </div>
                        {c.gap ? (
                          <Badge variant="destructive" className="gap-1 shrink-0">
                            <AlertTriangle className="w-3 h-3" /> Gap
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">
                            Covered
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-4">
              <BucketList
                title="What people need"
                description="Outcome shoppers ask for, by share of conversations"
                buckets={data.needs}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Conversation volume
                  </CardTitle>
                  <CardDescription>Last {Math.min(data.window_days, 60)} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.series}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <BucketList
                title="Preferred formats"
                description="Flower, edibles, vapes and more"
                buckets={data.formats}
              />
              <BucketList title="Type preference" description="Indica / sativa / hybrid" buckets={data.types} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terpene interest</CardTitle>
                  <CardDescription>Named terpenes in conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.terpenes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not enough terpene mentions yet.</p>
                  ) : (
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.terpenes} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/30">
              <CardContent className="py-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {data.suppressed_note} No individual conversations, identities or locations are exposed —
                  only aggregated counts. Generated {new Date(data.generated_at).toLocaleString()}.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default TenantInsights;
