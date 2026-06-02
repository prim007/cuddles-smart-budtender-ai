import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Scale, Leaf, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import africaMap from "@/assets/africa-map.jpg";
import cuddlesChar from "@/assets/cuddles.png";

type LegalStatus =
  | "recreational"
  | "medical"
  | "decriminalized"
  | "hemp-only"
  | "illegal";

interface CountryNode {
  name: string;
  flag: string;
  status: LegalStatus;
  // % of the map background image
  x: number;
  y: number;
  summary: string;
  details: string[];
  updated: string;
}

const STATUS_META: Record<
  LegalStatus,
  { label: string; ring: string; chip: string; icon: typeof Leaf; blurb: string }
> = {
  recreational: {
    label: "Adult-use friendly",
    ring: "ring-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.55)]",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
    icon: ShieldCheck,
    blurb: "Personal adult-use is permitted in private with limits.",
  },
  medical: {
    label: "Medical program",
    ring: "ring-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.55)]",
    chip: "bg-amber-400/15 text-amber-200 border-amber-300/40",
    icon: Leaf,
    blurb: "Licensed medical cannabis framework in force.",
  },
  decriminalized: {
    label: "Decriminalized",
    ring: "ring-sky-300 shadow-[0_0_24px_rgba(125,211,252,0.55)]",
    chip: "bg-sky-400/15 text-sky-200 border-sky-300/40",
    icon: Scale,
    blurb: "Small-quantity possession is non-criminal in practice.",
  },
  "hemp-only": {
    label: "Industrial hemp",
    ring: "ring-lime-300 shadow-[0_0_24px_rgba(190,242,100,0.55)]",
    chip: "bg-lime-400/15 text-lime-200 border-lime-300/40",
    icon: Sparkles,
    blurb: "Hemp (<0.3% THC) cultivation legalised for industry.",
  },
  illegal: {
    label: "Prohibited",
    ring: "ring-rose-400 shadow-[0_0_24px_rgba(251,113,133,0.55)]",
    chip: "bg-rose-500/15 text-rose-200 border-rose-400/40",
    icon: ShieldAlert,
    blurb: "Cannabis is illegal under current statute.",
  },
};

const COUNTRIES: CountryNode[] = [
  {
    name: "South Africa",
    flag: "🇿🇦",
    status: "recreational",
    x: 52, y: 77,
    summary: "Adult private use & cultivation legal (2018 ConCourt ruling, 2024 Cannabis for Private Purposes Act).",
    details: [
      "Adults may possess, cultivate and consume cannabis privately.",
      "Commercial sale remains regulated; medical licensing via SAHPRA.",
      "Hemp regulated separately under DALRRD permits.",
    ],
    updated: "2024",
  },
  {
    name: "Lesotho",
    flag: "🇱🇸",
    status: "medical",
    x: 55, y: 76,
    summary: "First African country to license medical cannabis cultivation (2017).",
    details: [
      "Robust export-oriented medical cultivation sector.",
      "Recreational use remains prohibited.",
    ],
    updated: "2023",
  },
  {
    name: "Zimbabwe",
    flag: "🇿🇼",
    status: "medical",
    x: 57, y: 67,
    summary: "Medical & scientific cannabis legalised in 2018; hemp commercialised.",
    details: [
      "Licensed producers may cultivate for medical & research export.",
      "Industrial hemp (<1% THC under ZW law) actively promoted.",
    ],
    updated: "2024",
  },
  {
    name: "Malawi",
    flag: "🇲🇼",
    status: "medical",
    x: 60, y: 64,
    summary: "Cannabis Regulation Act 2020 — medical & industrial hemp legal.",
    details: [
      "Cannabis Regulatory Authority issues cultivation, processing & sale licences.",
      "Recreational use illegal; possession still penalised.",
    ],
    updated: "2024",
  },
  {
    name: "Mozambique",
    flag: "🇲🇿",
    status: "illegal",
    x: 60, y: 70,
    summary: "Cannabis remains illegal; medical framework under discussion.",
    details: ["No formal medical programme yet.", "Enforcement is inconsistent in rural areas."],
    updated: "2024",
  },
  {
    name: "Zambia",
    flag: "🇿🇲",
    status: "medical",
    x: 55, y: 64,
    summary: "Cabinet approved medical & export licensing in 2019.",
    details: ["Cultivation licences cost ~USD 250k.", "Hemp regulation taking shape."],
    updated: "2023",
  },
  {
    name: "Ghana",
    flag: "🇬🇭",
    status: "hemp-only",
    x: 38, y: 47,
    summary: "Narcotics Control Commission Act 2020 permits hemp cultivation.",
    details: [
      "Hemp <0.3% THC allowed for industrial & medical use.",
      "Recreational possession still criminal.",
    ],
    updated: "2024",
  },
  {
    name: "Nigeria",
    flag: "🇳🇬",
    status: "illegal",
    x: 44, y: 47,
    summary: "Strict prohibition under NDLEA Act.",
    details: ["Largest illicit producer in West Africa.", "Periodic reform debates in National Assembly."],
    updated: "2024",
  },
  {
    name: "Morocco",
    flag: "🇲🇦",
    status: "medical",
    x: 36, y: 22,
    summary: "Legalised medical, cosmetic & industrial use in 2021 (Law 13-21).",
    details: ["ANRAC regulates licensed cooperatives in Rif region.", "Recreational use illegal."],
    updated: "2024",
  },
  {
    name: "Egypt",
    flag: "🇪🇬",
    status: "illegal",
    x: 57, y: 25,
    summary: "Cannabis prohibited; severe penalties for trafficking.",
    details: ["Possession can result in lengthy custodial sentences."],
    updated: "2024",
  },
  {
    name: "Kenya",
    flag: "🇰🇪",
    status: "illegal",
    x: 63, y: 56,
    summary: "Illegal, but legalisation bills tabled (Mghanga Bill 2023).",
    details: ["Active civil-society reform movement.", "Hemp pilots under discussion."],
    updated: "2024",
  },
  {
    name: "Uganda",
    flag: "🇺🇬",
    status: "medical",
    x: 59, y: 54,
    summary: "Licensed medical cultivation for export since 2015.",
    details: ["Strict export-only model.", "Domestic use remains illegal."],
    updated: "2023",
  },
  {
    name: "Rwanda",
    flag: "🇷🇼",
    status: "medical",
    x: 58, y: 57,
    summary: "Medical export framework approved 2021.",
    details: ["Cultivation licences only for export of processed product."],
    updated: "2023",
  },
  {
    name: "DRC",
    flag: "🇨🇩",
    status: "illegal",
    x: 54, y: 56,
    summary: "Cannabis illegal; one of the continent's largest informal producers.",
    details: ["No formal medical programme."],
    updated: "2024",
  },
  {
    name: "Ethiopia",
    flag: "🇪🇹",
    status: "illegal",
    x: 63, y: 48,
    summary: "Prohibited under federal law.",
    details: ["No medical exceptions formalised."],
    updated: "2024",
  },
  {
    name: "Tunisia",
    flag: "🇹🇳",
    status: "decriminalized",
    x: 46, y: 19,
    summary: "Law 52 reformed in 2017 — first offences avoid prison.",
    details: ["Possession remains an offence but with reduced penalties."],
    updated: "2023",
  },
  {
    name: "Senegal",
    flag: "🇸🇳",
    status: "illegal",
    x: 30, y: 40,
    summary: "Cannabis illegal under 1997 narcotics code.",
    details: ["Hemp legislation under early consideration."],
    updated: "2024",
  },
  {
    name: "Madagascar",
    flag: "🇲🇬",
    status: "illegal",
    x: 70, y: 73,
    summary: "Illegal under 1997 narcotics law.",
    details: ["Active informal cultivation in highlands."],
    updated: "2024",
  },
  {
    name: "Tanzania",
    flag: "🇹🇿",
    status: "illegal",
    x: 61, y: 60,
    summary: "Illegal with strict enforcement.",
    details: ["No medical framework."],
    updated: "2024",
  },
  {
    name: "Eswatini",
    flag: "🇸🇿",
    status: "illegal",
    x: 58, y: 75,
    summary: "Illegal — but reform debates active; major informal producer.",
    details: ["Famed 'Swazi Gold' landrace from this region."],
    updated: "2024",
  },
  {
    name: "Botswana",
    flag: "🇧🇼",
    status: "illegal",
    x: 53, y: 72,
    summary: "Illegal; hemp legislation under review.",
    details: ["Government exploring hemp framework alongside SACU partners."],
    updated: "2024",
  },
  {
    name: "Namibia",
    flag: "🇳🇦",
    status: "illegal",
    x: 49, y: 72,
    summary: "Illegal — High Court challenge ongoing.",
    details: ["Civil-society push for SA-style private-use ruling."],
    updated: "2024",
  },
];

const STATUS_FILTERS: { id: LegalStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "recreational", label: "Adult-use" },
  { id: "medical", label: "Medical" },
  { id: "decriminalized", label: "Decriminalized" },
  { id: "hemp-only", label: "Hemp only" },
  { id: "illegal", label: "Prohibited" },
];

const AfricaLegislationMap = () => {
  const [active, setActive] = useState<CountryNode | null>(null);
  const [filter, setFilter] = useState<LegalStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      COUNTRIES.filter(
        (c) =>
          (filter === "all" || c.status === filter) &&
          (query === "" || c.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [filter, query]
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: COUNTRIES.length };
    for (const c of COUNTRIES) out[c.status] = (out[c.status] ?? 0) + 1;
    return out;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-hippie-purple/5">
      <SEO
        title="African Cannabis Legislation Map | Cuddles AI"
        description="Interactive country-by-country guide to cannabis & hemp laws across Africa — South Africa, Ghana, Malawi, Zimbabwe, Morocco and more. Curated by Cuddles."
        canonical="https://cuddles-ai.com/africa-cannabis-map"
      />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Cuddles
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-hippie-coral to-hippie-amber text-white border-0">
            🌍 Cuddles Africa Atlas
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-hippie-coral via-hippie-amber to-hippie-green bg-clip-text text-transparent mb-3">
            African Cannabis Legislation Map
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tap any Cuddles to see the current cannabis & hemp legal status in that country.
            Curated and continuously updated by the Cuddles research team.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a country…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  filter === f.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label} <span className="opacity-60 ml-1">{counts[f.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-elevated bg-card">
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/10]">
            <img
              src={africaMap}
              alt="Stylised illustrated map of Africa"
              className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />

            {visible.map((c) => {
              const meta = STATUS_META[c.status];
              const isHover = hovered === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setActive(c)}
                  onMouseEnter={() => setHovered(c.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-full group focus:outline-none"
                  aria-label={`${c.name} – ${meta.label}`}
                >
                  {/* Cuddles pin */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "relative w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 transition-all duration-300 bg-background/80 backdrop-blur-sm",
                        meta.ring,
                        isHover && "scale-125 -translate-y-1"
                      )}
                    >
                      <img
                        src={cuddlesChar}
                        alt=""
                        className="w-full h-full object-contain p-0.5 drop-shadow"
                      />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">
                        {c.flag}
                      </span>
                    </div>
                    {/* tooltip */}
                    <div
                      className={cn(
                        "mt-2 px-2 py-1 rounded-md text-[10px] md:text-xs font-medium whitespace-nowrap border bg-card/95 backdrop-blur transition-all duration-200 pointer-events-none",
                        isHover ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                      )}
                    >
                      {c.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 p-4 border-t border-border bg-card/60 backdrop-blur">
            {(Object.keys(STATUS_META) as LegalStatus[]).map((s) => {
              const m = STATUS_META[s];
              const Icon = m.icon;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className={cn("w-3 h-3 rounded-full ring-2", m.ring)} />
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-muted-foreground">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick grid below map for accessibility / mobile scanability */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-hippie-coral" /> Country directory
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map((c) => {
              const meta = STATUS_META[c.status];
              return (
                <button
                  key={c.name}
                  onClick={() => setActive(c)}
                  className="text-left p-4 rounded-2xl border border-border bg-card hover:border-hippie-coral/50 hover:shadow-elevated transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{c.flag}</span>
                    <Badge variant="outline" className={cn("text-[10px]", meta.chip)}>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {c.summary}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground mt-10 text-center max-w-2xl mx-auto">
          ⚠️ Cuddles provides general cannabis education only — not legal advice.
          Laws change rapidly; always confirm with a qualified local source before acting.
        </p>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {active && (() => {
            const meta = STATUS_META[active.status];
            const Icon = meta.icon;
            return (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative w-14 h-14 rounded-full ring-2 bg-background/80 ring-hippie-coral/60">
                      <img src={cuddlesChar} alt="" className="w-full h-full object-contain p-0.5" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-base">
                        {active.flag}
                      </span>
                    </div>
                    <div>
                      <SheetTitle className="text-2xl">{active.name}</SheetTitle>
                      <Badge variant="outline" className={cn("mt-1", meta.chip)}>
                        <Icon className="w-3 h-3 mr-1" /> {meta.label}
                      </Badge>
                    </div>
                  </div>
                  <SheetDescription className="text-base text-foreground">
                    {active.summary}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Cuddles take
                    </div>
                    <p className="text-sm">{meta.blurb}</p>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Key points
                    </div>
                    <ul className="space-y-2">
                      {active.details.map((d, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <Leaf className="w-4 h-4 mt-0.5 text-hippie-green shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last reviewed by Cuddles: <strong>{active.updated}</strong>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link to="/blog" className="flex-1">
                      <Button variant="outline" className="w-full">Read blog</Button>
                    </Link>
                    <Link to="/#demo" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-hippie-coral to-hippie-amber text-white border-0">
                        Ask Cuddles
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AfricaLegislationMap;
