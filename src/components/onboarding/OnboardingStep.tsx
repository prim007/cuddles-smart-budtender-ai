import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OnboardingStepProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const OnboardingStep = ({ title, description, children, className }: OnboardingStepProps) => {
  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default OnboardingStep;
