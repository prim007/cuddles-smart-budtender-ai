# Cute Cuddles AI newsletter signup

## Build
- Add a dedicated public newsletter page with a calm, playful Cuddles look, one email field, one clear subscribe button, privacy reassurance, and an educational disclaimer.
- Show clear loading, success, already-subscribed, and error states without sending visitors elsewhere.
- Add the page to the app at `/newsletter` with matching search metadata.

## Brevo connection
- Add a narrowly scoped public signup function that validates the email, records consent, respects suppressed addresses, and adds the person to the existing **Cuddles Newsletters Subs** Brevo list.
- Prevent abuse with request limits and generic responses that do not reveal whether an address was already registered.
- Keep unsubscribe handling intact.

## Verify
- Confirm the page works on desktop and mobile, submits successfully, and shows no runtime errors.
- Confirm a test subscription reaches the correct Brevo list without exposing private keys.
