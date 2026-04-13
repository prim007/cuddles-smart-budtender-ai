import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, X, CheckCircle2, Bot, User } from "lucide-react";

const comparisonData = [
  { category: "Availability", manual: "Limited to store hours & staff schedules", ai: "24/7, handles unlimited simultaneous customers" },
  { category: "Product Knowledge", manual: "Varies by employee; training takes weeks", ai: "Instant access to full strain database, terpene data, effects" },
  { category: "Consistency", manual: "Different answers from different staff", ai: "Consistent, data-backed recommendations every time" },
  { category: "Personalization", manual: "Relies on memory and gut feeling", ai: "Tracks preferences, purchase history, mood, and tolerance" },
  { category: "Upselling", manual: "Uncomfortable, often skipped by staff", ai: "Natural, relevant suggestions based on real data" },
  { category: "Scalability", manual: "Need to hire more staff for growth", ai: "Handles 1 or 1,000 customers simultaneously" },
  { category: "Training Cost", manual: "R5,000+ per budtender, ongoing", ai: "Zero — AI improves automatically" },
  { category: "Speed", manual: "5-10 minutes per customer interaction", ai: "Under 5 seconds per recommendation" },
];

const roiCalculation = [
  { metric: "Average order increase", value: "35%", explanation: "AI recommends complementary products customers didn't know to ask for" },
  { metric: "Customer service time saved", value: "50%", explanation: "Staff focuses on in-store experience while AI handles digital queries" },
  { metric: "After-hours conversions", value: "+20%", explanation: "Cuddles captures website visitors at 11pm who would have bounced" },
  { metric: "Repeat purchase rate", value: "+25%", explanation: "Personalized follow-ups and journal tracking build loyalty" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cuddles AI vs Manual Budtending: A Data-Driven Comparison",
  description: "Side-by-side comparison of AI-powered budtending vs traditional manual budtending for cannabis dispensaries.",
  url: "https://cuddles-ai.com/ai-vs-manual-budtending",
  author: { "@type": "Organization", name: "Cuddles AI" },
  datePublished: "2026-04-13",
};

const AIvsManualBudtending = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cuddles AI vs Manual Budtending | Data-Driven Comparison"
        description="See how AI budtending outperforms manual budtending across 8 key metrics. Dispensaries using Cuddles AI report 35% higher sales and 50% faster service."
        url="/ai-vs-manual-budtending"
        keywords="AI vs manual budtending, cannabis budtender comparison, automated budtender, dispensary staff vs AI, smart budtender ROI, cannabis retail efficiency"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            Comparison
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-5xl leading-tight">
            Cuddles AI vs. Manual Budtending
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your staff is great — but they can't be everywhere at once. See how AI augments your team to deliver better outcomes across the board.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-foreground">
              <div>Category</div>
              <div className="flex items-center gap-2"><User className="w-4 h-4" /> Manual</div>
              <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> Cuddles AI</div>
            </div>
            {/* Rows */}
            {comparisonData.map((row, i) => (
              <div key={row.category} className={`grid grid-cols-3 p-4 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"} border-t border-border`}>
                <div className="font-medium text-foreground">{row.category}</div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  {row.manual}
                </div>
                <div className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {row.ai}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            The ROI of AI Budtending
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Numbers from dispensaries already using Cuddles AI
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {roiCalculation.map((item) => (
              <Card key={item.metric} className="p-6">
                <div className="font-display text-3xl font-bold text-primary mb-1">{item.value}</div>
                <div className="font-semibold text-foreground mb-2">{item.metric}</div>
                <p className="text-sm text-muted-foreground">{item.explanation}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clarification */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            AI Doesn't Replace Your Team — It Amplifies Them
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Cuddles handles the repetitive digital queries so your staff can focus on what humans do best: building relationships, handling complex situations, and creating memorable in-store experiences.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              See the difference yourself
            </h3>
            <p className="text-muted-foreground mb-6">
              Try Cuddles AI free for 14 days. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dispensary-onboarding">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/ai-budtender">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  Learn More About AI Budtending
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

export default AIvsManualBudtending;
