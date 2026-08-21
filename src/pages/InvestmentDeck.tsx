import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Target, Zap, DollarSign, Award, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const InvestmentDeck = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PresentationDigitalDocument",
    "name": "Cuddles Investment Deck",
    "description": "Revolutionizing Cannabis Retail with AI-Powered Recommendations. $39.1B global market opportunity.",
    "author": {
      "@type": "Organization",
      "name": "Cuddles"
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO 
        title="Investment Deck - Cuddles"
        description="Revolutionizing Cannabis Retail with AI-Powered Recommendations. $39.1B global cannabis market (2024), 14.5% CAGR projected growth. View our investment deck."
        url="/investment-deck"
        type="article"
        structuredData={structuredData}
      />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-hippie-pink">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hippie-purple rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hippie-orange rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-center mb-6 bg-gradient-to-r from-hippie-yellow via-hippie-pink to-hippie-purple bg-clip-text text-transparent">
            Investment Deck
          </h1>
          <p className="text-xl md:text-2xl text-center text-foreground/90 mb-8">
            Revolutionizing Cannabis Retail with AI-Powered Recommendations
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-hippie-pink/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-orange to-hippie-yellow flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Market Opportunity</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-purple/10 to-hippie-pink/10">
                <div className="text-4xl font-bold text-hippie-purple mb-2">R723B+</div>
                <div className="text-foreground/80">Global Cannabis Market Size (2024) — $39.1B USD</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-orange/10 to-hippie-yellow/10">
                <div className="text-4xl font-bold text-hippie-orange mb-2">14.5%</div>
                <div className="text-foreground/80">Projected CAGR (2024-2033)</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-green/10 to-hippie-blue/10">
                <div className="text-4xl font-bold text-hippie-green mb-2">5,000+</div>
                <div className="text-foreground/80">Target Dispensaries</div>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/international-market">
                <Button variant="link" className="text-hippie-purple hover:text-hippie-pink">
                  View Global Market Analysis →
                </Button>
              </Link>
            </div>
            
            <p className="text-lg text-foreground/80 leading-relaxed">
              The legal cannabis industry is experiencing explosive growth, but customers struggle to navigate thousands of product options. 
              Traditional budtenders can't scale, and generic recommendations lead to poor experiences and lost sales.
            </p>
          </Card>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-hippie-orange/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">The Problem</h2>
              </div>
              <ul className="space-y-4 text-foreground/80">
                <li className="flex gap-3">
                  <span className="text-hippie-orange mt-1">•</span>
                  <span>Customers overwhelmed by 1,000+ product SKUs per dispensary</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-hippie-orange mt-1">•</span>
                  <span>Inconsistent recommendations from human budtenders</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-hippie-orange mt-1">•</span>
                  <span>High customer acquisition costs with low retention</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-hippie-orange mt-1">•</span>
                  <span>Limited personalization at scale</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm border-hippie-green/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-green to-hippie-blue flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">Our Solution</h2>
              </div>
              <ul className="space-y-4 text-foreground/80">
                <li className="flex gap-3">
                  <span className="text-hippie-green mt-1">✓</span>
                  <span>AI-powered personalized strain recommendations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-hippie-green mt-1">✓</span>
                  <span>Based on desired effects, experience level & preferences</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-hippie-green mt-1">✓</span>
                  <span>Sub-2 second responses grounded in a curated knowledge base (RAG)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-hippie-green mt-1">✓</span>
                  <span>Seamless integration with existing POS systems</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-hippie-purple/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-purple to-hippie-pink flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Business Model</h2>
            </div>
            
            <p className="text-foreground/80 mb-6">
              Dispensaries rent Cuddles as a monthly, cancel-anytime licence. Pricing is priced to sit under one
              part-time budtender salary in South Africa (R6,000–R9,000/month) while scaling with locations and volume.
              All prices exclude VAT and include a 14-day free trial.
            </p>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-green/10 to-hippie-blue/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-green mb-3">Starter</h3>
                <p className="text-foreground/80 mb-2">1 location, embeddable widget, 1,000 chats/mo</p>
                <div className="text-2xl font-bold text-foreground">R1,899/mo</div>
                <div className="text-sm text-foreground/60">≈ $100 USD</div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-purple/10 to-hippie-pink/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-purple mb-3">Growth</h3>
                <p className="text-foreground/80 mb-2">Up to 3 locations, POS sync, 5,000 chats/mo</p>
                <div className="text-2xl font-bold text-foreground">R5,300/mo</div>
                <div className="text-sm text-foreground/60">≈ $285 USD</div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-orange/10 to-hippie-yellow/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-orange mb-3">Pro</h3>
                <p className="text-foreground/80 mb-2">Unlimited locations, white-label, analytics &amp; API</p>
                <div className="text-2xl font-bold text-foreground">R27,750/mo</div>
                <div className="text-sm text-foreground/60">≈ $1,500 USD</div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-pink/10 to-hippie-purple/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-pink mb-3">Enterprise</h3>
                <p className="text-foreground/80 mb-2">Chains, reseller &amp; white-label deals, custom SLAs</p>
                <div className="text-2xl font-bold text-foreground">Custom</div>
                <div className="text-sm text-foreground/60">Annual contract</div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg bg-muted/40">
                <div className="text-sm text-foreground/70 mb-1">Consumer Premium</div>
                <div className="text-xl font-bold text-foreground">R99/mo</div>
              </div>
              <div className="p-5 rounded-lg bg-muted/40">
                <div className="text-sm text-foreground/70 mb-1">Blended target ARPA (B2B)</div>
                <div className="text-xl font-bold text-foreground">≈ R4,800/mo</div>
              </div>
              <div className="p-5 rounded-lg bg-muted/40">
                <div className="text-sm text-foreground/70 mb-1">Gross margin (AI + infra costs)</div>
                <div className="text-xl font-bold text-foreground">≈ 82%</div>
              </div>
            </div>

          </Card>
        </div>
      </section>

      {/* Traction */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-hippie-yellow/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-yellow to-hippie-orange flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Product Status &amp; Targets</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bubble font-bold text-foreground mb-4">Shipped today</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>Live consumer app: AI plant &amp; cannabis expert, strain scanner (OCR), journal, reviews</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>Embeddable dispensary widget with tenant-scoped catalogs and 14-day free trial</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>RAG knowledge base over curated strain, dosing and safety documents</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>POS connector framework (Dutchie, Flowhub, Cova, Sweed) and ~2,800 mapped dispensary listings</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bubble font-bold text-foreground mb-4">12-month targets</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>50 paying dispensary tenants (≈ R2.9m ARR at blended ARPA)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>Median chat response under 2 seconds at 10x current volume</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>+15% basket size uplift measured against tenant POS baselines</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>Expansion pilots in Ghana, Malawi and Zimbabwe</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-foreground/60">
              Figures marked as targets are forward-looking objectives, not audited results. Cuddles is pre-revenue at
              scale; uplift benchmarks will be reported per tenant once POS baselines are measured.
            </p>

          </Card>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-hippie-purple/20 via-hippie-pink/20 to-hippie-orange/20 backdrop-blur-sm border-hippie-pink/50">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center text-foreground mb-6">
              Ready to Join Us?
            </h2>
            <p className="text-xl text-center text-foreground/80 mb-8">
              We're raising a R3m seed round to scale dispensary onboarding, deepen the AI stack, and expand across
              South Africa, Ghana, Malawi and Zimbabwe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={generateInvestorPdf}
                className="bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white text-lg px-8 py-6 h-auto"
              >
              <Mail className="w-5 h-5 mr-2" />
              Download Investor Summary
            </Button>

            <Link to="/schedule-demo">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-foreground border-2 border-hippie-yellow hover:bg-hippie-yellow/20 text-lg px-8 py-6 h-auto w-full">
                Schedule Demo
              </Button>
            </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default InvestmentDeck;