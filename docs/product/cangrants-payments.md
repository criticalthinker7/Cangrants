# CanGrants Payments

## Recommendation

Use Stripe Checkout for the first paid plan, with one recurring Pro subscription price. Do not collect card details directly in CanGrants. One-time or supporter payments can be evaluated later as separate Checkout flows, but they should not grant subscription-gated Pro access.

## Why Stripe First

- No custom PCI card handling in the app.
- Hosted Checkout and the customer portal reduce the app's security scope.
- Supports recurring subscriptions for Pro, plus separate one-time or supporter payments later if needed.
- Should be added after secure auth is in place.

## Bootstrap Pricing Shape

| Tier | Included |
| --- | --- |
| Free | Browse grants and save a limited number of grants. |
| Pro | One recurring subscription price for saving grants across devices, tracking applications, drafting proposals with AI, and receiving deadline reminders. |

## Implementation Order

1. Add secure auth and server-side user records.
2. Create the Stripe product and recurring price.
3. Add `/api/create-checkout-session`.
4. Add the Stripe webhook and verify every event signature before processing it.
5. From verified webhook events, persist the Stripe customer ID, subscription ID, and subscription status server-side, keyed to the authenticated user record.
6. Gate Pro UI and features from the server-side subscription state.

## Security Rules

- Keep `STRIPE_SECRET_KEY` server-only.
- Keep the Stripe webhook signing secret server-only.
- Verify every Stripe webhook signature with the webhook signing secret before processing events or updating subscription state.
- Use hosted Stripe Checkout and the hosted customer portal.
- Never trust client-provided subscription status.
