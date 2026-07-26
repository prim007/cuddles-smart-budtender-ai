import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Gift,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Truck,
  Brain,
  Star,
  Lock,
} from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";

const JOINING_FEE_ZAR = 249;
const MONTHLY_ZAR = 99;

/** Mouse-tracked 3D tilt card */
const Tilt3D = ({
  children,
  className = "",
  intensity = 12,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ x: -py * intensity, y: px * intensity });
  };

  return (
    <div ref={ref} style={{ perspective: "1200px" }} className={className}>
      <div
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setT({ x: 0, y: 0 });
        }}
        className="relative h-full transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `rotateX(${t.x}deg) rotateY(${t.y}deg) scale(${hover ? 1.02 : 1})`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Membership = () => {
  const { user } = useAuth();
  const { isPremium, isLoading, startCheckout } = useSubscription();

  const goldBoxIncludes = [
    "3–5 curated strains matched to the prompts you gave Cuddles that month",
    "One wildcard drop you'd never have picked yourself",
    "A printed dose + timing card written for your tolerance",
    "Member-only pricing on everything inside the box",
  ];

  const rules = [
    {
      title: "One joining fee, once",
      body: `R${JOINING_FEE_ZAR} on the day you join. It covers your member profile build, your first curation session with Cuddles, and your welcome Gold Box slot. Never charged again.`,
    },
    {
      title: "Curation needs conversation",
      body: "Your box is built from your real chats. Talk to Cuddles at least three times in a cycle or we roll your box forward instead of guessing.",
    },
    {
      title: "Members are 18+ and verified",
      body: "One verified member, one account. Boxes are non-transferable and can't be resold — that's how we keep supplier access.",
    },
    {
      title: "Cancel any cycle",
      body: `R${MONTHLY_ZAR}/month after joining. Cancel before your cycle closes and nothing further is charged. Your profile stays on file for 6 months.`,
    },
    {
      title: "Honest feedback is the price of entry",
      body: "Rate each box. Ratings train your next curation — skip them twice and curation pauses until you catch up.",
    },
  ];

  const comparison = [
    { label: "Cuddles AI budtender chat", free: true, member: true },
    { label: "Strain education & dosage tools", free: true, member: true },
    { label: "Save recommendations & journal", free: false, member: true },
    { label: "Gold Box — curated from your prompts", free: false, member: true },
    { label: "Memory: Cuddles remembers your history", free: false, member: true },
    { label: "Priority delivery slots", free: false, member: true },
    { label: "Member pricing & early drops", free: false, member: true },
    { label: "Concierge: reorder by one message", free: false, member: true },
  ];

  return (
    <div className="min-h-screen md:pt-20 overflow-x-hidden">
      <SEO
        title="Cuddles Membership — The Gold Box, Curated For You"
        description="Join Cuddles Membership: a one-time R249 joining fee, R99/month, and a Gold Box curated from the prompts you give Cuddles. Member pricing, priority delivery, AI memory."
        url="/membership"
      />
      <ThemeToggle />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden py-24">
          {/* 3D ambient field */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "conic-gradient(from 100deg at 50% 50%, hsl(var(--hippie-amber)/0.6), hsl(var(--hippie-coral)/0.5), hsl(var(--hippie-lavender)/0.45), hsl(var(--hippie-amber)/0.6))",
                animation: "gold-spin 24s linear infinite",
              }}
            />
            <div
              className="absolute -left-10 top-1/3 h-56 w-56 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--hippie-amber)/0.55), transparent 70%)",
                animation: "gold-float 9s ease-in-out infinite",
              }}
            />
            <div
              className="absolute -right-10 bottom-0 h-64 w-64 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--hippie-coral)/0.45), transparent 70%)",
                animation: "gold-float 11s ease-in-out infinite reverse",
              }}
            />
          </div>

          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  <Crown className="h-4 w-4" /> Invitation-grade membership
                </div>
                <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground leading-tight mb-5">
                  Free gets you answers.
                  <span className="block bg-gradient-to-r from-hippie-coral via-hippie-amber to-hippie-lavender bg-clip-text text-transparent">
                    Membership gets you the Gold Box.
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mb-8">
                  Everyone can chat to Cuddles. Members get a physical box, curated
                  strain by strain from the prompts they actually gave — plus memory,
                  member pricing and priority delivery.
                </p>

                <div className="flex flex-wrap items-end gap-6 mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Joining fee
                    </p>
                    <p className="text-4xl font-bold text-foreground">
                      R{JOINING_FEE_ZAR}
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}
                        once
                      </span>
                    </p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Then
                    </p>
                    <p className="text-4xl font-bold text-foreground">
                      R{MONTHLY_ZAR}
                      <span className="text-base font-normal text-muted-foreground">
                        /month
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isPremium ? (
                    <Button size="lg" asChild className="font-semibold">
                      <Link to="/premium">You're a member — manage plan</Link>
                    </Button>
                  ) : user ? (
                    <Button
                      size="lg"
                      disabled={isLoading}
                      onClick={() => startCheckout({ returnPath: "/membership" })}
                      className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-primary-foreground font-semibold hover:opacity-90"
                    >
                      {isLoading ? "Loading..." : "Join — claim my Gold Box"}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      asChild
                      className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-primary-foreground font-semibold hover:opacity-90"
                    >
                      <Link to="/auth">Join — claim my Gold Box</Link>
                    </Button>
                  )}
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/#demo">Stay on free tier</Link>
                  </Button>
                </div>
              </div>

              {/* 3D GOLD BOX */}
              <Tilt3D intensity={16} className="mx-auto w-full max-w-sm">
                <div
                  className="relative rounded-[2rem] p-[2px]"
                  style={{
                    background:
                      "linear-gradient(140deg, hsl(var(--hippie-amber)), hsl(var(--hippie-coral)) 45%, hsl(var(--hippie-lavender)))",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-4 rounded-[2.4rem] opacity-60 blur-2xl"
                    style={{
                      background:
                        "linear-gradient(140deg, hsl(var(--hippie-amber)/0.8), hsl(var(--hippie-coral)/0.6))",
                      transform: "translateZ(-60px)",
                    }}
                  />
                  <div className="relative overflow-hidden rounded-[2rem] bg-card p-8">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                    >
                      <div
                        className="absolute -inset-y-10 -left-1/2 w-1/2 rotate-12"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, hsl(var(--hippie-amber)/0.35), transparent)",
                          animation: "gold-shimmer 5s ease-in-out infinite",
                        }}
                      />
                    </div>
                    <div style={{ transform: "translateZ(50px)" }}>
                      <div className="flex items-center justify-between mb-8">
                        <Gift className="h-9 w-9 text-primary" />
                        <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                          Member No. 001
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                        The Gold Box
                      </h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Curated monthly from your Cuddles prompts.
                      </p>
                      <ul className="space-y-3">
                        {goldBoxIncludes.map((g) => (
                          <li
                            key={g}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {g}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8 rounded-xl border border-border bg-muted/40 p-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          Ships to your door · tracked · discreet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            </div>
          </div>
        </section>

        {/* FREE VS MEMBER */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
              Where the line sits
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Free stays genuinely useful. Membership is for people who want it done
              for them.
            </p>

            <Tilt3D intensity={6}>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="grid grid-cols-[1fr_90px_90px] items-center gap-2 border-b border-border bg-muted/50 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Feature</span>
                  <span className="text-center">Free</span>
                  <span className="text-center text-primary">Member</span>
                </div>
                {comparison.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1fr_90px_90px] items-center gap-2 border-b border-border/60 px-5 py-4 text-sm last:border-0"
                  >
                    <span className="text-foreground">{row.label}</span>
                    <span className="flex justify-center">
                      {row.free ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </span>
                    <span className="flex justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                  </div>
                ))}
              </div>
            </Tilt3D>
          </div>
        </section>

        {/* EXTRA MEMBER FEATURE */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-4">
                <Brain className="h-4 w-4" /> Members only
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Cuddles Memory + Concierge
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The extra feature you can't buy à la carte. Cuddles keeps a living
                profile of every strain that worked, every one that didn't, and the
                exact words you used — then acts on it without being asked twice.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "It remembers",
                  desc: "Every prompt, rating and journal entry feeds one profile. No re-explaining your anxiety, your shift pattern or your tolerance.",
                },
                {
                  icon: Truck,
                  title: "One-message reorder",
                  desc: "\"Send me last month's evening one\" — Cuddles builds the cart, applies member pricing and books a priority delivery slot.",
                },
                {
                  icon: Star,
                  title: "Curator's note",
                  desc: "Each Gold Box arrives with a written rationale: why this chemotype, this dose, this time of day, for you specifically.",
                },
              ].map((f) => (
                <Tilt3D key={f.title} intensity={10} className="h-full">
                  <div className="h-full rounded-2xl border border-border bg-card p-7">
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        background:
                          "linear-gradient(140deg, hsl(var(--hippie-amber)/0.25), hsl(var(--hippie-coral)/0.2))",
                        transform: "translateZ(40px)",
                      }}
                    >
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </Tilt3D>
              ))}
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
                <ShieldCheck className="h-4 w-4" /> House rules
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                What membership asks of you
              </h2>
            </div>

            <div className="space-y-4">
              {rules.map((r, i) => (
                <div
                  key={r.title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-6"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">
                      {r.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Cuddles offers general cannabis education only and does not provide
              medical advice. Members must be 18+ and comply with local law.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <Tilt3D intensity={8}>
              <div
                className="relative overflow-hidden rounded-[2rem] p-[2px]"
                style={{
                  background:
                    "linear-gradient(140deg, hsl(var(--hippie-amber)), hsl(var(--hippie-coral)) 50%, hsl(var(--hippie-lavender)))",
                }}
              >
                <div className="rounded-[2rem] bg-card px-8 py-14 text-center">
                  <Crown className="mx-auto mb-5 h-10 w-10 text-primary" />
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                    Join for R{JOINING_FEE_ZAR}. Stay for R{MONTHLY_ZAR}.
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                    Your first Gold Box is curated from your very next conversation
                    with Cuddles.
                  </p>
                  {isPremium ? (
                    <Button size="lg" asChild>
                      <Link to="/premium">Manage your membership</Link>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      disabled={isLoading}
                      onClick={() =>
                        user
                          ? startCheckout({ returnPath: "/membership" })
                          : undefined
                      }
                      asChild={!user}
                      className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-primary-foreground font-semibold hover:opacity-90"
                    >
                      {user ? (
                        <span>{isLoading ? "Loading..." : "Become a member"}</span>
                      ) : (
                        <Link to="/auth">Become a member</Link>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Tilt3D>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes gold-spin { to { transform: translateX(-50%) rotate(360deg); } }
        @keyframes gold-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-22px); } }
        @keyframes gold-shimmer { 0% { transform: translateX(0) rotate(12deg); } 60%,100% { transform: translateX(520%) rotate(12deg); } }
      `}</style>

      <Footer />
    </div>
  );
};

export default Membership;
