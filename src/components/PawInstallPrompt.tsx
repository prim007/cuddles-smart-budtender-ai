import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus, MoreVertical } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

const STORAGE_KEY = "cuddles_paw_install_prompt_dismissed_at";
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PawIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden="true">
    <ellipse cx="32" cy="44" rx="14" ry="12" />
    <ellipse cx="14" cy="28" rx="6" ry="8" />
    <ellipse cx="24" cy="14" rx="5.5" ry="7.5" />
    <ellipse cx="40" cy="14" rx="5.5" ry="7.5" />
    <ellipse cx="50" cy="28" rx="6" ry="8" />
  </svg>
);

const PawInstallPrompt = () => {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Skip in iframes/preview to avoid noise
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) return;

    // Snoozed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < SNOOZE_MS) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid;

    if (!isMobile) return;

    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "other");

    const handleBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBIP);

    const timer = setTimeout(() => {
      setOpen(true);
      trackEvent("paw_install_prompt_shown", "engagement", isIOS ? "ios" : "android");
    }, 4000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBIP);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setOpen(false);
    trackEvent("paw_install_prompt_dismissed", "engagement", platform);
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      trackEvent("paw_install_prompt_outcome", "conversion", outcome);
      setDeferredPrompt(null);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : dismiss())}>
      <DialogContent className="max-w-sm rounded-3xl border-hippie-coral/30 bg-gradient-to-br from-background via-hippie-peach/10 to-hippie-coral/10 p-0 overflow-hidden">
        {/* Paw trail header */}
        <div className="relative h-28 bg-gradient-to-br from-hippie-coral/30 via-hippie-peach/30 to-hippie-amber/30 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {[
              { top: "20%", left: "8%", rotate: "-25deg", delay: "0s" },
              { top: "55%", left: "30%", rotate: "15deg", delay: "0.3s" },
              { top: "15%", left: "55%", rotate: "-10deg", delay: "0.6s" },
              { top: "60%", left: "78%", rotate: "20deg", delay: "0.9s" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute animate-paw-walk"
                style={{ top: p.top, left: p.left, transform: `rotate(${p.rotate})`, animationDelay: p.delay }}
              >
                <PawIcon className="w-8 h-8 text-hippie-coral" />
              </div>
            ))}
          </div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber flex items-center justify-center shadow-glow animate-paw-bounce">
              <PawIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 pt-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">
              🐾 Add Cuddles to your home screen
            </DialogTitle>
            <DialogDescription className="text-center">
              One tap. No app store. Your AI budtender, always a paw away.
            </DialogDescription>
          </DialogHeader>

          {platform === "ios" ? (
            <ol className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-hippie-coral/20 text-hippie-coral font-semibold flex items-center justify-center">1</span>
                <span className="flex-1 pt-0.5">
                  Tap the <Share className="inline w-4 h-4 mx-1 text-hippie-coral" /> <strong>Share</strong> button in Safari
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-hippie-coral/20 text-hippie-coral font-semibold flex items-center justify-center">2</span>
                <span className="flex-1 pt-0.5">
                  Choose <Plus className="inline w-4 h-4 mx-1 text-hippie-coral" /> <strong>Add to Home Screen</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-hippie-coral/20 text-hippie-coral font-semibold flex items-center justify-center">3</span>
                <span className="flex-1 pt-0.5">Tap <strong>Add</strong> — and look for the paw 🐾 on your home screen</span>
              </li>
            </ol>
          ) : platform === "android" && deferredPrompt ? (
            <div className="mt-5">
              <Button
                onClick={handleAndroidInstall}
                className="w-full bg-gradient-to-r from-hippie-coral to-hippie-amber text-white font-display font-semibold rounded-2xl h-12 shadow-glow hover:shadow-elevated"
              >
                <Download className="w-5 h-5 mr-2" />
                Install Cuddles
              </Button>
            </div>
          ) : (
            <ol className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-hippie-coral/20 text-hippie-coral font-semibold flex items-center justify-center">1</span>
                <span className="flex-1 pt-0.5">
                  Tap the <MoreVertical className="inline w-4 h-4 mx-1 text-hippie-coral" /> <strong>menu</strong> in your browser
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-hippie-coral/20 text-hippie-coral font-semibold flex items-center justify-center">2</span>
                <span className="flex-1 pt-0.5">Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-hippie-coral/20 text-hippie-coral font-semibold flex items-center justify-center">3</span>
                <span className="flex-1 pt-0.5">Confirm — and find the paw 🐾 on your home screen</span>
              </li>
            </ol>
          )}

          <button
            onClick={dismiss}
            className="mt-5 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PawInstallPrompt;
