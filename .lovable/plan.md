# Growth Plan: 4 Levers to Increase Chat Volume

Goal: turn the current ~3 chats/week into a steady stream by improving acquisition, activation, retention, and B2B distribution.

## 1. Acquisition — Programmatic SEO city pages

Create dynamic landing pages for South African cannabis searches.

- New route `/dispensary-near-me/:city` rendered by a single `CityDispensaryPage` component
- Seed list of 12 ZA cities: Johannesburg, Cape Town, Durban, Pretoria, Port Elizabeth, Bloemfontein, East London, Polokwane, Nelspruit, Kimberley, Pietermaritzburg, Stellenbosch
- Each page: unique H1, intro copy mentioning the city, embedded `DispensaryFinder` pre-set to that city, FAQ section, JSON-LD `LocalBusiness`/`FAQPage`
- Add all 12 URLs to `public/sitemap.xml`
- Cross-link from Footer "Popular searches"

## 2. Activation — Make the chat impossible to miss

- `StickyChatFAB`: auto-open after 8 s of idle on first visit (sessionStorage flag so it doesn't nag on every page)
- Rotating teaser bubble above the FAB cycling through: "Try: 'strain for anxiety'", "Try: 'dispensary near me'", "Try: 'help me sleep'"
- Promote `HeroQuickPrompts` above the fold and make each chip a one-click chat-open with the prompt pre-filled

## 3. Retention — Welcome-back email for existing leads

Note: Lovable Emails policy forbids bulk/marketing blasts. We will instead wire a **transactional welcome-back email** that fires when an existing `email_leads` row gets a new chat session — a legitimate per-recipient event.

- New template `welcome-back.tsx` in `_shared/transactional-email-templates/`
- Edge function trigger: when `chat_conversations` insert matches a known `email_leads.email`, enqueue the email once per 7-day window (dedupe in `email_send_log`)
- Template: "Cuddles remembered you 🌿 — 3 new strains matched to your last question" + CTA to open chat

## 4. B2B amplification — Dispensary widget outreach surface

- New admin-only page `/admin/widget-outreach` listing all `tenants` with status, embed-key copy button, and a "Send install email" action that triggers the existing onboarding email
- Public marketing block on the homepage: "Are you a dispensary? Add Cuddles to your site in 2 minutes" linking to `/dispensary-onboarding`
- Track widget impressions: add a `widget_view` event to `ab_events` from `widget.js` so we can see which tenants are actually embedding

## Technical Section

| Lever | Files touched |
|---|---|
| 1 | New `src/pages/CityDispensaryPage.tsx`, new `src/data/zaCities.ts`, `src/App.tsx` route, `public/sitemap.xml`, `src/components/Footer.tsx` |
| 2 | `src/components/StickyChatFAB.tsx`, `src/components/HeroQuickPrompts.tsx`, `src/components/Hero.tsx` |
| 3 | New `supabase/functions/_shared/transactional-email-templates/welcome-back.tsx`, update `registry.ts`, new `supabase/functions/trigger-welcome-back/index.ts` (DB-trigger callable), one migration for the `pg_net` trigger on `chat_conversations` |
| 4 | New `src/pages/WidgetOutreach.tsx` (admin-gated), `src/App.tsx` route, `public/widget.js` (add fetch to log `widget_view`), `src/components/Hero.tsx` (B2B block) |

## Out of scope (cannot be done in code)

- Paid Google/Meta ads — you'd need to fund and run those in the ad consoles
- TikTok/Instagram Reels publishing — Remotion can render the videos but posting is manual
- Actual dispensary cold-outreach — the page makes outreach easier but you/team still send the emails

## Order of execution

1. Lever 2 (activation) — fastest impact, ~30 min, no schema changes
2. Lever 1 (SEO city pages) — biggest long-term lever, ~1 hour
3. Lever 4 (B2B page + widget tracking) — ~45 min
4. Lever 3 (welcome-back email) — last, requires migration + edge function deploy

Reply **"go"** to execute all four, or name the lever(s) to skip.
