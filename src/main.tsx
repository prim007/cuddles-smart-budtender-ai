import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const STALE_MODULE_RELOAD_KEY = "cuddles:stale-module-reload";
const STALE_MODULE_ERROR_PATTERN = /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|Unable to preload CSS/i;
const SERVICE_WORKER_CLEANUP_KEY = "cuddles:service-worker-cleanup:v5-menu-live";
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
