import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanText, FileText, Sparkles, ArrowRight, Check } from "lucide-react";
import ocrDemoLabel from "@/assets/ocr-demo-label.jpg";

type DemoId = "ocr" | "menu" | "match";

const tabs: { id: DemoId; label: string; icon: typeof ScanText }[] = [
  { id: "ocr", label: "Read any label", icon: ScanText },
  { id: "menu", label: "Pull a live menu", icon: FileText },
  { id: "match", label: "Match by feeling", icon: Sparkles },
];

const ocrFields: [string, string][] = [
  ["Brand", "TRIPPLE FOUR"],
  ["Product", "Blue Dream"],
  ["THC", "22.4%"],
  ["CBD", "0.8%"],
  ["Batch No.", "TF-2291-A"],
  ["Lab", "GreenLeaf Analytics"],
  ["Tested", "2026-03-14"],
  ["Net Weight", "3.5 g"],
];

const menuRows: [string, string][] = [
  ["Blue Dream — 3.5g", "R450"],
  ["Gelato 41 — 3.5g", "R520"],
  ["Live Resin Vape", "R390"],
  ["Full Spectrum Oil 30ml", "R320"],
];

const matchChips = ["Deep sleep", "No anxiety", "Body-heavy", "Myrcene forward"];

const SeeItInAction = () => {
  const [active, setActive] = useState<DemoId>("ocr");

  return (
    <section id="see-it-in-action" className="py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Live demos</p>
          <h2 className="font-display font-bold text-foreground mb-6 text-balance">
            See it <span className="gradient-text">in action</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Three things Cuddles does that no other budtender in South Africa does — shown, not told.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto">
          {active === "ocr" && (
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              <Card className="overflow-hidden">
                <div className="px-5 pt-5">
                  <Badge variant="outline">Before — your photo</Badge>
                </div>
                <CardContent className="p-5">
                  <img
                    src={ocrDemoLabel}
                    alt="Cannabis jar label photographed for AI text extraction"
                    loading="lazy"
                    className="w-full rounded-xl object-cover max-h-80"
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="px-5 pt-5 flex items-center gap-2">
                  <Badge className="bg-primary/15 text-primary border-primary/40">After — extracted</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">98% legible</span>
                </div>
                <CardContent className="p-5 grid grid-cols-2 gap-3">
                  {ocrFields.map(([label, value]) => (
                    <div key={label} className="p-3 rounded-lg bg-muted/60">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <p className="font-medium text-sm break-words">{value}</p>
                    </div>
                  ))}
                  <p className="col-span-2 text-xs text-muted-foreground">
                    Printed COA values override the AI's visual estimate — don't trust the sticker, verify it.
                  </p>
                </CardContent>
              </Card>

              <div className="md:col-span-2 text-center">
                <Button asChild>
                  <Link to="/scanner" aria-label="Try the Cuddles strain and label scanner">
                    Scan your own label <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {active === "menu" && (
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="rounded-xl bg-muted/60 p-3 text-sm">
                    <span className="text-xs text-muted-foreground block mb-1">You type</span>
                    “show me the dirty vapes menu”
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-sm">
                    <span className="text-xs text-muted-foreground block mb-1">Cuddles replies</span>
                    Instantly renders the partner's live menu card in the chat — no PDF download, no hallucinated prices.
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="px-5 pt-5">
                  <Badge variant="outline">Menu card</Badge>
                </div>
                <CardContent className="p-5 space-y-2">
                  {menuRows.map(([item, price]) => (
                    <div key={item} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <span>{item}</span>
                      <span className="font-medium">{price}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="md:col-span-2 text-center">
                <Button asChild>
                  <Link to="/dirty-vapes" aria-label="Open the Dirty Vapes live menu page">
                    Open a live menu <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {active === "match" && (
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="rounded-xl bg-muted/60 p-3 text-sm">
                    <span className="text-xs text-muted-foreground block mb-1">You say</span>
                    “I want to sleep but I get anxious easily”
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchChips.map((chip) => (
                      <Badge key={chip} variant="secondary">
                        <Check className="w-3 h-3 mr-1" />
                        {chip}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cuddles translates plain feelings into terpene and cannabinoid parameters, then filters real stock.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="rounded-xl border border-border p-4">
                    <p className="font-display font-bold text-lg">Granddaddy Purple</p>
                    <Badge className="mt-1 bg-primary/15 text-primary border-primary/40">Indica</Badge>
                    <p className="text-sm text-muted-foreground mt-3">
                      Myrcene-dominant, low-THC-anxiety profile. Sedating within 45 minutes, minimal head-race.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    General cannabis education only — not medical advice.
                  </p>
                </CardContent>
              </Card>

              <div className="md:col-span-2 text-center">
                <Button asChild>
                  <Link to="/chat" aria-label="Chat with the Cuddles AI budtender">
                    Ask Cuddles yourself <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SeeItInAction;
