import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Leaf, MessageCircle, Beaker, Wind, Zap, Sparkles, Sun,
  Heart, AlertTriangle, Soup, Dna, Sprout, Loader2, HelpCircle, MapPin,
} from "lucide-react";
import { buildStrainFaqs, faqSchema, breadcrumbSchema } from "@/lib/strainSeo";


const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const titleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const StrainDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [generating, setGenerating] = useState(false);
  const [genFailed, setGenFailed] = useState(false);

  // Tenant strain (optional — for in-stock pricing)
  const { data: tenantStrain } = useQuery({
    queryKey: ["tenant-strain", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_strains")
        .select("*")
        .eq("in_stock", true);
      return (data || []).find((s) => slugify(s.strain_name) === slug) || null;
    },
    staleTime: 1000 * 60 * 10,
  });

  // AI profile from cache
  const { data: profile, refetch: refetchProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["strain-profile", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("strain_profiles")
        .select("*")
        .eq("strain_slug", slug!)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  // Auto-generate if no profile exists — one attempt per slug, never a retry loop
  useEffect(() => {
    if (profileLoading || profile || generating || genFailed || !slug) return;
    setGenerating(true);
    (async () => {
      try {
        const name = tenantStrain?.strain_name || titleCase(slug);
        const { error } = await supabase.functions.invoke("generate-strain-profile", {
          body: { strain_name: name },
        });
        // invoke returns the error instead of throwing (e.g. 401 for signed-out visitors)
        if (error) {
          console.warn("Profile gen unavailable:", error.message);
          setGenFailed(true);
        } else {
          await refetchProfile();
        }
      } catch (e) {
        console.error("Profile gen failed", e);
        setGenFailed(true);
      } finally { setGenerating(false); }
    })();
  }, [profile, profileLoading, slug, tenantStrain, generating, genFailed, refetchProfile]);

  // Fresh attempt allowed if the visitor navigates to a different strain
  useEffect(() => { setGenFailed(false); }, [slug]);

  const displayName = profile?.strain_name || tenantStrain?.strain_name || (slug ? titleCase(slug) : "Strain");
  const displayType = profile?.strain_type || tenantStrain?.strain_type || "Hybrid";

  // Keyword-first title: "<Strain> Strain: Effects, THC & Terpenes"
  const title = `${displayName} Strain: Effects, THC & Terpenes`;
  const description = profile?.short_description
    ? `${profile.short_description.slice(0, 110)} ${displayName} effects, THC level, terpenes and where to find it in South Africa.`.slice(0, 158)
    : `${displayName} is a ${displayType.toLowerCase()} cannabis strain. Effects, THC level, terpene profile, flavours and where to find it in South Africa.`;


  const typeGradient = displayType.toLowerCase().includes("indica")
    ? "from-purple-500/20 to-indigo-500/10"
    : displayType.toLowerCase().includes("sativa")
    ? "from-amber-500/20 to-orange-500/10"
    : "from-emerald-500/20 to-teal-500/10";

  const infoCards = [
    profile?.thc_range && { icon: Beaker, label: "THC", value: profile.thc_range },
    profile?.cbd_range && { icon: Beaker, label: "CBD", value: profile.cbd_range },
    profile?.best_time_of_day && { icon: Sun, label: "Best Time", value: profile.best_time_of_day },
    profile?.growing_difficulty && { icon: Sprout, label: "Growing", value: profile.growing_difficulty },
    tenantStrain?.primary_terpene && { icon: Wind, label: "Terpene", value: tenantStrain.primary_terpene },
    tenantStrain?.primary_effect && { icon: Zap, label: "Effect", value: tenantStrain.primary_effect },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  // Google requires Product markup to carry offers, review, or aggregateRating.
  // Without real merchant data we describe the page as a WebPage instead of
  // shipping an incomplete Product.
  const hasOffer = tenantStrain?.price != null;
  const productSchema = hasOffer
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: displayName,
        description,
        category: `${displayType} Cannabis Strain`,
        brand: { "@type": "Brand", name: "Cuddles AI" },
        url: `https://cuddles-ai.com/strains/${slug}`,
        offers: {
          "@type": "Offer",
          price: tenantStrain!.price,
          priceCurrency: "ZAR",
          availability: tenantStrain!.in_stock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `https://cuddles-ai.com/strains/${slug}`,
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: displayName,
        description,
        about: { "@type": "Thing", name: `${displayName} (${displayType} cannabis strain)` },
        url: `https://cuddles-ai.com/strains/${slug}`,
      };

  const faqs = buildStrainFaqs({
    name: displayName,
    type: displayType,
    thcRange: profile?.thc_range,
    cbdRange: profile?.cbd_range,
    effects: Array.isArray(profile?.effects) ? (profile!.effects as string[]) : [],
    flavors: Array.isArray(profile?.flavors) ? (profile!.flavors as string[]) : [],
    medicalUses: Array.isArray(profile?.medical_uses) ? (profile!.medical_uses as string[]) : [],
    negatives: Array.isArray(profile?.negatives) ? (profile!.negatives as string[]) : [],
    bestTime: profile?.best_time_of_day,
    lineage: profile?.lineage,
    terpene: tenantStrain?.primary_terpene,
  });

  const graph = [productSchema, faqSchema(faqs), breadcrumbSchema(displayName, slug || "")];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} url={`/strains/${slug}`}
        keywords={`${displayName} strain, ${displayName} effects, ${displayName} thc, ${displayName} ${displayType.toLowerCase()}, ${displayName} south africa, cannabis strain`}
        structuredData={graph as unknown as object} />
      <ThemeToggle />

      <main className="container mx-auto px-4 py-12 max-w-4xl">

        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/strains" className="hover:text-foreground transition-colors">Strains</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{displayName}</span>
        </nav>

        {/* Hero */}
        <div className={`rounded-3xl bg-gradient-to-br ${typeGradient} border border-border p-8 md:p-12 mb-8`}>
          <Badge variant="outline" className="mb-4 text-sm">{displayType}</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            {displayName} Strain
          </h1>
          {profile?.short_description && (
            <p className="text-lg text-muted-foreground">{profile.short_description}</p>
          )}
          {tenantStrain?.price != null && (
            <p className="text-2xl font-bold text-foreground mt-4">R{tenantStrain.price.toLocaleString()}</p>
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
                <p className="text-base font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Unavailable: new generation requires signing in */}
        {!profile && !profileLoading && !generating && genFailed && (
          <div className="flex flex-col items-center gap-2 py-10 px-6 rounded-2xl border border-dashed border-border bg-muted/20 mb-8 text-center">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground max-w-md">
              We haven't written an in-depth profile for {displayName} yet.
              Sign in and ask Cuddles — it will generate one for you.
            </span>
          </div>
        )}


        {/* Long description */}
        {profile?.long_description && (
          <section className="mb-8 p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> About {displayName}
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-foreground/90">
              {profile.long_description}
            </div>
          </section>
        )}

        {/* Effects & Medical */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Array.isArray(profile.effects) && profile.effects.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Effects</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.effects as string[]).map((e) => (
                    <Badge key={e} variant="secondary">{e}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(profile.medical_uses) && profile.medical_uses.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> Common Wellness Uses</h3>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {(profile.medical_uses as string[]).map((m) => (
                    <li key={m} className="flex gap-2"><span className="text-primary">•</span>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(profile.flavors) && profile.flavors.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Soup className="w-4 h-4 text-amber-500" /> Flavors</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.flavors as string[]).map((f) => (
                    <Badge key={f} variant="outline">{f}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(profile.negatives) && profile.negatives.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Potential Negatives</h3>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {(profile.negatives as string[]).map((n) => (
                    <li key={n} className="flex gap-2"><span className="text-orange-500">•</span>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Terpenes */}
        {profile && Array.isArray(profile.terpenes) && profile.terpenes.length > 0 && (
          <section className="mb-8 p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Wind className="w-4 h-4 text-primary" /> Terpene Profile</h3>
            <div className="space-y-3">
              {(profile.terpenes as any[]).map((t, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 sm:w-40 shrink-0">
                    <Leaf className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{t.name}</span>
                    {t.percentage && <span className="text-xs text-muted-foreground">{t.percentage}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{t.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lineage */}
        {profile?.lineage && (
          <section className="mb-8 p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Dna className="w-4 h-4 text-primary" /> Lineage</h3>
            <p className="text-sm text-foreground/90">{profile.lineage}</p>
          </section>
        )}

        {/* Similar */}
        {profile && Array.isArray(profile.similar_strains) && profile.similar_strains.length > 0 && (
          <section className="mb-8">
            <h3 className="font-semibold mb-3">Similar Strains</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.similar_strains as string[]).map((s) => (
                <Link key={s} to={`/strains/${slugify(s)}`}
                  className="px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary text-sm transition-colors">
                  {s}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ — targets long-tail "is X indica", "X thc level", "where to buy X" queries */}
        <section className="mb-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> {displayName} — frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.question} className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-2">{f.question}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Local intent block */}
        <section className="mb-8 p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Finding {displayName} in South Africa
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            Stock of {displayName} moves fast between clubs and dispensaries in Johannesburg, Cape Town, Durban and Pretoria.
            Rather than phoning around, tell Cuddles what you're after and it checks live dispensary menus for {displayName} —
            or the nearest match by effect and terpene profile — and shows you what's actually on the shelf right now.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/strains" className="text-primary hover:underline">All cannabis strains</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/strains/featured" className="text-primary hover:underline">Strains of the week</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/shop" className="text-primary hover:underline">Shop available products</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/blog" className="text-primary hover:underline">Cannabis guides</Link>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mb-6 max-w-xl mx-auto">
          AI-generated for general cannabis education only. Not medical advice. Consult a qualified professional for medical guidance.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/#demo" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" /> Ask Cuddles About {displayName}
            </Button>
          </Link>
          <Link to="/strains/featured" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl" size="lg">
              <Sparkles className="w-4 h-4 mr-2" /> 10 Strains of the Week
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StrainDetail;
