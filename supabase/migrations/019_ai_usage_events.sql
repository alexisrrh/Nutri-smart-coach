create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_type_created_idx
on public.ai_usage_events (user_id, type, created_at desc);

alter table public.ai_usage_events enable row level security;

drop policy if exists "ai_usage_events_select_own" on public.ai_usage_events;
drop policy if exists "ai_usage_events_insert_own" on public.ai_usage_events;

create policy "ai_usage_events_select_own"
on public.ai_usage_events
for select
using (auth.uid() = user_id);

create policy "ai_usage_events_insert_own"
on public.ai_usage_events
for insert
with check (auth.uid() = user_id);
