import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { ArrowRight, Bot, BarChart3, Clock, ShoppingCart, Users, Brain, Zap, CheckCircle2, MessageCircle, Download, Sparkles } from "lucide-react";
import ComplianceSection from "@/components/ComplianceSection";

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
    priceCurrency: "ZAR",
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
        title="AI Budtender for Dispensaries: 24/7 Smart Recommendations"
        description="An AI budtender that covers peak-hour queues and staff turnover for your dispensary. Free to try, no credit card, and it plugs into your live menu in minutes."
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
            Peak-hour queues and constant staff turnover cost dispensaries sales every week. Cuddles answers product questions instantly, so every customer gets a knowledgeable budtender experience — even when your floor is short-staffed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/education/chat-with-cuddles">
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

      {/* How the AI budtender works (technical) */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            How the AI Budtender Works
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Cuddles is a retrieval-grounded recommendation engine, not a generic chatbot bolted onto a menu.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">RAG-grounded answers</h3>
              <p className="text-muted-foreground">
                Every reply is built from a curated knowledge base of strain, terpene, dosing and safety
                passages retrieved by vector search, so recommendations cite your catalogue instead of
                relying on a model's memory.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Live menu &amp; POS sync</h3>
              <p className="text-muted-foreground">
                Your product list syncs into a per-tenant catalogue that is automatically re-embedded when
                items change, so the budtender only recommends stock you actually have on the shelf.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Effect-based matching</h3>
              <p className="text-muted-foreground">
                Customer intent (sleep, focus, pain, anxiety, social) is classified and matched against
                cannabinoid ratios, terpene profiles and tolerance signals — the same reasoning a strong
                budtender uses on the floor.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Embed in one line</h3>
              <p className="text-muted-foreground">
                A single script tag with your tenant embed key drops the widget onto any website, including
                WordPress and Shopify. Conversations, intents and demand signals flow into your insights
                dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* POS integrations */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            POS Integrations: Dutchie, Cova, Flowhub &amp; More
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            The AI budtender is only as good as the menu behind it. Cuddles pulls your live product
            list so every recommendation reflects what is actually in stock right now.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Supported point-of-sale and e-commerce integrations</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-3 pr-4 font-semibold text-foreground">Platform</th>
                  <th scope="col" className="py-3 pr-4 font-semibold text-foreground">How it connects</th>
                  <th scope="col" className="py-3 font-semibold text-foreground">Menu refresh</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th scope="row" className="py-3 pr-4 font-medium text-foreground">Dutchie</th>
                  <td className="py-3 pr-4">Menu feed mapped into your tenant catalogue, including THC/CBD and category fields.</td>
                  <td className="py-3">Scheduled sync</td>
                </tr>
                <tr className="border-b border-border/60">
                  <th scope="row" className="py-3 pr-4 font-medium text-foreground">Cova</th>
                  <td className="py-3 pr-4">Product and inventory export mapped to strain profiles with per-store availability.</td>
                  <td className="py-3">Scheduled sync</td>
                </tr>
                <tr className="border-b border-border/60">
                  <th scope="row" className="py-3 pr-4 font-medium text-foreground">Flowhub</th>
                  <td className="py-3 pr-4">Inventory feed keyed on SKU so out-of-stock items drop out of recommendations.</td>
                  <td className="py-3">Scheduled sync</td>
                </tr>
                <tr className="border-b border-border/60">
                  <th scope="row" className="py-3 pr-4 font-medium text-foreground">Shopify &amp; WooCommerce</th>
                  <td className="py-3 pr-4">Storefront catalogue import plus the embeddable widget on your product pages.</td>
                  <td className="py-3">Near real-time</td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 pr-4 font-medium text-foreground">Spreadsheet or PDF menu</th>
                  <td className="py-3 pr-4">Upload a CSV or menu PDF — Cuddles extracts products, prices and potency automatically.</td>
                  <td className="py-3">On upload</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Running something else? See the{" "}
            <Link to="/pos-integrations" className="text-primary hover:underline">full POS integration guide</Link>{" "}
            — any menu that can be exported can be connected.
          </p>
        </div>
      </section>

      {/* RAG pipeline detail */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            Inside the RAG Pipeline
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Retrieval-augmented generation is why Cuddles answers about your shelf instead of
            inventing products. Here is what happens on every message.
          </p>
          <ol className="space-y-5">
            <li className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">1. Intent classification</h3>
              <p className="text-muted-foreground">The customer's message is classified into an intent — effect-seeking, product lookup, dosing question, safety question or purchase intent — which decides what gets retrieved.</p>
            </li>
            <li className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">2. Vector retrieval</h3>
              <p className="text-muted-foreground">The query is embedded and matched against two stores: your tenant menu embeddings and a curated knowledge base of strain, terpene, dosing and safety passages.</p>
            </li>
            <li className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">3. Grounded generation</h3>
              <p className="text-muted-foreground">Only the retrieved passages and in-stock products are passed to the language model, with instructions to refuse rather than guess when the catalogue has no match.</p>
            </li>
            <li className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">4. Tool calls for live data</h3>
              <p className="text-muted-foreground">When a customer asks where to buy or what is in stock, the agent calls live tools — menu search and dispensary lookup — instead of answering from memory.</p>
            </li>
            <li className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">5. Demand signals back to you</h3>
              <p className="text-muted-foreground">Every intent and unmatched request is logged to your insights dashboard, so you can see the effects and products customers ask for but you do not stock.</p>
            </li>
          </ol>
          <p className="text-sm text-muted-foreground mt-8 text-center">
            Deeper technical detail is in the{" "}
            <Link to="/technology" className="text-primary hover:underline">RAG architecture whitepaper</Link>.
          </p>
        </div>
      </section>

      {/* B2B proof points & rental pricing */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            What Dispensaries Get When They Rent Cuddles
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            No per-seat licences and no build cost — you rent a working AI budtender monthly and can
            cancel at any time.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Plan</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Monthly</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Included</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">Starter</td>
                  <td className="px-4 py-3">R1,899 (~$100)</td>
                  <td className="px-4 py-3">1 location, 1,000 chats, embeddable widget</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">Growth</td>
                  <td className="px-4 py-3">R5,300 (~$285)</td>
                  <td className="px-4 py-3">3 locations, POS/menu sync, 5,000 chats, demand insights</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">Pro</td>
                  <td className="px-4 py-3">R27,750 (~$1,500)</td>
                  <td className="px-4 py-3">Unlimited locations, white-label, API access</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">Enterprise</td>
                  <td className="px-4 py-3">Custom</td>
                  <td className="px-4 py-3">Annual contract, dedicated support, custom integrations</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Answers from your menu</h3>
              <p className="text-muted-foreground text-sm">
                Retrieval runs against your own tenant catalogue, so out-of-stock and off-menu products
                are never recommended.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Live in a day</h3>
              <p className="text-muted-foreground text-sm">
                Upload or sync your menu, paste one script tag, and the budtender is answering customers —
                no developer, no POS migration.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Demand data back to you</h3>
              <p className="text-muted-foreground text-sm">
                Every conversation is turned into intent and demand signals you can use for buying
                decisions in your insights dashboard.
              </p>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Response-time and conversion figures are internal targets, not audited results. Cuddles is an
            education and recommendation tool, not medical advice.
          </p>
          <div className="text-center mt-8">
            <Link to="/licensing">
              <Button size="lg" variant="outline" className="font-display font-medium rounded-xl">
                See full rental terms
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              Take Cuddles with you
            </h3>
            <p className="text-muted-foreground mb-6">
              Install the app for one-tap access. Works offline, loads instantly, and feels like a native app.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/install">
                <Button size="lg" className="font-display font-semibold rounded-xl gap-2 w-full">
                  <Download className="w-4 h-4" />
                  Download the App
                </Button>
              </Link>
              <Link to="/education/chat-with-cuddles">
                <Button size="lg" variant="outline" className="font-display font-medium rounded-xl gap-2 w-full">
                  <MessageCircle className="w-4 h-4" />
                  Try Cuddles Free
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

      <ComplianceSection />
      <Footer />
    </div>
  );
};

export default AIBudtender;
