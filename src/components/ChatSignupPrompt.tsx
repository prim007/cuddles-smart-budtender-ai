import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/components/GoogleAnalytics";

const ChatSignupPrompt = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (user || dismissed) return null;

  return (
    <div className="mx-2 my-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-4 animate-in fade-in duration-500">
      <button
        onClick={() => {
          setDismissed(true);
          trackEvent("chat_signup_dismissed", "conversion", "inline_chat");
        }}
        className="float-right text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Loving these recommendations? 🌿
          </p>
          <p className="text-xs text-muted-foreground">
            Create a free account to save strains, track your sessions, and get personalized tips based on your history.
          </p>
          <Link
            to="/auth"
            onClick={() => trackEvent("cta_click", "signup", "inline_chat_prompt")}
          >
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-1.5 mt-1"
            >
              <UserPlus className="h-3.5 w-3.5" /> Sign Up Free — 10 Seconds
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatSignupPrompt;
