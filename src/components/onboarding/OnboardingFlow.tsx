import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile, UserProfile } from "@/contexts/UserProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import OnboardingStep from "./OnboardingStep";
import OnboardingProgress from "./OnboardingProgress";
import SelectableCard from "./SelectableCard";
import MultiSelectChip from "./MultiSelectChip";
import { 
  Leaf, 
  Zap, 
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Flame,
  Wind,
  Coffee,
  Smile,
  Heart
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import cuddlesImage from "@/assets/cuddles.png";

const ONBOARDING_COMPLETE_KEY = "cuddles-onboarding-complete";

const experienceOptions = [
  { value: "beginner", icon: <Leaf className="w-5 h-5" />, descKey: "New to cannabis" },
  { value: "intermediate", icon: <Flame className="w-5 h-5" />, descKey: "Some experience" },
  { value: "experienced", icon: <Zap className="w-5 h-5" />, descKey: "Regular user" },
] as const;

const toleranceOptions = [
  { value: "low", icon: <Leaf className="w-5 h-5" />, descKey: "Sensitive to effects" },
  { value: "medium", icon: <Flame className="w-5 h-5" />, descKey: "Moderate tolerance" },
  { value: "high", icon: <Zap className="w-5 h-5" />, descKey: "High tolerance" },
] as const;

const consumptionOptions = [
  { value: "smoke", icon: <Wind className="w-5 h-5" />, descKey: "Traditional flower" },
  { value: "vape", icon: <Coffee className="w-5 h-5" />, descKey: "Vaporizers & carts" },
  { value: "edible", icon: <Smile className="w-5 h-5" />, descKey: "Food & drinks" },
  { value: "tincture", icon: <Heart className="w-5 h-5" />, descKey: "Oils & tinctures" },
] as const;

const effectOptions = [
  "Relaxation", "Creativity", "Energy", "Focus", "Sleep", 
  "Pain Relief", "Euphoria", "Social", "Appetite", "Calm"
];

const flavorOptions = [
  "Citrus", "Earthy", "Sweet", "Pine", "Berry", 
  "Diesel", "Tropical", "Mint", "Spicy", "Floral"
];

interface OnboardingFlowProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

const OnboardingFlow = ({ forceOpen, onComplete }: OnboardingFlowProps) => {
  const { t } = useLanguage();
  const { profile, updateProfile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Local state for selections
  const [experienceLevel, setExperienceLevel] = useState<UserProfile["experienceLevel"]>(profile.experienceLevel);
  const [toleranceLevel, setToleranceLevel] = useState<UserProfile["toleranceLevel"]>(profile.toleranceLevel);
  const [consumptionMethod, setConsumptionMethod] = useState<UserProfile["consumptionMethod"]>(profile.consumptionMethod);
  const [preferredEffects, setPreferredEffects] = useState<string[]>(profile.preferredEffects);
  const [flavorPreferences, setFlavorPreferences] = useState<string[]>(profile.flavorPreferences);

  const totalSteps = 6; // Welcome + 5 preference steps

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    
    // Check if onboarding was completed
    const completed = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    if (!completed) {
      // Show immediately on first visit
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleComplete = () => {
    updateProfile({
      experienceLevel,
      toleranceLevel,
      consumptionMethod,
      preferredEffects,
      flavorPreferences,
    });
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleEffect = (effect: string) => {
    setPreferredEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const toggleFlavor = (flavor: string) => {
    setFlavorPreferences(prev => 
      prev.includes(flavor) 
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: return !!experienceLevel;
      case 2: return !!toleranceLevel;
      case 3: return !!consumptionMethod;
      case 4: return preferredEffects.length > 0;
      case 5: return true; // Flavors optional
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingStep 
            title="Welcome to Cuddles! 🌿" 
            description="Let's personalize your experience to give you the best recommendations."
          >
            <div className="flex flex-col items-center py-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-hippie-lavender to-hippie-teal mb-4 shadow-glow">
                <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
              </div>
              <p className="text-center text-muted-foreground max-w-xs">
                I'll ask you a few quick questions to understand your preferences and provide personalized recommendations.
              </p>
            </div>
          </OnboardingStep>
        );

      case 1:
        return (
          <OnboardingStep 
            title={t.experienceLevel}
            description="How familiar are you with cannabis?"
          >
            <div className="space-y-3">
              {experienceOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  selected={experienceLevel === option.value}
                  onClick={() => setExperienceLevel(option.value)}
                  icon={option.icon}
                  title={t[option.value]}
                  description={option.descKey}
                />
              ))}
            </div>
          </OnboardingStep>
        );

      case 2:
        return (
          <OnboardingStep 
            title={t.tolerance}
            description="How sensitive are you to cannabis effects?"
          >
            <div className="space-y-3">
              {toleranceOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  selected={toleranceLevel === option.value}
                  onClick={() => setToleranceLevel(option.value)}
                  icon={option.icon}
                  title={t[option.value]}
                  description={option.descKey}
                />
              ))}
            </div>
          </OnboardingStep>
        );

      case 3:
        return (
          <OnboardingStep 
            title={t.consumptionMethod}
            description="What's your preferred way to consume?"
          >
            <div className="grid grid-cols-2 gap-3">
              {consumptionOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  selected={consumptionMethod === option.value}
                  onClick={() => setConsumptionMethod(option.value)}
                  icon={option.icon}
                  title={t[option.value]}
                  description={option.descKey}
                />
              ))}
            </div>
          </OnboardingStep>
        );

      case 4:
        return (
          <OnboardingStep 
            title={t.preferredEffects}
            description="Select the effects you're looking for (choose multiple)"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {effectOptions.map((effect) => (
                <MultiSelectChip
                  key={effect}
                  selected={preferredEffects.includes(effect)}
                  onClick={() => toggleEffect(effect)}
                  label={effect}
                />
              ))}
            </div>
          </OnboardingStep>
        );

      case 5:
        return (
          <OnboardingStep 
            title={t.flavorPreferences}
            description="What flavors do you enjoy? (optional)"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {flavorOptions.map((flavor) => (
                <MultiSelectChip
                  key={flavor}
                  selected={flavorPreferences.includes(flavor)}
                  onClick={() => toggleFlavor(flavor)}
                  label={flavor}
                />
              ))}
            </div>
          </OnboardingStep>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleSkip(); }}>
      <DialogContent 
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-border/50 shadow-elevated max-h-[85vh] w-[95vw] sm:w-full [&>button:last-child]:hidden" 
        aria-describedby={undefined}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Onboarding</DialogTitle>
        </VisuallyHidden>
        <div className="relative bg-card overflow-y-auto max-h-[85vh]">
          {/* Skip button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-4 h-4 mr-1" />
            Skip
          </Button>

          <div className="p-4 sm:p-6 pt-12">
            {/* Progress */}
            <div className="mb-4 sm:mb-6">
              <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
            </div>

            {/* Step content */}
            <div className="min-h-0">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4 sm:mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={currentStep === 0 ? "invisible" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white rounded-xl"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;
