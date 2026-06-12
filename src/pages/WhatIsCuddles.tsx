import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      "Tell Cuddles what you're looking for — relaxation, focus, creativity, sleep — and get personalized strain picks in seconds. Our AI understands terpenes, cannabinoids, and your preferences.",
    href: "/education/chat-with-cuddles",
  },
  {
    icon: Camera,
    title: "Strain Scanner",
    description:
      "Snap a photo of any cannabis flower and Cuddles identifies the strain, describes its effects, and suggests similar alternatives using computer vision and a proprietary strain database.",
    href: "/scanner",
  },
  {
    icon: BookOpen,
    title: "Strain Journal",
    description:
      "Track every session with mood, dosage, effects, and ratings. Over time, Cuddles learns your patterns and refines recommendations to match your unique endocannabinoid system.",
    href: "/journal",
  },
  {
    icon: Star,
    title: "Community Reviews",
    description:
      "Read real experiences from fellow cannabis enthusiasts. Discover trending strains, hidden gems, and honest feedback from a global community.",
    href: "/reviews",
  },
  {
    icon: Heart,
    title: "T-Break Coach",
    description:
      "A personalized tolerance reset program with progress tracking, motivational support, and AI-guided adjustments based on your usage history and goals.",
    href: "/t-break",
  },
  {
    icon: Sprout,
    title: "Seedling Monitor",
    description:
      "Track your grow from seed to harvest with care logs, environment tracking (temperature, humidity, light), and AI-generated cultivation tips tailored to your setup.",
    href: "/grow",
  },
];

const b2bFeatures = [
  {
    icon: Store,
    title: "Embeddable AI Budtender",
    description:
      "Add Cuddles to any dispensary website or POS screen in minutes. Customers get instant, compliant strain recommendations that increase basket size by 20–35%.",
    href: "/ai-budtender",
  },
  {
    icon: Zap,
    title: "POS Integrations",
    description:
      "Native connectors for Dutchie, Flowhub, Cova, and Sweed. Real-time inventory sync means Cuddles only recommends products you actually have in stock.",
    href: "/pos-integrations",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description:
      "Understand what strains sell best, when peak hours hit, and which customer segments drive the most revenue — all powered by AI pattern recognition.",
    href: "/why-cuddles",
  },
  {
    icon: ShoppingCart,
    title: "Inventory Optimization",
    description:
      "AI analyzes purchase trends and customer preferences to help suppliers and retailers stock what actually sells, reducing dead inventory by up to 30%.",
    href: "/why-cuddles",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Share Your Goals",
    description:
      "Tell Cuddles what effects you're after — pain relief, better sleep, creative focus, or just winding down.",
  },
  {
    step: "02",
    title: "AI Analyzes & Recommends",
    description:
      "Our RAG-powered engine cross-references your preferences with strain profiles, terpene data, and community feedback.",
  },
  {
    step: "03",
    title: "Track & Refine",
    description:
      "Log your sessions in the journal. Cuddles learns from every entry to make increasingly accurate suggestions.",
  },
];

const stats = [
  { value: "35%", label: "Higher average order value for dispensaries" },
  { value: "40%", label: "Better customer retention with personalization" },
  { value: "30%", label: "Reduction in dead inventory via AI forecasting" },
  { value: "<2s", label: "Real-time recommendation speed" },
];

const WhatIsCuddles = () => {
  return (
    <div className="min-h-screen pb-20">
      <SEO
        title="What is Cuddles AI? — Your AI Cannabis Budtender"
        description="Cuddles AI is a free AI-powered cannabis budtender that gives personalized strain recommendations, scans strains from photos, tracks your journal, and helps dispensaries sell smarter."
        keywords="what is Cuddles AI, AI cannabis budtender, strain recommendation app, cannabis AI assistant, smart budtender, cannabis journal app, strain scanner"
        url="/what-is-cuddles"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Built by Tripple444
          </div>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl leading-tight">
            What is <span className="gradient-text">Cuddles AI</span>?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Cuddles is your personal AI-powered cannabis budtender — a smart companion that helps you discover the right strains, track your experiences, and make informed decisions about cannabis. Built for consumers. Powering dispensaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/education/chat-with-cuddles">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl gap-2">
                <MessageCircle className="w-5 h-5" />
                Try Cuddles Free
              </Button>
            </Link>
            <Link to="/dispensary-onboarding">
              <Button
                size="lg"
                variant="outline"
                className="font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl gap-2"
              >
                <Store className="w-5 h-5" />
                For Dispensaries
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-display font-bold text-foreground mb-6 text-2xl md:text-3xl">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Cannabis is personal. What works for one person may not work for another. Cuddles was built to cut through the noise — combining AI intelligence with real strain data and community wisdom to help every individual find their perfect match. No guesswork. No stigma. Just personalized guidance.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
            <Shield className="w-4 h-4 text-primary" />
            General cannabis education only — not medical advice
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center bg-card border-border">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Consumer Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              For Consumers
            </p>
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
              Your Personal <span className="gradient-text">Cannabis Companion</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete suite of free AI-powered tools designed to enhance your cannabis journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consumerFeatures.map((feature) => (
              <Link key={feature.title} to={feature.href} className="group block">
                <Card className="h-full bg-card border border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              How It Works
            </p>
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
              Three Steps to <span className="gradient-text">Better Sessions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-5xl font-display font-bold text-primary/20 mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              For Dispensaries & Suppliers
            </p>
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
              AI That <span className="gradient-text">Pays for Itself</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Cuddles isn't just for consumers. Dispensaries and suppliers use our AI to sell more, waste less, and understand their customers better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {b2bFeatures.map((feature) => (
              <Link key={feature.title} to={feature.href} className="group block">
                <Card className="h-full bg-card border border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/why-cuddles">
              <Button variant="outline" size="lg" className="font-display font-semibold px-8">
                See All Business Benefits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Built For South Africa, Available Worldwide */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display font-bold text-foreground mb-4 text-2xl md:text-3xl">
              Built in South Africa. Used Worldwide.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Cuddles was born in South Africa to serve the growing legal cannabis market, but our AI speaks to enthusiasts and dispensaries across the globe. Same-day delivery available in South Africa via Tripple Four Shop Hub.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="p-6 bg-card border-border">
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
            </Card>
            <Card className="p-6 bg-card border-border">
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
            </Card>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Brain className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display font-bold text-foreground mb-4 text-2xl md:text-3xl">
            Powered by RAG & Multi-Agent AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Cuddles uses Retrieval-Augmented Generation (RAG) to pull from a proprietary knowledge base of 36+ cannabis strains, terpene science, and cultivation expertise. Our multi-agent system routes questions to specialized AI workers — inventory, education, personalization — for accurate, context-aware responses every time.
          </p>
          <Link to="/technology">
            <Button variant="outline" size="lg" className="font-display font-semibold px-8">
              Read the Technical Whitepaper
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
            Ready to Meet Cuddles?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start chatting for free, or schedule a demo to see how Cuddles can transform your dispensary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/education/chat-with-cuddles">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl gap-2">
                <Sparkles className="w-5 h-5" />
                Chat with Cuddles
              </Button>
            </Link>
            <Link to="/schedule-demo">
              <Button
                size="lg"
                variant="outline"
                className="font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl gap-2"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatIsCuddles;
