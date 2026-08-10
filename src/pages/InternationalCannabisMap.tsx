import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import worldMap from "@/assets/world-map.jpg";
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
  region: string;
  status: LegalStatus;
  x: number; // % across world map
  y: number; // % down world map
  summary: string;
  details: string[];
  updated: string;
  slug?: string;
}

const countrySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const STATUS_META: Record<
  LegalStatus,
  { label: string; ring: string; chip: string; icon: typeof Leaf; blurb: string }
> = {
  recreational: {
    label: "Adult-use legal",
    ring: "ring-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.55)]",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
    icon: ShieldCheck,
    blurb: "Adults may legally purchase, possess or consume cannabis with limits.",
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
  // ————— Americas —————
  {
    name: "Canada", flag: "🇨🇦", region: "Americas", status: "recreational", x: 22, y: 22,
    summary: "Federally legal for adult use since the Cannabis Act (2018).",
    details: [
      "Adults 18/19+ (province-dependent) may buy from licensed retailers.",
      "Home cultivation up to 4 plants (except QC/MB).",
      "Health Canada oversees medical & commercial licensing.",
    ], updated: "2025",
  },
  {
    name: "United States", flag: "🇺🇸", region: "Americas", status: "medical", x: 22, y: 34,
    summary: "Federally illegal (Schedule I) but 24+ states allow adult use, 38+ medical.",
    details: [
      "State-by-state patchwork; DEA rescheduling to III proposed.",
      "Federal SAFE Banking Act still pending.",
      "Hemp <0.3% THC legal federally under 2018 Farm Bill.",
    ], updated: "2025",
  },
  {
    name: "Mexico", flag: "🇲🇽", region: "Americas", status: "decriminalized", x: 20, y: 42,
    summary: "Supreme Court struck down prohibition (2021); adult use effectively decriminalized.",
    details: ["Personal possession up to 28g permitted.", "Regulated retail market still pending legislation."],
    updated: "2024",
  },
  {
    name: "Uruguay", flag: "🇺🇾", region: "Americas", status: "recreational", x: 32, y: 78,
    summary: "First country to fully legalize adult use (2013).",
    details: ["Purchases via pharmacies, clubs or home-grow registry.", "IRCCA regulates the market."],
    updated: "2024",
  },
  {
    name: "Brazil", flag: "🇧🇷", region: "Americas", status: "medical", x: 35, y: 68,
    summary: "STF decriminalized personal possession (2024); medical imports allowed.",
    details: ["ANVISA authorises prescribed cannabis products.", "Recreational sale still prohibited."],
    updated: "2025",
  },
  {
    name: "Argentina", flag: "🇦🇷", region: "Americas", status: "medical", x: 31, y: 82,
    summary: "Medical & industrial framework since Law 27.350 (2017), expanded 2020.",
    details: ["REPROCANN registry for patient self-cultivation.", "Recreational use decriminalized in practice."],
    updated: "2024",
  },
  {
    name: "Colombia", flag: "🇨🇴", region: "Americas", status: "medical", x: 27, y: 55,
    summary: "Medical & industrial cannabis legal since 2016; leading LatAm exporter.",
    details: ["Personal dose (20g) decriminalized.", "Adult-use bill repeatedly debated."],
    updated: "2024",
  },
  {
    name: "Jamaica", flag: "🇯🇲", region: "Americas", status: "decriminalized", x: 26, y: 48,
    summary: "Ganja decriminalized (2015); medical & Rastafari sacramental use permitted.",
    details: ["Up to 2 oz possession is a petty offence.", "Licensed medical dispensaries operate island-wide."],
    updated: "2024",
  },

  // ————— Europe —————
  {
    name: "Germany", flag: "🇩🇪", region: "Europe", status: "recreational", x: 52, y: 26,
    summary: "Adult use legalised April 2024 via the Cannabis Act (CanG).",
    details: ["Adults may possess 25g in public, 50g at home, grow 3 plants.", "Non-profit cannabis clubs supply members.", "Commercial retail pilots being scoped."],
    updated: "2025",
  },
  {
    name: "Malta", flag: "🇲🇹", region: "Europe", status: "recreational", x: 52, y: 33,
    summary: "First EU country to legalise adult use (Dec 2021).",
    details: ["7g possession & 4 home plants allowed.", "Non-profit associations supply members."],
    updated: "2024",
  },
  {
    name: "Luxembourg", flag: "🇱🇺", region: "Europe", status: "recreational", x: 51, y: 26,
    summary: "Home cultivation & private use legalised (2023).",
    details: ["Up to 4 plants per household.", "No commercial retail yet."],
    updated: "2024",
  },
  {
    name: "Netherlands", flag: "🇳🇱", region: "Europe", status: "decriminalized", x: 51, y: 25,
    summary: "Tolerated coffeeshop model; regulated cultivation pilot underway (2024).",
    details: ["5g personal possession tolerated.", "Wietexperiment supplying licensed retailers in 10 cities."],
    updated: "2025",
  },
  {
    name: "Spain", flag: "🇪🇸", region: "Europe", status: "decriminalized", x: 48, y: 29,
    summary: "Private use tolerated; cannabis social clubs operate in grey zone.",
    details: ["Public consumption fined.", "Medical framework approved by Congress (2022)."],
    updated: "2024",
  },
  {
    name: "Portugal", flag: "🇵🇹", region: "Europe", status: "decriminalized", x: 46, y: 30,
    summary: "All drugs decriminalized for personal use since 2001.",
    details: ["Medical cannabis regulated by INFARMED (2018).", "Possession triggers health referral, not prosecution."],
    updated: "2024",
  },
  {
    name: "Czechia", flag: "🇨🇿", region: "Europe", status: "medical", x: 53, y: 26,
    summary: "Medical legal since 2013; adult-use bill drafted (2024).",
    details: ["Personal possession decriminalized (up to 10g).", "Reform coalition pushing regulated retail."],
    updated: "2025",
  },
  {
    name: "Switzerland", flag: "🇨🇭", region: "Europe", status: "medical", x: 52, y: 28,
    summary: "Medical legal (2022); adult-use pilot trials in Basel, Zurich, Bern.",
    details: ["Pilot participants buy from licensed pharmacies.", "CBD <1% THC sold legally."],
    updated: "2025",
  },
  {
    name: "United Kingdom", flag: "🇬🇧", region: "Europe", status: "medical", x: 49, y: 24,
    summary: "Medical cannabis legal via specialist prescription (2018).",
    details: ["NHS scripts remain rare; private clinics dominate.", "Recreational use remains a Class B offence."],
    updated: "2024",
  },
  {
    name: "France", flag: "🇫🇷", region: "Europe", status: "medical", x: 50, y: 27,
    summary: "Medical pilot programme extended in 2024; recreational remains illegal.",
    details: ["CBD <0.3% THC legalised (2022 court ruling).", "Full medical framework expected 2026."],
    updated: "2024",
  },
  {
    name: "Italy", flag: "🇮🇹", region: "Europe", status: "medical", x: 52, y: 30,
    summary: "State-run medical cultivation via Military Pharmaceutical Chemical Plant.",
    details: ["Home-grow ruled non-criminal by Cassazione (2019).", "Referendum on decrim blocked in 2022."],
    updated: "2024",
  },

  // ————— Africa —————
  {
    name: "South Africa", flag: "🇿🇦", region: "Africa", status: "recreational", x: 56, y: 78,
    summary: "Adult private use & cultivation legal (2018 ConCourt; 2024 CfPP Act).",
    details: ["Adults may possess, cultivate, consume cannabis privately.", "Commercial sale regulated by SAHPRA (medical).", "Hemp regulated by DALRRD."],
    updated: "2025",
  },
  { name: "Lesotho", flag: "🇱🇸", region: "Africa", status: "medical", x: 57, y: 76,
    summary: "First African country to license medical cultivation (2017).",
    details: ["Export-oriented cultivation sector.", "Recreational use prohibited."], updated: "2024" },
  { name: "Malawi", flag: "🇲🇼", region: "Africa", status: "medical", x: 59, y: 68,
    summary: "Cannabis Regulation Act 2020 — medical & hemp legal.",
    details: ["Cannabis Regulatory Authority issues licences.", "Recreational use still criminal."], updated: "2024" },
  { name: "Zimbabwe", flag: "🇿🇼", region: "Africa", status: "medical", x: 58, y: 71,
    summary: "Medical & scientific cannabis legalised 2018.",
    details: ["Licensed producers may export.", "Industrial hemp actively promoted."], updated: "2024" },
  { name: "Morocco", flag: "🇲🇦", region: "Africa", status: "medical", x: 47, y: 34,
    summary: "Medical, cosmetic & industrial use legalised 2021 (Law 13-21).",
    details: ["ANRAC regulates Rif region cooperatives.", "Recreational use illegal."], updated: "2024" },
  { name: "Ghana", flag: "🇬🇭", region: "Africa", status: "hemp-only", x: 49, y: 55,
    summary: "Narcotics Control Commission Act 2020 permits hemp.",
    details: ["Hemp <0.3% THC allowed.", "Recreational possession criminal."], updated: "2024" },
  { name: "Nigeria", flag: "🇳🇬", region: "Africa", status: "illegal", x: 51, y: 55,
    summary: "Strict prohibition under NDLEA Act.",
    details: ["Largest illicit producer in West Africa.", "Reform debates ongoing."], updated: "2024" },
  { name: "Egypt", flag: "🇪🇬", region: "Africa", status: "illegal", x: 55, y: 36,
    summary: "Cannabis prohibited; severe trafficking penalties.",
    details: ["Custodial sentences common."], updated: "2024" },
  { name: "Kenya", flag: "🇰🇪", region: "Africa", status: "illegal", x: 59, y: 60,
    summary: "Illegal; Mghanga reform bill tabled 2023.",
    details: ["Active civil-society reform movement."], updated: "2024" },

  // ————— Middle East & Asia —————
  {
    name: "Israel", flag: "🇮🇱", region: "Middle East", status: "medical", x: 55, y: 35,
    summary: "World leader in cannabis research; expansive medical programme.",
    details: ["Recreational possession decriminalized (2019).", "Major exporter to EU markets."],
    updated: "2024",
  },
  {
    name: "Lebanon", flag: "🇱🇧", region: "Middle East", status: "medical", x: 55, y: 33,
    summary: "Medical & industrial cultivation legalised 2020.",
    details: ["Bekaa Valley licensing framework rolling out.", "Recreational use remains illegal."],
    updated: "2024",
  },
  {
    name: "Thailand", flag: "🇹🇭", region: "Asia-Pacific", status: "medical", x: 74, y: 50,
    summary: "Decriminalised in 2022; recriminalisation tightened to medical-only (2025).",
    details: ["Retail dispensaries pivot to prescription-based sales.", "Home cultivation still allowed with registration."],
    updated: "2025",
  },
  {
    name: "Japan", flag: "🇯🇵", region: "Asia-Pacific", status: "medical", x: 84, y: 32,
    summary: "Medical CBD-based Epidiolex approved 2024; recreational strictly illegal.",
    details: ["New Cannabis Control Act criminalises personal use.", "CBD products regulated by MHLW."],
    updated: "2025",
  },
  {
    name: "South Korea", flag: "🇰🇷", region: "Asia-Pacific", status: "medical", x: 82, y: 31,
    summary: "First East Asian nation to legalise medical cannabis (2018).",
    details: ["Only imported cannabinoid pharmaceuticals allowed.", "Recreational use punished even abroad."],
    updated: "2024",
  },
  {
    name: "India", flag: "🇮🇳", region: "Asia-Pacific", status: "illegal", x: 70, y: 44,
    summary: "NDPS Act prohibits resin/flower; bhang tolerated in several states.",
    details: ["Ayurvedic medical use permitted in limited cases.", "Uttarakhand pilot for hemp cultivation."],
    updated: "2024",
  },
  {
    name: "China", flag: "🇨🇳", region: "Asia-Pacific", status: "illegal", x: 78, y: 34,
    summary: "Strict prohibition; hemp cultivation permitted in Yunnan & Heilongjiang.",
    details: ["Major CBD raw-material exporter (banned domestically).", "Harsh penalties for possession."],
    updated: "2024",
  },

  // ————— Oceania —————
  {
    name: "Australia", flag: "🇦🇺", region: "Oceania", status: "medical", x: 84, y: 72,
    summary: "Medical legal federally (2016); ACT decriminalised adult use (2020).",
    details: ["TGA authorises specialist prescriptions.", "Recreational use policy varies by state/territory."],
    updated: "2025",
  },
  {
    name: "New Zealand", flag: "🇳🇿", region: "Oceania", status: "medical", x: 92, y: 80,
    summary: "Medicinal Cannabis Scheme active since 2020; 2020 recreational referendum failed 50.7-48.4%.",
    details: ["Pharmacies dispense prescribed products.", "Recreational possession remains an offence."],
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

const REGIONS = ["All", "Americas", "Europe", "Africa", "Middle East", "Asia-Pacific", "Oceania"];

const InternationalCannabisMap = () => {
  const [searchParams] = useSearchParams();
  const initialRegion = (() => {
    const r = searchParams.get("region");
    if (!r) return "All";
    const match = REGIONS.find((x) => x.toLowerCase() === r.toLowerCase());
    return match ?? "All";
  })();
  const [active, setActive] = useState<CountryNode | null>(null);
  const [filter, setFilter] = useState<LegalStatus | "all">("all");
  const [region, setRegion] = useState<string>(initialRegion);
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const searched = useMemo(
    () => COUNTRIES.filter((c) => q === "" || c.name.toLowerCase().includes(q)),
    [q]
  );

  const visible = useMemo(
    () =>
      searched.filter(
        (c) =>
          (filter === "all" || c.status === filter) &&
          (region === "All" || c.region === region)
      ),
    [searched, filter, region]
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: searched.length };
    for (const c of searched) out[c.status] = (out[c.status] ?? 0) + 1;
    return out;
  }, [searched]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-hippie-purple/5">
      <SEO
        title="International Cannabis Legislation Map | Cuddles AI"
        description="Interactive country-by-country guide to global cannabis & hemp laws — the Americas, Europe, Africa, Middle East, Asia-Pacific and Oceania. Curated by Cuddles."
        url="/international-cannabis-map"
        keywords="global cannabis laws, international cannabis legislation, cannabis legal status by country, world cannabis map, medical cannabis countries, recreational cannabis countries"
      />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Cuddles
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-hippie-coral to-hippie-amber text-white border-0">
            🌍 Cuddles World Atlas
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-hippie-coral via-hippie-amber to-hippie-green bg-clip-text text-transparent mb-3">
            International Cannabis Legislation Map
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tap any Cuddles pin to see the current cannabis & hemp legal status in that country.
            Curated and continuously updated by the Cuddles research team.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
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
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium border transition-all",
                  region === r
                    ? "bg-hippie-coral text-white border-hippie-coral"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-elevated bg-card">
          <div className="relative w-full aspect-[16/9]">
            <img
              src={worldMap}
              alt="Stylised illustrated map of the world"
              className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
              width={1920}
              height={1080}
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
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "relative w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 transition-all duration-300 bg-background/80 backdrop-blur-sm",
                        meta.ring,
                        isHover && "scale-125 -translate-y-1 z-10"
                      )}
                    >
                      <img
                        src={cuddlesChar}
                        alt=""
                        className="w-full h-full object-contain p-0.5 drop-shadow"
                      />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px]">
                        {c.flag}
                      </span>
                    </div>
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

        {/* Directory */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-hippie-coral" /> Country directory
            <span className="text-sm text-muted-foreground font-normal ml-2">({visible.length})</span>
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
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{c.region}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {c.summary}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
                      <div className="text-xs text-muted-foreground">{active.region}</div>
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
                    <Link to="/chat" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-hippie-coral to-hippie-amber text-white">
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

export default InternationalCannabisMap;
