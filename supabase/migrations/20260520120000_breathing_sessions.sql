-- breathing_sessions: log of completed cohérence cardiaque sessions.
-- RGPD: only timing/counts; no emotional content, no physiological data.

create extension if not exists "pgcrypto";

create table if not exists public.breathing_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds  integer not null default 0 check (duration_seconds >= 0),
  completed_cycles  integer not null default 0 check (completed_cycles >= 0),
  created_at   timestamptz not null default now()
);

create index if not exists breathing_sessions_user_id_idx
  on public.breathing_sessions (user_id);

create index if not exists breathing_sessions_user_started_idx
  on public.breathing_sessions (user_id, started_at desc);

alter table public.breathing_sessions enable row level security;

drop policy if exists "breathing_sessions: select own" on public.breathing_sessions;
create policy "breathing_sessions: select own"
  on public.breathing_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "breathing_sessions: insert own" on public.breathing_sessions;
create policy "breathing_sessions: insert own"
  on public.breathing_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "breathing_sessions: update own" on public.breathing_sessions;
create policy "breathing_sessions: update own"
  on public.breathing_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "breathing_sessions: delete own" on public.breathing_sessions;
create policy "breathing_sessions: delete own"
  on public.breathing_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);
