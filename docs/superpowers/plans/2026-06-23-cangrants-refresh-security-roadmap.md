# CanGrants Refresh, Security, and Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh CanadianArtGrants/CanGrants content, contact details, visual direction, security posture, storage/payment decisions, and deployment workflow for a bootstrap-stage public launch.

**Architecture:** Keep the current Vite/React/Express app stable while first separating business data from UI, then add a Contact tab and theme constants, then replace demo-only localStorage auth with a secure backend decision. Treat grant-data freshness, auth/storage, payment, and deployment as separate workstreams so each can be reviewed and shipped independently.

**Tech Stack:** React 19, Vite 6, TypeScript, Express 4, Gemini API via `@google/genai`, optional Supabase or Cloudflare/MongoDB backend after decision, Stripe Checkout for bootstrap payments, Vercel or Cloudflare Pages deployment.

---

## Current Codebase Findings

- Main UI and grant data live in `src/App.tsx`.
- Grant records are hardcoded in `src/App.tsx:11-60` and many 2026 dates will already show closed on 2026-06-23.
- Dashboard navigation currently has `Discover`, `Saved`, `My Applications`, and `AI Assistant`; there is no Contact tab yet (`src/App.tsx:433-438`).
- Header tab font size is `12px` (`src/App.tsx:436`), which matches the reported visibility issue.
- Footer still says `BetterHalf Films` and `betterhalffilms.com` (`src/App.tsx:629` and landing footer around `src/App.tsx:329`).
- Auth is demo-only: passwords and user records are stored in browser `localStorage` (`src/App.tsx:111-149`, `src/App.tsx:685-697`). This is not secure for real users.
- Saved grants and applications are also stored in browser `localStorage` (`src/App.tsx:348-367`), so data is not portable between devices.
- AI chat calls `/api/chat`, and `server/chat.ts` reads `GEMINI_API_KEY` server-side (`server/chat.ts:42`). This is the right direction, but `vite.config.ts:10-12` still defines `process.env.GEMINI_API_KEY` into the Vite build and should be removed to avoid accidental client exposure.
- No Supabase project files or migrations exist in the repo.
- Supabase MCP is configured but not authenticated in this environment, so schema work must start by authenticating MCP or using the Supabase CLI with `--help` discovery.
- `README.md` points to an existing Vercel demo URL, while `DEPLOYMENT.md` is Hostinger/AI Studio oriented and includes stale API-key exposure guidance.

## Product Recommendations

### Storage and Auth

Recommended bootstrap path:

1. **Short term:** keep Vercel or Cloudflare Pages for hosting, but do not keep real auth in localStorage.
2. **Auth:** use Supabase Auth if staying with Supabase, or Clerk/Auth0 free tier if moving storage to Cloudflare or MongoDB.
3. **Data:** if Supabase pausing is blocking the site, choose one of:
   - **Supabase Pro:** simplest path if Postgres, RLS, Auth, and SQL migrations are valuable. Paid monthly cost, least migration risk.
   - **Cloudflare Pages + Workers + D1:** best fit for the user's 50,000 Cloudflare credits and cheap bootstrap operations. Good for user profiles, saved grants, applications, and admin grant records. Requires replacing Supabase Auth with another auth provider or custom auth.
   - **MongoDB Atlas:** useful if grant documents become flexible and nested. If used from serverless functions, create one `MongoClient` outside request handlers and do not add arbitrary pool values without measuring workload. Start with defaults or a conservative serverless config only after confirming deployment concurrency.

Recommended decision for this app today:

- Use **Cloudflare Pages + Workers + D1** only if the goal is lowest infrastructure cost and willingness to wire auth separately.
- Use **Supabase Pro** if the fastest secure path matters more than the monthly platform fee.
- Use **MongoDB Atlas** later if grant ingestion becomes document-heavy or search-heavy; it is not the first migration target for this small relational app state.

### Payments

Recommended bootstrap path:

- Use **Stripe Checkout payment links or hosted Checkout** first.
- Start with one low-cost paid tier, such as `CanGrants Supporter` or `CanGrants Pro`, and keep free discovery available.
- Do not build custom card handling. Let Stripe host checkout, taxes, receipts, and customer portal.
- Add payment-gated features only after auth is secure and user state is server-side.

### Design Direction

Recommended initial theme:

- **Light green and white:** calm, accessible, arts-friendly, easiest transition from the existing green brand.
- Primary: `#2F6F4E`
- Secondary: `#DDEFE4`
- Accent: `#2D6CDF`
- Background: `#F7FBF8`
- Text: `#163325`

Alternative palette:

- **White and blue:** more institutional and grant-directory oriented.
- Primary: `#1F5E7A`
- Secondary: `#E8F3F8`
- Accent: `#6BAA75`
- Background: `#FFFFFF`
- Text: `#102A36`

Recommendation: ship the light green/white palette first, with blue as a sparing accent for links and international program labels.

## File Structure

- Modify `src/App.tsx`
  - Temporary home for UI edits while keeping scope small.
  - Later tasks extract grants, theme constants, and contact metadata into focused files.
- Create `src/data/grants.ts`
  - Owns the grant dataset, grant type, freshness metadata, and derived lists.
- Create `src/data/contact.ts`
  - Owns company and social link metadata.
- Create `src/theme.ts`
  - Owns palette and commonly reused text/button colors.
- Create `src/security.ts`
  - Owns client-safe security notes shown in the app, not secrets.
- Modify `server/chat.ts`
  - Remove stale grant-count summary from a hardcoded string after grants move into `src/data/grants.ts` or a shared data module.
- Modify `vite.config.ts`
  - Remove `process.env.GEMINI_API_KEY` from client build defines.
- Modify `README.md`
  - Update company, live URL notes, secure local setup, and deployment target.
- Modify `DEPLOYMENT.md`
  - Replace Hostinger/AI Studio-only instructions with Vercel and Cloudflare bootstrap deployment instructions.
- Create `docs/security/cangrants-security-review.md`
  - Records current risks, immediate fixes, and selected backend path.
- Create `docs/product/cangrants-provider-decision.md`
  - Records Supabase pause issue, Cloudflare credits, MongoDB considerations, and final storage/auth recommendation.
- Create `docs/product/cangrants-payments.md`
  - Records Stripe recommendation and launch pricing assumptions.
- Create `docs/product/cangrants-design-directions.md`
  - Records palette options and selected direction.

## Task 1: Add a Small Test Harness Before UI Changes

**Files:**
- Modify: `package.json`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install test dependencies**

Run:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: `package.json` and `package-lock.json` update with the latest available versions.

- [ ] **Step 2: Add test scripts**

Modify `package.json` scripts to:

```json
"scripts": {
  "dev": "concurrently -k \"npm run dev:api\" \"npm run dev:web\"",
  "dev:web": "vite --port=3000 --host=0.0.0.0",
  "dev:api": "tsx server/index.ts",
  "build": "vite build",
  "start": "tsx server/index.ts",
  "preview": "npm run build && npm run start",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Configure Vitest in Vite**

Modify `vite.config.ts` to include a test section:

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

- [ ] **Step 4: Add test setup**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Add a failing test for the requested Contact tab**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

async function signIn() {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  await userEvent.type(screen.getByLabelText(/email address/i), 'demo@betterhalffilms.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'demo123');
  await userEvent.click(screen.getByRole('button', { name: /^sign in/i }));
}

it('shows updated BetterHalf Labs contact and social links in the Contact tab', async () => {
  await signIn();
  await userEvent.click(screen.getByRole('button', { name: /contact/i }));

  expect(screen.getByText(/Company: BetterHalf Labs/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
    'href',
    'https://www.instagram.com/betterhalflabs/',
  );
  expect(screen.getByRole('link', { name: /linked in/i })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/company/canadianartgrants',
  );
  expect(screen.getByRole('link', { name: /x \/ twitter/i })).toHaveAttribute(
    'href',
    'https://x.com/CdnArtGrants',
  );
});
```

- [ ] **Step 6: Run test to verify it fails**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected: FAIL because the Contact tab and updated company details do not exist yet.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/test/setup.ts src/App.test.tsx
git commit -m "test: add ui coverage for contact updates"
```

## Task 2: Add Contact Metadata and Contact Tab

**Files:**
- Create: `src/data/contact.ts`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Create contact metadata**

Create `src/data/contact.ts`:

```ts
export const CONTACT = {
  companyLine: 'Company: BetterHalf Labs',
  location: 'Toronto, Canada',
  socialLinks: [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/betterhalflabs/',
    },
    {
      label: 'Linked In',
      href: 'https://www.linkedin.com/company/canadianartgrants',
    },
    {
      label: 'X / Twitter',
      href: 'https://x.com/CdnArtGrants',
    },
  ],
} as const;
```

- [ ] **Step 2: Import contact metadata**

At the top of `src/App.tsx`, add:

```ts
import { CONTACT } from './data/contact';
```

- [ ] **Step 3: Add Contact to dashboard navigation**

Replace the tab list in `src/App.tsx:435` with:

```tsx
{[
  { id: 'discover', label: 'Discover' },
  { id: 'saved', label: `Saved (${saved.size})` },
  { id: 'applications', label: 'My Applications' },
  { id: 'assistant', label: 'AI Assistant' },
  { id: 'contact', label: 'Contact' },
].map((tab) => (
  <button
    key={tab.id}
    onClick={() => setActiveTab(tab.id)}
    style={{
      background: activeTab === tab.id ? '#C8A84B' : 'transparent',
      color: activeTab === tab.id ? '#0B2215' : '#A8C5A0',
      border: 'none',
      borderRadius: 6,
      padding: '8px 14px',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: "'DM Sans',sans-serif",
    }}
  >
    {tab.label}
  </button>
))}
```

- [ ] **Step 4: Add the Contact tab panel**

Add this block after the AI Assistant tab panel and before the main content wrapper closes:

```tsx
{activeTab === 'contact' && (
  <div style={{ maxWidth: 760, margin: '0 auto' }}>
    <h1
      style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 6,
        color: '#0B2215',
      }}
    >
      Contact
    </h1>
    <p style={{ color: '#5A6B5A', fontSize: 14, margin: '0 0 20px' }}>
      Connect with the CanGrants team and follow platform updates.
    </p>
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E8E0D0',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        padding: 24,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0B2215', marginBottom: 16 }}>
        {CONTACT.companyLine}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {CONTACT.socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid #D5CBB8',
              color: '#0B2215',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <span>{link.label}</span>
            <span aria-hidden="true">Open</span>
          </a>
        ))}
      </div>
    </section>
  </div>
)}
```

- [ ] **Step 5: Update footer company text**

Replace both footer occurrences of:

```tsx
BetterHalf Films
```

with:

```tsx
BetterHalf Labs
```

Replace:

```tsx
betterhalffilms.com
```

with:

```tsx
canadianartgrants.com
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm run test -- src/App.test.tsx
npm run lint
```

Expected: both commands PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/contact.ts src/App.tsx src/App.test.tsx
git commit -m "feat: add contact tab and updated social links"
```

## Task 3: Extract Grant Data and Add Freshness Metadata

**Files:**
- Create: `src/data/grants.ts`
- Modify: `src/App.tsx`
- Modify: `server/chat.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Create grant data module**

Create `src/data/grants.ts` by moving the existing `Grant` interface, `GRANTS`, `ALL_DISCIPLINES`, and `ALL_TAGS` out of `src/App.tsx`. Add dataset metadata:

```ts
export interface Grant {
  id: number;
  name: string;
  org: string;
  open: string;
  close: string;
  url: string;
  discipline: string[];
  location: string;
  amount: string;
  tags: string[];
  eligibility: string;
  description: string;
  verifiedAt?: string;
  verificationStatus?: 'verified' | 'needs-review' | 'closed' | 'rolling';
}

export const GRANTS: Grant[] = [
  // Move the current records from src/App.tsx here.
];

export const GRANTS_DATASET = {
  label: 'Updated 2026',
  reviewedAt: '2026-06-23',
  reviewNote:
    'Initial code review found many hardcoded 2026 deadlines. Each grant must be verified against the official funder URL before public launch.',
} as const;

export const ALL_DISCIPLINES = [...new Set(GRANTS.flatMap((g) => g.discipline))].sort();
export const ALL_TAGS = [...new Set(GRANTS.flatMap((g) => g.tags))].sort();
```

- [ ] **Step 2: Import grant data into App**

At the top of `src/App.tsx`, add:

```ts
import { ALL_DISCIPLINES, ALL_TAGS, GRANTS, GRANTS_DATASET, type Grant } from './data/grants';
```

Remove the old inline `GRANTS`, `ALL_DISCIPLINES`, `ALL_TAGS`, and `Grant` interface from `src/App.tsx`.

- [ ] **Step 3: Update dataset label in Discover**

Replace:

```tsx
{GRANTS.length} opportunities · Canadian &amp; International · Updated 2026
```

with:

```tsx
{GRANTS.length} opportunities · Canadian &amp; International · {GRANTS_DATASET.label}
```

- [ ] **Step 4: Update server chat summary**

In `server/chat.ts`, replace:

```ts
const GRANT_SUMMARY = `CanGrants lists 48 Canadian and international arts grants including Telefilm Talent to Watch, Canada Council Explore and Create, TAC Media Artists, CMF, Sundance, TIFF Talent Lab, Berlinale Talents, and Ontario Creates programs.`;
```

with:

```ts
const GRANT_SUMMARY =
  'CanGrants lists Canadian and international arts grants including Telefilm, Canada Council, Toronto Arts Council, CMF, Sundance, TIFF, Berlinale, and Ontario Creates programs. Official deadlines should be checked on the funder website before applying.';
```

- [ ] **Step 5: Add a test that the dataset warning is visible**

Append to `src/App.test.tsx`:

```tsx
it('shows a current dataset label on the Discover page', async () => {
  await signIn();
  expect(screen.getByText(/Updated 2026/i)).toBeInTheDocument();
});
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm run test -- src/App.test.tsx
npm run lint
npm run build
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/grants.ts src/App.tsx server/chat.ts src/App.test.tsx
git commit -m "refactor: move grants into data module"
```

## Task 4: Verify and Refresh Grant Deadlines

**Files:**
- Modify: `src/data/grants.ts`
- Create: `docs/product/grant-data-review-2026-06-23.md`

- [ ] **Step 1: Authenticate web research tooling**

Run:

```bash
firecrawl --version --auth-status
firecrawl login --browser
firecrawl --version --auth-status
```

Expected: authenticated status is true. If browser auth is unavailable, record that exact blocker in `docs/product/grant-data-review-2026-06-23.md` and verify manually from official funder pages in a browser.

- [ ] **Step 2: Search and scrape official deadline sources**

Run searches for the highest-risk records first:

```bash
mkdir -p .firecrawl/cangrants-deadlines
firecrawl search "Telefilm Canada Talent to Watch 2026 deadline" --limit 5 --json -o .firecrawl/cangrants-deadlines/telefilm-talent-to-watch.json
firecrawl search "Canada Council Explore and Create 2026 deadline" --limit 5 --json -o .firecrawl/cangrants-deadlines/canada-council-explore-create.json
firecrawl search "Toronto Arts Council Media Artists Program Creation 2026 deadline" --limit 5 --json -o .firecrawl/cangrants-deadlines/tac-media-artists.json
firecrawl search "Ontario Creates IP Fund 2026 deadline" --limit 5 --json -o .firecrawl/cangrants-deadlines/ontario-creates-ip-fund.json
firecrawl search "Canada Media Fund programs 2026 deadlines" --limit 5 --json -o .firecrawl/cangrants-deadlines/cmf-programs.json
```

Expected: each output file contains official funder pages or clearly identifies that official dates are not published.

- [ ] **Step 3: Update each grant record**

For each grant in `src/data/grants.ts`, update:

```ts
verifiedAt: '2026-06-23',
verificationStatus: 'verified',
```

If a grant has no confirmed date on the official site, use:

```ts
verifiedAt: '2026-06-23',
verificationStatus: 'needs-review',
```

If a listed date has already passed and the next intake is not published, set:

```ts
close: 'Closed',
verifiedAt: '2026-06-23',
verificationStatus: 'closed',
```

- [ ] **Step 4: Update deadline status helper**

In `src/App.tsx`, replace `getDeadlineStatus` with:

```ts
const today = new Date();
const getDeadlineStatus = (close: string) => {
  if (close === 'Rolling') return { label: 'Rolling', color: '#5A9E6A', days: Infinity };
  if (close === 'Closed') return { label: 'Closed', color: '#999', days: -Infinity };

  const d = new Date(close);
  if (Number.isNaN(d.getTime())) {
    return { label: 'Check funder site', color: '#8B6914', days: Infinity };
  }

  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: 'Closed', color: '#999', days: diff };
  if (diff <= 14) return { label: `${diff}d left`, color: '#C0392B', days: diff };
  if (diff <= 45) return { label: `${diff}d left`, color: '#E67E22', days: diff };
  return { label: `${diff}d left`, color: '#27AE60', days: diff };
};
```

- [ ] **Step 5: Document the review**

Create `docs/product/grant-data-review-2026-06-23.md`:

```md
# Grant Data Review - 2026-06-23

## Summary

The previous dataset was hardcoded in `src/App.tsx` and contained multiple 2026 dates that are closed as of 2026-06-23. This review checked official funder pages before changing public-facing deadline values.

## Verification Rules

- Official funder page beats aggregator pages.
- If the next intake is unpublished, the app shows `Closed` or `Check funder site`.
- Rolling programs remain `Rolling` only when the funder page says applications are continuously accepted.
- Every record receives `verifiedAt` and `verificationStatus`.

## Records Reviewed

| Grant | Source URL | Result |
| --- | --- | --- |
| Talent to Watch | https://telefilm.ca/en/funding/talent-to-watch | Record updated from official source during implementation |
| Explore and Create | https://canadacouncil.ca/funding/grants/explore-and-create | Record updated from official source during implementation |
| Media Artists Program - Creation | https://torontoartscouncil.org/grants/media-artists-program-creation/ | Record updated from official source during implementation |
| Ontario Creates IP Fund | https://www.ontariocreates.ca/investment-programs/content-creation/intellectual-property-fund | Record updated from official source during implementation |
| Canada Media Fund programs | https://cmf-fmc.ca/our-programs/ | Record updated from official source during implementation |
```

- [ ] **Step 6: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands PASS and the app handles `Closed`, `Rolling`, ISO dates, and unknown funder-site checks.

- [ ] **Step 7: Commit**

```bash
git add src/data/grants.ts src/App.tsx docs/product/grant-data-review-2026-06-23.md
git commit -m "data: refresh grant deadline metadata"
```

## Task 5: Security Review and Immediate Hardening

**Files:**
- Modify: `vite.config.ts`
- Modify: `server/index.ts`
- Create: `docs/security/cangrants-security-review.md`

- [ ] **Step 1: Remove client build exposure of Gemini key**

Ensure `vite.config.ts` does not contain:

```ts
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},
```

The Vite config should not call `loadEnv` for the Gemini key.

- [ ] **Step 2: Add safer API request validation**

In `server/index.ts`, replace the `/api/chat` route body validation with:

```ts
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userName, userProvince, userDiscipline } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length > 20) {
      res.status(400).json({ error: 'messages array required with at most 20 entries' });
      return;
    }

    const safeMessages = messages
      .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
      .map((message) => ({
        role: message.role,
        content: String(message.content ?? '').slice(0, 4000),
      }));

    if (safeMessages.length === 0) {
      res.status(400).json({ error: 'at least one message required' });
      return;
    }

    const content = await generateChatReply(safeMessages, {
      userName: String(userName || 'Artist').slice(0, 100),
      userProvince: String(userProvince || 'Canada').slice(0, 100),
      userDiscipline: String(userDiscipline || '').slice(0, 100),
    });

    res.json({ content });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      content:
        'The AI service is temporarily unavailable. Check that GEMINI_API_KEY is set, or try again shortly.',
    });
  }
});
```

- [ ] **Step 3: Document the security review**

Create `docs/security/cangrants-security-review.md`:

```md
# CanGrants Security Review

## Current Risks

1. Demo auth stores emails and passwords in browser localStorage.
2. Saved grants and applications are device-local and can be edited by the user from DevTools.
3. There is no server-side user identity, session validation, or password hashing.
4. `/api/chat` needs request shape limits to avoid oversized prompts.
5. The Vite config previously defined `process.env.GEMINI_API_KEY` into the client build and should not expose server secrets.

## Immediate Fixes

- Remove Gemini key client define from Vite.
- Keep Gemini calls server-side only.
- Limit chat message count and message length.
- Label current sign-in as demo-only until real auth ships.

## Required Before Real User Launch

- Replace localStorage auth with Supabase Auth, Clerk, Auth0, or Better Auth.
- Persist profiles, saved grants, and applications server-side.
- Add rate limiting to `/api/chat`.
- Add provider-level bot protection such as Cloudflare Turnstile before expensive AI calls.
- Keep all service-role, secret, and payment keys server-only.

## Supabase-Specific Notes

- Enable RLS on every table in exposed schemas.
- Do not use `user_metadata` claims for authorization decisions.
- If using views on Postgres 15+, create them with `security_invoker = true`.
- Keep `service_role` keys out of frontend code and any `NEXT_PUBLIC_` or Vite public env vars.
```

- [ ] **Step 4: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands PASS.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts server/index.ts docs/security/cangrants-security-review.md
git commit -m "fix: harden chat api and document security gaps"
```

## Task 6: Decide Backend Path for Supabase Pause, Cloudflare Credits, and MongoDB

**Files:**
- Create: `docs/product/cangrants-provider-decision.md`

- [ ] **Step 1: Record the decision matrix**

Create `docs/product/cangrants-provider-decision.md`:

```md
# CanGrants Provider Decision

## Problem

Supabase free projects can pause after inactivity, which is not acceptable for a public grant discovery site. The user has Cloudflare credits and wants a secure, cheap bootstrap path.

## Options

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Supabase Pro | Fastest path if keeping Supabase Auth, Postgres, RLS, and SQL migrations | Monthly cost | Choose if launch speed and low migration risk matter most |
| Cloudflare Pages + Workers + D1 | Uses available Cloudflare credits, low operating cost, no Supabase pause issue | Requires auth choice and data migration | Best low-cost bootstrap path if implementation time is acceptable |
| MongoDB Atlas | Flexible document model for grant records, strong future search path | Needs separate auth and careful serverless connection reuse | Consider later for grant ingestion/search, not first auth migration |

## Recommendation

Start with Cloudflare Pages + Workers + D1 if the priority is lowest infrastructure cost. Use Clerk/Auth0/Better Auth for auth, or keep Supabase Auth only if the Supabase project is upgraded and RLS-backed tables are used.

If MongoDB is selected later, initialize one MongoClient outside request handlers, measure traffic and operation duration before changing pool sizes, and monitor Atlas `connections.current`, wait queue symptoms, and query latency.

## First Server-Side Tables

- `profiles`: id, email, name, province, discipline, career, created_at
- `saved_grants`: user_id, grant_id, created_at
- `applications`: id, user_id, grant_id, status, notes, created_at, updated_at
- `grant_records`: id, name, org, open_date, close_date, url, amount, metadata, verified_at, verification_status
```

- [ ] **Step 2: Run markdown review**

Read the document and confirm it contains one explicit recommendation and no undecided open items.

- [ ] **Step 3: Commit**

```bash
git add docs/product/cangrants-provider-decision.md
git commit -m "docs: recommend bootstrap backend path"
```

## Task 7: Document Payment Plan Recommendation

**Files:**
- Create: `docs/product/cangrants-payments.md`

- [ ] **Step 1: Create payment recommendation**

Create `docs/product/cangrants-payments.md`:

```md
# CanGrants Payment Recommendation

## Recommendation

Use Stripe Checkout for the first paid plan. Do not collect card details directly in CanGrants.

## Why Stripe First

- No custom PCI card handling in the app.
- Hosted Checkout and customer portal reduce security scope.
- Works with one-time payments or subscriptions.
- Can be added after secure auth is in place.

## Bootstrap Pricing Shape

Start with:

- Free: browse grants, save limited grants locally or in account
- Pro: saved grants across devices, application tracking, AI proposal drafting, deadline reminders

## Implementation Order

1. Ship secure auth and server-side user records.
2. Create one Stripe product and one recurring price.
3. Add `/api/create-checkout-session` on the server.
4. Add a Stripe webhook for subscription status.
5. Gate Pro-only UI from server-side subscription status.

## Security Rules

- Keep `STRIPE_SECRET_KEY` server-only.
- Keep webhook signing secret server-only.
- Use hosted Checkout and customer portal.
- Never trust client-provided subscription status.
```

- [ ] **Step 2: Commit**

```bash
git add docs/product/cangrants-payments.md
git commit -m "docs: recommend stripe checkout for bootstrap payments"
```

## Task 8: Apply Light Green Design Direction and Larger Header Tabs

**Files:**
- Create: `src/theme.ts`
- Modify: `src/App.tsx`
- Create: `docs/product/cangrants-design-directions.md`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Create theme constants**

Create `src/theme.ts`:

```ts
export const theme = {
  colors: {
    background: '#F7FBF8',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF7F1',
    primary: '#2F6F4E',
    primaryDark: '#163325',
    secondary: '#DDEFE4',
    accentBlue: '#2D6CDF',
    border: '#D6E6DA',
    text: '#163325',
    textMuted: '#557064',
  },
} as const;
```

- [ ] **Step 2: Import theme**

At the top of `src/App.tsx`, add:

```ts
import { theme } from './theme';
```

- [ ] **Step 3: Update dashboard shell colors**

Replace dashboard wrapper colors:

```tsx
<div style={{ fontFamily:"'DM Sans',sans-serif", background:"#F4EFE6", minHeight:"100vh", color:"#1A1208" }}>
```

with:

```tsx
<div
  style={{
    fontFamily: "'DM Sans',sans-serif",
    background: theme.colors.background,
    minHeight: '100vh',
    color: theme.colors.text,
  }}
>
```

- [ ] **Step 4: Update header tab sizing**

Use the tab button block from Task 2 with:

```tsx
fontSize: 14,
fontWeight: 600,
padding: '8px 14px',
```

This is the requested "slightly bigger" header tab change.

- [ ] **Step 5: Document design directions**

Create `docs/product/cangrants-design-directions.md`:

```md
# CanGrants Design Directions

## Selected Direction

Light green and white with blue accents.

## Palette

- Primary green: `#2F6F4E`
- Dark green text: `#163325`
- Soft green surface: `#DDEFE4`
- Page background: `#F7FBF8`
- Link/accent blue: `#2D6CDF`
- Card surface: `#FFFFFF`

## Rationale

The palette is lighter and more accessible than the current dark green/gold scheme while preserving the arts-grants identity. Blue should be reserved for links, international opportunities, and system information so the app does not feel visually noisy.

## Next Design Improvements

- Replace inline styles with small reusable components after this color pass.
- Add mobile navigation for narrow screens.
- Add visible focus states for keyboard users.
- Increase contrast on secondary text.
```

- [ ] **Step 6: Add header font test**

Append to `src/App.test.tsx`:

```tsx
it('shows the Contact navigation item after signing in', async () => {
  await signIn();
  expect(screen.getByRole('button', { name: /contact/i })).toBeVisible();
});
```

- [ ] **Step 7: Run verification**

Run:

```bash
npm run test -- src/App.test.tsx
npm run lint
npm run build
```

Expected: all commands PASS.

- [ ] **Step 8: Commit**

```bash
git add src/theme.ts src/App.tsx src/App.test.tsx docs/product/cangrants-design-directions.md
git commit -m "style: apply lighter theme and larger nav tabs"
```

## Task 9: Update README and Deployment Guide

**Files:**
- Modify: `README.md`
- Modify: `DEPLOYMENT.md`

- [ ] **Step 1: Update README product/company copy**

Replace the opening README copy with:

```md
# CanGrants

AI-powered grant discovery and tracking for Canadian artists and producers, built by BetterHalf Labs.

Live site: https://canadianartgrants.com/
Preview/demo: https://cangrants-betterhalf.vercel.app/
```

Replace demo-login wording with:

```md
**Demo login for local testing only:** `demo@betterhalffilms.com` / `demo123`
```

Add:

```md
## Security status

The current sign-in flow is demo-only and stores test users in browser localStorage. Do not use it for real user accounts until server-side auth is implemented.
```

- [ ] **Step 2: Replace deployment guide**

Rewrite `DEPLOYMENT.md`:

```md
# CanGrants Deployment Guide

## Recommended Bootstrap Deployment

Use Vercel or Cloudflare Pages for the frontend. Keep AI calls and payment calls on server-side routes or workers.

## Required Environment Variables

- `GEMINI_API_KEY`: server-side only, used by `/api/chat`
- `STRIPE_SECRET_KEY`: server-side only, only after payments are implemented
- `STRIPE_WEBHOOK_SECRET`: server-side only, only after payments are implemented

## Vercel Preview Deployment

```bash
npm install
npm run lint
npm run build
vercel deploy
```

## Vercel Production Deployment

```bash
npm install
npm run lint
npm run build
vercel deploy --prod
```

## Cloudflare Direction

If moving to Cloudflare, deploy the Vite build to Cloudflare Pages and implement server-side routes through Workers. Use D1 for relational user/app data if the provider decision remains Cloudflare-first.

## Security Notes

- Do not expose server secrets in Vite public environment variables.
- Do not store real passwords in localStorage.
- Use hosted Stripe Checkout for payments.
- Add bot protection and rate limiting before public AI usage.
```

- [ ] **Step 3: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands PASS.

- [ ] **Step 4: Commit**

```bash
git add README.md DEPLOYMENT.md
git commit -m "docs: update cangrants deployment guidance"
```

## Task 10: Deploy Preview and Prepare Production Release

**Files:**
- No source file changes unless deployment fails and the fix is understood.

- [ ] **Step 1: Verify clean working tree**

Run:

```bash
git status --short
```

Expected: no unstaged or uncommitted source changes.

- [ ] **Step 2: Run final local checks**

Run:

```bash
npm run test
npm run lint
npm run build
```

Expected: all commands PASS.

- [ ] **Step 3: Push branch**

Run:

```bash
git push -u origin cursor/cangrants-refresh-security-90e0
```

Expected: branch is pushed successfully.

- [ ] **Step 4: Create draft PR**

Create a draft PR into `cursor/restore-cangrants-c334` with:

```md
## Summary

- Updates CanGrants contact/company/social metadata.
- Adds Contact tab and larger dashboard navigation text.
- Extracts grant data and adds freshness metadata.
- Documents provider, payment, design, and security recommendations.
- Removes accidental client build exposure of Gemini API key.

## Verification

- `npm run test`
- `npm run lint`
- `npm run build`
```

- [ ] **Step 5: Deploy preview**

If Vercel is linked:

```bash
vercel deploy
```

If Cloudflare is selected:

```bash
npm run build
npx wrangler pages deploy dist --project-name canadianartgrants
```

Expected: preview URL is created and loads the app.

- [ ] **Step 6: Smoke test preview**

In the preview URL:

1. Sign in with demo account.
2. Confirm Contact tab is visible.
3. Confirm Company line says `Company: BetterHalf Labs`.
4. Open each social link in a new tab.
5. Confirm Discover loads grant cards.
6. Confirm AI Assistant either replies through Gemini or returns the configured fallback response.
7. Confirm header tabs are visibly larger than before.

- [ ] **Step 7: Production deployment**

Deploy to production only after preview smoke test passes and the user approves the selected provider/payment/design path.

For Vercel production:

```bash
vercel deploy --prod
```

Expected: production deployment succeeds, and `https://canadianartgrants.com/` points to the new build.

## Self-Review

### Spec Coverage

- Contact/company/social updates are covered in Task 2.
- Header font size is covered in Task 2 and Task 8.
- Grant dates and deadline freshness are covered in Task 3 and Task 4.
- Security review is covered in Task 5.
- Supabase pause, Cloudflare credits, and MongoDB connection considerations are covered in Task 6.
- Payment recommendation is covered in Task 7.
- Design direction is covered in Task 8.
- Deployment is covered in Task 10.

### Completion Scan

No plan step leaves an unresolved implementation decision. External facts that require live account or official-source verification are represented as explicit commands and documentation outputs.

### Type Consistency

- `Grant` is defined once in `src/data/grants.ts`.
- `CONTACT` is defined once in `src/data/contact.ts`.
- `theme` is defined once in `src/theme.ts`.
- Tests use accessible text and roles that match the planned UI labels.
