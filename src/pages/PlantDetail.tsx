import { Link, useParams, Navigate } from "react-router-dom";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Sun, Droplets, Mountain, Wind, Thermometer, Leaf, Scissors, AlertTriangle, MessageCircle, ArrowRight } from "lucide-react";
import { getPlant, PLANT_GUIDE } from "@/data/plantGuide";

const PlantDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const plant = slug ? getPlant(slug) : undefined;

  if (!plant) return <Navigate to="/plants" replace />;

  const facts = [
    { icon: Sun, label: "Light", value: plant.light },
    { icon: Droplets, label: "Water", value: plant.water },
    { icon: Mountain, label: "Soil", value: plant.soil },
    { icon: Wind, label: "Humidity", value: plant.humidity },
    { icon: Thermometer, label: "Temperature", value: plant.temperature },
    { icon: Leaf, label: "Feeding", value: plant.feeding },
    { icon: Scissors, label: "Propagation", value: plant.propagation },
    { icon: AlertTriangle, label: "Toxicity", value: plant.toxicity },
  ];

  const faqs = [
    { q: `How often should I water ${plant.name}?`, a: plant.water },
    { q: `How much light does ${plant.name} need?`, a: plant.light },
    { q: `What soil is best for ${plant.name}?`, a: plant.soil },
    { q: `Is ${plant.name} toxic to pets?`, a: plant.toxicity },
    { q: `How do I propagate ${plant.name}?`, a: plant.propagation },
    ...plant.commonProblems.map((p) => ({
      q: `Why does my ${plant.name} have ${p.problem.toLowerCase()}?`,
      a: `${p.cause}. ${p.fix}`,
    })),
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${plant.name} Care Guide (${plant.botanicalName})`,
      description: plant.summary,
      author: { "@type": "Organization", name: "Cuddles AI" },
      mainEntityOfPage: `https://cuddles-ai.com/plants/${plant.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const related = PLANT_GUIDE.filter(
    (p) => p.category === plant.category && p.slug !== plant.slug,
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <SEO
        title={`${plant.name} Care Guide — Light, Water & Problems`}
        description={`${plant.name} (${plant.botanicalName}) care guide: light, watering, soil, humidity, feeding, propagation and fixes for the most common problems.`}
        url={`/plants/${plant.slug}`}
        keywords={`${plant.name} care, ${plant.botanicalName}, how to water ${plant.name}, ${plant.name} light requirements, ${plant.name} problems`}
        structuredData={jsonLd}
      />
      <ThemeToggle />

      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
          <Link to="/plants" className="hover:text-primary">Plant care guide</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{plant.name}</span>
        </nav>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sprout className="w-4 h-4" /> {plant.category}
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
          {plant.name} Care Guide
        </h1>
        <p className="italic text-muted-foreground mb-4">{plant.botanicalName}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline">{plant.difficulty} to grow</Badge>
        </div>
        <p className="text-lg text-muted-foreground mb-10">{plant.summary}</p>

        <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Care at a glance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {facts.map((f) => (
            <div key={f.label} className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-1 text-primary">
                <f.icon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">{f.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{f.value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
          Common {plant.name} problems and fixes
        </h2>
        <div className="space-y-3 mb-12">
          {plant.commonProblems.map((p) => (
            <div key={p.problem} className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-1">{p.problem}</h3>
              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Cause:</strong> {p.cause}</p>
              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Fix:</strong> {p.fix}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Grower tips</h2>
        <ul className="space-y-2 mb-12">
          {plant.tips.map((t) => (
            <li key={t} className="flex items-start gap-3 text-muted-foreground">
              <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
          {plant.name} FAQs
        </h2>
        <div className="space-y-4 mb-12">
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-foreground mb-1">{f.q}</h3>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>

        {related.length > 0 && (
          <>
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              More {plant.category.toLowerCase()} guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/plants/${r.slug}`}
                  className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <span className="font-medium text-foreground">{r.name} care guide</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-2" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="p-6 rounded-2xl border border-border bg-muted/30 mb-8">
          <p className="text-sm text-muted-foreground italic">
            General plant education. For cannabis specifically, follow your local law — 18+ in South
            Africa — and treat any health or dosing information as education, not medical advice.
          </p>
        </div>

        <Link to="/#chat-demo">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Ask Cuddles about {plant.name}
          </Button>
        </Link>
      </article>

      <Footer />
    </div>
  );
};

export default PlantDetail;
