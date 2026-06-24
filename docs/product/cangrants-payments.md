# CanGrants Payments

## Recommendation

Use Stripe Checkout for the first paid plan. Do not collect card details directly in CanGrants.

## Why Stripe First

- No custom PCI card handling in the app.
- Hosted Checkout and the customer portal reduce the app's security scope.
- Supports a one-time payment model or recurring subscriptions.
- Should be added after secure auth is in place.

## Bootstrap Pricing Shape

| Tier | Included |
| --- | --- |
| Free | Browse grants and save a limited number of grants. |
| Pro | Save grants across devices, track applications, draft proposals with AI, and receive deadline reminders. |

## Implementation Order

1. Add secure auth and server-side user records.
2. Create the Stripe product and recurring price.
3. Add `/api/create-checkout-session`.
4. Add the Stripe webhook.
5. Gate Pro UI from server-side subscription status.

## Security Rules

- Keep `STRIPE_SECRET_KEY` server-only.
- Keep the Stripe webhook signing secret server-only.
- Use hosted Stripe Checkout and the hosted customer portal.
- Never trust client-provided subscription status.
