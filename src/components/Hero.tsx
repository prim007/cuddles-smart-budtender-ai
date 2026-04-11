import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Store, UserPlus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { trackEvent } from "@/components/GoogleAnalytics";
import { useEffect, useState, useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate live user count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => Math.max(5, prev + Math.floor(Math.random() * 5) - 2));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Cycle placeholder text
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
        // Dispatch the quick-prompt event that ChatDemo already listens for
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
    <section className="relative flex items-center justify-center py-12 md:py-16 bg-gradient-to-br from-[hsl(270,40%,15%)] via-[hsl(320,45%,18%)] to-[hsl(350,50%,22%)]">
      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between py-3 px-4 md:px-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-white/20">
              <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-semibold text-white text-lg hidden sm:block">Cuddles</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://tripplefourmarketplace.lovable.app" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 font-medium gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </Button>
            </a>
            <Link to="/auth">
              <Button size="sm" className="bg-white/15 text-white hover:bg-white/25 font-medium gap-1 border border-white/20">
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-3xl mx-auto text-center pt-14">
          {/* Live activity indicator */}
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1.5 mb-4 animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-300 font-medium">
              {liveCount} people chatting right now
            </span>
          </div>

          <h1 className="font-display font-bold text-white mb-3 leading-tight">
            <span className="text-2xl md:text-3xl block text-white/80">Your AI Cannabis Expert</span>
            <span className="block gradient-text text-4xl md:text-6xl py-1">
              Cuddles
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/60 mb-5 max-w-xl mx-auto leading-relaxed font-sans">
            Tell me what you're looking for — sleep, pain relief, creativity — and I'll find your perfect strain in seconds.
          </p>

          {/* Inline chat input — above the fold, instant value */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder={HERO_PROMPTS[placeholderIdx]}
                className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-base py-2"
              />
              <button
                type="submit"
                className="shrink-0 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
                aria-label="Ask Cuddles"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick-tap prompts */}
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {HERO_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendToChat(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
            <a href="https://tripplefourmarketplace.lovable.app" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                onClick={() => trackEvent('cta_click', 'shop', 'hero_order')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 font-display font-semibold text-lg px-8 py-5 h-auto rounded-xl gap-2 w-full"
              >
                <Store className="w-5 h-5" />
                Order Delivery 🛒
              </Button>
            </a>
          </div>

          <p className="text-xs text-white/40 mb-6">No signup required · Free forever · 2,500+ happy users</p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: '95%', label: 'Match accuracy' },
              { value: '<2s', label: 'Response time' },
              { value: '4.9★', label: 'User rating' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 bg-white/5 border border-white/10">
                <div className="text-xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-white/40 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
