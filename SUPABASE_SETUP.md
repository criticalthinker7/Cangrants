# Supabase setup for CanGrants

CanGrants uses Supabase for beta-ready authentication and the future database-backed grant tracker.

## 1. Environment variables

Create a local `.env` file and add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

For the current Supabase project shared during setup, the project URL format is:

```env
VITE_SUPABASE_URL=https://jmljwgqvmxwlkfzrkctz.supabase.co
```

Do not commit `.env`. The anon key is public, but it should still be managed through environment variables.

## 2. Auth providers

In Supabase:

1. Go to **Authentication > Providers**.
2. Enable **Email** for magic-link sign-in.
3. Enable **Google** if you want social login.
4. Add the deployed site URL to **Authentication > URL Configuration**:
   - Site URL: `https://cangrants-betterhalf.vercel.app`
   - Redirect URLs:
     - `https://cangrants-betterhalf.vercel.app`
     - `http://localhost:3000`

Google login also requires OAuth credentials from Google Cloud Console.

## 3. Database schema

Run `supabase/schema.sql` in the Supabase SQL Editor.

This creates:

- `profiles`
- `grants`
- `saved_grants`
- `applications`
- `wishlist_submissions`
- `newsletter_subscriptions`

It also enables row-level security so users can only manage their own saved grants and applications.

## 4. Next data migration step

The grant catalog still lives in `src/App.tsx`. The next migration step is to import that catalog into the `grants` table and then read grants from Supabase instead of the hardcoded array.
