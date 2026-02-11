import { Brain, Users, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Advanced machine learning algorithms analyze user preferences to suggest the perfect products",
  },
  {
    icon: Users,
    title: "Personalized Experience",
    description: "Tailored suggestions based on experience level, desired effects, and flavor preferences",
  },
  {
    icon: TrendingUp,
    title: "Increased Sales",
    description: "Boost conversion rates by 40% with intelligent product recommendations",
  },
  {
    icon: Shield,
    title: "Compliant & Secure",
    description: "Built with industry regulations in mind, ensuring full compliance and data security",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Real-time analytics and customer insights to optimize inventory and marketing",
  },
  {
    icon: BarChart3,
    title: "ROI Tracking",
    description: "Comprehensive metrics to measure the impact on your bottom line",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Features</p>
          <h2 className="font-display font-bold text-foreground mb-6 text-balance">
            Why Choose <span className="gradient-text">Cuddles</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Revolutionize your cannabis retail experience with cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 border border-border hover:border-primary/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
