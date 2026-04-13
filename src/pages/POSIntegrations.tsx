import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Plug, Zap, Shield, RefreshCw } from "lucide-react";

const posPartners = [
  {
    name: "Dutchie",
    description: "Sync your Dutchie menu in real-time. Cuddles AI recommends strains that are actually in stock and drives online orders directly through your existing Dutchie storefront.",
    features: ["Live menu sync", "Online ordering integration", "Inventory-aware recommendations"],
  },
  {
    name: "Flowhub",
    description: "Connect Flowhub POS data so Cuddles can recommend based on real purchase history, compliance data, and live inventory levels.",
    features: ["Purchase history analysis", "Compliance-safe recommendations", "Real-time inventory"],
  },
  {
    name: "Cova",
    description: "Integrate with Cova POS to power AI recommendations from your actual product catalog, pricing, and stock levels.",
    features: ["Product catalog sync", "Price-aware suggestions", "Multi-location support"],
  },
  {
    name: "Sweed",
    description: "Sweed users get plug-and-play AI budtending that reads your menu, understands your product mix, and recommends accordingly.",
    features: ["Menu auto-import", "Category-aware AI", "Customer preference tracking"],
  },
];

const integrationSteps = [
  { step: "1", title: "Sign up for Cuddles AI", description: "Create your dispensary account in under 2 minutes." },
  { step: "2", title: "Connect your POS", description: "Paste your API key or use our one-click connectors." },
  { step: "3", title: "Embed on your site", description: "Add a single script tag — no developer needed." },
  { step: "4", title: "AI starts selling", description: "Cuddles immediately uses your live data to recommend products." },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cannabis POS AI Integrations — Dutchie, Flowhub, Cova, Sweed",
  description: "Cuddles AI integrates with leading cannabis POS systems. Connect Dutchie, Flowhub, Cova, or Sweed and get AI-powered budtending in minutes.",
  url: "https://cuddles-ai.com/pos-integrations",
};

const POSIntegrations = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cannabis POS AI Integration | Dutchie, Flowhub, Cova & Sweed"
        description="Connect Cuddles AI to your cannabis POS system in minutes. Integrates with Dutchie, Flowhub, Cova, and Sweed for real-time, inventory-aware strain recommendations."
        url="/pos-integrations"
        keywords="Dutchie AI integration, Flowhub AI integration, Cova POS AI, Sweed cannabis AI, cannabis POS automation, dispensary POS integration, AI budtender POS, cannabis retail technology"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            POS Integrations
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl leading-tight">
            Plug Cuddles AI Into <span className="text-primary">Your POS</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Works with the cannabis POS systems you already use. No migration, no disruption — just smarter selling from day one.
          </p>
          <Link to="/dispensary-onboarding">
            <Button size="lg" className="font-display font-semibold rounded-xl gap-2">
              <Plug className="w-5 h-5" />
              Connect Your POS
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* POS Partners */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Supported POS Systems
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {posPartners.map((pos) => (
              <Card key={pos.name} className="p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{pos.name} + Cuddles AI</h3>
                <p className="text-muted-foreground mb-4">{pos.description}</p>
                <ul className="space-y-2">
                  {pos.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Connect in 4 Simple Steps
          </h2>
          <div className="space-y-6">
            {integrationSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Real-Time Sync", desc: "Inventory updates instantly. Cuddles never recommends out-of-stock products." },
              { icon: Shield, title: "Compliance Safe", desc: "All recommendations respect your regional compliance rules and product categories." },
              { icon: RefreshCw, title: "Zero Downtime", desc: "Non-invasive integration. Your POS keeps running — Cuddles reads, never writes." },
            ].map((b) => (
              <Card key={b.title} className="p-6 text-center">
                <b.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              Don't see your POS? We'll build it.
            </h3>
            <p className="text-muted-foreground mb-6">
              Contact us and we'll create a custom integration for your system within 2 weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dispensary-onboarding">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  Request Custom Integration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default POSIntegrations;
