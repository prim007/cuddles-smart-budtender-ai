import { MessageSquare, Brain, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Share Your Preferences",
    description: "Describe your desired effects, experience level, and flavor preferences through a simple conversation",
    emoji: "💬",
  },
  {
    icon: Brain,
    title: "AI Analyzes & Matches",
    description: "Our advanced AI processes the information and matches it with the perfect products from your inventory",
    emoji: "🧠",
  },
  {
    icon: ShoppingBag,
    title: "Get Recommendations",
    description: "Receive tailored product suggestions with detailed information to make confident purchases",
    emoji: "🎯",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-hippie-lavender/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="pill mb-4 animate-fade-in">🚀 Process</div>
          <h2 className="font-display font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A seamless three-step process from inquiry to purchase
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[55%] w-[90%] h-px">
                    <div className="w-full h-full bg-gradient-to-r from-primary/40 to-accent/40" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent/60" />
                  </div>
                )}

                <div 
                  className="relative z-10 text-center glass-card rounded-2xl p-8 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber flex items-center justify-center text-white text-sm font-bold shadow-soft">
                    {index + 1}
                  </div>
                  
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{step.emoji}</span>
                  </div>
                  
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
