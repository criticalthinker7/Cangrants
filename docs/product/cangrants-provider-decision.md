# CanGrants Provider Decision

## Problem

Supabase free projects can pause after inactivity, which is not acceptable for public grant discovery. The user has Cloudflare credits and wants a secure, cheap bootstrap path.

## Options

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Supabase Pro | Fastest path if keeping Supabase Auth, Postgres, RLS-backed authorization, SQL migrations, and familiar hosted admin tooling. | Adds a monthly platform cost and does not use the available Cloudflare credits for the primary backend. | Choose only when launch speed and lowest migration risk matter more than minimizing infrastructure cost. |
| Cloudflare Pages + Workers + D1 | Uses the user's Cloudflare credits, avoids Supabase free-project pausing, keeps hosting and server-side routes close together, and fits relational app state such as profiles, saved grants, applications, and grant records. | Requires implementing the selected auth provider, Worker/D1 implementation work, and migration away from localStorage state. | Best bootstrap path when lowest infrastructure cost is the priority. |
| MongoDB Atlas | Flexible document model for richer grant records, future ingestion pipelines, and search-oriented grant metadata. | Needs separate auth, careful serverless connection reuse, and operational monitoring before tuning connection settings. | Consider for a later grant-ingestion or search-heavy phase, not the first low-cost auth and storage migration. |

## Explicit Recommendation

Start with Cloudflare Pages + Workers + D1 if the priority is lowest infrastructure cost. Use Clerk/Auth0/Better Auth for auth, or keep Supabase Auth only if Supabase is upgraded and RLS-backed tables are used.

## MongoDB Operational Note

If MongoDB is selected later, initialize one `MongoClient` outside request handlers, measure traffic and operation duration before changing pool sizes, and monitor Atlas `connections.current`, wait queue symptoms, and query latency. Do not prescribe arbitrary pool sizes.

## First Server-Side Tables

- `profiles`: id, email, name, province, discipline, career, created_at
- `saved_grants`: user_id, grant_id, created_at
- `applications`: id, user_id, grant_id, status, notes, created_at, updated_at
- `grant_records`: id, name, org, open_date, close_date, url, amount, metadata, verified_at, verification_status
