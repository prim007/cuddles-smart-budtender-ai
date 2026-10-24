import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, trackSignupComplete } from "@/components/GoogleAnalytics";

const SHOP_URL = "https://tripplefourshophub.online";

const SignupBanner = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in to get your code", description: "Your 15% code is sent to your account email." });
        window.location.href = `/auth?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const { error } = await supabase.functions.invoke("send-promo-code", {
        body: { email: email.trim().toLowerCase(), source: "inline_banner" },
      });
      if (error) throw error;
      toast({ title: "You're in! 🎉", description: "Check your inbox for your 15% discount code!" });
      trackSignupComplete("inline_banner");

      setSubmitted(true);
    } catch {
      toast({ title: "Oops!", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    const claimHref = `/claim?email=${encodeURIComponent(email.trim().toLowerCase())}`;
    return (
      <section className="py-12 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <CheckCircle className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-2xl font-display font-bold text-foreground">You're on the list! 🎉</h3>
          <p className="text-muted-foreground">Check your email for your 15% code — then claim your free account to save it.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a href={claimHref}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
                Claim My Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={SHOP_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold">
            <Gift className="h-4 w-4" />
            Exclusive Offer
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Get 15% Off Your First Order
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join 2,400+ members and receive your exclusive promo code instantly.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-base"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 px-6"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "..." : "Claim Discount"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};

export default SignupBanner;
