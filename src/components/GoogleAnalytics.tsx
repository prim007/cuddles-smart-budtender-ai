import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Replace with your Google Analytics tracking ID
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX';

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

  useEffect(() => {
    if (GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX') {
      // Track page view on route change
      if (window.gtag) {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: location.pathname + location.search,
        });
      }
    }
  }, [location]);

  return null;
};

export const initGA = () => {
  if (GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX') {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date() as any);
    window.gtag('config', GA_TRACKING_ID);
  }
};

// Custom event tracking helper
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (window.gtag && GA_TRACKING_ID !== 'G-XXXXXXXXXX') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
