import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, ExternalLink, Store, UserPlus, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { trackEvent } from "@/components/GoogleAnalytics";
import HeroQuickPrompts from "./HeroQuickPrompts";

const Hero = () => {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-[hsl(270,40%,15%)] via-[hsl(320,45%,18%)] to-[hsl(350,50%,22%)]">
      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between py-4 px-4 md:px-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20">
              <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-semibold text-white text-lg hidden sm:block">Cuddles</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://tripplefourmarketplace.lovable.app" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 font-medium gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </Button>
            </a>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 font-medium">
                Analytics
              </Button>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto text-center pt-16">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-6">
            AI-Powered Cannabis Recommendations
          </p>

          <h1 className="font-display font-bold text-white mb-6 leading-tight">
            Meet
            <span className="block gradient-text text-5xl md:text-7xl lg:text-8xl py-2">
              Cuddles
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-4 max-w-2xl mx-auto leading-relaxed font-sans">
            Your intelligent budtender that recommends the perfect strains based on your desired effects, experience level, and preferences
          </p>

          {/* Engagement nudge — drives users directly to chat */}
          <p className="text-sm text-white/50 mb-10 animate-pulse">
            👇 Try asking Cuddles something below — no signup needed
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/auth">
              <Button
                size="lg"
                onClick={() => trackEvent('cta_click', 'signup', 'hero_signup')}
                className="bg-primary text-white hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl gap-2 w-full"
              >
                <UserPlus className="w-5 h-5" />
                Sign Up Free — It Takes 10 Seconds
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={() => { trackEvent('cta_click', 'demo', 'hero_try_now'); scrollToDemo(); }}
              variant="outline"
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-display font-medium text-lg px-8 py-6 h-auto rounded-xl gap-2"
            >
              <Bot className="w-5 h-5" />
              Try Cuddles Now
            </Button>
          </div>
          <div className="flex justify-center gap-3 mb-16">
            <Link to="/schedule-demo">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => trackEvent('cta_click', 'demo', 'hero_schedule_demo')}
                className="text-white/60 hover:text-white hover:bg-white/10 font-medium gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule a Demo
              </Button>
            </Link>
            <Link to="/dispensary-onboarding">
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 font-medium gap-2"
              >
                <Store className="w-4 h-4" />
                For Dispensaries
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Match Accuracy', value: '95%', icon: '🎯' },
              { label: 'Response Time', value: '<2s', icon: '⚡' },
              { label: 'User Satisfaction', value: '4.9/5', icon: '⭐' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-6 bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-display font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/50 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
