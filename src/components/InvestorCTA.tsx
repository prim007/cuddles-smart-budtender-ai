import { Button } from "@/components/ui/button";
import { Rocket, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const InvestorCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-hippie-lavender/20 via-hippie-coral/20 to-hippie-amber/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-hippie-coral/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-hippie-lavender/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-10 md:p-14 animate-scale-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-hippie-coral to-hippie-amber flex items-center justify-center shadow-glow">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="font-display font-bold text-foreground mb-6 text-balance">
              Ready to Revolutionize <span className="gradient-text">Cannabis Retail</span>?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join us in transforming the cannabis shopping experience. Schedule a demo or request our investment materials today.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              {[
                { label: 'Market Size', value: 'R590B+', emoji: '📈' },
                { label: 'Projected Growth', value: '25% CAGR', emoji: '🚀' },
                { label: 'Target Retailers', value: '5,000+', emoji: '🏪' },
              ].map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="glass-card rounded-xl p-5 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-2xl mb-2">{stat.emoji}</div>
                  <div className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/investment-deck">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-white hover:shadow-glow hover-lift font-display font-semibold text-lg px-8 py-6 h-auto w-full rounded-xl gap-2"
                >
                  <Mail className="w-5 h-5" />
                  View Investment Deck
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover-lift font-display font-medium text-lg px-8 py-6 h-auto w-full rounded-xl"
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestorCTA;
