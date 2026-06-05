import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import prerender from "@prerenderer/rollup-plugin";

// Routes prerendered at build time so Google can index content instantly.
// Auth-gated pages (/journal, /scanner) still render — they show signed-out
// marketing content suitable for indexing.
const PRERENDER_ROUTES = [
  "/",
  "/strains",
  "/blog",
  "/journal",
  "/scanner",
  "/reviews",
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && prerender({
      routes: PRERENDER_ROUTES,
      renderer: "@prerenderer/renderer-puppeteer",
      rendererOptions: {
        renderAfterTime: 4000,
        maxConcurrentRoutes: 2,
        headless: true,
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
      postProcess(renderedRoute: { route: string; html: string }) {
        // Keep noscript blocks intact for crawlers; placeholder for future
        // HTML sanitization (e.g. removing SW boot scripts).
        renderedRoute.html = renderedRoute.html;
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
