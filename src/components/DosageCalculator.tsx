import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
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
import { Calculator, AlertTriangle, Info } from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ConsumptionMethod = "smoke" | "vape" | "edible" | "tincture";
type ExperienceLevel = "beginner" | "intermediate" | "experienced";

interface DosageRecommendation {
  thcRange: string;
  amount: string;
  timing: string;
  notes: string;
}

const dosageMatrix: Record<ConsumptionMethod, Record<ExperienceLevel, DosageRecommendation>> = {
  smoke: {
    beginner: {
      thcRange: "10-15% THC",
      amount: "1-2 small puffs",
      timing: "Wait 15-30 minutes before more",
      notes: "Start with a single puff and wait to feel effects before taking more.",
    },
    intermediate: {
      thcRange: "15-20% THC",
      amount: "2-4 puffs",
      timing: "Wait 15-20 minutes between sessions",
      notes: "You can handle moderate doses but still respect the plant.",
    },
    experienced: {
      thcRange: "20%+ THC",
      amount: "As comfortable",
      timing: "Based on personal preference",
      notes: "Trust your experience but remember tolerance can change.",
    },
  },
  vape: {
    beginner: {
      thcRange: "50-60% THC",
      amount: "1-2 second pull",
      timing: "Wait 10-20 minutes before more",
      notes: "Vapes are concentrated - start very small!",
    },
    intermediate: {
      thcRange: "60-80% THC",
      amount: "2-3 second pulls",
      timing: "Wait 10-15 minutes between sessions",
      notes: "Moderate your intake as effects come on faster.",
    },
    experienced: {
      thcRange: "80%+ THC",
      amount: "As comfortable",
      timing: "Based on personal preference",
      notes: "High-potency products still deserve respect.",
    },
  },
  edible: {
    beginner: {
      thcRange: "2.5-5mg THC",
      amount: "Half to one piece",
      timing: "Wait 2-3 hours before more",
      notes: "Edibles take longer - patience is key! Never double dose.",
    },
    intermediate: {
      thcRange: "5-15mg THC",
      amount: "1-2 pieces",
      timing: "Wait 1.5-2 hours before more",
      notes: "Effects last 4-8 hours. Plan accordingly.",
    },
    experienced: {
      thcRange: "15-50mg THC",
      amount: "Based on tolerance",
      timing: "Wait at least 1 hour before more",
      notes: "High doses can still surprise you. Stay hydrated.",
    },
  },
  tincture: {
    beginner: {
      thcRange: "2.5-5mg THC",
      amount: "0.25-0.5ml",
      timing: "Wait 30-60 minutes before more",
      notes: "Hold under tongue for 60 seconds for faster absorption.",
    },
    intermediate: {
      thcRange: "5-15mg THC",
      amount: "0.5-1ml",
      timing: "Wait 30-45 minutes before more",
      notes: "Sublingual absorption is faster than edibles.",
    },
    experienced: {
      thcRange: "15-30mg THC",
      amount: "1-2ml",
      timing: "Wait 20-30 minutes before more",
      notes: "Precise dosing is a benefit of tinctures.",
    },
  },
};

interface DosageCalculatorProps {
  className?: string;
}

const DosageCalculator = ({ className }: DosageCalculatorProps) => {
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const [selectedMethod, setSelectedMethod] = useState<ConsumptionMethod>(
    profile.consumptionMethod || "smoke"
  );
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>(
    profile.experienceLevel || "beginner"
  );

  const recommendation = dosageMatrix[selectedMethod][selectedExperience];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={className}
          aria-label={t.dosageCalculator}
        >
          <Calculator className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t.dosageCalculator}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These are general educational guidelines only. Individual responses vary significantly.
              Always start with the lowest suggested dose.
            </AlertDescription>
          </Alert>

          {/* Method Selection */}
          <div className="space-y-2">
            <Label>{t.consumptionMethod}</Label>
            <Select
              value={selectedMethod}
              onValueChange={(value) => setSelectedMethod(value as ConsumptionMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smoke">{t.smoke}</SelectItem>
                <SelectItem value="vape">{t.vape}</SelectItem>
                <SelectItem value="edible">{t.edible}</SelectItem>
                <SelectItem value="tincture">{t.tincture}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Selection */}
          <div className="space-y-2">
            <Label>{t.experienceLevel}</Label>
            <Select
              value={selectedExperience}
              onValueChange={(value) => setSelectedExperience(value as ExperienceLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t.beginner}</SelectItem>
                <SelectItem value="intermediate">{t.intermediate}</SelectItem>
                <SelectItem value="experienced">{t.experienced}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recommendation Card */}
          <Card className="bg-gradient-to-br from-hippie-purple/10 to-hippie-pink/10 border-hippie-purple/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-4 w-4 text-hippie-purple" />
                {t.recommendedDose}
              </CardTitle>
              <CardDescription>{t.startLow}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">THC Range</p>
                  <p className="font-semibold text-primary">{recommendation.thcRange}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-primary">{recommendation.amount}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Timing</p>
                <p className="font-medium">{recommendation.timing}</p>
              </div>
              
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground italic">
                  {recommendation.notes}
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert variant="default" className="bg-hippie-green/10 border-hippie-green/30">
            <Info className="h-4 w-4 text-hippie-green" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Cannabis affects everyone differently. Factors like body weight,
              metabolism, and recent food intake all influence effects. When in doubt, wait longer
              before taking more.
            </AlertDescription>
          </Alert>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DosageCalculator;
