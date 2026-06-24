# Deployment Guide

CanGrants should bootstrap on a managed static platform with server-side API execution for integrations.

Recommended bootstrap targets:

- **Vercel** for the fastest preview and production workflow.
- **Cloudflare Pages** if the project stays Cloudflare-first.

Keep AI and payment calls on server routes, serverless functions, or Workers. Do not call Gemini or Stripe directly from browser code.

## Required environment variables

Configure these variables in the hosting provider dashboard before deploying:

| Variable | Scope | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | Server-only | Used by AI chat/discovery routes. |
| `STRIPE_SECRET_KEY` | Server-only | Used to create hosted Stripe Checkout sessions and server-side billing calls. |
| `STRIPE_WEBHOOK_SECRET` | Server-only | Used to verify Stripe webhook signatures. |

Do not expose server secrets with `VITE_` prefixes or other public-client environment variable mechanisms.

## Vercel preview deployment

Use Vercel previews for branch and pull-request validation.

```bash
npm install
npm run lint
npm run build
vercel
```

If the project is not linked yet, follow the Vercel CLI prompts or run `vercel link` first. Add preview environment variables in Vercel Project Settings or with the Vercel CLI before testing routes that need Gemini or Stripe.

## Vercel production deployment

After preview validation, deploy production from the intended release branch:

```bash
npm install
npm run lint
npm run build
vercel --prod
```

Production must have the required server-only environment variables configured for the Production environment. Keep Stripe webhook endpoints pointed at the production deployment URL and use the matching `STRIPE_WEBHOOK_SECRET`.

## Cloudflare Pages and Workers

For a Cloudflare-first deployment:

1. Build the Vite app with `npm run build`.
2. Deploy the generated `dist/` output to Cloudflare Pages.
3. Route server-side AI, Stripe Checkout, and Stripe webhook logic through Cloudflare Workers.
4. If the Cloudflare-first decision remains, use D1 for Cloudflare-hosted persistence.

Store `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` as Worker secrets. Pages should serve the static UI; Workers should own privileged server operations.

## Security notes

- Never put server secrets in Vite public variables or browser bundles.
- Do not use real passwords in localStorage. The current local sign-in is demo-only until server-side auth is implemented.
- Use hosted Stripe Checkout instead of collecting card details in the app.
- Add bot protection and rate limiting before opening public AI-powered routes.
