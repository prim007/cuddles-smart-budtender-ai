import { ExternalLink, ArrowRight, Sparkles, Camera, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/components/GoogleAnalytics";

const YOUTUBE_CHANNEL = "https://www.youtube.com/@CuddlesAI-Budtender";

const WALKTHROUGHS = [
  {
    icon: Sparkles,
    title: "Meet Cuddles — your AI plant & cannabis expert",
    description: "Watch the live chat demo find a strain match in a few messages.",
    href: "/see-it-in-action",
  },
  {
    icon: Camera,
    title: "Label scanning & strain identification",
    description: "See how the scanner reads a product label and returns real batch detail.",
    href: "/technology",
  },
  {
    icon: Leaf,
    title: "Strain types explained — indica, sativa, hybrid",
    description: "Browse the strain library with effects, terpenes, and dosing guidance.",
    href: "/strains",
  },
];

const YouTubeSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            See Cuddles in Action
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Try the interactive walkthroughs below, or follow the channel for new
            recommendation and cultivation breakdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {WALKTHROUGHS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all"
            >
              <item.icon className="w-6 h-6 text-primary mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("youtube_channel_click", "engagement", "bottom_link")}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814Z" />
              <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568Z" className="fill-white" />
            </svg>
            Subscribe on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
