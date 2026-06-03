import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

const ROTATING_HOOKS = [
  { emoji: "💬", text: "Ask me anything about cannabis!", sub: "Free • No signup" },
  { emoji: "😴", text: "Need help sleeping tonight?", sub: "I'll pick a strain in seconds" },
  { emoji: "🌿", text: "First time? I'll walk you through it.", sub: "Beginner-friendly answers" },
  { emoji: "⚡", text: "Want an uplifting daytime strain?", sub: "Tell me your vibe" },
  { emoji: "🧠", text: "Curious about terpenes or CBD?", sub: "Ask me anything" },
];

const StickyChatFAB = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hookIdx, setHookIdx] = useState(0);

  // Show tooltip badge after 1.5 seconds — grab attention fast
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Rotate hooks every 6s and re-pulse tooltip
  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setHookIdx((i) => (i + 1) % ROTATING_HOOKS.length);
      setShowTooltip(false);
      setTimeout(() => setShowTooltip(true), 250);
    }, 7000);
    return () => clearInterval(interval);
  }, [dismissed]);

  const openChat = () => {
    trackEvent("chat_fab_clicked", "conversion", "sticky_fab");
    const chatSection = document.getElementById("chat-demo");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = chatSection.querySelector("input[type='text'], textarea") as HTMLInputElement | null;
        input?.focus();
      }, 700);
    } else {
      // Not on home page — send them to the dedicated chat page
      window.location.href = "/education/chat-with-cuddles";
    }
    setDismissed(true);
    setShowTooltip(false);
  };

  const hook = ROTATING_HOOKS[hookIdx];

  return (
    <div className="fixed bottom-6 right-6 z-[9997] flex items-end gap-3">
      {/* Tooltip badge */}
      {showTooltip && !dismissed && (
        <button
          onClick={openChat}
          className="animate-in slide-in-from-right-4 fade-in duration-300 relative text-left"
        >
          <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-elevated max-w-[240px] hover:bg-muted/60 transition-colors">
            <span
              onClick={(e) => { e.stopPropagation(); setDismissed(true); setShowTooltip(false); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-muted rounded-full flex items-center justify-center hover:bg-muted-foreground/20 transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </span>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {hook.emoji} {hook.text}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {hook.sub}
            </p>
          </div>
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-border" />
        </button>
      )}

      {/* FAB button with attention ring */}
      <button
        onClick={openChat}
        className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-hippie-coral to-hippie-pink text-white shadow-elevated hover:scale-110 transition-all duration-200 flex items-center justify-center"
        aria-label="Chat with Cuddles AI"
      >
        {/* Pulsing rings */}
        {!dismissed && (
          <>
            <span className="absolute inset-0 rounded-full bg-hippie-coral/40 animate-ping" />
            <span className="absolute -inset-1 rounded-full border-2 border-hippie-coral/30 animate-pulse" />
          </>
        )}
        <MessageCircle className="h-7 w-7 relative z-10" />
        {!dismissed && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-hippie-amber rounded-full border-2 border-background animate-pulse z-10" />
        )}
      </button>
    </div>
  );
};

export default StickyChatFAB;
