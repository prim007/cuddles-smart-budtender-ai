import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";

const Hero = () => {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated rusty metallic background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hippie-purple rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hippie-orange rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-hippie-green rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-hippie-pink rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Animated Cuddles character */}
        <div className="absolute left-8 top-1/4 w-32 h-32 md:w-48 md:h-48 animate-gentle-float z-20 hidden md:block">
          <img 
            src={cuddlesImage} 
            alt="Cuddles mascot" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border-2 border-hippie-pink/50 animate-fade-in shadow-glow">
            <Sparkles className="w-4 h-4 text-hippie-yellow animate-pulse" />
            <span className="text-white text-sm font-bubble font-semibold">✌️ Peace, Love & Cannabis ✌️</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-groovy text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Meet
            <span className="block bg-gradient-to-r from-hippie-yellow via-hippie-pink to-hippie-purple bg-clip-text text-transparent">
              Cuddles
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Transform cannabis retail with AI that recommends perfect strains based on desired effects, experience level, and preferences
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              onClick={scrollToDemo}
              className="bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white hover:shadow-glow font-retro text-lg px-8 py-6 h-auto border-2 border-white/30"
            >
              <Bot className="w-5 h-5 mr-2" />
              Try Cuddles
            </Button>
            <Link to="/analytics">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-hippie-yellow hover:bg-hippie-yellow/20 hover:border-hippie-orange font-retro text-lg px-8 py-6 h-auto"
              >
                View Analytics Platform
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Match Accuracy', value: '95%' },
              { label: 'Avg. Response Time', value: '<2s' },
              { label: 'Customer Satisfaction', value: '4.9/5' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
