import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Palette, Loader2 } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const QUICK_IDEAS = [
  "Cleaner, less clutter",
  "Bigger text & buttons",
  "Better colours",
  "Faster / lighter feel",
  "Easier to find the chat",
  "Better on mobile",
];

/**
 * Shown inline in chat when someone roasts / comments on how Cuddles looks.
 * Turns the joke into a design suggestion.
 */
const ChatUIFeedbackPrompt = () => {
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const toggle = (idea: string) =>
    setPicked((prev) => (prev.includes(idea) ? prev.filter((i) => i !== idea) : [...prev, idea]));

  const submit = () => {
    const payload = { ideas: picked, note: note.trim(), at: new Date().toISOString() };
    try {
      const prev = JSON.parse(localStorage.getItem("cuddles-ui-feedback") || "[]");
      localStorage.setItem("cuddles-ui-feedback", JSON.stringify([...prev, payload]));
    } catch {
      /* noop */
    }
    trackEvent("ui_feedback_submitted", "engagement", picked.join("|") || "note_only");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-start gap-2 animate-in fade-in">
        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground">
          Noted — thank you! Your design notes go straight to the humans building Cuddles. 🎨
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-3 animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Palette className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Fair enough — you'd know better than me 😅
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            What would you change about how Cuddles looks and feels?
          </p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => toggle(idea)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  picked.includes(idea)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {idea}
              </button>
            ))}
          </div>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything else you'd redesign?"
            className="mt-2 min-h-[60px] text-sm"
            maxLength={500}
          />

          <Button
            size="sm"
            className="mt-2 h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            disabled={picked.length === 0 && !note.trim()}
            onClick={submit}
          >
            Send my suggestion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatUIFeedbackPrompt;
