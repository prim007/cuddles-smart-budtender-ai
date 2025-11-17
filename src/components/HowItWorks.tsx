import { MessageSquare, Brain, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Customer Shares Preferences",
    description: "Users describe their desired effects, experience level, and flavor preferences through a simple conversation",
  },
  {
    icon: Brain,
    title: "AI Analyzes & Matches",
    description: "Our advanced AI processes the information and matches it with the perfect products from your inventory",
  },
  {
    icon: ShoppingBag,
    title: "Personalized Recommendations",
    description: "Customers receive tailored product suggestions with detailed information to make confident purchases",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            A seamless three-step process from inquiry to purchase
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}

                <div className="relative z-10 text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-hero shadow-glow flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-3">
                    STEP {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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
