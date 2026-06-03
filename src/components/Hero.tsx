import { Button } from "@/components/ui/button";
import { ExternalLink, Store, UserPlus, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { trackEvent } from "@/components/GoogleAnalytics";
import { useEffect, useState, useRef } from "react";
import PhoneFrame from "@/components/PhoneFrame";
import PhoneChatPreview from "@/components/PhoneChatPreview";

const HERO_PROMPTS = [
  "Best strain for sleep?",
  "Something for anxiety relief",
  "A creative sativa for daytime",
  "Help with chronic pain",
];

const HERO_BUBBLES = [
  { from: "user" as const, text: "Best strain for sleep? 😴" },
  { from: "cuddles" as const, text: "Try Granddaddy Purple — heavy indica, ~20% THC, myrcene-rich. Great for insomnia." },
  { from: "user" as const, text: "How much should I take?" },
  { from: "cuddles" as const, text: "Start low: 2.5–5mg edible or 1–2 small puffs 30 min before bed. Wait, then reassess." },
];

const Hero = () => {
  const [liveCount, setLiveCount] = useState(12);
  const [heroInput, setHeroInput] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => Math.max(5, prev + Math.floor(Math.random() * 5) - 2));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % HERO_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendToChat = (text: string) => {
    trackEvent('hero_chat_submit', 'conversion', text);
    const chatSection = document.getElementById('chat-demo');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cuddles-quick-prompt', { detail: text }));
      }, 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInput.trim()) return;
    sendToChat(heroInput.trim());
    setHeroInput("");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(270,45%,12%)] via-[hsl(320,45%,16%)] to-[hsl(350,55%,20%)] py-10 md:py-16">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-hippie-coral/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-hippie-amber/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-hippie-lavender/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Navigation */}
        <nav className="mb-10 flex items-center justify-between md:mb-16">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-white/20">
              <img src={cuddlesImage} alt="Cuddles AI logo" className="h-full w-full object-cover" width="36" height="36" fetchPriority="high" />
            </div>
            <span className="font-display text-lg font-semibold text-white">Cuddles</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://tripplefourmarketplace.lovable.app" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-2 font-medium text-white/80 hover:bg-white/10 hover:text-white">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </Button>
            </a>
            <Link to="/auth">
              <Button size="sm" className="gap-1 border border-white/20 bg-white/15 font-medium text-white hover:bg-white/25">
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-2">
          {/* Left: bold copy */}
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex animate-fade-in items-center gap-2 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-medium text-green-300">
                {liveCount} people chatting right now
              </span>
            </div>

            <h1 className="font-display font-bold leading-[1.05] tracking-tight text-white">
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Meet <span className="gradient-text">Cuddles</span>,
              </span>
              <span className="mt-2 block text-3xl text-white/95 sm:text-4xl md:text-5xl lg:text-6xl">
                the AI that gets your{" "}
                <span className="gradient-text">cannabis</span> right.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base text-white/70 md:text-lg lg:mx-0">
              Honest answers, science-backed strain matches and same-day delivery across South Africa — all in one chat.
            </p>

            {/* Inline chat input */}
            <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-lg lg:mx-0">
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  ref={inputRef}
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder={HERO_PROMPTS[placeholderIdx]}
                  className="flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary/90"
                  aria-label="Ask Cuddles"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {HERO_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendToChat(prompt)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <a
                href="https://tripplefourmarketplace.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  onClick={() => trackEvent('cta_click', 'shop', 'hero_order')}
                  className="h-auto w-full gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-5 font-display text-lg font-semibold text-white hover:opacity-90 sm:w-auto"
                >
                  <Store className="h-5 w-5" />
                  Order Delivery
                </Button>
              </a>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-auto w-full gap-2 rounded-xl border-white/30 bg-white/5 px-8 py-5 font-display text-lg font-semibold text-white hover:bg-white/15 sm:w-auto"
                >
                  <Sparkles className="h-5 w-5" />
                  Try the App
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/40">No signup required · Free forever · 2,500+ happy users</p>

            <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 lg:mx-0">
              {[
                { value: '95%', label: 'Match accuracy' },
                { value: '<2s', label: 'Response time' },
                { value: '4.9★', label: 'User rating' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="font-display text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Floating sparkles around phone */}
            <div className="absolute left-4 top-10 hidden rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md md:block animate-fade-in-up">
              ✨ 95% match
            </div>
            <div className="absolute -right-2 top-1/3 hidden rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md lg:block animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              🌿 Same-day delivery
            </div>
            <div className="absolute bottom-16 left-0 hidden rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md md:block animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              💬 24/7 budtender
            </div>

            <PhoneFrame>
              <PhoneChatPreview bubbles={HERO_BUBBLES} />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
