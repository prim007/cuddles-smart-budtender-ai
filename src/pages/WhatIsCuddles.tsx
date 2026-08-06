import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import {
  Brain,
  Camera,
  BookOpen,
  Star,
  Heart,
  Sprout,
  Store,
  Zap,
  Shield,
  Globe,
  MessageCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";

const consumerFeatures = [
  {
    icon: MessageCircle,
    title: "AI Strain Recommendations",
    description:
      "Tell Cuddles what you're after — relaxation, focus, sleep — and get personalized picks in seconds.",
    href: "/education/chat-with-cuddles",
    tint: "from-hippie-coral/30 to-hippie-peach/10",
  },
  {
    icon: Camera,
    title: "Strain Scanner",
    description:
      "Snap a photo of any flower and Cuddles identifies the strain and suggests similar alternatives.",
    href: "/scanner",
    tint: "from-hippie-amber/30 to-hippie-coral/10",
  },
  {
    icon: BookOpen,
    title: "Strain Journal",
    description:
      "Track sessions with mood, dosage, and effects. Cuddles learns your patterns over time.",
    href: "/journal",
    tint: "from-hippie-teal/30 to-hippie-sage/10",
  },
  {
    icon: Star,
    title: "Community Reviews",
    description:
      "Read real experiences from fellow enthusiasts. Discover trending strains and hidden gems.",
    href: "/reviews",
    tint: "from-hippie-lavender/30 to-hippie-coral/10",
  },
  {
    icon: Heart,
    title: "T-Break Coach",
    description:
      "A personalized tolerance reset program with progress tracking and AI-guided adjustments.",
    href: "/t-break",
    tint: "from-hippie-peach/30 to-hippie-amber/10",
  },
  {
    icon: Sprout,
    title: "Seedling Monitor",
    description:
      "Track your grow from seed to harvest with care logs and AI-generated cultivation tips.",
    href: "/grow",
    tint: "from-hippie-sage/30 to-hippie-teal/10",
  },
];

const b2bFeatures = [
  {
    icon: Store,
    title: "Embeddable AI Budtender",
    description:
      "Add Cuddles to any dispensary in minutes. Compliant recommendations that grow baskets 20–35%.",
    href: "/ai-budtender",
  },
  {
    icon: Zap,
    title: "POS Integrations",
    description:
      "Native connectors for Dutchie, Flowhub, Cova, and Sweed. Real-time inventory sync.",
    href: "/pos-integrations",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description:
      "Understand what sells, when peaks hit, and which segments drive the most revenue.",
    href: "/why-cuddles",
  },
  {
    icon: ShoppingCart,
    title: "Inventory Optimization",
    description:
      "AI analyzes trends to help you stock what sells, reducing dead inventory by up to 30%.",
    href: "/why-cuddles",
  },
];

const howItWorks = [
  { step: "01", title: "Share Your Goals", description: "Tell Cuddles what effects you're after — relief, sleep, focus, or winding down." },
  { step: "02", title: "AI Analyzes & Recommends", description: "Our RAG engine cross-references your preferences with strain and terpene data." },
  { step: "03", title: "Track & Refine", description: "Log sessions. Cuddles learns from every entry to make sharper suggestions." },
];

const stats = [
  { value: "35%", label: "Higher order value" },
  { value: "40%", label: "Better retention" },
  { value: "30%", label: "Less dead inventory" },
  { value: "<2s", label: "Recommendation speed" },
];

// Reusable abstract background — soft gradient orbs + grid mesh behind a frosted layer
const AbstractBackdrop = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Conic / radial color fields */}
    <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-50"
         style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--hippie-coral) / 0.55), transparent 60%)" }} />
    <div className="absolute top-1/3 -right-40 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50"
         style={{ background: "radial-gradient(circle at 70% 40%, hsl(var(--hippie-amber) / 0.45), transparent 60%)" }} />
    <div className="absolute -bottom-40 left-1/3 w-[44rem] h-[44rem] rounded-full blur-3xl opacity-40"
         style={{ background: "radial-gradient(circle at 50% 60%, hsl(var(--hippie-teal) / 0.45), transparent 60%)" }} />
    <div className="absolute top-1/2 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
         style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--hippie-lavender) / 0.45), transparent 60%)" }} />
    {/* Grid mesh */}
    <div className="absolute inset-0 opacity-[0.07]"
         style={{
           backgroundImage:
             "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
           backgroundSize: "56px 56px",
           maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
         }} />
    {/* Noise / vignette */}
    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/60" />
  </div>
);

// Frosted, 3D "glass" plate behind text blocks
const GlassPlate = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative rounded-3xl border border-white/15 dark:border-white/10 bg-background/40 backdrop-blur-2xl shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.35),inset_0_1px_0_0_hsl(0_0%_100%/0.25)] ${className}`}>
    {children}
  </div>
);

// 3D tilt-style card
const TiltCard = ({ children, tint = "from-primary/20 to-accent/10" }: { children: React.ReactNode; tint?: string }) => (
  <div className="group relative [perspective:1200px] h-full">
    <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-br ${tint} opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100`} />
    <div className="relative h-full rounded-3xl border border-white/20 dark:border-white/10 bg-background/55 backdrop-blur-xl p-6 shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.4),inset_0_1px_0_0_hsl(0_0%_100%/0.3)] transition-transform duration-500 ease-out will-change-transform group-hover:[transform:rotateX(4deg)_rotateY(-6deg)_translateZ(10px)]">
      {children}
    </div>
  </div>
);

const WhatIsCuddles = () => {
  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <SEO
        title="What is Cuddles AI? — Your AI Plant & Cannabis Companion"
        description="Cuddles AI is a free AI plant expert and cannabis specialist: personalised strain recommendations, plant care and grow help, photo scanning, a private journal, and smarter selling for dispensaries."
        keywords="what is Cuddles AI, AI plant assistant, AI cannabis budtender, plant care AI, strain recommendation app, cannabis AI assistant, smart budtender, strain scanner"
        url="/what-is-cuddles"

      />

      {/* Global abstract backdrop */}
      <AbstractBackdrop />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <GlassPlate className="px-6 md:px-12 py-14 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Built by Tripple444
            </div>
            <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl leading-tight">
              What is <span className="gradient-text">Cuddles AI</span>?
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed mb-8">
              Your personal AI-powered cannabis budtender — a smart companion that helps you discover strains, track experiences, and make informed decisions. Built for consumers. Powering dispensaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/education/chat-with-cuddles">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto rounded-2xl gap-2 shadow-[0_15px_40px_-10px_hsl(var(--primary)/0.6)]">
                  <MessageCircle className="w-5 h-5" />
                  Try Cuddles Free
                </Button>
              </Link>
              <Link to="/dispensary-onboarding">
                <Button size="lg" variant="outline" className="font-display font-semibold text-lg px-8 py-6 h-auto rounded-2xl gap-2 bg-background/40 backdrop-blur-md border-white/20">
                  <Store className="w-5 h-5" />
                  For Dispensaries
                </Button>
              </Link>
            </div>
          </GlassPlate>
        </div>
      </section>

      {/* MISSION */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <GlassPlate className="px-6 md:px-12 py-12 text-center">
            <h2 className="font-display font-bold text-foreground mb-6 text-2xl md:text-3xl">Our Mission</h2>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Cannabis is personal. What works for one person may not work for another. Cuddles combines AI intelligence with real strain data and community wisdom to help every individual find their perfect match — no guesswork, no stigma.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/70 bg-background/60 backdrop-blur-md border border-white/15 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-primary" />
              General cannabis education only — not medical advice
            </div>
          </GlassPlate>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((stat) => (
              <TiltCard key={stat.label} tint="from-hippie-coral/30 to-hippie-amber/10">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CONSUMER FEATURES */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-[0.2em] mb-3">For Consumers</p>
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-5xl">
              Your Personal <span className="gradient-text">Cannabis Companion</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete suite of free AI-powered tools designed to enhance your cannabis journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consumerFeatures.map((feature) => (
              <Link key={feature.title} to={feature.href} className="block h-full">
                <TiltCard tint={feature.tint}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center mb-5 shadow-inner border border-white/20">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                </TiltCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-[0.2em] mb-3">How It Works</p>
            <h2 className="font-display font-bold text-foreground text-3xl md:text-5xl">
              Three Steps to <span className="gradient-text">Better Sessions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <TiltCard key={step.step} tint="from-hippie-teal/25 to-hippie-lavender/10">
                <div className="text-center">
                  <div className="text-6xl font-display font-bold gradient-text mb-4 opacity-80">{step.step}</div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-[0.2em] mb-3">For Dispensaries & Suppliers</p>
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-5xl">
              AI That <span className="gradient-text">Pays for Itself</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Dispensaries and suppliers use our AI to sell more, waste less, and understand their customers better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {b2bFeatures.map((feature) => (
              <Link key={feature.title} to={feature.href} className="block h-full">
                <TiltCard tint="from-hippie-amber/25 to-hippie-coral/10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center mb-5 border border-white/20">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                </TiltCard>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/why-cuddles">
              <Button variant="outline" size="lg" className="font-display font-semibold px-8 rounded-2xl bg-background/40 backdrop-blur-md border-white/20">
                See All Business Benefits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* GLOBAL REACH */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <GlassPlate className="px-6 md:px-12 py-12">
            <div className="text-center mb-10">
              <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-display font-bold text-foreground mb-4 text-2xl md:text-3xl">
                Built in South Africa. Used Worldwide.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Cuddles was born in South Africa to serve the growing legal cannabis market. Same-day delivery available in South Africa via Tripple Four Shop Hub.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="rounded-2xl p-6 bg-background/50 backdrop-blur-md border border-white/15">
                <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  For Consumers
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Free AI strain recommendations</li>
                  <li>• Strain scanner from photos</li>
                  <li>• Personal journal & community reviews</li>
                  <li>• Same-day delivery in South Africa</li>
                  <li>• Educational blog & tolerance coaching</li>
                </ul>
              </div>
              <div className="rounded-2xl p-6 bg-background/50 backdrop-blur-md border border-white/15">
                <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  For Dispensaries
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Embeddable AI budtender widget</li>
                  <li>• POS integration (Dutchie, Flowhub, etc.)</li>
                  <li>• Real-time sales analytics</li>
                  <li>• 14-day free trial, no credit card</li>
                  <li>• Inventory optimization insights</li>
                </ul>
              </div>
            </div>
          </GlassPlate>
        </div>
      </section>

      {/* TECH */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <GlassPlate className="px-6 md:px-12 py-12 text-center">
            <Brain className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display font-bold text-foreground mb-4 text-2xl md:text-3xl">
              Powered by RAG & Multi-Agent AI
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed mb-8">
              Cuddles uses Retrieval-Augmented Generation to pull from a proprietary knowledge base of 36+ strains, terpene science, and cultivation expertise. Our multi-agent system routes questions to specialized AI workers for accurate, context-aware responses.
            </p>
            <Link to="/technology">
              <Button variant="outline" size="lg" className="font-display font-semibold px-8 rounded-2xl bg-background/40 backdrop-blur-md border-white/20">
                Read the Technical Whitepaper
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </GlassPlate>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <GlassPlate className="px-6 md:px-12 py-12 text-center">
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">Ready to Meet Cuddles?</h2>
            <p className="text-lg text-foreground/80 mb-8">
              Start chatting for free, or schedule a demo to see how Cuddles can transform your dispensary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/education/chat-with-cuddles">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto rounded-2xl gap-2 shadow-[0_15px_40px_-10px_hsl(var(--primary)/0.6)]">
                  <Sparkles className="w-5 h-5" />
                  Chat with Cuddles
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button size="lg" variant="outline" className="font-display font-semibold text-lg px-8 py-6 h-auto rounded-2xl gap-2 bg-background/40 backdrop-blur-md border-white/20">
                  Schedule a Demo
                </Button>
              </Link>
            </div>
          </GlassPlate>
        </div>
      </section>
    </div>
  );
};

export default WhatIsCuddles;
