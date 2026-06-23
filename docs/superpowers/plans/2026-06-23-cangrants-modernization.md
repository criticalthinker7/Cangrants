# CanGrants Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve data freshness, production security, infrastructure reliability, monetization readiness, and UI clarity for Canadianartgrants.com.

**Architecture:** Keep the current React + Express structure, but move sensitive auth/data workflows to managed services. Add repeatable data-review workflows and production security middleware. Introduce a lightweight billing boundary first (subscription gating + webhook handling), then expand.

**Tech Stack:** React (Vite), TypeScript, Express, MongoDB Atlas or Supabase Postgres, Cloudflare (DNS/CDN/WAF), Stripe Billing, GitHub Actions.

---

### Task 1: Grant data freshness workflow

**Files:**
- Create: `src/grants/grants-data.ts`
- Create: `src/grants/grants-utils.ts`
- Modify: `src/App.tsx` (replace inline grants array import + freshness banner usage)
- Create: `scripts/validate-grants.mjs`
- Test: `src/grants/grants-utils.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { summarizeDeadlines } from "./grants-utils";
import { grants } from "./grants-data";

describe("summarizeDeadlines", () => {
  it("returns open/closed counts and last reviewed string", () => {
    const summary = summarizeDeadlines(grants, new Date("2026-06-23"));
    expect(summary.lastReviewed).toBeTruthy();
    expect(summary.total).toBe(grants.length);
    expect(summary.openOrRolling + summary.closed).toBe(grants.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/grants/grants-utils.test.ts`
Expected: FAIL because files/functions do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/grants/grants-utils.ts
export function summarizeDeadlines(grants: Array<{ close: string }>, today = new Date()) {
  const closed = grants.filter((g) => g.close !== "Rolling" && new Date(g.close) < today).length;
  return {
    total: grants.length,
    closed,
    openOrRolling: grants.length - closed,
    lastReviewed: "June 2026",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/grants/grants-utils.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/grants src/App.tsx scripts/validate-grants.mjs
git commit -m "feat: add grant freshness workflow and validation utilities"
```

---

### Task 2: Production auth and data security baseline

**Files:**
- Modify: `server/index.ts`
- Create: `server/auth/session.ts`
- Create: `server/middleware/require-auth.ts`
- Create: `server/middleware/request-validation.ts`
- Modify: `src/App.tsx` (remove localStorage password auth flow)
- Test: `server/index.security.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import request from "supertest";
import { app } from "./index";

it("rate limits excessive chat requests", async () => {
  for (let i = 0; i < 90; i += 1) {
    await request(app).post("/api/chat").send({ messages: [{ role: "user", content: "hi" }] });
  }
  const res = await request(app).post("/api/chat").send({ messages: [{ role: "user", content: "hi" }] });
  expect([429, 400]).toContain(res.status);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- server/index.security.test.ts`
Expected: FAIL before middleware export/test harness setup.

- [ ] **Step 3: Write minimal implementation**

```ts
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use("/api/chat", rateLimit({ windowMs: 15 * 60 * 1000, max: 80 }));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- server/index.security.test.ts`
Expected: PASS with 429 on throttled requests.

- [ ] **Step 5: Commit**

```bash
git add server src/App.tsx
git commit -m "feat: enforce security middleware and safer auth boundaries"
```

---

### Task 3: Supabase pause mitigation + alternative architecture decision

**Files:**
- Create: `docs/architecture/2026-06-backend-options.md`
- Create: `docs/architecture/cost-model.csv`
- Create: `infra/decision-records/adr-001-backend-platform.md`

- [ ] **Step 1: Write decision template skeleton**

```md
# ADR-001 Backend Platform Decision
- Status: Proposed
- Option A: Supabase Pro
- Option B: MongoDB Atlas + Cloudflare Workers
- Option C: Hybrid (Supabase Auth + MongoDB Data)
```

- [ ] **Step 2: Collect actual constraints and assumptions**

Run: `printf "traffic,monthly_active_users,avg_query_volume\n" > docs/architecture/cost-model.csv`
Expected: file created with explicit assumptions tracked in version control.

- [ ] **Step 3: Fill recommendation with objective criteria**

```md
## Recommendation
Start with Supabase Pro only if RLS + Postgres relational workflows are immediately needed.
If cost minimization dominates and workload is mostly read-heavy listing/search, prioritize Cloudflare + MongoDB Atlas free tier with strict connection pooling.
```

- [ ] **Step 4: Verify decision artifact completeness**

Run: `rg "Recommendation|Rollback Plan|Security" docs/architecture/2026-06-backend-options.md infra/decision-records/adr-001-backend-platform.md`
Expected: non-empty matches for each section.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture infra/decision-records
git commit -m "docs: add backend platform ADR and cost comparison model"
```

---

### Task 4: Payment foundation (bootstrap-safe Stripe setup)

**Files:**
- Create: `server/billing/stripe.ts`
- Create: `server/routes/billing.ts`
- Modify: `server/index.ts` (mount billing routes)
- Create: `src/billing/PricingCard.tsx`
- Create: `src/billing/BillingPage.tsx`
- Test: `server/routes/billing.test.ts`

- [ ] **Step 1: Write the failing API test**

```ts
it("creates a checkout session", async () => {
  const res = await request(app).post("/api/billing/create-checkout").send({ planId: "starter-monthly" });
  expect(res.status).toBe(200);
  expect(res.body.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- server/routes/billing.test.ts`
Expected: FAIL because route is missing.

- [ ] **Step 3: Write minimal implementation**

```ts
router.post("/create-checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_STARTER_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.APP_URL}/billing?success=1`,
    cancel_url: `${process.env.APP_URL}/billing?cancelled=1`,
  });
  res.json({ url: session.url });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- server/routes/billing.test.ts`
Expected: PASS with mocked Stripe SDK.

- [ ] **Step 5: Commit**

```bash
git add server src/billing
git commit -m "feat: add starter Stripe billing flow and pricing UI"
```

---

### Task 5: Visual refresh and accessibility pass

**Files:**
- Modify: `src/App.tsx` (theme tokens, font size scale, contrast updates)
- Create: `src/theme/palette.ts`
- Test: `src/App.visual.test.tsx`

- [ ] **Step 1: Write the failing visual/a11y test**

```ts
import { render, screen } from "@testing-library/react";
import App from "../App";

it("uses readable tab font sizing for desktop nav", () => {
  render(<App />);
  const discover = screen.getByRole("button", { name: /discover/i });
  expect(window.getComputedStyle(discover).fontSize).toBe("14px");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.visual.test.tsx`
Expected: FAIL before tokenized theme + render setup.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/theme/palette.ts
export const palette = {
  mintBg: "#F6FFF9",
  skyBg: "#EEF5FF",
  brandGreen: "#2F7D5C",
  brandBlue: "#215E91",
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.visual.test.tsx`
Expected: PASS and improved readability in nav/header.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/theme/palette.ts
git commit -m "style: apply light theme and accessibility font updates"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-06-23-cangrants-modernization.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
