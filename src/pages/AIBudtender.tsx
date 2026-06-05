import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, Bot, BarChart3, Clock, ShoppingCart, Users, Brain, Zap, CheckCircle2, MessageCircle, Download, Sparkles } from "lucide-react";

const stats = [
  { value: "35%", label: "Higher Average Order Value", icon: ShoppingCart },
  { value: "50%", label: "Faster Customer Service", icon: Clock },
  { value: "2,500+", label: "Active Users", icon: Users },
  { value: "24/7", label: "Always Available", icon: Bot },
];

const features = [
  {
    icon: Brain,
    title: "RAG-Powered Strain Intelligence",
    description: "Unlike basic chatbots, Cuddles uses Retrieval-Augmented Generation to pull from real-time strain databases, terpene profiles, and customer preference data for accurate recommendations.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Upselling",
    description: "AI analyzes purchase patterns and customer preferences to suggest complementary products, increasing basket size without pushy sales tactics.",
  },
  {
    icon: Clock,
    title: "Eliminate Wait Times",
    description: "Customers get instant, personalized answers about strains, effects, and dosing — freeing your staff to handle complex queries and build relationships.",
  },
  {
    icon: Zap,
    title: "5-Minute Setup",
    description: "Embed Cuddles on your website with a single script tag. No developer needed. Works with any POS system including Dutchie, Flowhub, and Cova.",
  },
];

const useCases = [
  "Customer asks: 'What's good for sleep?' → Cuddles recommends your highest-margin indica in stock",
  "New customer confused by options → Cuddles walks them through effects, terpenes, and dosing",
  "Busy Friday evening rush → Cuddles handles 50+ simultaneous conversations while staff serves in-store",
  "Customer browsing your website at 2am → Cuddles converts the visit into a pre-order",
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Cuddles AI Smart Budtender",
  applicationCategory: "BusinessApplication",
  description: "AI-powered smart budtender for cannabis dispensaries. Increases sales, reduces wait times, and delivers personalized strain recommendations 24/7.",
  url: "https://cuddles-ai.com/ai-budtender",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to try and download — no credit card required",
  },
  featureList: [
    "RAG-powered strain recommendations",
    "Real-time inventory integration",
    "POS system compatibility",
    "24/7 automated customer service",
    "Data-driven upselling",
  ],
};

const AIBudtender = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Budtender for Dispensaries | Free to Try & Download"
        description="Cuddles AI is the smart budtender that increases dispensary sales by 35% and cuts wait times in half. RAG-powered strain recommendations, POS integration, 24/7 availability. Free to try — no credit card required."
        url="/ai-budtender"
        keywords="AI budtender for dispensaries, automated cannabis product recommendations, cannabis retail automation, smart budtender, dispensary AI chatbot, reduce dispensary wait times with AI, cannabis recommendation engine"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            Cannabis Retail Automation
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl leading-tight">
            The AI Budtender That <span className="text-primary">Sells For You</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Stop losing sales to long wait times and undertrained staff. Cuddles AI gives every customer a personalized, knowledgeable budtender experience — instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chat">
              <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                <MessageCircle className="w-4 h-4" />
                Try Cuddles Free
              </Button>
            </Link>
            <Link to="/install">
              <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                <Download className="w-4 h-4" />
                Download the App
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            100% free to try and download. No credit card. No signup required to start chatting.
          </p>
        </div>
      </section>

      {/* How to use Cuddles — clear instructions */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-3">
            How to Use Cuddles
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Three simple steps. Free, private, and instant.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold mb-3">1</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" /> Open the chat
              </h3>
              <p className="text-muted-foreground text-sm">
                Tap <strong>Try Cuddles Free</strong> above to launch the chat — no account needed.
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold mb-3">2</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Ask anything
              </h3>
              <p className="text-muted-foreground text-sm">
                Tell Cuddles how you feel or what you want — sleep, focus, pain relief, creativity. Get matched strains in seconds.
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold mb-3">3</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" /> Install the app
              </h3>
              <p className="text-muted-foreground text-sm">
                Save Cuddles to your phone for one-tap access. Free to download — works on iOS & Android.
              </p>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6 italic">
            Cuddles provides general cannabis education only — not medical advice.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-display text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            How an AI Budtender Increases Basket Size
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Real scenarios where Cuddles AI converts browsers into buyers
          </p>
          <div className="space-y-4">
            {useCases.map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-foreground">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Why Cuddles AI Outperforms Basic Chatbots
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
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
              Ready to automate your budtending?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join dispensaries already using Cuddles AI to increase sales and delight customers.
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

      {/* Related Pages */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">Learn More</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/cannabis-retail-automation" className="text-sm text-primary hover:underline">Cannabis Retail Automation</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/technology" className="text-sm text-primary hover:underline">Our RAG Technology</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/reduce-dispensary-wait-times" className="text-sm text-primary hover:underline">Reduce Wait Times</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/how-ai-budtender-increases-basket-size" className="text-sm text-primary hover:underline">Increase Basket Size</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/pos-integrations" className="text-sm text-primary hover:underline">POS Integrations</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIBudtender;
