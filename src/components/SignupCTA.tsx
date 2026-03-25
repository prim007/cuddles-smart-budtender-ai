import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/components/GoogleAnalytics";

const SignupCTA = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user || dismissed) return;
    const alreadyDismissed = sessionStorage.getItem("signup_cta_dismissed");
    if (alreadyDismissed) { setDismissed(true); return; }

    const timer = setTimeout(() => setVisible(true), 15000); // show after 15s of browsing
    return () => clearTimeout(timer);
  }, [user, dismissed]);

  if (!visible || user || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("signup_cta_dismissed", "true");
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 relative">
        <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <p className="font-display font-semibold text-foreground mb-1">
          Enjoying Cuddles? 🌿
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          Sign up free to save strains, track sessions & get personalized tips.
        </p>
        <Link to="/auth" onClick={() => trackEvent("cta_click", "signup", "floating_cta")}>
          <Button className="w-full bg-gradient-to-r from-hippie-purple to-hippie-pink hover:opacity-90 gap-2">
            <UserPlus className="h-4 w-4" /> Create Free Account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SignupCTA;
