# Premium plan setup (chat stays free)

## Your data
The database still holds everything: 461 saved chats, 57 accounts, 14 profiles, 3 shops, 179 strain pages and 40 knowledge articles. No new chats have been saved since 18 Oct 2026, because the AI credits ran out and chats stopped getting answers. Topping up credits brings new chats back. Nothing needs restoring.

## Rule
The AI chat (website chat, budtender page, shop chat boxes) is always free and unlimited for everyone. It never goes behind Premium.

## Free vs Premium (from your document)

| Feature | Free | Premium |
| --- | --- | --- |
| AI chat, strain search, dispensary finder | Unlimited | Unlimited |
| Strain / plant photo scanner | 3 scans a month | Unlimited |
| Image & meme studio | 5 a day, Cuddles watermark | 20 a day, no watermark |
| Strain journal | Log sessions | Plus "what works for me" insights from your past logs |
| T-break coach | Timeline + tips | Plus daily personal check-ins |
| Grow tracker | Logs | Plus personal feeding and climate schedule |

Left out for now: smartwatch sync, trichome harvest predictor, 4K images. These are big builds and can come later.

## Prices
- Premium: R99/month by card (current), or US$5.49/month or US$49/year via PayPal.
- Retail starter (small clubs): left as-is on the existing business plan, not added now.

## Paying
- Keep the existing card checkout.
- Add "Pay with PayPal" on the Premium page only. PayPal is labelled "Cuddles AI Premium Software Subscription". It is never used for shop orders or delivery.
- When PayPal confirms a payment, Premium switches on; when it is cancelled, it switches off.

## Technical details
- New `paypal_subscriptions` table (RLS, user reads own rows, service role writes).
- Edge functions: `paypal-create-subscription` (auth'd, creates plan subscription via PayPal Billing API using saved PAYPAL_CLIENT_ID/SECRET, sandbox first), `paypal-webhook` (verifies signature, handles ACTIVATED / PAYMENT.SALE.COMPLETED / CANCELLED / SUSPENDED).
- `check-subscription` also returns subscribed when an active PayPal row exists.
- Server-side limits for scans and images keyed by Premium status (extend existing quota helper); watermark applied to free image results.
- Journal insights and T-break check-ins call the existing chat AI only for Premium users.
- Sandbox end-to-end payment test before switching to live PayPal codes.
