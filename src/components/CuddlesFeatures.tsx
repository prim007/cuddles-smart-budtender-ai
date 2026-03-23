import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Camera, Star, Heart, ArrowRight, Sprout } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Strain Journal",
    description: "Track your cannabis experiences with mood, effects, and ratings. AI analyzes patterns over time.",
    href: "/journal",
  },
  {
    icon: Camera,
    title: "Strain Scanner",
    description: "Use AI to identify strains from photos with detailed info about effects and characteristics.",
    href: "/scanner",
  },
  {
    icon: Star,
    title: "Community Reviews",
    description: "Share your experiences and discover trending strains from the community.",
    href: "/reviews",
  },
  {
    icon: Heart,
    title: "T-Break Coach",
    description: "AI-guided tolerance break program with progress tracking and personalized motivation.",
    href: "/t-break",
  },
];

const CuddlesFeatures = () => {
  return (
    <section id="cuddles-features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Tools</p>
          <h2 className="font-display font-bold text-foreground mb-6 text-balance">
            Your Personal <span className="gradient-text">Cannabis Companion</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Explore our suite of AI-powered tools designed to enhance your cannabis journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Link key={index} to={feature.href} className="group block">
              <Card className="h-full bg-card border border-border hover:border-primary/20 transition-colors">
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <Button variant="outline">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CuddlesFeatures;
