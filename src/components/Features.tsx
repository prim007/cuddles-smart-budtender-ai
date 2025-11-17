import { Brain, Users, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Smart Budtender?
          </h2>
          <p className="text-xl text-muted-foreground">
            Revolutionize your cannabis retail experience with cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-gradient-card border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
