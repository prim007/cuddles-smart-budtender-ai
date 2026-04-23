import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-KHJ04X5EE1';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// --- UTM helpers ---
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const UTM_STORAGE_KEY = 'cuddles-utm';

/** Parse UTM params from current URL and persist in sessionStorage */
const captureUtmParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  
  for (const key of UTM_PARAMS) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }

  // If we found UTM params, persist them for the session
  if (Object.keys(utm).length > 0) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch { /* storage full / disabled */ }
  }

  // Return stored params (may have been captured on a previous page)
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : utm;
  } catch {
    return utm;
  }
};

/** Get stored UTM params without re-parsing */
const getStoredUtm = (): Record<string, string> => {
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// --- Bot detection ---
const BOT_DATACENTER_CITIES = new Set([
  'council bluffs', 'boardman', 'ashburn', 'the dalles',
  'north charleston', 'pryor', 'pryor creek', 'quincy',
  'new albany', 'papillion',
]);

const isLikelyBot = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  if (/bot|crawl|spider|scrape|headless|phantom|puppeteer|selenium|lighthouse|prerender|wget|curl|httpie|axios|node-fetch|python|java\/|go-http|ahrefs|semrush|mj12|dotbot|yandex|bingpreview|facebookexternalhit|slackbot|discordbot/i.test(ua)) {
    return true;
  }
  if (!navigator.language && !navigator.languages?.length) return true;
  if (navigator.webdriver) return true;
  if (!(window as any).chrome && /chrome/i.test(ua)) return true;
  if (screen.width === 0 || screen.height === 0) return true;
  // Headless signals: no plugins, no touch, no permissions API on "mobile"
  if ((navigator as any).plugins?.length === 0 && /mobile/i.test(ua)) return true;
  // Tiny / unusual viewports favored by scrapers
  if (window.innerWidth < 200 || window.innerHeight < 200) return true;
  return false;
};

/** Filter out noise: skip tracking for ultra-short sessions (<10s engagement) */
let sessionStartTime = Date.now();
const isLowQualitySession = (): boolean => {
  return (Date.now() - sessionStartTime) < 10000;
};

export const GoogleAnalytics = () => {
  const location = useLocation();

  // Load GA script once — use gtag recommended loading pattern
  useEffect(() => {
    if (!GA_TRACKING_ID || document.getElementById('ga-script')) return;

    // Skip GA entirely for obvious bots
    if (isLikelyBot()) return;

    // Capture UTM params on first load
    const utm = captureUtmParams();

    // Initialize dataLayer before script loads to queue events
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };

    const configOptions: Record<string, any> = {
      send_page_view: false, // We send manually on route change to avoid double-counting
      cookie_flags: 'SameSite=None;Secure',
      transport_type: 'beacon', // Use navigator.sendBeacon for reliability
    };

    // Forward UTM params to GA config for proper attribution
    if (utm.utm_source) configOptions.campaign_source = utm.utm_source;
    if (utm.utm_medium) configOptions.campaign_medium = utm.utm_medium;
    if (utm.utm_campaign) configOptions.campaign_name = utm.utm_campaign;
    if (utm.utm_term) configOptions.campaign_term = utm.utm_term;
    if (utm.utm_content) configOptions.campaign_content = utm.utm_content;

    window.gtag('js', new Date() as any);
    window.gtag('config', GA_TRACKING_ID, configOptions);

    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);
  }, []);

  // Track page views on route change — include UTM data for attribution
  useEffect(() => {
    if (!GA_TRACKING_ID || !window.gtag) return;

    const timer = setTimeout(() => {
      const utm = getStoredUtm();
      window.gtag?.('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
        ...(utm.utm_source && { campaign_source: utm.utm_source }),
        ...(utm.utm_medium && { campaign_medium: utm.utm_medium }),
        ...(utm.utm_campaign && { campaign_name: utm.utm_campaign }),
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Track scroll depth
  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    const thresholds = [25, 50, 75, 90];
    const fired = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent('scroll_depth', 'engagement', `${t}%`);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Track time on page — use beacon on unload for reliability
  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    const start = Date.now();

    const sendTimeOnPage = () => {
      const seconds = Math.round((Date.now() - start) / 1000);
      if (seconds > 5) {
        trackEvent('time_on_page', 'engagement', location.pathname, seconds);
      }
    };

    // Use visibilitychange (more reliable than unload on mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendTimeOnPage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendTimeOnPage();
    };
  }, [location.pathname]);

  // Track outbound link clicks
  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
        trackEvent('outbound_click', 'engagement', href);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
};

// Use beacon transport for critical events to prevent data loss
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (window.gtag && !isLowQualitySession()) {
    const utm = getStoredUtm();
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      transport_type: 'beacon',
      ...(utm.utm_source && { campaign_source: utm.utm_source }),
    });
  }
};

// Track feature usage for engagement metrics
export const trackFeatureUse = (featureName: string) => {
  trackEvent('feature_use', 'engagement', featureName);
};

// Track search queries for content optimization
export const trackSearch = (query: string) => {
  trackEvent('search', 'engagement', query);
};

// --- Key conversion events for GA4 ---
export const trackChatInitiated = (sessionId: string) => {
  trackEvent('chat_initiated', 'conversion', sessionId);
};

export const trackRecommendationGiven = (strainOrTopic: string) => {
  trackEvent('recommendation_given', 'conversion', strainOrTopic);
};

export const trackPromptClicked = (promptLabel: string) => {
  trackEvent('prompt_clicked', 'engagement', promptLabel);
};

export const trackOrderLinkClicked = (destination: string) => {
  trackEvent('order_link_clicked', 'conversion', destination);
};

export const trackSignupComplete = (method: string) => {
  trackEvent('signup_complete', 'conversion', method);
  // Fire GA4 generate_lead event so it shows up in "Qualified Leads" report
  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      method,
      currency: 'ZAR',
      value: 0,
    });
  }
};

export const trackLeadCaptured = (source: string, email?: string) => {
  trackEvent('lead_captured', 'conversion', source);
  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      method: source,
      currency: 'ZAR',
      value: 0,
    });
  }
};

export const trackArticleEngaged = (slug: string) => {
  trackEvent('article_engaged', 'engagement', slug);
};
