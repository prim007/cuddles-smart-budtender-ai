# Architecture rules

- Public newsletter signup must go through the `newsletter-subscribe` edge function so Brevo credentials, suppression checks, and consent records remain server-side.
- Public legal notices share `LegalPageLayout` so navigation, readability, and compliance links stay consistent across Privacy, Terms, and POPIA pages.- Project rule: social features (profiles, connections, shared_items) only share display name + likes; sharing restricted to accepted connections via are_connected() RLS.
