# SamMotion

Premium fitness tracker — Next.js 14 + Supabase, mobile-first PWA.

## Quick start (local)

```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/auth/login`. Sign up, then you're in the app.

## One-time Supabase setup

1. Create a project at https://supabase.com → copy URL + anon key into `.env.local`.
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run.
3. **Authentication → URL Configuration** → add your local + prod redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-app.vercel.app/auth/callback`
4. (Optional, for fast testing) **Authentication → Providers → Email** → uncheck "Confirm email".

## Deploy to Vercel

```bash
git init && git add . && git commit -m "Initial commit"
gh repo create sammotion --public --source=. --push
```

Then go to https://vercel.com/new → import the repo → add the two `NEXT_PUBLIC_SUPABASE_*` env vars → Deploy. Every `git push` afterward auto-redeploys.

## What's where

```
app/                    Next.js App Router
  auth/                 Login, sign-up, callback, sign-out (Supabase)
  page.tsx              Auth-gated home (redirects to /auth/login if not signed in)
  layout.tsx            Root layout, PWA manifest, Vercel Analytics
  sammotion.css         App styles (dark theme, neon orange/green)
components/sammotion/   The 5 screens + 4 modals + tab bar
  screens/              home, workout, gym, stats, log
  modals/               start-wizard, add-gym, add-exercise, finish-workout
lib/sammotion/
  types.ts              MuscleId (sub-heads), AppState, HistoryEntry, etc.
  data.ts               100+ exercises, 35+ equipment, built-in routines
  helpers.ts            calcE1RM, formatters, week-streak, exercise filters
  store.tsx             Supabase-backed StoreProvider + useStore hook
  muscle-svg.tsx        Anterior + posterior anatomical map with sub-heads
lib/supabase/           SSR clients (browser, server, middleware)
middleware.ts           Global auth gate
public/                 PWA icons + manifest
supabase/schema.sql     5 tables + Row Level Security + new-user trigger
```

## Multi-user data isolation

Every table has Row Level Security — `user_id = auth.uid()` policies mean User A literally cannot read User B's rows even if the client tried. Test with two browsers (one incognito): different sign-ups, completely isolated data.

## License

Private project.
