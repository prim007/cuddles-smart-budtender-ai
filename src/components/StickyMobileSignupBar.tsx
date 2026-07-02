import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";
import { trackEvent } from "@/components/GoogleAnalytics";
import { Button } from "@/components/ui/button";

const HIDDEN_ROUTES = [
  "/auth",
  "/claim",
  "/checkout",
  "/admin",
  "/dispensary-onboarding",
];

const DISMISS_KEY = "cuddles-sticky-signup-dismissed";

const StickyMobileSignupBar = () => {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  });
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!dismissed) {
      trackEvent("sticky_signup_shown", "conversion", pathname);
    }
    // only fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || user || dismissed) return null;
  if (HIDDEN_ROUTES.some((p) => pathname.startsWith(p))) return null;

  const handleGoogle = async () => {
    setSigningIn(true);
    trackEvent("cta_click", "signup", "sticky_mobile_google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "Google Sign-In Failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Sign-In Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningIn(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    trackEvent("sticky_signup_dismissed", "conversion", pathname);
  };

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-primary/20 bg-background/95 backdrop-blur-md shadow-elevated animate-in slide-in-from-bottom-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Sign up prompt"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
            Save your chat & unlock 20% off
          </p>
          <Link
            to="/auth"
            className="text-[11px] text-muted-foreground hover:text-primary underline"
            onClick={() => trackEvent("cta_click", "signup", "sticky_mobile_email")}
          >
            Sign up with email
          </Link>
        </div>
        <Button
          size="sm"
          onClick={handleGoogle}
          disabled={signingIn}
          className="h-9 px-3 bg-white hover:bg-white/90 text-gray-800 border border-gray-200 rounded-lg font-semibold text-xs gap-1.5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {signingIn ? "..." : "Continue"}
        </Button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StickyMobileSignupBar;
