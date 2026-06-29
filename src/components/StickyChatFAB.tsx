import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";
import { getVariant, logAbEvent, CHAT_FAB_EXPERIMENT, CHAT_FAB_VARIANTS } from "@/lib/abTest";
import { useAuth } from "@/hooks/useAuth";

type Hook = { emoji: string; text: string; sub: string };

const DEFAULT_HOOKS: Hook[] = [
  { emoji: "💬", text: "Ask me anything about cannabis!", sub: "Free • No signup" },
  { emoji: "😴", text: "Need help sleeping tonight?", sub: "I'll pick a strain in seconds" },
  { emoji: "🌿", text: "First time? I'll walk you through it.", sub: "Beginner-friendly answers" },
  { emoji: "⚡", text: "Want an uplifting daytime strain?", sub: "Tell me your vibe" },
  { emoji: "🧠", text: "Curious about terpenes or CBD?", sub: "Ask me anything" },
];

const CHECKOUT_HOOKS: Hook[] = [
  { emoji: "🛒", text: "Need help with your order?", sub: "Ask before you check out" },
  { emoji: "🚚", text: "Questions about delivery?", sub: "I can explain fees & timing" },
  { emoji: "🎁", text: "Looking for a promo code?", sub: "I'll point you to today's offer" },
];

const STRAIN_HOOKS: Hook[] = [
  { emoji: "🌿", text: "Not sure if this strain is for you?", sub: "Tell me your vibe" },
  { emoji: "🧠", text: "Want to know the effects?", sub: "I'll break it down in 10s" },
  { emoji: "🤝", text: "Looking for something similar?", sub: "I'll suggest alternatives" },
];

const PRICING_HOOKS: Hook[] = [
  { emoji: "💡", text: "Curious what Premium unlocks?", sub: "Ask me before you upgrade" },
  { emoji: "💬", text: "Questions about plans or billing?", sub: "I can help in seconds" },
];

const HOMEPAGE_HOOKS: Hook[] = [
  { emoji: "👋", text: "Hey there! Looking for something specific?", sub: "I'm Cuddles, your AI budtender" },
  ...DEFAULT_HOOKS,
];

const pickHooksForPath = (path: string): Hook[] => {
  if (path === "/" || path === "") return HOMEPAGE_HOOKS;
  if (path.startsWith("/checkout") || path.startsWith("/shop") || path.startsWith("/cart") || path.startsWith("/order")) return CHECKOUT_HOOKS;
  if (path.startsWith("/strains") || path.startsWith("/strain")) return STRAIN_HOOKS;
  if (path.startsWith("/premium") || path.startsWith("/pricing") || path.startsWith("/pos-integrations")) return PRICING_HOOKS;
  return DEFAULT_HOOKS;
};

const TOOLTIP_DELAY_MS = 8_000; // attention-grabbing 8s auto-open
const ABANDON_AFTER_MS = 30_000;

const StickyChatFAB = () => {
  const location = useLocation();
  const { displayName } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hookIdx, setHookIdx] = useState(0);
  const variant = getVariant(CHAT_FAB_EXPERIMENT, [...CHAT_FAB_VARIANTS]);
  const showRotatingHooks = variant === "rotating_hooks";
  const tooltipFiredRef = useRef(false);
  const abandonTimerRef = useRef<number | null>(null);

  const hooks = useMemo(() => {
    const base = pickHooksForPath(location.pathname);
    if (!displayName) return base;
    // Personalize the first hook with the user's name
    return [
      { emoji: "👋", text: `Hey ${displayName}! Need a hand?`, sub: "I'm Cuddles, your AI budtender" },
      ...base,
    ];
  }, [location.pathname, displayName]);

  // Fire chat_view exposure event once per session
  useEffect(() => {
    logAbEvent({ experiment: CHAT_FAB_EXPERIMENT, variant, event: "chat_view" });
  }, [variant]);

  // Gentle auto-open of the tooltip after 20s, once
  useEffect(() => {
    if (dismissed || tooltipFiredRef.current) return;
    const timer = window.setTimeout(() => {
      setShowTooltip(true);
      tooltipFiredRef.current = true;
      logAbEvent({
        experiment: CHAT_FAB_EXPERIMENT,
        variant,
        event: "chat_tooltip_shown",
        properties: { path: location.pathname, delay_ms: TOOLTIP_DELAY_MS },
      });
    }, TOOLTIP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dismissed, variant, location.pathname]);

  // Rotate hooks every 7s (rotating variant only)
  useEffect(() => {
    if (!showRotatingHooks || dismissed || !showTooltip) return;
    const interval = setInterval(() => {
      setHookIdx((i) => (i + 1) % hooks.length);
      setShowTooltip(false);
      setTimeout(() => setShowTooltip(true), 250);
    }, 7000);
    return () => clearInterval(interval);
  }, [dismissed, showRotatingHooks, showTooltip, hooks.length]);

  // Reset hook index when path/hooks change
  useEffect(() => { setHookIdx(0); }, [hooks]);

  const dismissTooltip = (source: string) => {
    setDismissed(true);
    setShowTooltip(false);
    logAbEvent({
      experiment: CHAT_FAB_EXPERIMENT,
      variant,
      event: "chat_tooltip_dismissed",
      properties: { source, path: location.pathname },
    });
  };

  const armAbandonTimer = (source: string) => {
    if (abandonTimerRef.current) window.clearTimeout(abandonTimerRef.current);
    abandonTimerRef.current = window.setTimeout(() => {
      // If no chat_message has been logged for this session, count as abandoned
      const fired = sessionStorage.getItem(`abfired:${CHAT_FAB_EXPERIMENT}:${variant}:chat_message:${sessionStorage.getItem("cuddles_ab_session") ?? ""}`)
        ?? sessionStorage.getItem("cuddles_chat_message_sent");
      if (!fired) {
        logAbEvent({
          experiment: CHAT_FAB_EXPERIMENT,
          variant,
          event: "chat_abandoned",
          properties: { source, path: location.pathname, after_ms: ABANDON_AFTER_MS },
        });
      }
    }, ABANDON_AFTER_MS);
  };

  const openChat = () => {
    trackEvent("chat_fab_clicked", "conversion", "sticky_fab");
    logAbEvent({ experiment: CHAT_FAB_EXPERIMENT, variant, event: "chat_open", properties: { source: "fab", path: location.pathname } });
    logAbEvent({ experiment: CHAT_FAB_EXPERIMENT, variant, event: "chat_start", properties: { source: "fab" } });
    armAbandonTimer("fab");
    const chatSection = document.getElementById("chat-demo");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = chatSection.querySelector("input[type='text'], textarea") as HTMLInputElement | null;
        input?.focus();
      }, 700);
    } else {
      window.location.href = "/education/chat-with-cuddles";
    }
    setDismissed(true);
    setShowTooltip(false);
  };

  const hook = hooks[hookIdx] ?? hooks[0];

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
              onClick={(e) => { e.stopPropagation(); dismissTooltip("x_button"); }}
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
