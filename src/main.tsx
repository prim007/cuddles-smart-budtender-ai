import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const STALE_MODULE_RELOAD_KEY = "cuddles:stale-module-reload";
const STALE_MODULE_ERROR_PATTERN = /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|Unable to preload CSS/i;

const recoverFromStaleModuleError = (value: unknown) => {
  const message = value instanceof Error ? value.message : String(value);
  if (!STALE_MODULE_ERROR_PATTERN.test(message)) return;
  if (window.sessionStorage.getItem(STALE_MODULE_RELOAD_KEY) === "true") return;
  window.sessionStorage.setItem(STALE_MODULE_RELOAD_KEY, "true");
  window.location.reload();
};

window.addEventListener("error", (event) => recoverFromStaleModuleError(event.error ?? event.message));
window.addEventListener("unhandledrejection", (event) => recoverFromStaleModuleError(event.reason));

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
