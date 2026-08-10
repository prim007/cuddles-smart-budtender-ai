import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Scale, Info, MessageCircle, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";

type LegalStatus = "recreational" | "medical" | "decriminalized" | "hemp-only" | "illegal";

interface CountryInfo {
  name: string;
  flag: string;
  status: LegalStatus;
  statusLabel: string;
  summary: string;
  details: string[];
  currency: string;
  priceExamples: string[];
  localStrains: string[];
  cta: string;
}

const COUNTRY_DB: Record<string, CountryInfo> = {
  ghana: {
    name: "Ghana",
    flag: "🇬🇭",
    status: "hemp-only",
    statusLabel: "Industrial hemp legal",
    summary:
      "Ghana permits industrial hemp cultivation under the Narcotics Control Commission Act, 2020 (Act 1019). Hemp is defined as cannabis with less than 0.3% THC. Recreational cannabis remains illegal.",
    details: [
      "Licences for hemp cultivation and processing are issued by the Narcotics Control Commission.",
      "THC above 0.3% is treated as a narcotic; possession can lead to prosecution.",
      "Medical cannabis is not yet a formal, accessible programme, though reform discussions continue.",
      "CBD and hemp-derived products remain tightly regulated; import cautiously.",
    ],
    currency: "GHS",
    priceExamples: [
      "CBD oil (30 ml): ~GHS 150–350 (imported)",
      "Hemp seeds: ~GHS 50–120 per 100 g",
      "THC products: not legally available",
    ],
    localStrains: ["Hemp varieties (low THC)", "Imported CBD isolates"],
    cta:
      "Ask Cuddles about legal hemp products, CBD basics, and how to stay on the right side of Ghanaian law.",
  },
  malawi: {
    name: "Malawi",
    flag: "🇲🇼",
    status: "medical",
    statusLabel: "Medical & hemp legal",
    summary:
      "Malawi passed the Cannabis Regulation Act, 2020, creating a legal framework for medicinal cannabis, industrial hemp, and scientific research. The Cannabis Regulatory Authority (CRA) issues licences.",
    details: [
      "Licences cover cultivation, processing, distribution, export, and research.",
      "Recreational cannabis use and possession remain illegal.",
      "Malawi is positioning itself as a regional medical-cannabis exporter.",
      "Patient access through licensed medical channels is still developing.",
    ],
    currency: "MWK",
    priceExamples: [
      "Medical cannabis oil (imported): ~MWK 80,000–200,000",
      "Hemp fibre products: ~MWK 5,000–15,000",
      "Street pricing is illegal and unregulated.",
    ],
    localStrains: ["Malawi Gold (legacy landrace, unregulated)", "Licensed medical cultivars"],
    cta:
      "Ask Cuddles about Malawi's medical cannabis licences, hemp opportunities, and how to find legal products.",
  },
  zimbabwe: {
    name: "Zimbabwe",
    flag: "🇿🇼",
    status: "medical",
    statusLabel: "Medical & scientific legal",
    summary:
      "Zimbabwe legalised cannabis for medicinal and scientific use in 2018. The Medicines Control Authority of Zimbabwe (MCAZ) regulates the sector, with a strong export focus.",
    details: [
      "Cultivation, production, and distribution require a licence from the Ministry of Health.",
      "Recreational use remains prohibited and possession is criminal.",
      "Industrial hemp is promoted as a separate crop with lower THC thresholds.",
      "Most production is export-oriented; domestic patient access is limited.",
    ],
    currency: "ZWL",
    priceExamples: [
      "Medical cannabis oil: ~USD 80–200 (often USD-priced)",
      "Hemp seed/oil: ~ZWL 15,000–40,000",
      "Recreational products are not legally sold.",
    ],
    localStrains: ["Licensed medical hybrids", "Industrial hemp varieties"],
    cta:
      "Ask Cuddles about Zimbabwe's cannabis licences, export rules, and responsible medical use.",
  },
};

const STATUS_STYLES: Record<LegalStatus, string> = {
  recreational: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  medical: "bg-amber-400/15 text-amber-200 border-amber-300/40",
  decriminalized: "bg-sky-400/15 text-sky-200 border-sky-300/40",
  "hemp-only": "bg-lime-400/15 text-lime-200 border-lime-300/40",
  illegal: "bg-rose-500/15 text-rose-200 border-rose-400/40",
};

const CountryPage = () => {
  const { country } = useParams<{ country: string }>();
  const data = country ? COUNTRY_DB[country.toLowerCase()] : undefined;

  if (!data) {
    return (
      <div className="min-h-screen bg-background py-24 text-center">
        <SEO title="Country not found | Cuddles AI" noindex url={`/country/${country}`} />
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Country page not found</h1>
          <p className="mt-2 text-muted-foreground">
            We haven't built a local guide for that country yet.
          </p>
          <Link to="/international-cannabis-map">
            <Button variant="outline" className="mt-4">View the world map</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Cannabis laws in ${data.name} (2026) | Cuddles AI`}
        description={`${data.summary} Updated 2026 guide to legal status, hemp, medical cannabis, prices, and local strains in ${data.name}.`}
        url={`/country/${country?.toLowerCase()}`}
        keywords={`${data.name} cannabis laws, ${data.name} hemp legal, ${data.name} medical cannabis, cannabis legal status ${data.name}, ${data.name} CBD`}
      />

      <div className="container mx-auto max-w-4xl px-4 py-24">
        <Link
          to="/international-cannabis-map"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to International Cannabis Map
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label={`${data.name} flag`}>
              {data.flag}
            </span>
            <h1 className="font-display text-4xl font-bold text-foreground">
              Cannabis & hemp in {data.name}
            </h1>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={cn("border", STATUS_STYLES[data.status])}>
              <Scale className="mr-1.5 h-3 w-3" />
              {data.statusLabel}
            </Badge>
            <span className="text-sm text-muted-foreground">Updated 2026</span>
          </div>
        </div>

        <Card className="mb-6 p-6">
          <h2 className="font-display mb-3 text-xl font-semibold text-foreground">Legal summary</h2>
          <p className="leading-relaxed text-foreground/90">{data.summary}</p>
          <ul className="mt-4 space-y-2">
            {data.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {d}
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-display mb-3 text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Local prices
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Approximate local prices in {data.currency}. Street/recreational prices are not listed because they are illegal or unregulated.
            </p>
            <ul className="space-y-2">
              {data.priceExamples.map((p, i) => (
                <li key={i} className="text-sm text-foreground/90">• {p}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display mb-3 text-lg font-semibold text-foreground flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" /> Local strains & products
            </h2>
            <ul className="space-y-2">
              {data.localStrains.map((s, i) => (
                <li key={i} className="text-sm text-foreground/90">• {s}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-gradient-to-br from-hippie-coral/10 to-hippie-amber/10 border-hippie-coral/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Ask Cuddles about {data.name}</h2>
              <p className="text-sm text-muted-foreground">{data.cta}</p>
            </div>
            <Link to="/education/chat-with-cuddles">
              <Button className="whitespace-nowrap">
                <MessageCircle className="mr-2 h-4 w-4" /> Chat with Cuddles
              </Button>
            </Link>
          </div>
        </Card>

        <p className="mt-8 text-xs text-muted-foreground">
          Disclaimer: This page is for general educational information only and does not constitute legal advice. Laws change frequently; consult a local attorney or regulator before making any business or personal decisions.
        </p>
      </div>
    </div>
  );
};

export default CountryPage;
