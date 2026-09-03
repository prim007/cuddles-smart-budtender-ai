import { Send } from "lucide-react";
import cuddlesImage from "@/assets/cuddles.png";
import { trackEvent } from "@/components/GoogleAnalytics";
import { FormEvent, useRef, useState } from "react";
import Cuddles3D from "@/components/Cuddles3D";

const HERO_PROMPTS = [
  "Best strain for sleep?",
  "Something for anxiety relief",
  "A creative sativa for daytime",
  "Help with my houseplant",
];

const Hero = () => {
  const [heroInput, setHeroInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sendToChat = (text: string) => {
    trackEvent("hero_chat_submit", "conversion", text);
    const chatSection = document.getElementById("chat-demo");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("cuddles-quick-prompt", { detail: text }));
      }, 600);
    }
  };

  const handleSubmit = (e: FormEvent) => {
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
            <img
              src={cuddlesImage}
              alt="Cuddles AI brand mark"
              className="h-full w-full object-cover"
              width="36"
              height="36"
              fetchPriority="high"
            />
          </div>
          <span className="font-display text-lg font-semibold">Cuddles</span>
        </div>

        <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="font-display font-bold leading-[1.05] tracking-tight text-white">
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Meet <span className="gradient-text">Cuddles</span>,
              </span>
              <span className="mt-2 block text-3xl text-white/95 sm:text-4xl md:text-5xl lg:text-6xl">
                the AI that gets your <span className="gradient-text">plants</span> right.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base text-white/70 md:text-lg lg:mx-0">
              A plant expert first, cannabis specialist second — honest answers on strains, herbs, houseplants and grows, plus same-day delivery across South Africa, all in one chat.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-lg lg:mx-0">
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  ref={inputRef}
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Ask Cuddles about a plant or strain"
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
          </div>

          <div className="relative flex justify-center lg:justify-end">
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
