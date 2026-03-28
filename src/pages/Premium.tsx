import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, BookOpen, Zap, Shield } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PREMIUM_TIER } from "@/contexts/SubscriptionContext";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Premium = () => {
  const { user } = useAuth();
  const { isPremium, isLoading, subscriptionEnd, startCheckout, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Welcome to Premium! 🎉", description: "Your subscription is now active." });
      checkSubscription();
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No charges were made.", variant: "destructive" });
    }
  }, [searchParams]);

  const features = {
    free: [
      "AI budtender chat",
      "Basic strain info",
      "Cannabis education",
      "Quick prompt suggestions",
    ],
    premium: [
      "Everything in Free",
      "Save AI recommendations",
      "Consumption journal & tracking",
      "Advanced symptom-to-strain matching",
      "Personalized insights from your history",
      "VIP ordering perks via Tripple444",
      "Early access to new strains",
      "Priority AI responses",
    ],
  };

  return (
    <div className="min-h-screen md:pt-20">
      <SEO title="Cuddles Premium - Unlock Your Full Cannabis Experience" description="Upgrade to Cuddles Premium for personalized strain tracking, advanced matching, and exclusive perks." url="/premium" />
      <ThemeToggle />

      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Crown className="w-4 h-4" /> Premium Plans
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Elevate Your Cannabis Experience
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Go beyond basic recommendations. Track, learn, and get matched with the perfect strains based on your personal history.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-1">Cuddles Basic</h3>
                <p className="text-muted-foreground text-sm">Free forever</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">R0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {features.free.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/#demo">
                <Button variant="outline" className="w-full">Start Chatting</Button>
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Cuddles Premium
                </h3>
                <p className="text-muted-foreground text-sm">Your personal cannabis companion</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{PREMIUM_TIER.price}</span>
                  <span className="text-muted-foreground">/{PREMIUM_TIER.interval}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {features.premium.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <div className="space-y-3">
                  <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-semibold text-primary">✓ Active Premium Member</p>
                    {subscriptionEnd && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Renews {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : user ? (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
                  onClick={startCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Upgrade to Premium"}
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
                >
                  <Link to="/auth">Sign Up to Unlock Premium</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: "Digital Stash Box", desc: "Save every recommendation and build your personal strain library." },
              { icon: Zap, title: "Smart Matching", desc: "AI learns from your journal to give increasingly accurate suggestions." },
              { icon: Shield, title: "VIP Perks", desc: "Fast-lane ordering, early drops, and member discounts at Tripple444." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Premium;
