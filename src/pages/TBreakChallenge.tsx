import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Gift,
  Loader2,
  MessageCircle,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CHALLENGE_DAYS = 7;

const steps = [
  {
    icon: Target,
    title: "Day 0 — Accept the challenge",
    body: "One tap starts a 7-day tolerance break in your account. Tell Cuddles why you're doing it and it holds you to it.",
  },
  {
    icon: CalendarCheck,
    title: "Days 1–6 — Daily check-ins",
    body: "Log mood and symptoms in seconds. Cuddles coaches you through the sleep dips, the appetite wobble and the day-3 irritability.",
  },
  {
    icon: Gift,
    title: "Day 7 — Unlock 15% off",
    body: "Complete the break and your reward unlocks: 15% off your next order, redeemed straight through Cuddles.",
  },
  {
    icon: MessageCircle,
    title: "After — Just tell Cuddles what you want",
    body: "Say \"I want something light for the evening\" and Cuddles picks the strain, applies the discount and takes you to checkout.",
  },
];

const benefits = [
  { icon: TrendingDown, label: "Lower tolerance", body: "Cannabinoid receptors start recovering in as little as 48 hours." },
  { icon: Sparkles, label: "Stronger effect", body: "The same amount hits the way it used to — without buying more." },
  { icon: Gift, label: "Cheaper sessions", body: "Less product for the same result, plus 15% off when you finish." },
];

const TBreakChallenge = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [starting, setStarting] = useState(false);
  const [hasActiveBreak, setHasActiveBreak] = useState<boolean | null>(null);
  const autoStarted = useRef(false);

  useEffect(() => {
    if (!user) {
      setHasActiveBreak(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("tolerance_breaks")
        .select("id")
        .eq("status", "active")
        .limit(1);
      if (!cancelled) setHasActiveBreak((data?.length ?? 0) > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const startChallenge = useCallback(async () => {
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent("/t-break-challenge?start=1")}`);
      return;
    }
    if (hasActiveBreak) {
      navigate("/t-break");
      return;
    }
    setStarting(true);
    try {
      const { error } = await supabase.from("tolerance_breaks").insert({
        user_id: user.id,
        target_days: CHALLENGE_DAYS,
        reason: "7-Day T-Break Challenge — unlock 15% off",
      });
      if (error) throw error;
      toast({
        title: "Challenge accepted 💪",
        description: `${CHALLENGE_DAYS} days. Cuddles will check in with you daily.`,
      });
      navigate("/t-break");
    } catch {
      toast({
        title: "Couldn't start the challenge",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStarting(false);
    }
  }, [user, hasActiveBreak, navigate, toast]);

  // Auto-start after returning from sign-in with ?start=1
  useEffect(() => {
    if (autoStarted.current) return;
    if (authLoading || !user || hasActiveBreak === null) return;
    if (searchParams.get("start") !== "1") return;
    autoStarted.current = true;
    searchParams.delete("start");
    setSearchParams(searchParams, { replace: true });
    startChallenge();
  }, [authLoading, user, hasActiveBreak, searchParams, setSearchParams, startChallenge]);

  const ctaLabel = !user
    ? "Accept the challenge"
    : hasActiveBreak
      ? "Go to your active break"
      : "Accept the challenge";

  const CTA = ({ className = "" }: { className?: string }) => (
    <Button
      size="lg"
      onClick={startChallenge}
      disabled={starting}
      className={`text-base font-semibold ${className}`}
    >
      {starting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Target className="mr-2 h-5 w-5" />}
      {ctaLabel}
      {!starting && <ArrowRight className="ml-2 h-5 w-5" />}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="7-Day T-Break Challenge — Reset Your Tolerance, Unlock 15% Off"
        description="Take the Cuddles AI 7-day tolerance break challenge. Daily AI coaching, mood tracking, and 15% off your next order when you finish."
        url="/t-break-challenge"
        keywords="tolerance break, t-break challenge, cannabis tolerance reset, 7 day t-break, Cuddles AI"
      />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" aria-hidden="true" />
          <div className="container relative mx-auto max-w-4xl px-4 py-16 md:py-24">
            <Button variant="ghost" asChild className="mb-6 -ml-2">
              <Link to="/" aria-label="Back to Cuddles AI home">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>

            <Badge className="mb-4">7 days · Free · Ends with 15% off</Badge>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              The 7-Day T-Break Challenge
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Your tolerance is why the same amount does less than it used to. Seven days off resets it —
              and Cuddles walks you through every one of them. Finish the week and we unlock{" "}
              <span className="font-semibold text-foreground">15% off your next order</span>.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CTA />
              <Button size="lg" variant="outline" asChild>
                <Link to="/t-break">See the tracker</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {user
                ? "Starts instantly in your account."
                : "You'll sign in first — the challenge starts the moment you're in."}
            </p>
          </div>
        </section>

        {/* Why */}
        <section className="border-b border-border py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold md:text-3xl">Why a break actually works</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {benefits.map((b) => (
                <Card key={b.label} className="border-border/60">
                  <CardContent className="pt-6">
                    <b.icon className="mb-4 h-7 w-7 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">{b.label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="text-2xl font-bold md:text-3xl">How the challenge runs</h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      <span className="sr-only">Step {i + 1}: </span>
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Reward */}
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5">
              <CardContent className="p-8 md:p-10">
                <Gift className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
                <h2 className="text-2xl font-bold md:text-3xl">Your reward on day 7</h2>
                <ul className="mt-5 space-y-3 text-muted-foreground">
                  {[
                    "15% off your next order, unlocked automatically when the break completes.",
                    "Redeem it by telling Cuddles what you want — no code to remember.",
                    "Cuddles re-recommends your dose for a reset tolerance, so you don't overshoot.",
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CTA />
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Cuddles provides general cannabis education only and does not give medical advice.
                  Speak to a healthcare professional about your individual situation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TBreakChallenge;
