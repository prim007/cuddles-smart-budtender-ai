import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Globe, TrendingUp, MapPin, Users, DollarSign, Award } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const InternationalMarket = () => {
  return (
    <div className="min-h-screen pb-20">
      <SEO 
        title="Global Cannabis Market Analysis - Cuddles"
        description="The global cannabis market is valued at $39.1B USD (2024) and growing at 14.5% CAGR. Explore international market opportunities for Cuddles AI-powered cannabis recommendations."
        url="/international-market"
        type="article"
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-12 h-12 text-hippie-purple" />
            <h1 className="text-5xl md:text-7xl font-display font-bold text-center bg-gradient-to-r from-hippie-yellow via-hippie-pink to-hippie-purple bg-clip-text text-transparent">
              Global Market Opportunity
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-center text-foreground/90 mb-8">
            The Cannabis Industry: A Multi-Billion Rand Global Market
          </p>
        </div>
      </section>

      {/* US Market in Rands */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-hippie-purple/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-purple to-hippie-pink flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">US Cannabis Market</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-purple/10 to-hippie-pink/10">
               <div className="text-4xl font-bold text-hippie-purple mb-2">$33.6B</div>
                <div className="text-foreground/80">US Market Size (2024)</div>
                <div className="text-sm text-muted-foreground mt-2">(~R622B ZAR)</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-orange/10 to-hippie-yellow/10">
                <div className="text-4xl font-bold text-hippie-orange mb-2">14.5%</div>
                <div className="text-foreground/80">Projected CAGR</div>
                <div className="text-sm text-muted-foreground mt-2">(2024-2033)</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-green/10 to-hippie-blue/10">
                <div className="text-4xl font-bold text-hippie-green mb-2">$151.7B</div>
                <div className="text-foreground/80">Projected by 2033</div>
                <div className="text-sm text-muted-foreground mt-2">(~R2.8T ZAR)</div>
              </div>
            </div>
            
            <p className="text-lg text-foreground/80 leading-relaxed">
              The United States legal cannabis market is experiencing explosive growth, representing a massive opportunity 
              for innovative technology solutions like Cuddles. With legalization expanding across states and consumer 
              demand at an all-time high, the market is projected to nearly double by 2030.
            </p>
          </Card>
        </div>
      </section>

      {/* Global Market Overview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-hippie-orange/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-orange to-hippie-yellow flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Global Cannabis Market</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-blue/10 to-hippie-purple/10">
               <div className="text-4xl font-bold text-hippie-blue mb-2">$39.1B</div>
                <div className="text-foreground/80">Global Market Size (2024)</div>
                <div className="text-sm text-muted-foreground mt-2">(~R723B ZAR)</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-hippie-green/10 to-hippie-blue/10">
                <div className="text-4xl font-bold text-hippie-green mb-2">$151.7B</div>
                <div className="text-foreground/80">Projected by 2033</div>
                <div className="text-sm text-muted-foreground mt-2">(~R2.8T ZAR)</div>
              </div>
            </div>

            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              The global cannabis market is expanding rapidly beyond North America, with significant growth in 
              Europe, South America, and select Asian markets. This presents enormous opportunities for Cuddles 
              to scale internationally as regulations continue to evolve worldwide.
            </p>
          </Card>
        </div>
      </section>

      {/* Key Markets */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-foreground mb-12">
            Key International Markets
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-purple/30">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-hippie-purple" />
                <h3 className="text-xl font-bubble font-bold text-foreground">Canada</h3>
              </div>
              <div className="space-y-2 text-foreground/80">
                <p className="font-semibold text-hippie-purple">R89B Market (2024)</p>
                <p>Fully legalized recreational market</p>
                <p>Strong regulatory framework</p>
                <p>5,000+ retail locations</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-orange/30">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-hippie-orange" />
                <h3 className="text-xl font-bubble font-bold text-foreground">Germany</h3>
              </div>
              <div className="space-y-2 text-foreground/80">
                <p className="font-semibold text-hippie-orange">R71B Market (2024)</p>
                <p>Recently legalized recreational use</p>
                <p>Europe's largest economy</p>
                <p>Rapid market expansion expected</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-green/30">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-hippie-green" />
                <h3 className="text-xl font-bubble font-bold text-foreground">Netherlands</h3>
              </div>
              <div className="space-y-2 text-foreground/80">
                <p className="font-semibold text-hippie-green">R18B Market (2024)</p>
                <p>Established tolerance policy</p>
                <p>Famous coffeeshop culture</p>
                <p>Tourism-driven demand</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-blue/30">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-hippie-blue" />
                <h3 className="text-xl font-bubble font-bold text-foreground">Uruguay</h3>
              </div>
              <div className="space-y-2 text-foreground/80">
                <p className="font-semibold text-hippie-blue">R4.5B Market (2024)</p>
                <p>First country to fully legalize</p>
                <p>Government-regulated system</p>
                <p>Growing medical market</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-pink/30">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-hippie-pink" />
                <h3 className="text-xl font-bubble font-bold text-foreground">Australia</h3>
              </div>
              <div className="space-y-2 text-foreground/80">
                <p className="font-semibold text-hippie-pink">R27B Market (2024)</p>
                <p>Expanding medical cannabis program</p>
                <p>Strong pharmaceutical infrastructure</p>
                <p>Growing patient base</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-yellow/30">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-hippie-yellow" />
                <h3 className="text-xl font-bubble font-bold text-foreground">Israel</h3>
              </div>
              <div className="space-y-2 text-foreground/80">
                <p className="font-semibold text-hippie-yellow">R9B Market (2024)</p>
                <p>World leader in cannabis research</p>
                <p>Advanced medical program</p>
                <p>Export opportunities emerging</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Drivers */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-hippie-green/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-green to-hippie-blue flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Key Market Drivers</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bubble font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-hippie-green" />
                  Consumer Trends
                </h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">•</span>
                    <span>Growing acceptance and destigmatization</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">•</span>
                    <span>Increasing demand for wellness products</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">•</span>
                    <span>Shift from illicit to legal purchases</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-green mt-1">•</span>
                    <span>Rising medical cannabis prescriptions</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bubble font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-hippie-purple" />
                  Industry Developments
                </h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex gap-3">
                    <span className="text-hippie-purple mt-1">•</span>
                    <span>Progressive legalization worldwide</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-purple mt-1">•</span>
                    <span>Technology-driven retail innovation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-purple mt-1">•</span>
                    <span>Institutional investment increasing</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-hippie-purple mt-1">•</span>
                    <span>Improved product quality and variety</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Cuddles Opportunity */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-hippie-purple/20 via-hippie-pink/20 to-hippie-orange/20 backdrop-blur-sm border-hippie-pink/50">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center text-foreground mb-6">
              Cuddles' Market Opportunity
            </h2>
            <p className="text-xl text-center text-foreground/80 mb-6">
              With the global cannabis market valued at $39.1 billion (2024) and projected to reach $151.7 billion by 2033, Cuddles is positioned 
              to become the leading AI recommendation platform across multiple international markets.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="text-center p-6 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-hippie-purple mb-2">R180M+</div>
                <div className="text-foreground/80">Addressable Market</div>
                <div className="text-sm text-muted-foreground mt-2">10,000+ dispensaries globally</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-hippie-orange mb-2">R5.3K - R17.8K</div>
                <div className="text-foreground/80">Per Location Revenue</div>
                <div className="text-sm text-muted-foreground mt-2">(R299 - R999/month)</div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Link to="/investment-deck">
                <Button className="bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white text-lg px-8 py-6 h-auto">
                  View Investment Deck
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-foreground border-2 border-hippie-yellow hover:bg-hippie-yellow/20 text-lg px-8 py-6 h-auto">
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

export default InternationalMarket;
