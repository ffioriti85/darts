-- Warm-up rounds (excluded from session aggregates) and per-throw flag.

alter table public.sessions
  add column if not exists warm_up_rounds integer not null default 10
  check (warm_up_rounds >= 0);

alter table public.throws
  add column if not exists is_warm_up boolean not null default false;
