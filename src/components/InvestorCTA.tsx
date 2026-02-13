import { Button } from "@/components/ui/button";
import { Rocket, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const InvestorCTA = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-10 md:p-14 border border-border">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-7 h-7 text-primary" />
            </div>
            
            <h2 className="font-display font-bold text-foreground mb-6 text-balance">
              Ready to Revolutionize <span className="gradient-text">Cannabis Retail</span>?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join us in transforming the cannabis shopping experience. Schedule a demo or request our investment materials today.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              {[
                { label: 'Global Market (2024)', value: '$39.1B', emoji: '📈' },
                { label: 'Projected Growth', value: '14.5% CAGR', emoji: '🚀' },
                { label: 'Target Retailers', value: '5,000+', emoji: '🏪' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-5 bg-muted/50 border border-border">
                  <div className="text-2xl mb-2">{stat.emoji}</div>
                  <div className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/investment-deck">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto w-full rounded-xl gap-2"
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
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display font-medium text-lg px-8 py-6 h-auto w-full rounded-xl"
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
