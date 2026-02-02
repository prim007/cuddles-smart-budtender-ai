import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Zap, Heart, Palette, Coffee } from "lucide-react";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const prompts = [
  {
    icon: Moon,
    label: "Help me sleep",
    prompt: "I'm looking for something to help me relax and get a good night's sleep. I'm a beginner.",
    color: "from-hippie-blue to-hippie-purple",
  },
  {
    icon: Zap,
    label: "Boost creativity",
    prompt: "I want something that will boost my creativity and help me focus on artistic projects.",
    color: "from-hippie-yellow to-hippie-orange",
  },
  {
    icon: Heart,
    label: "Pain relief",
    prompt: "I'm looking for something to help with pain relief and relaxation without feeling too sedated.",
    color: "from-hippie-pink to-hippie-purple",
  },
  {
    icon: Sparkles,
    label: "Social energy",
    prompt: "I want something uplifting for social gatherings that will make me feel happy and talkative.",
    color: "from-hippie-orange to-hippie-pink",
  },
  {
    icon: Palette,
    label: "Stress relief",
    prompt: "I need something to help me unwind after a stressful day. Medium experience level.",
    color: "from-hippie-green to-hippie-blue",
  },
  {
    icon: Coffee,
    label: "Morning energy",
    prompt: "What would you recommend for a productive morning that won't make me too anxious?",
    color: "from-hippie-yellow to-hippie-green",
  },
];

const QuickPrompts = ({ onSelect, disabled }: QuickPromptsProps) => {
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
