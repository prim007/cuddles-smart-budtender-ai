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
              <h2 className="text-3xl md:text-4xl font-groovy text-foreground">Market Opportunity</h2>
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
                <h2 className="text-3xl font-groovy text-foreground">The Problem</h2>
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
                <h2 className="text-3xl font-groovy text-foreground">Our Solution</h2>
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
                  <span>Instant responses with 95%+ accuracy</span>
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
              <h2 className="text-3xl md:text-4xl font-groovy text-foreground">Business Model</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-purple/10 to-hippie-pink/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-purple mb-3">SaaS Subscription</h3>
                <p className="text-foreground/80 mb-2">Monthly recurring revenue per dispensary location</p>
                <div className="text-2xl font-bold text-foreground">R5,300-R17,800/mo</div>
              </div>
              
              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-orange/10 to-hippie-yellow/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-orange mb-3">Transaction Fee</h3>
                <p className="text-foreground/80 mb-2">Small percentage on purchases influenced by Cuddles</p>
                <div className="text-2xl font-bold text-foreground">1-2%</div>
              </div>
              
              <div className="p-6 rounded-lg bg-gradient-to-br from-hippie-green/10 to-hippie-blue/10">
                <h3 className="text-xl font-bubble font-bold text-hippie-green mb-3">Enterprise</h3>
                <p className="text-foreground/80 mb-2">Custom solutions for multi-location chains</p>
                <div className="text-2xl font-bold text-foreground">Custom</div>
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
              <h2 className="text-3xl md:text-4xl font-groovy text-foreground">Traction & Metrics</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bubble font-bold text-foreground mb-4">Key Achievements</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>95% recommendation accuracy rate</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>Sub-2 second average response time</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>4.9/5 customer satisfaction rating</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-yellow mt-1">★</span>
                    <span>Integration with major POS systems</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bubble font-bold text-foreground mb-4">Customer Impact</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>35% increase in average order value</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>50% reduction in customer service time</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>40% improvement in customer retention</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">↑</span>
                    <span>60% decrease in product returns</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-hippie-purple/20 via-hippie-pink/20 to-hippie-orange/20 backdrop-blur-sm border-hippie-pink/50">
            <h2 className="text-3xl md:text-5xl font-groovy text-center text-foreground mb-6">
              Ready to Join Us?
            </h2>
            <p className="text-xl text-center text-foreground/80 mb-8">
              We're raising our Series A to scale operations, expand our AI capabilities, and capture market share across South Africa and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white text-lg px-8 py-6 h-auto">
              <Mail className="w-5 h-5 mr-2" />
              Request Full Deck
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