import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Sparkles, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SignupPromoModal = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const { toast } = useToast();

  const generatePromoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `CUDDLES15-${suffix}`;
  };

  useEffect(() => {
    const dismissed = sessionStorage.getItem("cuddles_promo_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("cuddles_promo_dismissed", "true");
  };

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
      const { error } = await supabase.from("email_leads").insert({
        email: email.trim().toLowerCase(),
        source: "signup_promo_modal",
      });

      if (error && error.code === "23505") {
        const code = generatePromoCode();
        setPromoCode(code);
        toast({ title: "Already signed up!", description: "Here's your discount code again!" });
      } else if (error) {
        throw error;
      } else {
        const code = generatePromoCode();
        setPromoCode(code);
        toast({ title: "You're in! 🎉", description: "Your 15% discount code is ready!" });
      }
      setSubmitted(true);
    } catch {
      toast({ title: "Oops!", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">You're all set! 🎉</DialogTitle>
              <DialogDescription className="text-center text-base">
                A special <span className="font-bold text-primary">15% discount code</span> will be sent to your inbox. Keep an eye out!
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Start Exploring Cuddles
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">Welcome to Cuddles! ✌️</DialogTitle>
                <DialogDescription className="text-center text-base">
                  Sign up to unlock the full Cuddles AI experience and get <span className="font-bold text-primary">15% off your first order</span> — a special promo code will be sent to your email.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? "Signing up..." : "Sign Up & Get 15% Off"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              No spam, just good vibes. Unsubscribe anytime.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignupPromoModal;
