import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Camera, Star, Heart, ArrowRight } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Strain Journal",
    description: "Track your cannabis experiences with mood, effects, and ratings. AI analyzes patterns over time.",
    href: "/journal",
    gradient: "from-hippie-purple to-hippie-lavender",
    color: "text-hippie-purple",
  },
  {
    icon: Camera,
    title: "Strain Scanner",
    description: "Use AI to identify strains from photos with detailed info about effects and characteristics.",
    href: "/scanner",
    gradient: "from-hippie-pink to-hippie-coral",
    color: "text-hippie-pink",
  },
  {
    icon: Star,
    title: "Community Reviews",
    description: "Share your experiences and discover trending strains from the community.",
    href: "/reviews",
    gradient: "from-hippie-orange to-hippie-amber",
    color: "text-hippie-orange",
  },
  {
    icon: Heart,
    title: "T-Break Coach",
    description: "AI-guided tolerance break program with progress tracking and personalized motivation.",
    href: "/t-break",
    gradient: "from-hippie-green to-hippie-teal",
    color: "text-hippie-green",
  },
];

const CuddlesFeatures = () => {
  return (
    <section id="cuddles-features" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-hippie-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-hippie-pink/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="pill mb-4 animate-fade-in">🌿 Cuddles Tools</div>
          <h2 className="font-display font-bold text-foreground mb-6 text-balance">
            Your Personal <span className="gradient-text">Cannabis Companion</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Explore our suite of AI-powered tools designed to enhance your cannabis journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.href}
              className="group block animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="h-full glass-card hover-lift transition-all duration-300 border-transparent hover:border-hippie-purple/20">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className={`w-4 h-4 ${feature.color} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to save your data and track your journey
          </p>
          <Link to="/auth">
            <Button variant="outline" className="border-hippie-purple/30 hover:border-hippie-purple hover:bg-hippie-purple/5">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CuddlesFeatures;
