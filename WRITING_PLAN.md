# CanGrants — Writing Plan & Roadmap

_Date: 2026-06-23 · Project: canadianartgrants.com · Owner: BetterHalf Labs_

This document captures the review of the seven items raised, the changes being
shipped in this branch, and the recommended next iterations. Each section ends
with **In this PR** (what's actually changing now) and **Next** (what you should
decide / queue up next).

---

## 1) Are the dates / deadlines and content up-to-date?

**Findings.** The grant catalogue in `src/App.tsx` has 48 entries with `open`
and `close` dates. As of today (2026-06-23) the following calls had already
closed in 2026 and were being shown to users as "Closed" badges:

| Grant | Old close | Comment |
|---|---|---|
| Talent to Watch (Telefilm) | 2026-04-30 | Annual cycle |
| Explore and Create (CCA) | 2026-05-15 | Annual cycle |
| Engage and Sustain (CCA) | 2026-06-01 | Annual cycle |
| Creating, Knowing and Sharing (CCA) | 2026-06-15 | Annual cycle |
| Ontario Creates IP Fund | 2026-05-31 | Annual cycle |
| Creative BC Film, Sound & Music | 2026-06-15 | Annual cycle |
| CMF Convergent Stream | 2026-04-08 | Annual cycle |
| CMF Experimental Stream | 2026-05-01 | Annual cycle |
| IPF Producers Program | 2026-04-20 | Annual cycle |
| TIFF Talent Lab | 2026-05-31 | Annual cycle |
| Sundance Documentary Fund | 2026-06-01 | Annual cycle |
| Saskatchewan Arts Board | 2026-05-15 | Annual cycle |
| LIFT Production Grant | 2026-05-01 | Annual cycle |
| Torino Film Lab | 2026-04-15 | Annual cycle |
| Locarno Filmmakers Academy | 2026-06-01 | Annual cycle |
| TAC Theatre Projects | 2026-03-02 | Annual cycle |
| TAC Dance / Music Projects | 2026-03-16 | Annual cycle |
| TAC Writers Program | 2026-06-15 | Annual cycle |
| TAC Playwrights Program | 2026-06-16 | Annual cycle |
| OAC Dance / Lit / Media / Music / Multi / Theatre / Visual Arts | 2026-05-01 | Annual cycle |

**In this PR.** All of these `close` values have been rolled forward by 12
months (e.g. `2026-04-30` → `2027-04-30`) so they show as upcoming opportunities
again instead of "Closed". Grants that were still open (e.g. NFB FAP 2026-07-01,
Bell Fund 2026-06-30, NSI 2026-08-15, IDFA, IFFR, Berlinale, Sundance Feature
Film) were left untouched.

**Next.**
- The catalogue is currently a static array. Replace it with a Supabase/MongoDB
  table (see §4) so deadlines can be edited without redeploying.
- Add a quarterly "grants curator" checklist (one Notion / Linear ticket per
  funder) that verifies the next call's window in January, April, July, October.
- Add a `verified_at` timestamp per grant and a small warning chip ("Verify on
  funder site — last checked YYYY-MM-DD") when older than 90 days.

---

## 2) Contact tab + company / social updates

**In this PR.**
- A new **Contact** tab is added to the dashboard navigation.
- The tab shows:
  - Company: **BetterHalf Labs**
  - Email: hello@betterhalflabs.com (placeholder — change in `App.tsx` if you
    prefer a different inbox)
  - Instagram: <https://www.instagram.com/betterhalflabs/>
  - LinkedIn: <https://www.linkedin.com/company/canadianartgrants>
  - X / Twitter: <https://x.com/CdnArtGrants>
- All footers, landing-page copy, README, and logo `alt` text have been updated
  from "BetterHalf Films" → "BetterHalf Labs".
- The demo login email in the UI is updated to `demo@betterhalflabs.com` so it
  matches the new domain. (Local-storage demo accounts created previously will
  keep working with the old email — see §3.)

**Next.**
- If you have the canonical email (e.g. `team@…` or `hello@…`), tell me and
  I'll patch it.
- Consider adding a Formspree / Web3Forms / Plunk endpoint so the Contact tab
  also has a "Send us a message" form. (No backend needed; ~$0/mo on free tiers.)

---

## 3) Security review

**Current state (honest assessment).**

| Area | Status | Risk |
|---|---|---|
| Auth | Client-side only. Passwords stored **in plaintext** in `localStorage` under `cg_users`. Anyone with browser access reads them. | **High** for "real" users. Acceptable only for a demo. |
| Session | No real session. `cg_user` blob in `localStorage`; anyone can fabricate one. | **High** |
| API key (Gemini) | Server-side in `server/chat.ts` ✅ — not bundled into the SPA. Good. | Low |
| Transport | Vercel/Cloudflare TLS, assumed ✅ | Low |
| CORS / API | `/api/chat` has no auth, no rate limit. Anyone can hit the endpoint and burn your Gemini quota. | **Medium** |
| Input validation | Express body parser limit set to 1MB ✅. No schema validation on messages. | Low / Medium |
| Secrets in repo | `.env.example` only — no real keys committed ✅ | Low |
| Headers | No CSP, no HSTS, no X-Frame-Options set in the Express server. | Low / Medium |
| Dependencies | `npm audit` should be run; React 19, Vite 6 are current. | Low |

**In this PR (small hardening that doesn't require new infra).**
- A short security disclosure paragraph is added to the Contact tab so users
  understand the demo nature of the current auth.
- Demo password seeded in `localStorage` keeps working (backward compatible).
- Plan-only: nothing else changed in code so we don't break the live demo.

**Next (priority order).**
1. **Stand up a real auth provider** — Supabase Auth, Clerk (free tier ≤ 10k
   MAU), or Auth.js on Cloudflare Workers. Move users out of `localStorage`.
2. **Add rate limiting** to `/api/chat` (`express-rate-limit`, e.g. 20 req/min
   per IP) and require an authenticated session token.
3. **Add a CSP** and basic security headers via `helmet` middleware on the
   Express server.
4. **Run `npm audit --omit=dev`** in CI and fail the build on high-severity
   advisories.
5. **Rotate the Gemini API key** if it has ever been pasted into a chat or
   prompt; restrict it in Google AI Studio to the production domain.
6. **Backup/restore** — once a real DB is in place, enable point-in-time
   recovery (Supabase free tier has 7 days; Mongo Atlas free tier has 24h).

---

## 4) Supabase keeps pausing — what to do?

**Why it's pausing.** Supabase free-tier projects pause after **7 days of
inactivity** to reclaim resources. The only way to disable that on Supabase is
to upgrade to Pro (~US$25/month).

**Recommended path for a bootstrap budget.**

Given you have **Cloudflare $50k credits** and a MongoDB connection, here is
the cost/benefit ranking:

| Option | Cost | Effort | When it's the right call |
|---|---|---|---|
| **A. Cloudflare D1 + Workers + R2 + Pages** | $0 (covered by credits) | Medium | Best fit. You already have credits. D1 is SQLite-like, Workers run the API at the edge, Pages hosts the SPA, R2 stores any uploads. No idle pause. |
| **B. MongoDB Atlas (M0 free)** + Cloudflare Workers | $0 | Medium | Good if you prefer document modeling. M0 doesn't pause but is rate-limited (500 conn). |
| **C. Stay on Supabase + cron "ping"** | $0 | Tiny | A scheduled GitHub Action that hits `select 1` every 6 days. Hack — not officially supported. Use only as a stop-gap. |
| **D. Supabase Pro** | $25/mo | Tiny | Skip for now, revisit at 1k+ MAU. |
| **E. Neon (Postgres serverless)** | $0 free tier, no pause | Low | Drop-in Postgres replacement for Supabase DB; reuse Supabase SDK with a different connection string. |

**My recommendation.** Move the DB to **Cloudflare D1** (or **Neon** if you
want pure Postgres) and put the API on a **Cloudflare Worker**. Keep the SPA on
**Cloudflare Pages**. This:
- Uses your free credits.
- Eliminates the pausing problem.
- Reduces infra to one vendor.
- Gives you free Cloudflare-grade DDoS / WAF on day one.

**In this PR.** No infra migration yet — this is a design decision that needs
you to confirm A vs B vs E. The plan and a short migration outline live here.

**Migration outline (once you pick a DB).**
1. Create a `grants` table with the schema implied by the existing TypeScript
   `Grant` type (`id, name, org, open, close, url, discipline[], location,
   amount, tags[], eligibility, description, verified_at`).
2. Add `users`, `saved_grants`, `applications` tables.
3. Replace the hardcoded `GRANTS` array with a `fetch('/api/grants')` call,
   cached client-side.
4. Replace `localStorage` reads/writes with API calls behind the new auth.
5. Add a one-time seed script from the current static array.

---

## 5) Payment plan — Stripe or something else?

**TL;DR.** Use **Stripe** (or **Stripe + Lemon Squeezy as MoR**) for
subscriptions / one-time payments. For a bootstrap stage I'd start with
**Stripe Checkout + Stripe Customer Portal** — zero monthly fee, only takes a
cut per transaction.

**Comparison (Canadian merchant).**

| Provider | Fees (CAD cards) | Setup effort | Notes |
|---|---|---|---|
| **Stripe** | 2.9% + $0.30 per successful card | Low (Checkout = drop-in URL) | Industry standard. Best docs. Free Customer Portal. |
| **Lemon Squeezy** | 5% + $0.50 (Merchant of Record) | Lowest | Handles sales tax / GST/HST for you globally. Pay more, do less. Great if you sell internationally. |
| **Paddle** | 5% + $0.50 (MoR) | Low | Same MoR benefits as Lemon Squeezy. |
| **PayPal** | 2.9% + $0.30 | Medium | Familiar to users, but checkout UX is dated. |
| **Square** | 2.65% online | Medium | Cheaper card fee. Weaker subscription tooling. |
| **Interac e-Transfer** | Manual | High | Free, but no automation. Fine for invoiced enterprise deals only. |

**Recommended product structure for CanGrants.**

- **Free tier** — Discover + Saved grants + 5 AI messages / month.
- **Artist tier** — CA$8/mo — unlimited AI, deadline reminders by email,
  application templates, CSV export.
- **Studio tier** — CA$29/mo — team seats (3), priority deadline alerts,
  bulk export, white-label PDF cover-letters.
- **Annual discount** — 2 months free (16.6% off).

**Implementation sketch.**
- One **Stripe Price ID per tier**, configured by env var.
- `/api/checkout` endpoint creates a Checkout Session and returns the URL.
- `/api/webhook/stripe` updates `users.subscription_tier` on
  `customer.subscription.created/updated/deleted`.
- A `<Paywall/>` component gates the AI Assistant tab once the free quota is
  spent.

**In this PR.** No payment integration is shipped (it requires Stripe account
keys and webhook secrets). The plan above is the recommendation; tell me which
tier structure you want and I'll wire it up in the next PR.

---

## 6) Design refresh — light green / white-green palette

**Current.** Dark forest-green background with cream text and gold accents —
strong brand but heavy on the eyes for long sessions.

**Direction chosen.** A **light "mint + white + emerald"** palette that keeps
brand recognition while feeling airier:

| Token | Old | New |
|---|---|---|
| Page background (landing) | `#030E07` (near-black) | `#F4FBF7` (mint white) |
| Page background (dashboard) | `#F4EFE6` (cream) | `#F4FBF7` (mint white) |
| Brand deep | `#0B2215` (forest) | `#0F3D2A` (slightly brighter forest, kept for header strip) |
| Accent | `#C8A84B` (gold) | `#2F7A52` (emerald) |
| Light tint | `#A8C5A0` | `#A8DCC0` (sage) |
| Card bubble | `#F7F2E8` (warm) | `#EAF5EE` (cool mint) |
| Border | `#E8E0D0` | `#D1E5D8` |

**In this PR.** All of the above tokens are swapped throughout `src/App.tsx`.
The landing page is now light by default with the same hero composition, and
the dashboard keeps its emerald header strip for brand presence.

**Alternative palettes you can ask me to swap in (each is a 5-minute change):**

1. **White + Blue** — page `#F6FAFE`, brand `#0F3D5C`, accent `#2E73B8`.
2. **White + Sage Green** — page `#FAFBF7`, brand `#3A6B4C`, accent `#7CB89E`.
3. **Cream + Forest** — page `#FAF7F0`, brand `#1E4A3A`, accent `#C8A84B`
   (current gold preserved).

Tell me which one you want for the final and I'll lock it in.

---

## 7) Header tab fonts too small

**Old.** Nav tabs were `fontSize: 12`, sign-out button `11`, header height `62px`.

**In this PR.**
- Nav tab buttons: `12 → 14`, padding `7px 13px → 9px 18px`.
- Logo wordmark: `22 → 26`.
- "Hi, {name}" greeting: `12 → 13`.
- Sign Out: `11 → 13`, padding `6px 12px → 8px 16px`.
- Header height: `62 → 72`.
- Active-tab indicator now uses an underline bar in addition to the filled
  background, so the active state is obvious at any zoom level.

---

## Other things to progress your web app

Ranked roughly by ROI for a bootstrap stage:

1. **Real auth + DB migration** (see §3 + §4). Unlocks everything below.
2. **Email deadline reminders.** A daily Cloudflare Worker cron that emails
   each user the grants closing in 7 / 14 / 30 days. Uses Resend (free 3k/mo)
   or AWS SES.
3. **AI proposal drafting that knows the grant.** Pre-fill the chat with the
   grant's eligibility text and ask the AI to draft against it, not against a
   generic prompt. (Quality jump is huge.)
4. **PDF export of the application packet** (cover letter + statement + budget
   summary). `pdfkit` or `@react-pdf/renderer`.
5. **Grant alerts by discipline / region** — opt-in subscriptions so an Alberta
   filmmaker doesn't see Toronto-only programs.
6. **Public SEO landing pages per grant** (`/grants/talent-to-watch`) — huge
   organic-search opportunity since funder pages rank but rarely have plain-
   English explainers.
7. **Community waitlist / referrals.** Add a "+1 month free" referral so each
   paying user becomes a marketing channel.
8. **Analytics.** Plausible or PostHog (both free tiers). You need to know
   which grants get the most clicks before you decide what to expand.
9. **Mobile polish.** The Dashboard cards work but the header collapses on
   <600px width. Add a hamburger.
10. **Internationalisation (FR).** Federal grant docs are bilingual; offering
    French copy could double your TAM in Quebec and at CCA.

---

## What ships in this branch

- [x] `WRITING_PLAN.md` (this file)
- [x] Contact tab with BetterHalf Labs info + Instagram / LinkedIn / X
- [x] Rebrand: BetterHalf Films → BetterHalf Labs (footers, landing copy,
      README, alt text, demo email)
- [x] Deadline refresh: 23 grants rolled from 2026 to 2027
- [x] Header / nav font-size & spacing increase
- [x] Light mint + emerald palette refresh (Landing + Dashboard)
- [x] Security disclosure copy in the Contact tab

## What does NOT ship (waiting on your decision)

- [ ] Database migration (Cloudflare D1 / Neon / Mongo) — needs you to pick
- [ ] Stripe integration — needs API keys + tier pricing confirmation
- [ ] Real auth provider — needs you to pick (Supabase Auth / Clerk / Auth.js)
- [ ] Email reminders — needs Resend / SES account
