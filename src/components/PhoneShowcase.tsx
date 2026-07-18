import PhoneFrame from "@/components/PhoneFrame";
import PhoneChatPreview from "@/components/PhoneChatPreview";
import Phone3D from "@/components/Phone3D";
import { Check } from "lucide-react";
import { ReactNode } from "react";

interface Section {
  eyebrow: string;
  title: ReactNode;
  description: string;
  bullets: string[];
  bubbles: { from: "cuddles" | "user"; text: ReactNode }[];
  headerGradient: string;
  bg: string;
  reverse?: boolean;
}

const SECTIONS: Section[] = [
  {
    eyebrow: "Strain Match",
    title: (
      <>
        Find your <span className="gradient-text">perfect strain</span> in under 30 seconds.
      </>
    ),
    description:
      "Tell Cuddles what you need — sleep, focus, pain relief, creativity — and get personalised matches grounded in real strain data, terpene profiles and dispensary stock.",
    bullets: [
      "Personalised to your tolerance & goals",
      "Indica, sativa & hybrid breakdowns",
      "Terpene & cannabinoid science",
    ],
    bubbles: [
      { from: "user", text: "I need something for focus while I work" },
      { from: "cuddles", text: "Try Jack Herer — uplifting sativa, terpinolene-forward. Clear-headed focus without jitters." },
      { from: "cuddles", text: "Microdose 1 puff, wait 5 min. I'll save it to your journal 📓" },
    ],
    headerGradient: "from-hippie-amber via-hippie-peach to-hippie-coral",
    bg: "bg-gradient-to-br from-[hsl(20,55%,94%)] to-[hsl(35,60%,90%)]",
  },
  {
    eyebrow: "Smart Dosing",
    title: (
      <>
        A dosage coach that <span className="gradient-text">actually keeps you safe</span>.
      </>
    ),
    description:
      "No more 'I think I took too much.' Cuddles calculates your starting dose by weight, tolerance and method — and walks you through onset, peak and tapering.",
    bullets: [
      "Edibles, vapes, oils & flower",
      "Onset & duration timelines",
      "Tolerance break planner",
    ],
    bubbles: [
      { from: "user", text: "First time trying edibles, what's safe?" },
      { from: "cuddles", text: "Start with 2.5mg THC. Onset 45–90 min — don't redose for 2 hours." },
      { from: "user", text: "What if it's too strong?" },
      { from: "cuddles", text: "Hydrate, find a calm space, try 1:1 CBD. I'll stay with you 💛" },
    ],
    headerGradient: "from-hippie-teal via-hippie-sage to-hippie-amber",
    bg: "bg-gradient-to-br from-[hsl(175,40%,92%)] to-[hsl(150,35%,90%)]",
    reverse: true,
  },
  {
    eyebrow: "Same-Day Delivery",
    title: (
      <>
        Order in chat. <span className="gradient-text">Delivered today.</span>
      </>
    ),
    description:
      "Once you've found your match, Cuddles hands you off to checkout — premium SA dispensary stock, transparent pricing, same-day delivery in Joburg, Cape Town & Pretoria.",
    bullets: [
      "R390 vapes · R320 oils · premium flower",
      "Live stock from licensed dispensaries",
      "Track your order in real-time",
    ],
    bubbles: [
      { from: "user", text: "Got the GDP in stock in Joburg?" },
      { from: "cuddles", text: "Yes — 3.5g R450, in stock at Tripple Four Sandton 📦" },
      { from: "cuddles", text: "ETA today 18:30. Tap to check out 👇" },
      { from: "user", text: "Add to cart 🛒" },
    ],
    headerGradient: "from-hippie-coral via-hippie-lavender to-hippie-teal",
    bg: "bg-gradient-to-br from-[hsl(270,30%,93%)] to-[hsl(350,40%,93%)]",
  },
];

const PhoneShowcase = () => {
  return (
    <div className="space-y-0">
      {SECTIONS.map((s, i) => (
        <section key={i} className={`${s.bg} py-16 md:py-24 text-zinc-900 relative overflow-hidden`}>
          <div className="container mx-auto px-4">
            <div
              className={`grid items-center gap-10 md:gap-16 lg:grid-cols-2 ${
                s.reverse ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Copy */}
              <div className="text-center lg:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-900/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-700 backdrop-blur-sm">
                  {s.eyebrow}
                </div>
                <h2 className="font-display text-3xl font-bold leading-tight text-zinc-900 md:text-4xl lg:text-5xl">
                  {s.title}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base text-zinc-700 md:text-lg lg:mx-0">
                  {s.description}
                </p>
                <ul className="mx-auto mt-6 max-w-md space-y-3 lg:mx-0">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-left">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm text-zinc-800 md:text-base">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone */}
              <div className="flex justify-center lg:justify-end">
                <Phone3D index={i}>
                  <PhoneFrame>
                    <PhoneChatPreview bubbles={s.bubbles} headerGradient={s.headerGradient} />
                  </PhoneFrame>
                </Phone3D>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default PhoneShowcase;
