import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, Brain, Database, Zap, Shield, CheckCircle2, X, Search, Cpu } from "lucide-react";

const comparisonRows = [
  { feature: "Knowledge Source", basic: "Pre-trained on generic internet data", rag: "Retrieves from your real-time strain database, terpene profiles, and inventory" },
  { feature: "Accuracy", basic: "Often hallucinates or gives outdated info", rag: "Grounded in verified, up-to-date product data" },
  { feature: "Personalization", basic: "One-size-fits-all responses", rag: "Considers user preferences, tolerance, mood, and history" },
  { feature: "Inventory Awareness", basic: "No connection to stock levels", rag: "Only recommends products currently in stock" },
  { feature: "Compliance", basic: "May suggest restricted products", rag: "Built-in regulatory filters per jurisdiction" },
  { feature: "Learning", basic: "Static — doesn't improve", rag: "Continuously improves from customer interactions and reviews" },
];

const ragSteps = [
  {
    icon: Search,
    title: "1. Query Understanding",
    description: "When a customer asks 'I need something for anxiety that won't make me drowsy,' Cuddles parses the intent: effect = anxiolytic, constraint = non-sedating.",
  },
  {
    icon: Database,
    title: "2. Vector Retrieval",
    description: "The system searches a vector database of strain profiles, terpene data, and customer reviews to find semantically matching products — not just keyword matches.",
  },
  {
    icon: Brain,
    title: "3. Contextual Generation",
    description: "A large language model synthesizes the retrieved data with the customer's profile (tolerance, preferences, past sessions) to generate a personalized, accurate recommendation.",
  },
  {
    icon: Shield,
    title: "4. Safety & Compliance Layer",
    description: "Before delivery, recommendations pass through compliance filters — age verification, purchase limits, and jurisdiction-specific product restrictions.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Why RAG Makes Cuddles AI More Accurate Than Basic Cannabis Chatbots",
  description: "Technical deep-dive into how Retrieval-Augmented Generation powers accurate, real-time cannabis strain recommendations.",
  url: "https://cuddles-ai.com/technology",
  author: { "@type": "Organization", name: "Cuddles AI" },
  datePublished: "2026-04-14",
  proficiencyLevel: "Expert",
  keywords: "RAG cannabis AI, retrieval augmented generation, cannabis chatbot technology, AI dispensary accuracy, vector database cannabis",
};

const RAGWhitepaper = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="RAG Technology: Why Cuddles AI Is More Accurate Than Basic Chatbots"
        description="Technical whitepaper on how Retrieval-Augmented Generation and vector databases power Cuddles AI's cannabis recommendations — and why basic chatbots fail dispensaries."
        url="/technology"
        keywords="RAG cannabis AI, retrieval augmented generation dispensary, cannabis chatbot vs AI budtender, vector database cannabis, AI accuracy cannabis retail, cannabis AI technology"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Cpu className="w-4 h-4" /> Technical Whitepaper
          </div>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-5xl leading-tight">
            Why RAG Makes Cannabis AI<br />Actually Accurate
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Most cannabis chatbots are glorified FAQ bots. Cuddles uses Retrieval-Augmented Generation to deliver recommendations grounded in real data — not hallucinations.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            The Problem with Basic Cannabis Chatbots
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            A dispensary installs a generic chatbot on their website. A customer asks: <em>"What's good for sleep without the munchies?"</em> The chatbot responds with a generic answer pulled from its training data — often outdated, sometimes wrong, and never personalized. It doesn't know your inventory, your customer's tolerance, or local regulations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This isn't just unhelpful — it actively damages trust. Customers learn the chatbot can't help, and they stop engaging. Your investment in "AI" becomes a liability.
          </p>
        </div>
      </section>

      {/* How RAG Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            How RAG Works in Cuddles AI
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Four steps from customer question to accurate, personalized recommendation
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {ragSteps.map((step) => (
              <Card key={step.title} className="p-6">
                <step.icon className="w-6 h-6 text-primary mb-3" />
                <div className="font-semibold text-foreground mb-2">{step.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Basic Chatbot vs. RAG-Powered AI
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-foreground">
              <div>Feature</div>
              <div className="flex items-center gap-2"><X className="w-4 h-4 text-destructive" /> Basic Chatbot</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Cuddles RAG</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 p-4 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"} border-t border-border`}>
                <div className="font-medium text-foreground">{row.feature}</div>
                <div className="text-sm text-muted-foreground">{row.basic}</div>
                <div className="text-sm text-foreground">{row.rag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters for Dispensaries */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            Why This Matters for Your Dispensary
          </h2>
          <div className="space-y-4">
            {[
              "Customers trust recommendations because they're backed by real product data",
              "No more embarrassing out-of-stock suggestions — AI knows your inventory",
              "Terpene-aware matching means better outcomes and fewer returns",
              "Every interaction teaches the system, making future recommendations better",
              "Compliance filters mean you never accidentally violate local regulations",
              "Works across all legal markets — US, Canada, Europe, Africa, and Asia-Pacific",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              See RAG in action
            </h3>
            <p className="text-muted-foreground mb-6">
              Try Cuddles AI free — ask it anything about cannabis and see how it compares to basic chatbots.
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

export default RAGWhitepaper;
