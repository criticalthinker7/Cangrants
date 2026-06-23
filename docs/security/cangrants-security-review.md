# CanGrants Security Review

## Current Risks

- Demo localStorage auth stores emails and passwords on the client.
- Saved grants and applications are device-local and editable by anyone with browser storage access.
- There is no server-side identity, session management, or password hashing.
- The chat route still needs rate limiting and bot protection to reduce automated abuse.
- Prior Vite config exposed the Gemini key into the client build.
- `npm install` and the baseline dependency audit reported dependency audit vulnerabilities. These should be triaged separately; do not run `npm audit fix` as part of this task.

## Immediate Fixes

- Removed the Gemini key client define from the Vite config.
- Gemini remains server-side only through the API route.
- Limit chat message count and message/context field lengths before calling the chat generator.
- Label the current sign-in experience as demo-only until real authentication is implemented.

## Required Before Real User Launch

- Replace localStorage auth with a real authentication provider and server-side session handling.
- Persist profiles, saved grants, and applications server-side instead of relying on editable device-local state.
- Add rate limiting for API routes, especially `/api/chat`.
- Add bot protection such as Cloudflare Turnstile to sensitive flows.
- Keep service keys and payment provider keys server-only, and never expose them through frontend or public environment variables.

## Supabase-Specific Notes

- Enable and verify Row Level Security (RLS) on exposed schemas.
- Do not use `user_metadata` for authorization decisions because users can modify it.
- Use `security_invoker` views on Postgres 15+ when views need to respect the querying user's RLS policies.
- Keep the `service_role` key out of frontend and public environment variables.
