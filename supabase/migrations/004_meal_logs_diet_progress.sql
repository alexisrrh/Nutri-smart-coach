-- Persist diet meal completion progress.
-- This migration is idempotent and follows the user-owned RLS model used by
-- diet_plans, meal_analyses, checkins, progress_logs, and workout_sessions.

begin;

create extension if not exists pgcrypto;

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  meal_id text not null,
  diet_plan_id uuid,
  source text not null default 'diet_plan',
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meal_logs
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid,
  add column if not exists meal_id text,
  add column if not exists diet_plan_id uuid,
  add column if not exists source text not null default 'diet_plan',
  add column if not exists completed boolean not null default false,
  add column if not exists completed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.meal_logs
set source = 'diet_plan'
where source is null;

update public.meal_logs
set completed = false
where completed is null;

update public.meal_logs
set created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.meal_logs
  alter column source set default 'diet_plan',
  alter column source set not null,
  alter column completed set default false,
  alter column completed set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

-- Remove duplicate diet progress rows before adding the unique index. Keep the
-- most recently updated row for each user, diet plan, meal, and source.
delete from public.meal_logs duplicate
using public.meal_logs keeper
where duplicate.ctid < keeper.ctid
  and duplicate.source = 'diet_plan'
  and keeper.source = 'diet_plan'
  and duplicate.user_id = keeper.user_id
  and duplicate.meal_id = keeper.meal_id
  and coalesce(
    duplicate.diet_plan_id,
    '00000000-0000-0000-0000-000000000000'::uuid
  ) = coalesce(
    keeper.diet_plan_id,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
  and (
    duplicate.updated_at < keeper.updated_at
    or (
      duplicate.updated_at = keeper.updated_at
      and duplicate.created_at <= keeper.created_at
    )
  );

create index if not exists meal_logs_user_id_idx
on public.meal_logs (user_id);

create index if not exists meal_logs_diet_plan_id_idx
on public.meal_logs (diet_plan_id);

create index if not exists meal_logs_user_diet_plan_idx
on public.meal_logs (user_id, diet_plan_id);

create index if not exists meal_logs_user_diet_plan_meal_idx
on public.meal_logs (user_id, diet_plan_id, meal_id);

create unique index if not exists meal_logs_diet_progress_unique_idx
on public.meal_logs (
  user_id,
  coalesce(diet_plan_id, '00000000-0000-0000-0000-000000000000'::uuid),
  meal_id
)
where source = 'diet_plan';

alter table public.meal_logs enable row level security;

drop policy if exists "meal_logs_select_own" on public.meal_logs;
drop policy if exists "meal_logs_insert_own" on public.meal_logs;
drop policy if exists "meal_logs_update_own" on public.meal_logs;
drop policy if exists "meal_logs_delete_own" on public.meal_logs;

create policy "meal_logs_select_own"
on public.meal_logs
for select
to authenticated
using (user_id = auth.uid());

create policy "meal_logs_insert_own"
on public.meal_logs
for insert
to authenticated
with check (user_id = auth.uid());

create policy "meal_logs_update_own"
on public.meal_logs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "meal_logs_delete_own"
on public.meal_logs
for delete
to authenticated
using (user_id = auth.uid());

commit;
