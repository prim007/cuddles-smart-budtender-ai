import { useEffect } from "react";
import { trackInstallFunnel, detectInstallPlatform } from "@/components/GoogleAnalytics";

const STANDALONE_FIRED_KEY = "cuddles_install_standalone_fired";
const INSTALLED_FIRED_KEY = "cuddles_install_installed_fired";

/**
 * Global, app-level install funnel observer.
 * - Fires `install_installed` when the browser confirms installation (`appinstalled`).
 * - Fires `install_launched_standalone` the first time the app boots in standalone/PWA mode.
 * Mount once near the root (alongside <GoogleAnalytics />).
 */
const InstallFunnelTracker = () => {
  useEffect(() => {
    // Skip in iframes/preview
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    const platform = detectInstallPlatform();

    // 1. Detect launch as standalone PWA (fires once per browser)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      try {
        if (!localStorage.getItem(STANDALONE_FIRED_KEY)) {
          localStorage.setItem(STANDALONE_FIRED_KEY, Date.now().toString());
          // Defer slightly so GA is initialized
          setTimeout(() => trackInstallFunnel("launched_standalone", platform), 1500);
        }
      } catch {
        /* storage disabled */
      }
    }

    // 2. Listen for `appinstalled` — fires on Android/desktop Chromium right after install
    const handleInstalled = () => {
      try {
        if (localStorage.getItem(INSTALLED_FIRED_KEY)) return;
        localStorage.setItem(INSTALLED_FIRED_KEY, Date.now().toString());
      } catch { /* noop */ }
      trackInstallFunnel("installed", platform);
    };

    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, []);

  return null;
};

export default InstallFunnelTracker;
