import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, Clock, Users, TrendingDown, CheckCircle2, BarChart3, Bot } from "lucide-react";

const waitTimeStats = [
  { stat: "8-15 min", label: "Average wait per customer at busy dispensaries", icon: Clock },
  { stat: "23%", label: "Customers who leave without buying due to long waits", icon: TrendingDown },
  { stat: "< 5 sec", label: "Cuddles AI response time for product recommendations", icon: Bot },
  { stat: "50%", label: "Reduction in service time with AI-assisted budtending", icon: BarChart3 },
];

const strategies = [
  {
    title: "Pre-Visit AI Consultation",
    description: "Customers browse your menu and get AI recommendations before arriving. They walk in already knowing what they want — reducing counter time by 60%.",
  },
  {
    title: "In-Store Kiosk Mode",
    description: "Customers waiting in line can interact with Cuddles on their phone or a store tablet, getting answers to common questions without occupying staff.",
  },
  {
    title: "After-Hours Self-Service",
    description: "Website visitors at 11pm get instant AI-powered recommendations and can pre-order for next-day pickup — no staff needed.",
  },
  {
    title: "Staff Augmentation",
    description: "New budtenders use Cuddles as a real-time assistant, answering complex strain questions accurately from day one — cutting training time in half.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Reduce Dispensary Wait Times with AI",
  description: "Proven strategies to cut cannabis dispensary wait times by 50% using AI-powered budtending and customer self-service.",
  url: "https://cuddles-ai.com/reduce-dispensary-wait-times",
  author: { "@type": "Organization", name: "Cuddles AI" },
  datePublished: "2026-04-14",
  keywords: "reduce dispensary wait times, cannabis retail efficiency, dispensary queue management, AI budtender speed",
};

const DispensaryWaitTimes = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Reduce Dispensary Wait Times by 50% with AI | Cuddles"
        description="Long lines kill cannabis sales. Learn how dispensaries use AI budtending to cut wait times by 50%, reduce walkouts by 23%, and serve more customers per hour."
        url="/reduce-dispensary-wait-times"
        keywords="reduce dispensary wait times, dispensary queue management, cannabis retail efficiency, AI budtender speed, dispensary customer experience, cannabis wait time solutions"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            Operational Efficiency
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-5xl leading-tight">
            Cut Dispensary Wait Times<br />in Half with AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            23% of dispensary customers walk out due to long wait times. AI-powered budtending solves this by handling the information gap — instantly.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {waitTimeStats.map((item) => (
              <Card key={item.label} className="p-4 text-center">
                <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-foreground mb-1">{item.stat}</div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            4 Ways AI Eliminates Wait Times
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Proven strategies from dispensaries using Cuddles AI
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {strategies.map((item) => (
              <Card key={item.title} className="p-6">
                <div className="font-semibold text-foreground mb-2">{item.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Math */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">
            The Revenue Impact
          </h2>
          <Card className="p-8">
            <div className="space-y-4">
              {[
                "A busy dispensary serves ~200 customers/day",
                "23% walkout rate = 46 lost customers/day",
                "Average transaction = $45 → $2,070 lost revenue per day",
                "Reducing wait times by 50% cuts walkouts to ~12% → recovers $1,000+/day",
                "That's $30,000+ in recovered monthly revenue",
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground">{line}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              Stop losing customers to wait times
            </h3>
            <p className="text-muted-foreground mb-6">
              Try Cuddles AI free for 14 days. Setup takes 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dispensary-onboarding">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/cannabis-retail-automation">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  Full Automation Guide
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

export default DispensaryWaitTimes;
