import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import {
  dosageMatrix,
  type ConsumptionMethod,
  type ExperienceLevel,
} from "@/components/DosageCalculator";
import { useUserProfile } from "@/contexts/UserProfileContext";

const METHODS: { id: ConsumptionMethod; label: string }[] = [
  { id: "smoke", label: "Smoking" },
  { id: "vape", label: "Vaping" },
  { id: "edible", label: "Edibles" },
  { id: "tincture", label: "Tinctures" },
];

const LEVELS: { id: ExperienceLevel; label: string }[] = [
  { id: "beginner", label: "New to it" },
  { id: "intermediate", label: "Some experience" },
  { id: "experienced", label: "Experienced" },
];

const DosageGuidePanel = () => {
  const { profile } = useUserProfile();
  const [method, setMethod] = useState<ConsumptionMethod>(profile.consumptionMethod || "smoke");
  const [level, setLevel] = useState<ExperienceLevel>(profile.experienceLevel || "beginner");

  const rec = dosageMatrix[method][level];

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          General education only, not medical advice. Everyone reacts differently — always start with
          the smallest amount and wait.
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">How are you taking it?</h3>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={method === m.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setMethod(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">How much experience do you have?</h3>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <Button
              key={l.id}
              size="sm"
              variant={level === l.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setLevel(l.id)}
            >
              {l.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Where to start</CardTitle>
          <CardDescription>Go low, go slow, and give it time to arrive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Strength to look for</p>
              <p className="font-semibold text-primary">{rec.thcRange}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-semibold text-primary">{rec.amount}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Timing</p>
            <p className="font-medium">{rec.timing}</p>
          </div>
          <p className="border-t border-border/50 pt-3 text-sm text-muted-foreground">{rec.notes}</p>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Body weight, food and recent use all change how something feels. When in doubt, wait longer
          before having more.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DosageGuidePanel;
