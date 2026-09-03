import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cuddles_cookie_consent";

export type ConsentLevel = "all" | "necessary" | null;

export function getCookieConsent(): ConsentLevel {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentLevel;
  } catch {
    return null;
  }
}

export function setCookieConsent(level: ConsentLevel) {
  try {
    if (level) {
      localStorage.setItem(COOKIE_CONSENT_KEY, level);
    } else {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    }
  } catch {
    // ignore
  }
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      // Delay slightly so it doesn't pop immediately on load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent("all");
    setVisible(false);
    window.location.reload();
  };

  const handleNecessaryOnly = () => {
    setCookieConsent("necessary");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-3 mb-24 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-6 sm:mb-4 max-w-5xl sm:mx-auto">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-xs sm:text-base text-card-foreground leading-relaxed">
              We use cookies to enhance your experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link
                to="/privacy-policy"
                className="underline underline-offset-2 text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={() => setVisible(false)}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNecessaryOnly}
              className="rounded-full px-5 border-border hover:bg-muted"
            >
              Necessary Only
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="rounded-full px-6 bg-gradient-to-r from-hippie-coral to-hippie-peach text-white hover:opacity-90 transition-opacity"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
