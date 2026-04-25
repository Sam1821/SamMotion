-- ─────────────────────────────────────────────────────────────────────────────
-- SamMotion — Supabase schema with per-user Row Level Security
-- Paste this into Supabase → SQL Editor and run once.
-- Each table: PK + user_id FK → auth.users; RLS policy allows owner-only access.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. PROFILES — one row per user, holds active selections + first-time flag.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_gym_id text,
  active_routine_id text,
  is_first_time boolean default true,
  updated_at timestamptz default now()
);

-- 2. GYMS — user's gyms with equipment list.
create table if not exists public.gyms (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🏠',
  equipment text[] not null default '{}',
  notes text,
  created_at timestamptz default now()
);
create index if not exists gyms_user_idx on public.gyms(user_id);

-- 3. ROUTINES — user's custom routines (built-ins live in code, not DB).
create table if not exists public.routines (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tags text[] not null default '{}',
  exercise_ids text[] not null default '{}',
  days_per_week int,
  is_custom boolean not null default true,
  created_at timestamptz default now()
);
create index if not exists routines_user_idx on public.routines(user_id);

-- 4. HISTORY — completed workout sessions (with full per-set detail).
create table if not exists public.history (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null,
  routine text,
  routine_id text,
  gym_id text,
  dur int not null default 0,
  vol int not null default 0,
  prs_count int not null default 0,
  exs text[] not null default '{}',
  details jsonb,           -- [{ id, n, sets:[{weight,reps,done,rpe?}] }]
  notes text,
  created_at timestamptz default now()
);
create index if not exists history_user_date_idx on public.history(user_id, date desc);

-- 5. PRS — personal bests, one row per (user, exercise).
create table if not exists public.prs (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  n text,
  w numeric not null,
  r int not null,
  e1rm numeric,
  date text,
  updated_at timestamptz default now(),
  primary key (user_id, exercise_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security — enable + owner-only policies on every table.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.gyms     enable row level security;
alter table public.routines enable row level security;
alter table public.history  enable row level security;
alter table public.prs      enable row level security;

-- Pattern: a logged-in user can only see/modify rows where user_id = auth.uid().
do $$
declare
  t text;
begin
  for t in select unnest(array['profiles','gyms','routines','history','prs']) loop
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_modify" on public.%I', t);
    execute format(
      'create policy "owner_select" on public.%I for select using (user_id = auth.uid())', t
    );
    execute format(
      'create policy "owner_modify" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t
    );
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create a profile row when a new user signs up.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, is_first_time)
  values (new.id, true)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
