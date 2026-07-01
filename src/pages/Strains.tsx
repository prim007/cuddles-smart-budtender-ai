import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Leaf, ArrowRight } from "lucide-react";

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const typeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "indica": return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
    case "sativa": return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    default: return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
  }
};

const Strains = () => {
  const { data: strains, isLoading } = useQuery({
    queryKey: ["strains-seo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_strains")
        .select("strain_name, strain_type, category, primary_terpene, primary_effect, thc_min, thc_max, in_stock")
        .eq("in_stock", true)
        .order("strain_name");
      if (error) throw error;
      // Deduplicate by strain name
      const seen = new Set<string>();
      return (data || []).filter((s) => {
        const key = s.strain_name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    staleTime: 1000 * 60 * 10,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cannabis Strain Directory",
    description: "Browse our complete directory of cannabis strains with detailed terpene profiles, THC/CBD content, and AI-powered recommendations.",
    url: "https://cuddles-ai.com/strains",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (strains || []).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://cuddles-ai.com/strains/${slugify(s.strain_name)}`,
        name: s.strain_name,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cannabis Strain Database | AI Recommendations"
        description="Browse 36+ cannabis strains with terpene profiles, THC/CBD data, and AI-powered recommendations from Cuddles AI."
        url="/strains"
        keywords="cannabis strain database, dispensary strain finder, AI strain recommendations, indica sativa hybrid, terpene profiles, THC CBD content, cannabis product catalog"
        structuredData={jsonLd}
      />
      <ThemeToggle />

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" /> Strain Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Cannabis Strain Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore {strains?.length || "our"} strains with detailed terpene profiles, effects, and AI-powered recommendations.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(strains || []).map((strain) => (
              <Link
                key={strain.strain_name}
                to={`/strains/${slugify(strain.strain_name)}`}
                className="group relative p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {strain.strain_name}
                  </h2>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={typeColor(strain.strain_type)}>
                    {strain.strain_type}
                  </Badge>
                  {strain.primary_effect && (
                    <Badge variant="outline" className="bg-muted/50">{strain.primary_effect}</Badge>
                  )}
                </div>
                {strain.primary_terpene && (
                  <p className="text-sm text-muted-foreground">
                    🌿 {strain.primary_terpene}
                    {strain.thc_min != null && strain.thc_max != null && ` · THC ${strain.thc_min}–${strain.thc_max}%`}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!strains || strains.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No strains available yet. Check back soon!</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Strains;
