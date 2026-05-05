import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";
import { trackInstallFunnel, detectInstallPlatform } from "@/components/GoogleAnalytics";

/**
 * Paw-print themed call-to-action that invites users to download/install Cuddles.
 * The paw "walks in" with bouncing toe-beans and a wagging main pad.
 */
const PawDownloadCTA = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hippie-coral/20 via-hippie-peach/20 to-hippie-amber/20 p-8 md:p-12 border border-hippie-coral/20 shadow-elevated">
          {/* Background paw trail */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            {[
              { top: "10%", left: "5%", delay: "0s", rotate: "-20deg" },
              { top: "60%", left: "15%", delay: "0.4s", rotate: "10deg" },
              { top: "20%", left: "80%", delay: "0.8s", rotate: "25deg" },
              { top: "70%", left: "70%", delay: "1.2s", rotate: "-15deg" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute animate-paw-walk"
                style={{ top: p.top, left: p.left, transform: `rotate(${p.rotate})`, animationDelay: p.delay }}
              >
                <PawIcon className="w-12 h-12 text-hippie-coral" />
              </div>
            ))}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Animated paw */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber flex items-center justify-center shadow-glow animate-paw-bounce">
                  <PawIcon className="w-20 h-20 md:w-24 md:h-24 text-white" animated />
                </div>
              </div>
            </div>

            {/* Copy + CTA */}
            <div className="flex-1 text-center md:text-left">
              <div className="pill mb-3 inline-block">🐾 Tap to install</div>
              <h2 className="font-display font-bold text-foreground mb-3 text-2xl md:text-4xl">
                Take Cuddles with you — paw-by-paw
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl">
                Add Cuddles to your home screen for one-tap access to your AI budtender.
                Works offline, loads instantly, and feels just like a native app.
              </p>
              <Link to="/install" onClick={() => { trackEvent("paw_download_cta_click", "conversion", "install"); trackInstallFunnel("cta_clicked", detectInstallPlatform(), { source: "paw_download_cta" }); }}>
                <button className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-hippie-coral to-hippie-amber px-7 py-4 text-white font-display font-semibold text-lg shadow-glow hover:shadow-elevated transition-all hover:scale-105">
                  <PawIcon className="w-6 h-6 transition-transform group-hover:-rotate-12" />
                  Download Cuddles
                  <Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                </button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">Free • No app store required • iOS + Android</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Paw print SVG — main pad + 4 toe beans
const PawIcon = ({ className = "", animated = false }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden="true">
    {/* Main pad */}
    <ellipse cx="32" cy="44" rx="14" ry="12" className={animated ? "origin-center animate-paw-pad" : ""} />
    {/* Toe beans */}
    <ellipse cx="14" cy="28" rx="6" ry="8" className={animated ? "origin-center animate-paw-toe-1" : ""} />
    <ellipse cx="24" cy="14" rx="5.5" ry="7.5" className={animated ? "origin-center animate-paw-toe-2" : ""} />
    <ellipse cx="40" cy="14" rx="5.5" ry="7.5" className={animated ? "origin-center animate-paw-toe-3" : ""} />
    <ellipse cx="50" cy="28" rx="6" ry="8" className={animated ? "origin-center animate-paw-toe-4" : ""} />
  </svg>
);

export default PawDownloadCTA;
