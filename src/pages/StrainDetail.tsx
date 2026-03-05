import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, MessageCircle, Beaker, Wind, Zap } from "lucide-react";

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const StrainDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: strain, isLoading, error } = useQuery({
    queryKey: ["strain-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_strains")
        .select("*")
        .eq("in_stock", true);
      if (error) throw error;
      const match = (data || []).find((s) => slugify(s.strain_name) === slug);
      if (!match) throw new Error("Strain not found");
      return match;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading strain info...</div>
      </div>
    );
  }

  if (error || !strain) {
    return (
      <div className="min-h-screen bg-background">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Strain Not Found</h1>
          <p className="text-muted-foreground mb-8">This strain doesn't exist or is currently unavailable.</p>
          <Link to="/strains">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Strains</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = `${strain.strain_name} – ${strain.strain_type} Cannabis Strain | Cuddles AI`;
  const description = `Learn about ${strain.strain_name}, a ${strain.strain_type.toLowerCase()} cannabis strain${strain.primary_effect ? ` known for ${strain.primary_effect.toLowerCase()}` : ""}. ${strain.primary_terpene ? `Dominant terpene: ${strain.primary_terpene}.` : ""} ${strain.thc_min != null && strain.thc_max != null ? `THC: ${strain.thc_min}–${strain.thc_max}%.` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: strain.strain_name,
    description,
    category: `Cannabis > ${strain.strain_type} > ${strain.category}`,
    url: `https://cuddles-ai.com/strains/${slug}`,
    brand: { "@type": "Brand", name: "Cuddles AI" },
    additionalProperty: [
      strain.primary_terpene && { "@type": "PropertyValue", name: "Primary Terpene", value: strain.primary_terpene },
      strain.secondary_terpene && { "@type": "PropertyValue", name: "Secondary Terpene", value: strain.secondary_terpene },
      strain.primary_effect && { "@type": "PropertyValue", name: "Primary Effect", value: strain.primary_effect },
      strain.thc_min != null && { "@type": "PropertyValue", name: "THC Range", value: `${strain.thc_min}–${strain.thc_max}%` },
      strain.cbd_min != null && { "@type": "PropertyValue", name: "CBD Range", value: `${strain.cbd_min}–${strain.cbd_max}%` },
    ].filter(Boolean),
    ...(strain.price != null && {
      offers: {
        "@type": "Offer",
        price: strain.price,
        priceCurrency: "ZAR",
        availability: "https://schema.org/InStock",
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cuddles-ai.com" },
      { "@type": "ListItem", position: 2, name: "Strains", item: "https://cuddles-ai.com/strains" },
      { "@type": "ListItem", position: 3, name: strain.strain_name, item: `https://cuddles-ai.com/strains/${slug}` },
    ],
  };

  const typeGradient = strain.strain_type.toLowerCase() === "indica"
    ? "from-purple-500/20 to-indigo-500/10"
    : strain.strain_type.toLowerCase() === "sativa"
    ? "from-amber-500/20 to-orange-500/10"
    : "from-emerald-500/20 to-teal-500/10";

  const infoCards = [
    strain.primary_terpene && { icon: Wind, label: "Primary Terpene", value: strain.primary_terpene },
    strain.secondary_terpene && { icon: Leaf, label: "Secondary Terpene", value: strain.secondary_terpene },
    strain.primary_effect && { icon: Zap, label: "Primary Effect", value: strain.primary_effect },
    (strain.thc_min != null && strain.thc_max != null) && { icon: Beaker, label: "THC", value: `${strain.thc_min}–${strain.thc_max}%` },
    (strain.cbd_min != null && strain.cbd_max != null) && { icon: Beaker, label: "CBD", value: `${strain.cbd_min}–${strain.cbd_max}%` },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} url={`/strains/${slug}`} keywords={`${strain.strain_name}, ${strain.strain_type}, ${strain.category}, cannabis strain, ${strain.primary_terpene || ""}, ${strain.primary_effect || ""}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ThemeToggle />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/strains" className="hover:text-foreground transition-colors">Strains</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{strain.strain_name}</span>
        </nav>

        {/* Hero card */}
        <div className={`rounded-3xl bg-gradient-to-br ${typeGradient} border border-border p-8 md:p-12 mb-8`}>
          <Badge variant="outline" className="mb-4 text-sm">{strain.strain_type}</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            {strain.strain_name}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {strain.category} · {strain.strain_type}
          </p>
          {strain.price != null && (
            <p className="text-2xl font-bold text-foreground mt-4">
              R{strain.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Info grid */}
        {infoCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {infoCards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {strain.notes && (
          <div className="prose prose-sm dark:prose-invert max-w-none mb-8 p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-xl font-semibold mb-2">About {strain.strain_name}</h2>
            <p>{strain.notes}</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link to="/#demo" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground rounded-xl" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask Cuddles About {strain.strain_name}
            </Button>
          </Link>
          <Link to="/strains" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" /> Browse All Strains
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StrainDetail;
