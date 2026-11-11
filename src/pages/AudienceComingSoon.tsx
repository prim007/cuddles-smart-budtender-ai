import { ArrowLeft, Building2, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import cuddlesImage from "@/assets/cuddles.png";

export default function AudienceComingSoon({ audience }: { audience: "individuals" | "businesses" }) {
  const business = audience === "businesses";
  const title = business ? "For Businesses" : "For Individuals";
  const Icon = business ? Building2 : Leaf;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-28 text-center text-foreground">
      <SEO title={`${title} — Coming soon | Cuddles AI`} description={`Cuddles AI ${title.toLowerCase()}. Coming soon.`} url={`/for-${audience}`} noindex />
      <img src={cuddlesImage} alt="Cuddles AI" width="96" height="96" className="mb-8 h-24 w-24 rounded-lg object-cover" />
      <div className="flex items-center gap-2 text-primary"><Icon aria-hidden="true" className="h-5 w-5" /><span className="font-display text-lg">{title}</span></div>
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Coming soon</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">A dedicated space for {business ? "your business" : "you and your plants"} is on its way.</p>
      <Button asChild variant="outline" className="mt-8"><Link to="/"><ArrowLeft aria-hidden="true" />Back to Cuddles</Link></Button>
      <p className="mt-10 text-xs text-muted-foreground">Plant education only. Not medical advice.</p>
    </main>
  );
}