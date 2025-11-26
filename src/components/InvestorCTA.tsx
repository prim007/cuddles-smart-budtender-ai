import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const InvestorCTA = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Card className="max-w-4xl mx-auto p-12 bg-white/95 backdrop-blur-sm border-0 shadow-elevated animate-scale-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow animate-pulse-glow">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Revolutionize Cannabis Retail?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join us in transforming the cannabis shopping experience. Schedule a demo or request our investment materials today.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              {[
                { label: 'Market Size', value: '$33B+' },
                { label: 'Projected Growth', value: '25% CAGR' },
                { label: 'Target Retailers', value: '5,000+' },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-3xl font-bold text-primary mb-1 hover:scale-110 transition-transform duration-300">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/investment-deck">
                <Button
                  size="lg"
                  className="bg-gradient-hero text-white shadow-glow hover:opacity-90 hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto w-full"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  View Investment Deck
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto w-full"
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default InvestorCTA;
