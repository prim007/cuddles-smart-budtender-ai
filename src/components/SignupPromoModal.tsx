import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, CheckCircle, Clock, Users, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, trackSignupComplete } from "@/components/GoogleAnalytics";
import { promoErrorDescription } from "@/lib/promoError";

const SHOP_URL = "https://tripplefourshophub.online";

const SignupPromoModal = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [triggerSource, setTriggerSource] = useState<"timer" | "exit">("timer");
  const { toast } = useToast();

  // Scroll-depth trigger (10% scroll) OR 15-second timer — whichever comes first
  useEffect(() => {
    const dismissed = sessionStorage.getItem("cuddles_promo_dismissed");
    if (dismissed) return;

    let triggered = false;
    const showModal = (source: string) => {
      if (triggered) return;
      triggered = true;
      const videoPopupOpen = document.querySelector('[data-video-popup="true"]');
      if (videoPopupOpen) {
        setTimeout(() => {
          setTriggerSource("timer");
          setOpen(true);
          trackEvent("promo_modal_shown", "conversion", source);
        }, 5000);
        return;
      }
      setTriggerSource("timer");
      setOpen(true);
      trackEvent("promo_modal_shown", "conversion", source);
    };

    // Timer fallback: 15 seconds
    const timer = setTimeout(() => showModal("timer_15s"), 15000);

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (scrollPercent >= 10) {
        showModal("scroll_depth_10");
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Exit-intent trigger (desktop only)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        const dismissed = sessionStorage.getItem("cuddles_promo_dismissed");
        const exitShown = sessionStorage.getItem("cuddles_exit_shown");
        if (!dismissed && !exitShown) {
          setTriggerSource("exit");
          setOpen(true);
          sessionStorage.setItem("cuddles_exit_shown", "true");
          trackEvent("promo_modal_shown", "conversion", "exit_intent");
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("cuddles_promo_dismissed", "true");
    trackEvent("promo_modal_dismissed", "conversion", triggerSource);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in to get your code", description: "Your 15% code is sent to your account email." });
        window.location.href = `/auth?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const { error } = await supabase.functions.invoke("send-promo-code", {
        body: { email: email.trim().toLowerCase(), source: "signup_promo_modal" },
      });
      if (error) throw error;
      toast({ title: "You're in! 🎉", description: "Check your inbox for your 15% discount code!" });
      trackSignupComplete("promo_modal");

      setSubmitted(true);
    } catch (error) {
      toast({ title: "Oops!", description: await promoErrorDescription(error, "Something went wrong. Please try again."), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-border bg-card overflow-hidden p-0">
        {submitted ? (
          <div className="text-center py-8 px-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">You're all set! 🎉</DialogTitle>
              <DialogDescription className="text-center text-base">
                We'll send your <span className="font-bold text-primary">15% discount code</span> to your email shortly. Head to the shop to browse!
              </DialogDescription>
            </DialogHeader>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
              onClick={() => trackEvent("shop_link_clicked", "conversion", "promo_modal_success")}
            >
              <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-6 py-3 h-auto">
                Browse the Shop 🛒
              </Button>
            </a>
          </div>
        ) : (
          <div>
            {/* Urgency banner */}
            <div className="bg-gradient-to-r from-primary/90 to-accent/90 px-4 py-2.5 flex items-center justify-center gap-2 text-primary-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">Limited Time: 15% Off Your First Order</span>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2">
                  <Gift className="h-7 w-7 text-primary-foreground" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center">
                    {triggerSource === "exit" ? "Wait! Don't leave empty-handed 🌿" : "Welcome to Cuddles! ✌️"}
                  </DialogTitle>
                  <DialogDescription className="text-center text-base">
                    {triggerSource === "exit"
                      ? "Grab your exclusive 15% discount before you go — just enter your email."
                      : "Sign up and get 15% off your first order — we'll send your promo code instantly."}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-12"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? "Signing up..." : "🎁 Claim My 15% Discount"}
                </Button>
              </form>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  2,400+ members
                </span>
                <span>•</span>
                <span>No spam, ever</span>
                <span>•</span>
                <span>Free to join</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignupPromoModal;
