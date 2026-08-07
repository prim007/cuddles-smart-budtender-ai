import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, ArrowRight, Search } from "lucide-react";
import { PLANT_GUIDE, PLANT_CATEGORIES, type PlantCategory } from "@/data/plantGuide";

const catColor = (c: PlantCategory) => {
  switch (c) {
    case "Herb": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    case "Vegetable": return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    case "Indigenous (SA)": return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20";
    case "Succulent": return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20";
    default: return "bg-primary/10 text-primary border-primary/20";
  }
};

const Plants = () => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PlantCategory | "All">("All");

  const plants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANT_GUIDE.filter((p) => {
      const matchesCat = active === "All" || p.category === active;
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.botanicalName.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, active]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Plant Care Directory",
    description:
      "Care guides for houseplants, herbs, vegetables, succulents and South African indigenous plants — light, water, soil, feeding and problem fixes.",
    url: "https://cuddles-ai.com/plants",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PLANT_GUIDE.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://cuddles-ai.com/plants/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <SEO
        title="Plant Care Guide | Houseplants, Herbs & SA Indigenous Plants"
        description="Browse Cuddles' plant care directory: light, water, soil, feeding and troubleshooting for houseplants, herbs, vegetables, succulents and South African indigenous plants."
        url="/plants"
        keywords="plant care guide, houseplant care, herb growing guide, indigenous South African plants, succulent care, vegetable growing, plant problems fix"
        structuredData={jsonLd}
      />
      <ThemeToggle />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sprout className="w-4 h-4" /> Plant Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Plant Care Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {PLANT_GUIDE.length} plants with light, water, soil, feeding and troubleshooting detail —
            the same knowledge Cuddles answers from in chat.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants, e.g. monstera or basil"
              aria-label="Search plants"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(["All", ...PLANT_CATEGORIES] as const).map((c) => (
            <Button
              key={c}
              size="sm"
              variant={active === c ? "default" : "outline"}
              onClick={() => setActive(c as PlantCategory | "All")}
            >
              {c}
            </Button>
          ))}
        </div>

        <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
          Browse all plants
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((p) => (
            <Link
              key={p.slug}
              to={`/plants/${p.slug}`}
              className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <p className="text-xs italic text-muted-foreground mb-3">{p.botanicalName}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className={catColor(p.category)}>{p.category}</Badge>
                <Badge variant="outline" className="bg-muted/50">{p.difficulty}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{p.summary}</p>
            </Link>
          ))}
        </div>

        {plants.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No plants match that search yet.</p>
        )}

        <div className="mt-12 p-6 rounded-2xl border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Cuddles is a plant expert first and a cannabis specialist second. Growing and consumption
            guidance is general education, not medical or legal advice.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Plants;
