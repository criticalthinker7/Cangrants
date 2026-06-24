# Deployment Guide

CanGrants should bootstrap on a managed static platform for the UI, with server-side API execution added for integrations.

Recommended bootstrap targets:

- **Vercel** for the fastest static UI preview and production workflow.
- **Cloudflare Pages** if the project stays Cloudflare-first for static hosting.

The current repository has a Vite static build plus an Express server in `server/index.ts` that calls `app.listen`. A default Vercel or Cloudflare Pages static deployment can serve the UI, but it will not automatically run the Express `/api/chat` route. To enable chat in a hosted environment, either adapt `/api/chat` to the platform's serverless/Worker API model or host the Express server separately.

Keep AI and payment calls on server routes, serverless functions, separately hosted servers, or Workers. Do not call Gemini or Stripe directly from browser code.

## Environment variables

Configure environment variables in the hosting provider dashboard for the runtime that uses them.

### Current AI configuration

| Variable | Scope | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | Server-only | Optional for local/static fallback behavior; required only for Gemini-backed AI responses on the server runtime that handles `/api/chat`. |

### Future payments configuration

These variables are conditional and only needed after Stripe payments are implemented server-side:

| Variable | Scope | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | Server-only | Future use for creating hosted Stripe Checkout sessions and server-side billing calls. |
| `STRIPE_WEBHOOK_SECRET` | Server-only | Future use for verifying Stripe webhook signatures. |

Do not expose server secrets with `VITE_` prefixes or other public-client environment variable mechanisms.

## Vercel static UI preview deployment

Use Vercel previews for branch and pull-request validation of the static UI.

```bash
npm install
npm run lint
npm run build
vercel
```

If the project is not linked yet, follow the Vercel CLI prompts or run `vercel link` first. This deploy path serves the Vite UI; it does not make the current Express `/api/chat` route available as a Vercel Function.

Before Gemini-backed chat works on Vercel, adapt the Express route to a Vercel serverless function/API route or point the UI at a separately hosted Express server. Configure `GEMINI_API_KEY` in the server runtime that handles chat.

## Vercel static UI production deployment

After preview validation, deploy the static UI to production from the intended release branch:

```bash
npm install
npm run lint
npm run build
vercel --prod
```

Production chat and payment endpoints need their own server-side deployment path. Do not point Stripe webhook endpoints at a Vercel static UI deployment unless webhook handling has been implemented as a Vercel Function or another reachable server endpoint.

## Cloudflare Pages and Workers

For a Cloudflare-first static UI deployment:

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name cangrants
```

This deploys the current Vite UI to Pages. Workers/API implementation is still pending before Gemini-backed AI chat, Stripe Checkout, or Stripe webhooks work on Cloudflare.

If the Cloudflare-first decision remains:

1. Route server-side AI, Stripe Checkout, and Stripe webhook logic through Cloudflare Workers.
2. Store `GEMINI_API_KEY` and future Stripe secrets as Worker secrets.
3. Use D1 for Cloudflare-hosted persistence if the app needs Cloudflare-native storage.

Pages should serve the static UI; Workers should own privileged server operations.

## Security notes

- Never put server secrets in Vite public variables or browser bundles.
- Do not use real passwords in localStorage. The current local sign-in is demo-only until server-side auth is implemented.
- Use hosted Stripe Checkout instead of collecting card details in the app.
- Add bot protection and rate limiting before opening public AI-powered routes.
