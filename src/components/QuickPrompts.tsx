import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Zap, Heart, Palette, Coffee } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const QuickPrompts = ({ onSelect, disabled }: QuickPromptsProps) => {
  const { t, language } = useLanguage();

  // Localized prompts based on language
  const prompts = [
    {
      icon: Moon,
      label: t.helpMeSleep,
      prompt: language === "en" 
        ? "I'm looking for something to help me relax and get a good night's sleep. I'm a beginner."
        : `${t.helpMeSleep} - I'm a beginner looking for relaxation and better sleep.`,
      color: "from-hippie-blue to-hippie-purple",
    },
    {
      icon: Zap,
      label: t.boostCreativity,
      prompt: language === "en"
        ? "I want something that will boost my creativity and help me focus on artistic projects."
        : `${t.boostCreativity} - I want to enhance my creative and artistic focus.`,
      color: "from-hippie-yellow to-hippie-orange",
    },
    {
      icon: Heart,
      label: t.painRelief,
      prompt: language === "en"
        ? "I'm looking for something to help with pain relief and relaxation without feeling too sedated."
        : `${t.painRelief} - Looking for relief without heavy sedation.`,
      color: "from-hippie-pink to-hippie-purple",
    },
    {
      icon: Sparkles,
      label: t.socialEnergy,
      prompt: language === "en"
        ? "I want something uplifting for social gatherings that will make me feel happy and talkative."
        : `${t.socialEnergy} - I want to feel uplifted and social.`,
      color: "from-hippie-orange to-hippie-pink",
    },
    {
      icon: Palette,
      label: t.stressRelief,
      prompt: language === "en"
        ? "I need something to help me unwind after a stressful day. Medium experience level."
        : `${t.stressRelief} - Help me unwind after stress. Medium experience.`,
      color: "from-hippie-green to-hippie-blue",
    },
    {
      icon: Coffee,
      label: t.morningEnergy,
      prompt: language === "en"
        ? "What would you recommend for a productive morning that won't make me too anxious?"
        : `${t.morningEnergy} - Looking for productive energy without anxiety.`,
      color: "from-hippie-yellow to-hippie-green",
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
            onClick={() => onSelect(prompt.prompt)}
            disabled={disabled}
            className={`group relative overflow-hidden border-border/50 hover:border-transparent transition-all duration-300`}
          >
            <span className={`absolute inset-0 bg-gradient-to-r ${prompt.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
            <Icon className="w-4 h-4 mr-2" />
            {prompt.label}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickPrompts;
