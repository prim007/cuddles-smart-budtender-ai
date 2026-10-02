# Architecture rules

- Public newsletter signup must go through the `newsletter-subscribe` edge function so Brevo credentials, suppression checks, and consent records remain server-side.
- Public legal notices share `LegalPageLayout` so navigation, readability, and compliance links stay consistent across Privacy, Terms, and POPIA pages.