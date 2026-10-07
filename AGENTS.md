# Architecture rules

- Public newsletter signup must go through the `newsletter-subscribe` edge function so Brevo credentials, suppression checks, and consent records remain server-side.
- Public legal notices share `LegalPageLayout` so navigation, readability, and compliance links stay consistent across Privacy, Terms, and POPIA pages.
- Social features (profiles, connections, shared_items) only share display name + likes; sharing is restricted to accepted connections via `are_connected()` RLS.
- Edge functions that spend paid AI without requiring sign-in must enforce `consumeQuotas()` from `_shared/ai-quota.ts` (database-backed, including a site-wide ceiling), because in-memory limits reset on cold starts and are not shared across replicas.
