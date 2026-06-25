import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, Bot, ShoppingCart, Clock, Globe, BarChart3, Zap, Shield, CheckCircle2 } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    problem: "Long Wait Times",
    solution: "AI answers customer questions in under 5 seconds, 24/7",
    keyword: "reduce dispensary wait times",
  },
  {
    icon: ShoppingCart,
    problem: "Low Basket Size",
    solution: "Smart cross-selling increases average order value by 35%",
    keyword: "increase cannabis basket size",
  },
  {
    icon: Bot,
    problem: "Inconsistent Recommendations",
    solution: "AI delivers data-backed, personalized suggestions every time",
    keyword: "automated cannabis recommendations",
  },
  {
    icon: BarChart3,
    problem: "No After-Hours Engagement",
    solution: "Capture online visitors at midnight with always-on AI chat",
    keyword: "cannabis website chatbot",
  },
];

const globalMarkets = [
  { region: "North America", countries: "USA, Canada", status: "Expanding legalization", opportunity: "Dispensary chains scaling need automated solutions" },
  { region: "Europe", countries: "Germany, Netherlands, Czech Republic", status: "New regulatory frameworks", opportunity: "First-mover advantage in emerging legal markets" },
  { region: "Africa", countries: "South Africa, Ghana, Lesotho", status: "Medicinal & private use", opportunity: "Growing retail infrastructure needs tech backbone" },
  { region: "Asia-Pacific", countries: "Thailand, Australia", status: "Medical programs expanding", opportunity: "Patient education and product matching via AI" },
];

const automationStack = [
  { title: "Smart Product Discovery", description: "Customers describe what they want in natural language — AI matches them to the right product instantly." },
  { title: "Inventory-Aware Suggestions", description: "Recommendations are filtered by real-time stock levels, so customers never get suggested out-of-stock items." },
  { title: "POS Integration", description: "Syncs with Dutchie, Flowhub, Cova, and Sweed — no manual data entry, no double handling." },
  { title: "Compliance-Ready", description: "All recommendations follow local regulations. Age verification, purchase limits, and product restrictions built-in." },
  { title: "Multi-Language Support", description: "Serve customers in English, Afrikaans, Spanish, German, and more — expanding your reach globally." },
  { title: "Analytics Dashboard", description: "Track which products AI recommends most, conversion rates, and customer satisfaction in real time." },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cannabis Retail Automation: How AI is Transforming Dispensary Operations",
  description: "Complete guide to automating cannabis retail with AI-powered budtending, POS integration, and customer engagement tools.",
  url: "https://cuddles-ai.com/cannabis-retail-automation",
  author: { "@type": "Organization", name: "Cuddles AI" },
  datePublished: "2026-04-14",
  keywords: "cannabis retail automation, dispensary automation, AI budtender, cannabis technology, dispensary software",
};

const CannabisRetailAutomation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cannabis Retail Automation | AI-Powered Dispensary Solutions"
        description="Automate your cannabis dispensary with AI budtending, POS integration, and 24/7 customer engagement. Reduce wait times by 50% and increase basket size by 35%."
        url="/cannabis-retail-automation"
        keywords="cannabis retail automation, dispensary automation, automated cannabis product recommendations, AI dispensary software, cannabis technology solutions, dispensary chatbot, reduce dispensary wait times with AI"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            Cannabis Retail Automation
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-5xl leading-tight">
            Automate Your Dispensary.<br />Serve More Customers. Sell More Product.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            The cannabis industry is growing globally at 14.5% CAGR. Dispensaries that automate customer engagement, product discovery, and upselling are winning — everywhere from Colorado to Cape Town.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dispensary-onboarding">
              <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                Start Free 14-Day Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/schedule-demo">
              <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            Problems Every Dispensary Faces
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Whether you're in the US, Canada, Europe, or Africa — these challenges are universal.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((item) => (
              <Card key={item.problem} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">❌ {item.problem}</div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {item.solution}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Automation Stack */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            The Complete Cannabis Automation Stack
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Everything you need to automate your dispensary — from product discovery to analytics
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationStack.map((item) => (
              <Card key={item.title} className="p-6">
                <Zap className="w-5 h-5 text-primary mb-3" />
                <div className="font-semibold text-foreground mb-2">{item.title}</div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Markets */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground text-center">
              Available Worldwide
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Cuddles AI serves dispensaries and cannabis retailers across every major legal market
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {globalMarkets.map((market) => (
              <Card key={market.region} className="p-6">
                <div className="font-display text-lg font-bold text-primary mb-1">{market.region}</div>
                <div className="text-sm text-muted-foreground mb-2">{market.countries}</div>
                <div className="text-xs text-muted-foreground mb-2 italic">{market.status}</div>
                <div className="flex items-start gap-2 text-sm text-foreground">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {market.opportunity}
                </div>
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
              Ready to automate your dispensary?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join dispensaries worldwide using Cuddles AI to serve more customers, sell more product, and scale operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dispensary-onboarding">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/ai-budtender">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  Learn About AI Budtending
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

export default CannabisRetailAutomation;
