import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Leaf, ArrowRight, CheckCircle2 } from "lucide-react";

const PersonalizedRecommendationsGuide = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Get Personalized Cannabis Strain Recommendations",
    description:
      "Step-by-step guide to using an AI virtual budtender to get personalized strain recommendations tailored to your goals, tolerance, and preferred effects.",
    totalTime: "PT3M",
    step: [
      { "@type": "HowToStep", position: 1, name: "Describe your goal", text: "Tell Cuddles what you want — better sleep, focus, pain relief, creativity, or social energy." },
      { "@type": "HowToStep", position: 2, name: "Share your context", text: "Mention experience level, preferred format (flower, edible, vape), and any effects to avoid." },
      { "@type": "HowToStep", position: 3, name: "Review tailored picks", text: "Cuddles ranks strains by terpene profile, THC/CBD ratio, and reported effects matched to your request." },
      { "@type": "HowToStep", position: 4, name: "Refine the recommendation", text: "Ask follow-ups like 'something less sedating' or 'a sativa under 18% THC' to narrow further." },
    ],
  };

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <SEO
        title="Personalized Strain Recommendations — Free Virtual Budtender Guide"
        description="Step-by-step guide to getting personalized cannabis strain recommendations from a free AI virtual budtender. Tailored picks based on effects, terpenes, and tolerance."
        url="/guides/personalized-recommendations"
        keywords="personalized strain recommendations, virtual budtender, AI strain recommendations, tailored cannabis advice, strain matchmaker, custom weed recommendations"
        structuredData={jsonLd}
      />
      <ThemeToggle />

      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          How to Get Personalized Strain Recommendations
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          A virtual budtender turns "I want to relax" into a shortlist of strains backed by terpene science.
          Here's how to get tailored picks from Cuddles AI in under three minutes — free, no signup required.
        </p>

        <section className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-display font-semibold text-foreground mt-10 mb-3">Why personalized beats generic top-10 lists</h2>
          <p className="text-muted-foreground">
            A top-10 indica list ignores your tolerance, your time of day, and the effects you actively want to avoid.
            Personalized strain recommendations weigh terpenes (myrcene for sleep, limonene for mood, pinene for focus),
            cannabinoid ratio, and reported user effects against the exact context you describe.
          </p>

          <h2 className="text-2xl font-display font-semibold text-foreground mt-10 mb-3">The 4-step process</h2>

          <div className="space-y-6 not-prose my-6">
            {[
              { n: 1, title: "Describe your goal in plain English", body: "‘Help me sleep without grogginess,’ ‘a creative daytime sativa,’ or ‘relief for chronic back pain without paranoia.’ Goals beat strain names." },
              { n: 2, title: "Share your context", body: "Mention experience level (new, casual, daily), preferred format (flower, vape, edible, tincture), and what to avoid (anxiety, couch-lock, dry mouth)." },
              { n: 3, title: "Review the ranked picks", body: "Cuddles returns strains with the terpene profile, THC/CBD range, and one-line ‘why it fits’ — not just a list of names." },
              { n: 4, title: "Refine in conversation", body: "‘Something less sedating,’ ‘a sativa under 18% THC,’ or ‘what pairs with this for daytime?’ The conversation keeps narrowing." },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 p-5 rounded-2xl border border-border bg-card">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-display font-semibold text-foreground mt-10 mb-3">What a virtual budtender is</h2>
          <p className="text-muted-foreground">
            A virtual budtender is an AI assistant trained on strain profiles, terpene research, and consumption guidance.
            Unlike a static strain database, it asks follow-up questions, remembers your preferences in-session, and adapts
            its picks as you describe what worked and what didn't.
          </p>

          <h2 className="text-2xl font-display font-semibold text-foreground mt-10 mb-3">Tips for better recommendations</h2>
          <ul className="space-y-2 not-prose my-4">
            {[
              "Lead with the outcome you want, not the strain you've heard about.",
              "Name effects to avoid — that's how AI ranks safety, not just fit.",
              "Mention the time of day; morning vs evening changes everything.",
              "Ask for the terpene reasoning so you can spot similar strains later.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 p-6 rounded-2xl border border-border bg-muted/30">
            <p className="text-sm text-muted-foreground italic">
              <strong className="text-foreground">Not medical advice.</strong> Cuddles provides general cannabis education.
              For medical conditions, consult a licensed clinician.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/#chat-demo">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <MessageCircle className="w-5 h-5" />
              Try the virtual budtender
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/strains">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Leaf className="w-5 h-5" />
              Browse strain directory
            </Button>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default PersonalizedRecommendationsGuide;
