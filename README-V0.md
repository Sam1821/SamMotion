# SamMotion — Pass 1 (foundation) — How to merge into v0

This folder (`sammotion-next/`) contains **all the missing pieces** the previous v0 build never wrote, plus the per-user Supabase data layer you asked for. After applying these to your v0 project, the app will:

- Compile and run (the v0 zip didn't — `lib/sammotion/*` was entirely missing)
- Require login; each friend gets their own isolated data
- Persist gyms, routines, sessions, and PRs to Supabase with row-level security
- Show 100+ exercises across all muscle groups (Free Exercise DB GIFs)
- Render a sub-head muscle map (chest upper/mid/lower, biceps long/short, triceps long/lateral/medial, hamstrings BF/SM, quads RF/VL/VM, etc.)

**Pass 2 (next turn — feature additions)** will add: log session detail+edit+delete, stats per-exercise chart, gym detail screen with delete, routine editor, workout reorder/replace.

---

## Step 1 — Create the Supabase project

1. Go to **https://supabase.com** → New project. Pick any region close to you. Set a strong DB password.
2. Wait ~2 min for provisioning.
3. In the dashboard sidebar: **Project Settings → API**.
   - Copy **Project URL** → you'll paste this as `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy **anon public key** → you'll paste this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Authentication → Providers → Email**: leave on. (Optional: turn off "confirm email" while testing so sign-ups work instantly.)
5. **SQL Editor → New query** → paste the entire contents of `supabase/schema.sql` from this folder → **Run**. This creates the 5 tables (`profiles`, `gyms`, `routines`, `history`, `prs`), enables RLS, and adds a trigger to auto-create a profile on sign-up.

You now have a working backend.

---

## Step 2 — Push the new files into v0

v0 doesn't accept folder uploads, but it does have **two ways** to merge external files. Pick whichever is easier for you.

### Option A (recommended) — connect v0 to GitHub

1. In your v0 chat, click the **"…" menu → "Connect to GitHub"** (or the GitHub icon at the top of the project). Create or pick a repo (e.g. `sammotion`). v0 pushes its current files there automatically.
2. Clone that repo locally:
   ```
   git clone https://github.com/YOU/sammotion.git
   ```
3. Copy everything from this `sammotion-next/` folder **into** the cloned repo, **overwriting** any conflicting files. The structure already mirrors v0's layout (`app/`, `lib/`, `supabase/`, etc.).
4. Create `.env.local` in the repo root from `.env.local.example` — paste your Supabase URL + anon key.
5. Commit + push:
   ```
   git add .
   git commit -m "Add Supabase per-user data layer + missing lib/ foundation"
   git push
   ```
6. Back in v0, click **"Pull from GitHub"** (or it auto-syncs). Tell v0 in the chat: *"I've pushed the lib/sammotion/, lib/supabase/, supabase/schema.sql, middleware.ts, and updated app/page.tsx — please pull and don't regenerate them."*

### Option B — paste each file into v0 chat

If you don't want to use GitHub, do this in **one v0 message**:

> I'm adding the missing foundation files. Please create these files exactly as below — do not modify them, do not regenerate them, and stop using localStorage; the new store at `lib/sammotion/store.tsx` reads/writes Supabase.
>
> [paste each file with a heading line like `### lib/sammotion/types.ts` followed by a triple-backtick code block]

Files you must paste (in this order):

1. `package.json`
2. `tsconfig.json`
3. `next.config.js`
4. `tailwind.config.ts`
5. `postcss.config.js`
6. `.env.local.example`
7. `middleware.ts`
8. `lib/utils.ts`
9. `lib/supabase/client.ts`
10. `lib/supabase/server.ts`
11. `lib/supabase/middleware.ts`
12. `lib/sammotion/types.ts`
13. `lib/sammotion/data.ts`
14. `lib/sammotion/helpers.ts`
15. `lib/sammotion/store.tsx`
16. `lib/sammotion/muscle-svg.tsx`
17. `supabase/schema.sql`
18. `app/page.tsx` (overwrites v0's existing one — adds the auth gate)

---

## Step 3 — Add env vars in v0 / Vercel

In v0's project settings (or Vercel project → Settings → Environment Variables), add:

| Name | Value |
| ---- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL`      | (your Project URL from Step 1) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon public key from Step 1) |

Re-deploy. The middleware in `middleware.ts` will now redirect anonymous users to `/auth/login` automatically.

---

## Step 4 — Test multi-user isolation

1. Open the deployed URL in a regular browser → sign up with email A → log a workout. ✅
2. Open in an **incognito window** → sign up with email B → you should see an empty app with no history. ✅ ← This is the "friend sees my data" bug fixed.
3. Sign back in as email A in regular window → your data is still there.

If both users see the same data, RLS isn't applied — re-run `supabase/schema.sql` and check the **Database → Policies** page in Supabase shows owner_select + owner_modify on each of the 5 tables.

---

## What changed vs the v0 zip you sent

| File | Status |
| ---- | ------ |
| `lib/sammotion/types.ts`         | **NEW** — sub-head MuscleId, AppState, HistoryEntry.details, etc. |
| `lib/sammotion/data.ts`          | **NEW** — 100+ exercises, 35+ equipment items, ROUTINE_PRIORITY, sample data |
| `lib/sammotion/helpers.ts`       | **NEW** — calcE1RM, fmtDate/Day/Vol/Dur, daysSince, calcWeekStreak, getExsForWorkout, getNextRoutine, hasEq, etc. |
| `lib/sammotion/store.tsx`        | **NEW** — Supabase-backed StoreProvider + useStore (per-user, with addCustomRoutine, deleteGym, deleteSession, updateSession ready for Pass 2 UI) |
| `lib/sammotion/muscle-svg.tsx`   | **NEW** — anterior + posterior anatomical view with sub-head regions, hover labels |
| `lib/supabase/{client,server,middleware}.ts` | **NEW** — Supabase SSR clients |
| `lib/utils.ts`                   | **NEW** — `cn()` helper |
| `middleware.ts`                  | **NEW** — global auth gate |
| `supabase/schema.sql`            | **NEW** — 5 tables + RLS + new-user trigger |
| `app/page.tsx`                   | **OVERWRITES** v0's — adds server-side auth guard |
| `package.json` etc.              | **NEW** — only if v0 doesn't already manage these (it usually does) |

Existing v0 files (all the screens, modals, TabBar, HistoryCard, auth pages, sammotion.css, layout.tsx) are unchanged — they will now compile because their imports finally resolve.

---

## Pass 2 preview (what I'll deliver next turn)

- **Log Tab**: tap a session → full per-set breakdown modal with edit/delete; recompute PRs after edits
- **Stats Tab**: per-exercise chart with toggle (top set / e1RM / volume) + 90d range + muscle-group volume distribution
- **Home Tab**: tap a recent PR → modal showing both the in-session set progression AND the all-time chart with the PR marked
- **Train Tab**: long-press / swipe an exercise → reorder / delete / replace; inline edit of default sets/reps/weight
- **Gym Tab**: tap a gym → detail screen (rename, edit equipment, sessions count, "Set as Active", **Delete** with confirm); routine editor for global routines (create / duplicate / edit / delete)
- A sign-out button in the app shell

Apply Pass 1, verify multi-user works, then come back and I'll ship Pass 2.
