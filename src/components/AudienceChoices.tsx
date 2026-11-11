import { ArrowUpRight, Building2, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AudienceChoices() {
  return (
    <section aria-labelledby="audience-heading" className="border-b border-border bg-background py-8 md:py-10">
      <div className="container mx-auto px-4">
        <h2 id="audience-heading" className="font-display text-3xl font-semibold text-foreground">Meet Cuddles AI</h2>
        <p className="mt-2 text-lg text-muted-foreground">Your intelligent plant companion.</p>
        <div className="mt-6 grid gap-6 pb-2 md:grid-cols-2">
          <Button asChild variant="outline" className="audience-choice h-auto min-h-32 justify-start gap-5 whitespace-normal rounded-lg px-6 py-6 text-left text-foreground hover:text-foreground">
            <Link to="/for-individuals">
              <Leaf aria-hidden="true" className="!h-8 !w-8 text-hippie-sage" />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold">For Individuals</span>
                <span className="mt-2 block text-base font-normal text-muted-foreground">Explore free AI plant tools</span>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="audience-choice audience-choice-business h-auto min-h-32 justify-start gap-5 whitespace-normal rounded-lg px-6 py-6 text-left text-foreground hover:text-foreground">
            <Link to="/for-businesses">
              <Building2 aria-hidden="true" className="!h-8 !w-8 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold">For Businesses</span>
                <span className="mt-2 block text-base font-normal text-muted-foreground">Automate your customer support</span>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}