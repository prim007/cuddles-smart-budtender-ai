import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";

// Finish sign-in from tokens/code that index.html removed from the URL.
{
  const w = window as unknown as { __cuddlesAuthFragment?: string; __cuddlesAuthCode?: string };
  if (w.__cuddlesAuthFragment) {
    const p = new URLSearchParams(w.__cuddlesAuthFragment);
    delete w.__cuddlesAuthFragment;
    const access_token = p.get("access_token");
    const refresh_token = p.get("refresh_token");
    if (access_token && refresh_token) {
      void supabase.auth.setSession({ access_token, refresh_token });
    }
  }
  if (w.__cuddlesAuthCode) {
    const code = w.__cuddlesAuthCode;
    delete w.__cuddlesAuthCode;
    void supabase.auth.exchangeCodeForSession(code).catch(() => undefined);
  }
}

const STALE_MODULE_RELOAD_KEY = "cuddles:stale-module-reload";
const STALE_MODULE_ERROR_PATTERN = /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|Unable to preload CSS/i;
const SERVICE_WORKER_CLEANUP_KEY = "cuddles:service-worker-cleanup:v12-force-redeploy";
const SERVICE_WORKER_RELOAD_KEY = "cuddles:service-worker-cleanup-reload";

const isCuddlesWebHost = () => {
  const { hostname, protocol } = window.location;

  if (protocol !== "https:" && hostname !== "localhost") return false;

  return [
    "cuddles-ai.com",
    "www.cuddles-ai.com",
    "cuddles-ai.lovable.app",
  ].includes(hostname) || hostname.endsWith(".lovable.app");
};

const isAppShellCache = (name: string) => {
  const lowerName = name.toLowerCase();
  const isNotificationCache = /firebase|onesignal|messaging|notification/.test(lowerName);
  const isKnownAppCache = /workbox|vite-pwa|precache|runtime|googleanalytics|cuddles/.test(lowerName);

  return isKnownAppCache && !isNotificationCache;
};

const clearStaleServiceWorkerCache = async () => {
  if (!isCuddlesWebHost()) return;
  if (window.localStorage.getItem(SERVICE_WORKER_CLEANUP_KEY) === "done") return;

  const cleanupResults: boolean[] = [];

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const unregisterResults = await Promise.allSettled(
      registrations.map((registration) => registration.unregister())
    );

    cleanupResults.push(registrations.length > 0 || unregisterResults.some((result) => result.status === "fulfilled" && result.value));
  }

  if ("caches" in window) {
    const cacheNames = await window.caches.keys();
    const appCacheNames = cacheNames.filter(isAppShellCache);
    const deleteResults = await Promise.allSettled(appCacheNames.map((name) => window.caches.delete(name)));

    cleanupResults.push(appCacheNames.length > 0 || deleteResults.some((result) => result.status === "fulfilled" && result.value));
  }

  window.localStorage.setItem(SERVICE_WORKER_CLEANUP_KEY, "done");

  if (cleanupResults.some(Boolean) && window.sessionStorage.getItem(SERVICE_WORKER_RELOAD_KEY) !== "done") {
    window.sessionStorage.setItem(SERVICE_WORKER_RELOAD_KEY, "done");
    window.location.reload();
  }
};

const recoverFromStaleModuleError = (value: unknown) => {
  const message = value instanceof Error ? value.message : String(value);
  if (!STALE_MODULE_ERROR_PATTERN.test(message)) return;
  if (window.sessionStorage.getItem(STALE_MODULE_RELOAD_KEY) === "true") return;
  window.sessionStorage.setItem(STALE_MODULE_RELOAD_KEY, "true");
  window.location.reload();
};

window.addEventListener("error", (event) => recoverFromStaleModuleError(event.error ?? event.message));
window.addEventListener("unhandledrejection", (event) => recoverFromStaleModuleError(event.reason));

void clearStaleServiceWorkerCache().catch(() => {
  window.localStorage.setItem(SERVICE_WORKER_CLEANUP_KEY, "done");
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
