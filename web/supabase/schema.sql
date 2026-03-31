-- Darts Training App — run in Supabase SQL Editor or via migration.
-- Reason: Core tables for sessions and per-throw tracking keyed by Clerk user_id.

-- Optional profile row for future Clerk webhooks / sync (not required for MVP API flow).
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  darts_per_round integer not null default 3 check (darts_per_round > 0),
  warm_up_rounds integer not null default 10 check (warm_up_rounds >= 0),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_throws integer not null default 0 check (total_throws >= 0),
  total_hits integer not null default 0 check (total_hits >= 0),
  total_misses integer not null default 0 check (total_misses >= 0),
  accuracy double precision not null default 0 check (accuracy >= 0 and accuracy <= 100),
  shooting_pace_seconds double precision
);

create index if not exists sessions_user_started_idx
  on public.sessions (user_id, started_at desc);

create table if not exists public.throws (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  throw_number integer not null check (throw_number > 0),
  is_hit boolean not null,
  is_warm_up boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, throw_number)
);

create index if not exists throws_session_idx on public.throws (session_id);

-- RLS: API uses the service role (bypasses RLS). Anon/authenticated clients have no policies.
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.throws enable row level security;
