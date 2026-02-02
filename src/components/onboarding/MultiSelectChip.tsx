import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MultiSelectChipProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

const MultiSelectChip = ({ selected, onClick, label, disabled }: MultiSelectChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 transition-all duration-200",
        "hover:border-primary/50",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {selected && <Check className="w-3.5 h-3.5" />}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default MultiSelectChip;
