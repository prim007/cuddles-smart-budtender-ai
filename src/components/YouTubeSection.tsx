import { Play, ExternalLink } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/components/GoogleAnalytics";

const YOUTUBE_CHANNEL = "https://www.youtube.com/@CuddlesAI-Budtender";

// Featured videos — replace video IDs with your actual uploads
const FEATURED_VIDEOS = [
  {
    id: "VIDEO_ID_1",
    title: "Meet Cuddles — Your AI Cannabis Expert",
    description: "See how Cuddles finds your perfect strain in seconds.",
    placeholder: true,
  },
  {
    id: "VIDEO_ID_2",
    title: "How the Smart Budtender Works",
    description: "A deep dive into the AI behind personalized recommendations.",
    placeholder: true,
  },
  {
    id: "VIDEO_ID_3",
    title: "Cannabis 101 — Indica vs Sativa vs Hybrid",
    description: "Everything you need to know about strain types.",
    placeholder: true,
  },
];

const YouTubeSection = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handlePlay = (videoId: string) => {
    setActiveVideo(videoId);
    trackEvent("youtube_play", "engagement", videoId);
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            See Cuddles in Action
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Watch how our AI budtender delivers personalized strain recommendations in real-time.
          </p>
        </div>

        {/* Main featured video */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video border border-border shadow-lg">
            {activeVideo && !FEATURED_VIDEOS.find(v => v.id === activeVideo)?.placeholder ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
                title="Cuddles AI Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[hsl(270,40%,15%)] via-[hsl(320,45%,18%)] to-[hsl(350,50%,22%)]">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="w-10 h-10 text-primary fill-primary" />
                </div>
                <div className="text-center px-4">
                  <p className="text-white font-display font-semibold text-lg mb-1">
                    Coming Soon — Cuddles Explainer Video
                  </p>
                  <p className="text-white/85 text-sm">
                    Subscribe to our channel to get notified when it drops!
                  </p>
                </div>
                <a
                  href={YOUTUBE_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("youtube_channel_click", "engagement", "main_section")}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814Z" />
                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568Z" className="fill-white" />
                  </svg>
                  Subscribe on YouTube
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Video thumbnails row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {FEATURED_VIDEOS.map((video) => (
            <button
              key={video.id}
              onClick={() => handlePlay(video.id)}
              className="group text-left rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all"
            >
              <div className="aspect-video bg-muted relative flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <Play className="w-8 h-8 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground line-clamp-1">{video.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{video.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Channel CTA */}
        <div className="text-center mt-6">
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("youtube_channel_click", "engagement", "bottom_link")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all videos on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
