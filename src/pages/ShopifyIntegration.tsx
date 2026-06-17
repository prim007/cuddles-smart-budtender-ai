import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Zap,
  Shield,
  RefreshCw,
  Store,
  BarChart3,
  HeadphonesIcon,
  Code,
  Globe,
  CreditCard,
} from "lucide-react";

const shopifyFeatures = [
  {
    icon: ShoppingBag,
    title: "Product Catalog Sync",
    description:
      "Cuddles AI reads your Shopify product catalog in real-time. Every strain, edible, vape, and accessory is mapped to our recommendation engine so the AI only suggests what you actually stock.",
    features: [
      "Auto-import collections & variants",
      "Live inventory-aware suggestions",
      "CBD, hemp & accessory support",
    ],
  },
  {
    icon: HeadphonesIcon,
    title: "Embedded AI Budtender Widget",
    description:
      "Drop a single script tag into your Shopify theme. Visitors get a conversational strain finder, dosage guidance, and personalized product recommendations without leaving your store.",
    features: [
      "One-click theme embed — no developer needed",
      "Mobile-first chat interface",
      "Matches customer vibe to your catalog",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Understand what customers are looking for vs. what they buy. Cuddles surfaces demand signals, popular effects, and missed conversion opportunities from every chat session.",
    features: [
      "Chat-to-conversion funnel tracking",
      "Strain demand heatmaps",
      "Inventory gap alerts",
    ],
  },
  {
    icon: CreditCard,
    title: "Checkout-Aware Recommendations",
    description:
      "Boost average order value with smart upsells. Cuddles suggests complementary products based on cart contents — rolling papers with flower, batteries with vapes, and more.",
    features: [
      "Cart-based cross-sell logic",
      "Compliance-safe suggestions",
      "Abandoned-cart recovery prompts",
    ],
  },
];

const integrationSteps = [
  {
    step: "1",
    title: "Connect your Shopify store",
    description: "Install the Cuddles AI app from the Shopify App Store or paste your store URL and API token.",
  },
  {
    step: "2",
    title: "Map your catalog",
    description: "Cuddles automatically syncs your products, collections, and inventory levels.",
  },
  {
    step: "3",
    title: "Customize the widget",
    description: "Pick your brand colors, chat avatar, and welcome message — all from the Cuddles dashboard.",
  },
  {
    step: "4",
    title: "Go live",
    description: "Add the embed script to your theme. The AI budtender appears on every page and starts selling immediately.",
  },
];

const shopifyBenefits = [
  {
    icon: Zap,
    title: "Real-Time Sync",
    desc: "Shopify inventory updates flow to Cuddles instantly. Never recommend an out-of-stock product again.",
  },
  {
    icon: Shield,
    title: "Compliance Safe",
    desc: "All recommendations respect Shopify's Acceptable Use Policy and regional cannabis regulations.",
  },
  {
    icon: RefreshCw,
    title: "Zero Downtime",
    desc: "Read-only integration. Your Shopify store keeps running — Cuddles observes, never interferes.",
  },
  {
    icon: Globe,
    title: "Multi-Market Support",
    desc: "Works with Shopify Markets, local currencies, and region-specific product availability.",
  },
  {
    icon: Code,
    title: "Headless Ready",
    desc: "Use Cuddles with Hydrogen, Liquid, or any custom Shopify storefront via our API.",
  },
  {
    icon: Store,
    title: "POS + Online",
    desc: "Extend the same AI budtender to your Shopify POS in-store for a unified customer experience.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Shopify Cannabis AI Integration — Cuddles AI for Shopify Stores",
  description:
    "Add an AI budtender to your Shopify store. Cuddles AI syncs your product catalog, recommends strains and accessories, and boosts conversion with embedded chat.",
  url: "https://cuddles-ai.com/shopify-integration",
};

const ShopifyIntegration = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shopify Cannabis AI Integration | Cuddles AI Budtender"
        description="Add an AI-powered cannabis budtender to your Shopify store. Real-time catalog sync, embedded chat widget, and smart product recommendations that boost basket size."
        url="/shopify-integration"
        keywords="Shopify cannabis AI, Shopify budtender app, cannabis Shopify integration, AI product recommendations Shopify, CBD Shopify chatbot, hemp store AI, Shopify strain finder, cannabis e-commerce AI"
        structuredData={structuredData}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            Shopify Integration
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl leading-tight">
            Cuddles AI for <span className="text-primary">Shopify</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Turn your Shopify store into an intelligent cannabis dispensary. AI-powered
            product recommendations, real-time inventory sync, and a conversational budtender
            that sells while you sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dispensary-onboarding">
              <Button size="lg" className="font-display font-semibold rounded-xl gap-2">
                <ShoppingBag className="w-5 h-5" />
                Connect Your Store
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/schedule-demo">
              <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2">
                <HeadphonesIcon className="w-5 h-5" />
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {shopifyFeatures.map((feature) => (
              <Card key={feature.title} className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((f) => (
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

      {/* Benefits Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Built for Shopify Scale
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopifyBenefits.map((b) => (
              <Card key={b.title} className="p-6 text-center">
                <b.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture / How it works under the hood */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            How the Integration Works
          </h2>
          <div className="space-y-8">
            {[
              {
                title: "Shopify Admin API Connection",
                body: "Cuddles connects via Shopify's Admin GraphQL API with a read-only custom app. We sync products, variants, inventory levels, and collections every few minutes — or in real-time via Shopify webhooks when stock changes.",
              },
              {
                title: "Product Enrichment Layer",
                body: "Raw Shopify SKUs are enriched with Cuddles' cannabis knowledge base: terpene profiles, effect tags, THC/CBD ranges, and consumption methods. The result is a smart catalog the AI actually understands.",
              },
              {
                title: "Embedded Chat Widget",
                body: "A lightweight React widget loads asynchronously on your storefront. It communicates with Cuddles' edge functions to fetch recommendations, check live inventory, and surface Shopify checkout links — all without slowing down your theme.",
              },
              {
                title: "Secure, Scoped Permissions",
                body: "We request the minimum OAuth scopes needed: read_products, read_inventory, and read_orders (optional, for conversion tracking). No write access. No customer data harvesting. Full POPIA/GDPR compliance.",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-4 border-primary pl-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{item.body}</p>
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
              Ready to add AI to your Shopify store?
            </h3>
            <p className="text-muted-foreground mb-6">
              Most stores are up and running in under 15 minutes. No code required for standard themes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dispensary-onboarding">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  Talk to Sales
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

export default ShopifyIntegration;
