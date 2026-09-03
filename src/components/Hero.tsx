import { Send } from "lucide-react";
import cuddlesImage from "@/assets/cuddles.png";
import { trackEvent } from "@/components/GoogleAnalytics";
import { useState } from "react";
import Cuddles3D from "@/components/Cuddles3D";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}


const Hero = () => {
  const [heroInput, setHeroInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    <section className="relative overflow-hidden bg-foreground py-10 text-background md:py-16">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-10 flex items-center gap-2 md:mb-16">
          <div className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-background/20">
            <img src={cuddlesImage} alt="Cuddles AI brand mark" className="h-full w-full object-cover" width="36" height="36" fetchPriority="high" />
          </div>
          <span className="font-display text-lg font-semibold">Cuddles</span>
        </div>

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
                <span className="gradient-text">plants</span> right.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base text-white/70 md:text-lg lg:mx-0">
              A plant expert first, cannabis specialist second — honest answers on strains, herbs, houseplants and grows, plus same-day delivery across South Africa, all in one chat.
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
                  className="flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-white/70"
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
              <Button
                size="lg"
                onClick={() => {
                  trackEvent('cta_click', 'chat', 'hero_start_chatting');
                  const chatSection = document.getElementById('chat-demo');
                  chatSection?.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => inputRef.current?.focus(), 700);
                }}
                className="h-auto w-full gap-2 rounded-2xl bg-gradient-to-r from-hippie-coral to-hippie-peach px-8 py-5 font-display text-lg font-semibold text-white shadow-[0_20px_40px_-10px_hsl(var(--hippie-coral)/0.5)] hover:scale-[1.02] hover:opacity-95 transition-transform sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Start Chatting Now
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleDownload}
                className="h-auto w-full gap-2 rounded-2xl border-white/30 bg-white/5 px-8 py-5 font-display text-lg font-semibold text-white backdrop-blur-md hover:bg-white/15 sm:w-auto"
              >
                <Download className="h-5 w-5" />
                Download App
              </Button>

              <a
                href="https://tripplefourshophub.online/partners/lef-labs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('cta_click', 'shop', 'hero_tripplefour_store')}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-auto w-full gap-2 rounded-2xl border-white/30 bg-white/5 px-8 py-5 font-display text-lg font-semibold text-white backdrop-blur-md hover:bg-white/15 sm:w-auto"
                >
                  <Store className="h-5 w-5" />
                  View Tripple Four Store
                </Button>
              </a>
            </div>

            <p className="mt-4 text-xs text-white/80">No signup required · Free forever · 2,500+ happy users</p>


            <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 lg:mx-0">
              {[
                { value: '95%', label: 'Match accuracy' },
                { value: '<2s', label: 'Response time' },
                { value: '4.9★', label: 'User rating' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="font-display text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
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

            <div className="relative w-full max-w-[560px]">
              <Cuddles3D />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

