import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, TrendingUp, ShoppingCart, Brain, BarChart3, Target, Lightbulb } from "lucide-react";

const strategies = [
  {
    icon: Brain,
    title: "Contextual Cross-Selling",
    description: "When a customer asks for a sleep strain, Cuddles also suggests a CBD tincture for relaxation or a grinder for convenience — products they didn't know they needed.",
    impact: "+15% basket size",
  },
  {
    icon: Target,
    title: "Preference-Based Upselling",
    description: "AI learns that a customer prefers premium terpene profiles. Next visit, it recommends the higher-margin strain with matching terpenes before they even ask.",
    impact: "+20% per transaction",
  },
  {
    icon: BarChart3,
    title: "Purchase Pattern Analysis",
    description: "Cuddles identifies that customers who buy Strain A also buy Strain B 60% of the time, and surfaces these pairings automatically.",
    impact: "+12% repeat purchases",
  },
  {
    icon: ShoppingCart,
    title: "Threshold Incentives",
    description: "AI detects when a cart is close to a free delivery threshold or loyalty reward tier, and suggests just-right additions to cross the line.",
    impact: "+8% average order value",
  },
];

const caseStudy = {
  title: "How a Dispensary Went from R850 to R1,150 Average Order",
  steps: [
    "Before: Staff recommended the same 5 strains to everyone. Average order: R850.",
    "Week 1: Cuddles AI deployed. Personalized recommendations based on customer effects preferences.",
    "Week 2: Cross-sell suggestions activated. Edibles and accessories added to 30% of orders.",
    "Week 4: Average order: R1,150. Staff reported less 'information fatigue' from repetitive questions.",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How an AI Budtender Increases Dispensary Basket Size by 35%",
  description: "Data-driven strategies showing how AI-powered budtending increases average order values for cannabis dispensaries.",
  url: "https://cuddles-ai.com/how-ai-budtender-increases-basket-size",
  author: { "@type": "Organization", name: "Cuddles AI" },
  datePublished: "2026-04-13",
};

const AIBasketSize = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="How an AI Budtender Increases Basket Size by 35%"
        description="Discover 4 data-driven strategies dispensaries use with Cuddles AI to increase average order values by 35%. Real ROI examples and implementation guide."
        url="/how-ai-budtender-increases-basket-size"
        keywords="increase dispensary basket size, AI upselling cannabis, cannabis cross selling, dispensary average order value, AI budtender ROI, cannabis retail revenue, smart upselling dispensary"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            Revenue Growth
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-5xl leading-tight">
            How an AI Budtender Increases <span className="text-primary">Basket Size by 35%</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The difference between a generic recommendation and a personalized one is R300 per order. Here's exactly how Cuddles AI captures that revenue.
          </p>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            4 AI-Driven Revenue Strategies
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {strategies.map((s) => (
              <Card key={s.title} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <s.icon className="w-10 h-10 text-primary" />
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{s.impact}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-2 justify-center mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Case Study</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">
            {caseStudy.title}
          </h2>
          <div className="space-y-4">
            {caseStudy.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                  {i + 1}
                </div>
                <p className="text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Takeaway */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            The Bottom Line
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Dispensaries using AI-powered recommendations see a <strong className="text-foreground">35% increase in average order value</strong> within the first month. The AI pays for itself in the first week.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              Start growing your basket size today
            </h3>
            <p className="text-muted-foreground mb-6">
              Free 14-day trial. No credit card. See the revenue difference in week one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dispensary-onboarding">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/ai-vs-manual-budtending">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  See AI vs Manual Comparison
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

export default AIBasketSize;
