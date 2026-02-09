import { Button } from "@/components/ui/button";
import { Bot, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { useState, useEffect } from "react";
import { processCuddlesImage } from "@/utils/processImage";

const Hero = () => {
  const [processedImage, setProcessedImage] = useState<string>(cuddlesImage);

  useEffect(() => {
    // Defer heavy image processing to avoid blocking initial render and forced reflow
    const scheduleProcessing = () => {
      processCuddlesImage().then(setProcessedImage);
    };
    
    // Use requestIdleCallback for non-critical processing, with fallback
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(scheduleProcessing, { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      // Fallback: use setTimeout to defer processing
      const timeoutId = setTimeout(scheduleProcessing, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const scrollToDemo = () => {
    // Use requestAnimationFrame to batch with next paint cycle
    requestAnimationFrame(() => {
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-hippie-lavender/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-hippie-coral/25 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-hippie-amber/20 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between py-4 px-4 md:px-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-soft">
              <img src={processedImage} alt="Cuddles" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-semibold text-white text-lg hidden sm:block">Cuddles</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://tripplefourmarketplace.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </Button>
            </a>
            <Link to="/analytics">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
              >
                Analytics
              </Button>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto text-center pt-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20 animate-fade-in shadow-soft">
            <Sparkles className="w-4 h-4 text-hippie-amber animate-pulse" />
            <span className="text-white/90 text-sm font-medium">AI-Powered Cannabis Recommendations</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Meet
            <span className="block gradient-text text-5xl md:text-7xl lg:text-8xl py-2">
              Cuddles
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in font-sans" style={{ animationDelay: '0.2s' }}>
            Your intelligent budtender that recommends the perfect strains based on your desired effects, experience level, and preferences
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              onClick={scrollToDemo}
              className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-white hover:shadow-glow hover-lift font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl border-0 gap-2"
            >
              <Bot className="w-5 h-5" />
              Try Cuddles Now
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/dispensary-onboarding">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 hover:border-white/50 font-display font-medium text-lg px-8 py-6 h-auto rounded-xl gap-2"
              >
                <Store className="w-5 h-5" />
                For Dispensaries
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Match Accuracy', value: '95%', icon: '🎯' },
              { label: 'Response Time', value: '<2s', icon: '⚡' },
              { label: 'User Satisfaction', value: '4.9/5', icon: '⭐' },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className="glass-card rounded-2xl p-6 hover-lift bg-white/5 backdrop-blur-md border border-white/10"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-display font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
