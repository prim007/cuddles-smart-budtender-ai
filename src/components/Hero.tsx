import { Button } from "@/components/ui/button";
import { ExternalLink, Store, UserPlus, Send, MessageCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { trackEvent } from "@/components/GoogleAnalytics";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { toast } from "sonner";

// Heavy 3D scene: loaded only once the banner is on screen so it never blocks
// first paint or interaction. Height is reserved to avoid any layout shift.
const Cuddles3D = lazy(() => import("@/components/Cuddles3D"));
const CUDDLES_3D_HEIGHT = "h-[320px] w-full sm:h-[540px] lg:h-[640px]";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}


const HERO_PROMPTS = [
  "Best strain for sleep?",
  "Something for anxiety relief",
  "A creative sativa for daytime",
  "Help with chronic pain",
];

const Hero = () => {
  const [liveCount, setLiveCount] = useState(12);
  const [heroInput, setHeroInput] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [showScene, setShowScene] = useState(false);

  // Only build the 3D scene when it is actually visible (and not on
  // reduced-motion / data-saver setups).
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ((navigator as any).connection?.saveData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          const start = () => setShowScene(true);
          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(start, { timeout: 2000 });
          } else {
            setTimeout(start, 300);
          }
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDownload = async () => {
    trackEvent('cta_click', 'install', 'hero_download_app');
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstallPrompt(null);
    } else {
      toast.info("Install Cuddles", {
        description: "Tap your browser's menu and choose 'Add to Home Screen' to install the Cuddles app.",
      });
    }
  };

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
    <section className="relative overflow-hidden bg-[#1a0f1f] py-10 md:py-16">
      {/* Sculptural sunset glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-hippie-coral/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-48 h-[600px] w-[600px] rounded-full bg-hippie-sage/10 blur-[160px]" />
      {/* Abstract tilted glass shards */}
      <div className="pointer-events-none absolute top-20 right-[12%] hidden h-96 w-64 rotate-[15deg] rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-3xl md:block" />
      <div className="pointer-events-none absolute -bottom-10 left-[8%] hidden h-40 w-80 -rotate-[5deg] rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-2xl lg:block" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 hidden h-48 w-48 -translate-x-1/2 rotate-[28deg] rounded-2xl border border-white/5 bg-gradient-to-br from-hippie-peach/10 to-transparent backdrop-blur-xl lg:block" />
      {/* Subtle grain to prevent banding */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")" } } />



      <div className="container relative z-10 mx-auto px-4">
        {/* Navigation */}
        <nav className="mb-10 flex items-center justify-between md:mb-16">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-white/20">
              <img src={cuddlesImage} alt="Cuddles AI budtender brand mark" className="h-full w-full object-cover" width="36" height="36" fetchPriority="high" />
            </div>
            <span className="font-display text-lg font-semibold text-white">Cuddles</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://tripplefourmarketplace.lovable.app" target="_blank" rel="noopener noreferrer" aria-label="Open the Tripple Four Marketplace in a new tab">
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
                className="h-auto w-full gap-2 rounded-2xl bg-gradient-to-r from-hippie-coral to-hippie-peach px-6 py-4 font-display text-base md:px-8 md:py-5 md:text-lg font-semibold text-white shadow-[0_20px_40px_-10px_hsl(var(--hippie-coral)/0.5)] hover:scale-[1.02] hover:opacity-95 transition-transform sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Start Chatting Now
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleDownload}
                className="h-auto w-full gap-2 rounded-2xl border-white/30 bg-white/5 px-6 py-4 font-display text-base md:px-8 md:py-5 md:text-lg font-semibold text-white backdrop-blur-md hover:bg-white/15 sm:w-auto"
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
                  className="h-auto w-full gap-2 rounded-2xl border-white/30 bg-white/5 px-6 py-4 font-display text-base md:px-8 md:py-5 md:text-lg font-semibold text-white backdrop-blur-md hover:bg-white/15 sm:w-auto"
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

            <div ref={sceneRef} className="relative w-full max-w-[560px]">
              {showScene ? (
                <Suspense fallback={<div className={CUDDLES_3D_HEIGHT} aria-hidden="true" />}>
                  <Cuddles3D />
                </Suspense>
              ) : (
                <div className={CUDDLES_3D_HEIGHT} aria-hidden="true" />
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

