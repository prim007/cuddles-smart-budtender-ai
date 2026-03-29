import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

const StickyChatFAB = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show tooltip badge after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Pulse the tooltip every 20s if not dismissed
  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setShowTooltip(false);
      setTimeout(() => setShowTooltip(true), 300);
    }, 20000);
    return () => clearInterval(interval);
  }, [dismissed]);

  const scrollToChat = () => {
    trackEvent("chat_fab_clicked", "conversion", "sticky_fab");
    const chatSection = document.getElementById("chat-demo");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
      // Focus the chat input after scroll
      setTimeout(() => {
        const input = chatSection.querySelector("input[type='text']") as HTMLInputElement;
        if (input) input.focus();
      }, 800);
    }
    setDismissed(true);
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9997] flex items-end gap-3">
      {/* Tooltip badge */}
      {showTooltip && !dismissed && (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300 relative">
          <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg max-w-[200px]">
            <button
              onClick={() => { setDismissed(true); setShowTooltip(false); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-muted rounded-full flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
            <p className="text-sm font-medium text-foreground">Need a strain recommendation? 🌿</p>
            <p className="text-xs text-muted-foreground mt-1">Ask the AI budtender</p>
          </div>
          {/* Arrow pointing to FAB */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-border" />
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={scrollToChat}
        className="group relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
        aria-label="Chat with Cuddles AI"
      >
        <MessageCircle className="h-6 w-6" />
        {/* Notification dot */}
        {!dismissed && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-background animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default StickyChatFAB;
