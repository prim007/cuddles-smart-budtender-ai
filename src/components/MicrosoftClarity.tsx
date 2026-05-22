import { useEffect } from "react";
import { getCookieConsent } from "@/components/CookieConsentBanner";

/**
 * Microsoft Clarity — free heatmaps, click hotspots, scroll maps & session replays.
 * Complements GA4 (GoogleAnalytics.tsx) which handles event/conversion tracking.
 *
 * Setup:
 *   1. Sign up at https://clarity.microsoft.com (free, unlimited traffic).
 *   2. Create a project for cuddles-ai.com, copy the Project ID (e.g. "abc123xyz").
 *   3. Add VITE_CLARITY_PROJECT_ID to your environment, or replace the fallback below.
 *
 * View heatmaps & recordings at https://clarity.microsoft.com after ~2h of traffic.
 */
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || "ws1rh983qp";

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

// Same bot heuristic used by GoogleAnalytics — don't pollute recordings with crawlers.
const isLikelyBot = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  if (
    /bot|crawl|spider|scrape|headless|phantom|puppeteer|selenium|lighthouse|prerender|wget|curl|httpie|axios|node-fetch|python|java\/|go-http|ahrefs|semrush|mj12|dotbot|yandex|bingpreview|facebookexternalhit|slackbot|discordbot/i.test(
      ua
    )
  ) {
    return true;
  }
  if (navigator.webdriver) return true;
  if (screen.width === 0 || screen.height === 0) return true;
  return false;
};

const MicrosoftClarity = () => {
  useEffect(() => {
    if (!CLARITY_PROJECT_ID) return;
    if (document.getElementById("ms-clarity-script")) return;

    // Don't run inside Lovable preview iframe
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    if (isLikelyBot()) return;

    // Official Clarity snippet (inlined as a TS module)
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.id = "ms-clarity-script";
      t.async = true;
      t.src = "https://www.clarity.ms/tag/" + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }, []);

  return null;
};

export default MicrosoftClarity;

/** Tag the current session with a custom label — surfaces as a filter in Clarity dashboard. */
export const clarityTag = (key: string, value: string | string[]) => {
  window.clarity?.("set", key, value);
};

/** Fire a custom event — visible in Clarity's "Smart Events" and used to build funnels. */
export const clarityEvent = (name: string) => {
  window.clarity?.("event", name);
};

/** Associate the current session with a logged-in user (use a hashed/opaque ID, not PII). */
export const clarityIdentify = (
  userId: string,
  sessionId?: string,
  pageId?: string,
  friendlyName?: string
) => {
  window.clarity?.("identify", userId, sessionId, pageId, friendlyName);
};

/** Upgrade a session — forces Clarity to record it even if sampling would skip it. */
export const clarityUpgrade = (reason: string) => {
  window.clarity?.("upgrade", reason);
};
