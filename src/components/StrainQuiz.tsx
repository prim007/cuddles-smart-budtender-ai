import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

const QUESTIONS = [
  {
    question: "What's your main goal?",
    options: ["Sleep better", "Reduce anxiety", "Boost creativity", "Pain relief", "Just vibe"],
  },
  {
    question: "Experience level?",
    options: ["Brand new", "Casual", "Regular", "Connoisseur"],
  },
  {
    question: "Preferred feeling?",
    options: ["Calm & relaxed", "Energised & social", "Focused & clear", "Euphoric & giggly"],
  },
];

const RESULTS: Record<string, { strain: string; type: string; why: string }> = {
  "Sleep better-Calm & relaxed": { strain: "Granddaddy Purple", type: "Indica", why: "Deep body relaxation and sedative terpenes for restful sleep" },
  "Reduce anxiety-Calm & relaxed": { strain: "Cannatonic", type: "Hybrid", why: "High CBD, low THC — calming without the head rush" },
  "Boost creativity-Energised & social": { strain: "Durban Poison", type: "Sativa", why: "Pure sativa energy to unlock creative flow" },
  "Pain relief-Calm & relaxed": { strain: "ACDC", type: "Hybrid", why: "CBD-dominant with anti-inflammatory terpenes" },
  default: { strain: "Blue Dream", type: "Hybrid", why: "Balanced hybrid that suits almost everyone — a crowd favourite" },
};

const StrainQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer: string) => {
    const next = [...answers, answer];
    setAnswers(next);
    trackEvent("quiz_answer", "engagement", `q${step}_${answer}`);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
      trackEvent("quiz_completed", "conversion", "strain_quiz");
    }
  };

  const getResult = () => {
    const key = `${answers[0]}-${answers[2]}`;
    return RESULTS[key] || RESULTS.default;
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  const scrollToChat = (strain: string) => {
    const chatSection = document.getElementById("chat-demo");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const input = chatSection.querySelector("input[type='text']") as HTMLInputElement;
        if (input) {
          input.value = `Tell me more about ${strain}`;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.focus();
        }
      }, 800);
    }
  };

  const result = getResult();

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">30-Second Strain Finder</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Find Your Perfect Strain 🎯
          </h2>
          <p className="text-muted-foreground mb-8">
            Answer 3 quick questions and we'll match you instantly
          </p>

          {!showResult ? (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <p className="text-lg font-semibold text-foreground mb-4">
                {QUESTIONS[step].question}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {QUESTIONS[step].options.map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    className="h-auto py-3 text-sm hover:bg-primary/10 hover:border-primary/40"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-md animate-in fade-in duration-500">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                Your Match
              </p>
              <h3 className="text-2xl font-display font-bold text-foreground mb-1">
                {result.strain}
              </h3>
              <span className="inline-block text-xs bg-primary/10 text-primary rounded-full px-3 py-1 mb-3 font-medium">
                {result.type}
              </span>
              <p className="text-sm text-muted-foreground mb-5">{result.why}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => scrollToChat(result.strain)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  Ask Cuddles About It <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StrainQuiz;
