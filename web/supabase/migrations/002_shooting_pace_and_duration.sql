-- Reason: Count-up sessions only; allow duration_minutes = 0; store pace at session end.
-- Apply in Supabase SQL Editor or via MCP apply_migration.

alter table public.sessions
  add column if not exists shooting_pace_seconds double precision;

-- Replace strict positive duration with nonnegative (legacy rows unchanged).
alter table public.sessions drop constraint if exists sessions_duration_minutes_check;
alter table public.sessions
  add constraint sessions_duration_minutes_nonneg check (duration_minutes >= 0);

alter table public.sessions alter column duration_minutes set default 0;
