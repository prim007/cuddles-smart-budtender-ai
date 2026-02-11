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
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Process</p>
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
                  <div className="hidden md:block absolute top-16 left-[55%] w-[90%] h-px bg-border" />
                )}

                <div className="relative z-10 text-center bg-card rounded-xl p-8 border border-border">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">{step.emoji}</span>
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
