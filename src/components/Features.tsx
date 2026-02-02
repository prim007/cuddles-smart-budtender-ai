import { Brain, Users, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Advanced machine learning algorithms analyze user preferences to suggest the perfect products",
    gradient: "from-hippie-lavender to-hippie-coral",
  },
  {
    icon: Users,
    title: "Personalized Experience",
    description: "Tailored suggestions based on experience level, desired effects, and flavor preferences",
    gradient: "from-hippie-coral to-hippie-peach",
  },
  {
    icon: TrendingUp,
    title: "Increased Sales",
    description: "Boost conversion rates by 40% with intelligent product recommendations",
    gradient: "from-hippie-peach to-hippie-amber",
  },
  {
    icon: Shield,
    title: "Compliant & Secure",
    description: "Built with industry regulations in mind, ensuring full compliance and data security",
    gradient: "from-hippie-amber to-hippie-sage",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Real-time analytics and customer insights to optimize inventory and marketing",
    gradient: "from-hippie-sage to-hippie-teal",
  },
  {
    icon: BarChart3,
    title: "ROI Tracking",
    description: "Comprehensive metrics to measure the impact on your bottom line",
    gradient: "from-hippie-teal to-hippie-lavender",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-hippie-lavender/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-hippie-coral/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="pill mb-4 animate-fade-in">✨ Features</div>
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
              className="group glass-card rounded-2xl p-8 hover-lift animate-fade-in cursor-default"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
