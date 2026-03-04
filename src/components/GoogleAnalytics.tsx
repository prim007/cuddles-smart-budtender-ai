import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-KHJ04X5EE1';

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const GoogleAnalytics = () => {
  const location = useLocation();

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

  // Track time on page
  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    const start = Date.now();

    return () => {
      const seconds = Math.round((Date.now() - start) / 1000);
      if (seconds > 5) {
        trackEvent('time_on_page', 'engagement', location.pathname, seconds);
      }
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

  useEffect(() => {
    if (GA_TRACKING_ID && !document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date() as any);
        window.gtag('config', GA_TRACKING_ID, {
          send_page_view: true,
          cookie_flags: 'SameSite=None;Secure',
        });
      };
    }
  }, []);

  useEffect(() => {
    if (GA_TRACKING_ID && window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return null;
};

// Custom event tracking helper
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

// Fire when user sends their first message in a session
export const trackChatInitiated = (sessionId: string) => {
  trackEvent('chat_initiated', 'conversion', sessionId);
};

// Fire when the AI returns a strain/product recommendation
export const trackRecommendationGiven = (strainOrTopic: string) => {
  trackEvent('recommendation_given', 'conversion', strainOrTopic);
};

// Fire when a user clicks a quick-prompt button
export const trackPromptClicked = (promptLabel: string) => {
  trackEvent('prompt_clicked', 'engagement', promptLabel);
};

// Fire when user clicks an outbound product/order link from chat
export const trackOrderLinkClicked = (destination: string) => {
  trackEvent('order_link_clicked', 'conversion', destination);
};

// Fire on signup completion
export const trackSignupComplete = (method: string) => {
  trackEvent('signup_complete', 'conversion', method);
};

// Fire when blog article is read past 50%
export const trackArticleEngaged = (slug: string) => {
  trackEvent('article_engaged', 'engagement', slug);
};
