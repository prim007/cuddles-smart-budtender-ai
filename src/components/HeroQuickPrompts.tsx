import { useState, useEffect } from "react";
import { Moon, Zap, Heart, Leaf, Sparkles } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

interface HeroQuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: Moon,
    label: "Deep Sleep & Relaxation",
    description: "Find a strain for deep sleep and relaxation",
    prompt: "I need something to help me get deep, restful sleep and full-body relaxation. What do you recommend?",
    gradient: "from-indigo-500 to-purple-600",
    emoji: "🌙",
  },
  {
    icon: Zap,
    label: "Uplifting Social Sativa",
    description: "Suggest an uplifting sativa for a social night out",
    prompt: "Suggest an uplifting sativa for a social night out. I want energy and good vibes without anxiety.",
    gradient: "from-amber-500 to-orange-600",
    emoji: "⚡",
  },
  {
    icon: Sparkles,
    label: "Cannabis Basics",
    description: "First time? Walk me through the basics",
    prompt: "I'm trying cannabis for the first time. Walk me through the basics — what should I know and where should I start?",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "🌱",
  },
  {
    icon: Heart,
    label: "High-CBD Recovery",
    description: "High-CBD options for muscle recovery",
    prompt: "Show me high-CBD options for muscle recovery without the heavy high. I want relief but need to stay functional.",
    gradient: "from-rose-500 to-pink-600",
    emoji: "💪",
  },
  {
    icon: Leaf,
    label: "Exotic Terpene Profiles",
    description: "Trending exotic terpene profiles right now",
    prompt: "What are the trending exotic terpene profiles right now? I'm a connoisseur looking for something unique.",
    gradient: "from-lime-500 to-green-600",
    emoji: "🍃",
  },
];

const HeroQuickPrompts = ({ onSelect }: HeroQuickPromptsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % prompts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleClick = (prompt: typeof prompts[0], index: number) => {
    trackEvent("hero_quick_prompt", "engagement", prompt.label);
    // Scroll to demo section first
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
    // Small delay so user sees the chat before the prompt fires
    setTimeout(() => onSelect(prompt.prompt), 600);
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p className="text-white/50 text-xs uppercase tracking-widest mb-4 text-center">
        Tap to try instantly — no signup needed
      </p>

      {/* Prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => {
          const Icon = prompt.icon;
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => handleClick(prompt, index)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-500 cursor-pointer ${
                isActive
                  ? "border-white/30 bg-white/10 scale-[1.02] shadow-lg shadow-white/5"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${prompt.gradient} flex items-center justify-center transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              >
                <span className="text-lg">{prompt.emoji}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {prompt.label}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {prompt.description}
                </p>
              </div>
              {isActive && (
                <div className="absolute -bottom-px left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {prompts.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-white/70" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroQuickPrompts;
