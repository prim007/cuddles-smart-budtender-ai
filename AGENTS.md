# Architecture rules

- In-app hash navigation observes lazy-loaded sections until the target exists, so cross-page chat links reach the chat instead of leaving visitors at the homepage top.

- Optional lazy-loaded homepage visuals use a local error boundary with the existing static mascot fallback, so import or WebGL failures cannot blank the page.

- Homepage audience choices use a shared static coming-soon page with separate URLs; they do not call paid services or replace existing tools.

- Knowledge ingestion includes a generated, chunked snapshot of public blog and partner catalogue sources; regenerate with scripts/prepare-rag-refresh.ts so edge deployment shares the site's source material without treating dated catalogue stock or draft laws as current facts.

- Image Studio generation is authenticated and server-only, with fail-closed database spend quotas and a service-only persistent gateway pause; keep generated results private in the current page and downloadable, not in a public gallery.
- Generated image downloads convert the image data into a Blob URL and attach the download link to the document so large results download reliably without data-URL navigation.

- Public newsletter signup must go through the `newsletter-subscribe` edge function so Brevo credentials, suppression checks, and consent records remain server-side.
- Public legal notices share `LegalPageLayout` so navigation, readability, and compliance links stay consistent across Privacy, Terms, and POPIA pages.
- Social features (profiles, connections, shared_items) only share display name + likes; sharing is restricted to accepted connections via `are_connected()` RLS.
- Companion rooms use separate RLS-protected transcripts for owners and currently accepted friends; group AI calls omit personal JWT/history, only server code writes assistant replies, and approved tasks stay owner-private without automatically sending alerts.
- Edge functions that spend paid AI without requiring sign-in must enforce `consumeQuotas()` from `_shared/ai-quota.ts` (database-backed, fail-closed, including a site-wide ceiling), because in-memory limits reset on cold starts and are not shared across replicas.
- Chat AI (smart-budtender, widget-chat, plant-care-tips, tolerance-coach, generate-strain-profile, agent-recommend) runs on Anthropic Claude through the Lovable AI Gateway's `/v1/messages` endpoint via `_shared/claude.ts` — the gateway rejects Claude on `/v1/chat/completions`, and `_shared/claude.ts` converts requests to Anthropic format and streams Claude SSE back as OpenAI-style chunks so the browser parsers stay unchanged. Vision, image generation, and embeddings keep their existing providers.
- Phone alerts use standard Web Push (VAPID) via `_shared/web-push.ts` and a dedicated `/push/` scoped worker, with every alert deduplicated in `push_sent_log`, so repeated cron or manual triggers never double-send and the app-shell cleanup never removes the alerts worker.
- Premium gating is decided server-side via `_shared/premium.ts` (card subscription, Stripe, or PayPal re-verified with PayPal) and limits live in `_shared/premium-limits.ts`; the AI chat never calls it, because chat must stay free for everyone.
- PayPal subscriptions are confirmed by querying PayPal directly (`paypal-confirm`, periodic re-check in `_shared/premium.ts`) instead of a webhook, so no webhook secret is needed and cancellations are caught on the next check.
- Shop weekly reports and the public monthly question report share `_shared/question-topics.ts` and `_shared/insight-report.ts`; the shop website chat stores only topic labels (`widget_topic_events`, server-only) and public reports suppress small topic counts and round totals, so no message text or visitor identity is ever exposed.
- The website chat install code is built only by `src/lib/embedSnippet.ts` (used by shop setup and /docs), so the script address shops paste never drifts from where `widget.js` is actually served.
- The main chat reads pasted web pages and searches Reddit reviews only through the `read_shop_page` / `search_reviews` tools in `smart-budtender/web-tools.ts` (Firecrawl, server-side), with their own fail-closed per-person and site-wide daily quotas and page text labelled as untrusted data, because each lookup costs money and pages can carry prompt injection.
