import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, RotateCcw, Check } from "lucide-react";
import { useUserProfile, UserProfile } from "@/contexts/UserProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const effectOptions = [
  "Relaxation",
  "Creativity",
  "Energy",
  "Pain Relief",
  "Sleep",
  "Focus",
  "Euphoria",
  "Appetite",
];

const flavorOptions = [
  "Citrus",
  "Earthy",
  "Sweet",
  "Pine",
  "Berry",
  "Diesel",
  "Spicy",
  "Floral",
];

interface UserProfilePanelProps {
  className?: string;
}

const UserProfilePanel = ({ className }: UserProfilePanelProps) => {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const toggleEffect = (effect: string) => {
    const current = profile.preferredEffects;
    const updated = current.includes(effect)
      ? current.filter((e) => e !== effect)
      : [...current, effect];
    updateProfile({ preferredEffects: updated });
  };

  const toggleFlavor = (flavor: string) => {
    const current = profile.flavorPreferences;
    const updated = current.includes(flavor)
      ? current.filter((f) => f !== flavor)
      : [...current, flavor];
    updateProfile({ flavorPreferences: updated });
  };

  const handleReset = () => {
    resetProfile();
    toast({
      title: t.resetProfile,
      description: "Your preferences have been cleared.",
    });
  };

  const hasProfile =
    profile.experienceLevel ||
    profile.toleranceLevel ||
    profile.consumptionMethod ||
    profile.preferredEffects.length > 0 ||
    profile.flavorPreferences.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={className}
          aria-label={t.profile}
        >
          <User className="h-5 w-5" />
          {hasProfile && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.profile}
          </SheetTitle>
          <SheetDescription>
            Save your preferences for personalized recommendations
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Experience Level */}
          <div className="space-y-2">
            <Label>{t.experienceLevel}</Label>
            <Select
              value={profile.experienceLevel || ""}
              onValueChange={(value) =>
                updateProfile({
                  experienceLevel: value as UserProfile["experienceLevel"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t.beginner}</SelectItem>
                <SelectItem value="intermediate">{t.intermediate}</SelectItem>
                <SelectItem value="experienced">{t.experienced}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tolerance Level */}
          <div className="space-y-2">
            <Label>{t.tolerance}</Label>
            <Select
              value={profile.toleranceLevel || ""}
              onValueChange={(value) =>
                updateProfile({
                  toleranceLevel: value as UserProfile["toleranceLevel"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tolerance level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t.low}</SelectItem>
                <SelectItem value="medium">{t.medium}</SelectItem>
                <SelectItem value="high">{t.high}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consumption Method */}
          <div className="space-y-2">
            <Label>{t.consumptionMethod}</Label>
            <Select
              value={profile.consumptionMethod || ""}
              onValueChange={(value) =>
                updateProfile({
                  consumptionMethod: value as UserProfile["consumptionMethod"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select consumption method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smoke">{t.smoke}</SelectItem>
                <SelectItem value="vape">{t.vape}</SelectItem>
                <SelectItem value="edible">{t.edible}</SelectItem>
                <SelectItem value="tincture">{t.tincture}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Effects */}
          <div className="space-y-2">
            <Label>{t.preferredEffects}</Label>
            <div className="flex flex-wrap gap-2">
              {effectOptions.map((effect) => (
                <Badge
                  key={effect}
                  variant={profile.preferredEffects.includes(effect) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleEffect(effect)}
                >
                  {profile.preferredEffects.includes(effect) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {effect}
                </Badge>
              ))}
            </div>
          </div>

          {/* Flavor Preferences */}
          <div className="space-y-2">
            <Label>{t.flavorPreferences}</Label>
            <div className="flex flex-wrap gap-2">
              {flavorOptions.map((flavor) => (
                <Badge
                  key={flavor}
                  variant={profile.flavorPreferences.includes(flavor) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleFlavor(flavor)}
                >
                  {profile.flavorPreferences.includes(flavor) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {flavor}
                </Badge>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
            disabled={!hasProfile}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t.resetProfile}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserProfilePanel;
