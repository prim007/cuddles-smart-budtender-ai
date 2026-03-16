import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-KHJ04X5EE1';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GoogleAnalytics = () => {
  const location = useLocation();

  // Load GA script once — use gtag recommended loading pattern
  useEffect(() => {
    if (!GA_TRACKING_ID || document.getElementById('ga-script')) return;

    // Initialize dataLayer before script loads to queue events
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date() as any);
    window.gtag('config', GA_TRACKING_ID, {
      send_page_view: false, // We send manually on route change to avoid double-counting
      cookie_flags: 'SameSite=None;Secure',
      transport_type: 'beacon', // Use navigator.sendBeacon for reliability
    });

    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);
  }, []);

  // Track page views on route change — send after short delay to capture correct title
  useEffect(() => {
    if (!GA_TRACKING_ID || !window.gtag) return;

    const timer = setTimeout(() => {
      window.gtag?.('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
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
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      transport_type: 'beacon',
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
};

export const trackArticleEngaged = (slug: string) => {
  trackEvent('article_engaged', 'engagement', slug);
};
