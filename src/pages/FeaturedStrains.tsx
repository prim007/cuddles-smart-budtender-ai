import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Leaf, ArrowRight } from "lucide-react";

interface WeeklyEntry { name: string; slug: string; }

const FeaturedStrains = () => {
  const [generating, setGenerating] = useState(false);

  // Ensure this week's rotation exists
  const { data: weekly, refetch } = useQuery({
    queryKey: ["weekly-featured"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("rotate-weekly-strains");
      if (error) throw error;
      return data as { week_start: string; strains: WeeklyEntry[] };
    },
    staleTime: 1000 * 60 * 60,
  });

  const slugs = (weekly?.strains || []).map((s) => s.slug);

  // Fetch any cached profiles for this week's strains
  const { data: profiles, refetch: refetchProfiles } = useQuery({
    queryKey: ["weekly-profiles", slugs.join(",")],
    queryFn: async () => {
      if (slugs.length === 0) return [];
      const { data, error } = await supabase
        .from("strain_profiles")
        .select("*")
        .in("strain_slug", slugs);
      if (error) throw error;
      return data || [];
    },
    enabled: slugs.length > 0,
  });

  // Auto-generate any missing profiles (sequentially, friendly to rate limits)
  useEffect(() => {
    if (!weekly || !profiles) return;
    const cachedSlugs = new Set(profiles.map((p) => p.strain_slug));
    const missing = weekly.strains.filter((s) => !cachedSlugs.has(s.slug));
    if (missing.length === 0 || generating) return;

    let cancelled = false;
    (async () => {
      setGenerating(true);
      for (const s of missing.slice(0, 3)) {
        if (cancelled) break;
        try {
          await supabase.functions.invoke("generate-strain-profile", {
            body: { strain_name: s.name },
          });
        } catch (e) { console.warn("gen failed", s.name, e); }
      }
      if (!cancelled) {
        await refetchProfiles();
        setGenerating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [weekly, profiles, generating, refetchProfiles]);

  const profileMap = new Map((profiles || []).map((p) => [p.strain_slug, p]));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Strain of the Week | 10 Featured Cannabis Strains"
        description="Discover this week's 10 featured cannabis strains with in-depth AI-powered profiles: effects, terpenes, THC/CBD, lineage and more. Updated every Monday."
        url="/strains/featured"
        keywords="strain of the week, featured cannabis strains, cannabis strain guide, weekly strain picks"
      />
      <ThemeToggle />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI-Powered Strain Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            10 Strains of the Week
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fresh deep-dive profiles every Monday. Effects, terpenes, lineage, growing tips — everything you need to know.
          </p>
          {weekly?.week_start && (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Week of {new Date(weekly.week_start).toLocaleDateString("en-ZA", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>

        {generating && (
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="relative inline-flex items-center justify-center w-8 h-8">
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <Leaf
                className="w-5 h-5 text-primary relative animate-bounce"
                style={{ animation: "bounce 1.2s ease-in-out infinite, spin 3s linear infinite" }}
              />
            </span>
            <span className="font-medium">Generating Strain Profiles</span>
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(weekly?.strains || []).map((s, idx) => {
            const profile: any = profileMap.get(s.slug);
            return (
              <Link
                key={s.slug}
                to={`/strains/${s.slug}`}
                className="group relative"
              >
                <Card className="h-full border-border hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs">
                      #{idx + 1}
                    </Badge>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-2">
                      <Leaf className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {s.name}
                      </h2>
                    </div>

                    {profile ? (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-xs">{profile.strain_type}</Badge>
                          {profile.thc_range && (
                            <Badge variant="outline" className="text-xs">THC {profile.thc_range}</Badge>
                          )}
                          {profile.best_time_of_day && (
                            <Badge variant="outline" className="text-xs">{profile.best_time_of_day}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {profile.short_description}
                        </p>
                        {Array.isArray(profile.effects) && profile.effects.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {profile.effects.slice(0, 4).map((e: string) => (
                              <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {e}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-2 py-2">
                        <div className="h-3 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-3/5 animate-pulse" />
                        <p className="text-xs text-muted-foreground italic pt-1">Profile loading...</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Read full profile</span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Strain profiles are AI-generated for general cannabis education only and are not medical advice. Consult a qualified professional for medical guidance.
          </p>
          <Button asChild variant="outline">
            <Link to="/strains">Browse the full strain directory <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeaturedStrains;
