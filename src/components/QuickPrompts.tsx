import { Button } from "@/components/ui/button";
import { Moon, Zap, Heart, Palette, Coffee, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackPromptClicked } from "@/components/GoogleAnalytics";
import { logAbEvent, CHAT_FAB_EXPERIMENT } from "@/lib/abTest";


interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const QuickPrompts = ({ onSelect, disabled }: QuickPromptsProps) => {
  const { t, language } = useLanguage();

  const prompts = [
    {
      icon: Moon,
      label: t.helpMeSleep,
      prompt: language === "en" 
        ? "I'm looking for something to help me relax and get a good night's sleep. I'm a beginner."
        : `${t.helpMeSleep} - I'm a beginner looking for relaxation and better sleep.`,
      gradient: "from-hippie-lavender to-hippie-teal",
    },
    {
      icon: Zap,
      label: t.boostCreativity,
      prompt: language === "en"
        ? "I want something that will boost my creativity and help me focus on artistic projects."
        : `${t.boostCreativity} - I want to enhance my creative and artistic focus.`,
      gradient: "from-hippie-amber to-hippie-peach",
    },
    {
      icon: Heart,
      label: t.painRelief,
      prompt: language === "en"
        ? "I'm looking for something to help with pain relief and relaxation without feeling too sedated."
        : `${t.painRelief} - Looking for relief without heavy sedation.`,
      gradient: "from-hippie-coral to-hippie-lavender",
    },
    {
      icon: Sparkles,
      label: t.socialEnergy,
      prompt: language === "en"
        ? "I want something uplifting for social gatherings that will make me feel happy and talkative."
        : `${t.socialEnergy} - I want to feel uplifted and social.`,
      gradient: "from-hippie-peach to-hippie-coral",
    },
    {
      icon: Palette,
      label: t.stressRelief,
      prompt: language === "en"
        ? "I need something to help me unwind after a stressful day. Medium experience level."
        : `${t.stressRelief} - Help me unwind after stress. Medium experience.`,
      gradient: "from-hippie-sage to-hippie-teal",
    },
    {
      icon: Coffee,
      label: t.morningEnergy,
      prompt: language === "en"
        ? "What would you recommend for a productive morning that won't make me too anxious?"
        : `${t.morningEnergy} - Looking for productive energy without anxiety.`,
      gradient: "from-hippie-amber to-hippie-sage",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => {
              trackPromptClicked(prompt.label);
              logAbEvent({ experiment: CHAT_FAB_EXPERIMENT, event: "chat_quick_prompt_clicked", properties: { label: prompt.label } });
              onSelect(prompt.prompt);
            }}

            disabled={disabled}
            className="group relative overflow-hidden border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all duration-300 rounded-full hover-scale"
          >
            <span className={`absolute inset-0 bg-gradient-to-r ${prompt.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <Icon className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm">{prompt.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickPrompts;
