import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ReactNode } from "react";

interface SelectableCardProps {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  disabled?: boolean;
}

const SelectableCard = ({
  selected,
  onClick,
  icon,
  title,
  description,
  disabled,
}: SelectableCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
        "hover:border-primary/50 hover:bg-accent/50",
        selected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border bg-card",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        <div>
          <div className="font-medium text-foreground">{title}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
    </button>
  );
};

export default SelectableCard;
