import { ReactNode } from "react";
import cuddlesImage from "@/assets/cuddles.png";

interface Bubble {
  from: "cuddles" | "user";
  text: ReactNode;
}

interface PhoneChatPreviewProps {
  bubbles: Bubble[];
  /** Optional accent gradient for the chat header */
  headerGradient?: string;
  title?: string;
  subtitle?: string;
}

const PhoneChatPreview = ({
  bubbles,
  headerGradient = "from-hippie-coral via-hippie-peach to-hippie-amber",
  title = "Cuddles",
  subtitle = "AI Budtender · online",
}: PhoneChatPreviewProps) => {
  return (
    <div className="flex h-full flex-col bg-[hsl(270,40%,12%)]">
      {/* Chat header */}
      <div className={`bg-gradient-to-r ${headerGradient} px-4 pt-3 pb-3`}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/40">
            <img src={cuddlesImage} alt="Cuddles" className="h-full w-full object-cover" width="36" height="36" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{title}</div>
            <div className="text-[10px] text-white/80 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
              {subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Bubbles */}
      <div className="flex-1 space-y-2.5 overflow-hidden px-3 py-4">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className={`flex ${b.from === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-[11px] leading-snug shadow-sm ${
                b.from === "user"
                  ? "bg-gradient-to-br from-hippie-coral to-hippie-peach text-white rounded-br-sm"
                  : "bg-white/95 text-zinc-800 rounded-bl-sm"
              }`}
            >
              {b.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/10 bg-[hsl(270,40%,16%)] px-3 py-2.5 pb-6">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
          <span className="text-[10px] text-white/80 flex-1">Ask Cuddles anything…</span>
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber" />
        </div>
      </div>
    </div>
  );
};

export default PhoneChatPreview;
