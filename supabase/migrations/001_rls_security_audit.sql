-- NutriSmartCoach MVP security audit / RLS baseline.
-- Review this file before running it in Supabase SQL Editor.
--
-- Scope:
-- - Lock user-owned application tables to auth.uid().
-- - Keep public read access only for shared routines/week shares where
--   is_public = true and share_id is not null.
-- - Add owner-scoped storage policies for food-photos and checkins buckets.
--
-- This migration is intentionally idempotent for the policy names below.
-- It does not create tables, columns, buckets, or change bucket public/private
-- visibility. Confirm the schema exists before applying.

begin;

-- ---------------------------------------------------------------------------
-- Audit helpers to run manually before/after applying.
-- ---------------------------------------------------------------------------
-- Existing policies:
-- select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname in ('public', 'storage')
--   and tablename in (
--     'profiles',
--     'meal_analyses',
--     'diet_plans',
--     'checkins',
--     'progress_logs',
--     'workout_sessions',
--     'custom_workout_routines',
--     'custom_workout_routine_week_shares',
--     'objects'
--   )
-- order by schemaname, tablename, policyname;
--
-- RLS status:
-- select n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public'
--   and c.relname in (
--     'profiles',
--     'meal_analyses',
--     'diet_plans',
--     'checkins',
--     'progress_logs',
--     'workout_sessions',
--     'custom_workout_routines',
--     'custom_workout_routine_week_shares'
--   )
-- order by c.relname;
--
-- Buckets:
-- select id, name, public, file_size_limit, allowed_mime_types
-- from storage.buckets
-- where id in ('food-photos', 'checkins')
-- order by id;

-- ---------------------------------------------------------------------------
-- Enable RLS on all user-owned app tables.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.meal_analyses enable row level security;
alter table public.diet_plans enable row level security;
alter table public.checkins enable row level security;
alter table public.progress_logs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.custom_workout_routines enable row level security;
alter table public.custom_workout_routine_week_shares enable row level security;

-- ---------------------------------------------------------------------------
-- Drop previously generated policies from this migration.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

drop policy if exists "meal_analyses_select_own" on public.meal_analyses;
drop policy if exists "meal_analyses_insert_own" on public.meal_analyses;
drop policy if exists "meal_analyses_update_own" on public.meal_analyses;
drop policy if exists "meal_analyses_delete_own" on public.meal_analyses;

drop policy if exists "diet_plans_select_own" on public.diet_plans;
drop policy if exists "diet_plans_insert_own" on public.diet_plans;
drop policy if exists "diet_plans_update_own" on public.diet_plans;
drop policy if exists "diet_plans_delete_own" on public.diet_plans;

drop policy if exists "checkins_select_own" on public.checkins;
drop policy if exists "checkins_insert_own" on public.checkins;
drop policy if exists "checkins_update_own" on public.checkins;
drop policy if exists "checkins_delete_own" on public.checkins;

drop policy if exists "progress_logs_select_own" on public.progress_logs;
drop policy if exists "progress_logs_insert_own" on public.progress_logs;
drop policy if exists "progress_logs_update_own" on public.progress_logs;
drop policy if exists "progress_logs_delete_own" on public.progress_logs;

drop policy if exists "workout_sessions_select_own" on public.workout_sessions;
drop policy if exists "workout_sessions_insert_own" on public.workout_sessions;
drop policy if exists "workout_sessions_update_own" on public.workout_sessions;
drop policy if exists "workout_sessions_delete_own" on public.workout_sessions;

drop policy if exists "custom_workout_routines_select_own" on public.custom_workout_routines;
drop policy if exists "custom_workout_routines_select_public_shared" on public.custom_workout_routines;
drop policy if exists "custom_workout_routines_insert_own" on public.custom_workout_routines;
drop policy if exists "custom_workout_routines_update_own" on public.custom_workout_routines;
drop policy if exists "custom_workout_routines_delete_own" on public.custom_workout_routines;

drop policy if exists "custom_workout_routine_week_shares_select_own" on public.custom_workout_routine_week_shares;
drop policy if exists "custom_workout_routine_week_shares_select_public_shared" on public.custom_workout_routine_week_shares;
drop policy if exists "custom_workout_routine_week_shares_insert_own" on public.custom_workout_routine_week_shares;
drop policy if exists "custom_workout_routine_week_shares_update_own" on public.custom_workout_routine_week_shares;
drop policy if exists "custom_workout_routine_week_shares_delete_own" on public.custom_workout_routine_week_shares;

drop policy if exists "food_photos_select_own" on storage.objects;
drop policy if exists "food_photos_insert_own" on storage.objects;
drop policy if exists "food_photos_update_own" on storage.objects;
drop policy if exists "food_photos_delete_own" on storage.objects;
drop policy if exists "checkins_storage_select_own" on storage.objects;
drop policy if exists "checkins_storage_insert_own" on storage.objects;
drop policy if exists "checkins_storage_update_own" on storage.objects;
drop policy if exists "checkins_storage_delete_own" on storage.objects;

-- ---------------------------------------------------------------------------
-- profiles: primary key is the Supabase user id.
-- ---------------------------------------------------------------------------
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- User-owned data tables with user_id.
-- ---------------------------------------------------------------------------
create policy "meal_analyses_select_own"
on public.meal_analyses
for select
to authenticated
using (user_id = auth.uid());

create policy "meal_analyses_insert_own"
on public.meal_analyses
for insert
to authenticated
with check (user_id = auth.uid());

create policy "meal_analyses_update_own"
on public.meal_analyses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "meal_analyses_delete_own"
on public.meal_analyses
for delete
to authenticated
using (user_id = auth.uid());

create policy "diet_plans_select_own"
on public.diet_plans
for select
to authenticated
using (user_id = auth.uid());

create policy "diet_plans_insert_own"
on public.diet_plans
for insert
to authenticated
with check (user_id = auth.uid());

create policy "diet_plans_update_own"
on public.diet_plans
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "diet_plans_delete_own"
on public.diet_plans
for delete
to authenticated
using (user_id = auth.uid());

create policy "checkins_select_own"
on public.checkins
for select
to authenticated
using (user_id = auth.uid());

create policy "checkins_insert_own"
on public.checkins
for insert
to authenticated
with check (user_id = auth.uid());

create policy "checkins_update_own"
on public.checkins
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "checkins_delete_own"
on public.checkins
for delete
to authenticated
using (user_id = auth.uid());

create policy "progress_logs_select_own"
on public.progress_logs
for select
to authenticated
using (user_id = auth.uid());

create policy "progress_logs_insert_own"
on public.progress_logs
for insert
to authenticated
with check (user_id = auth.uid());

create policy "progress_logs_update_own"
on public.progress_logs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "progress_logs_delete_own"
on public.progress_logs
for delete
to authenticated
using (user_id = auth.uid());

create policy "workout_sessions_select_own"
on public.workout_sessions
for select
to authenticated
using (user_id = auth.uid());

create policy "workout_sessions_insert_own"
on public.workout_sessions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "workout_sessions_update_own"
on public.workout_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "workout_sessions_delete_own"
on public.workout_sessions
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Custom routines: own CRUD plus public read for shared links only.
-- ---------------------------------------------------------------------------
create policy "custom_workout_routines_select_own"
on public.custom_workout_routines
for select
to authenticated
using (user_id = auth.uid());

create policy "custom_workout_routines_select_public_shared"
on public.custom_workout_routines
for select
to anon, authenticated
using (
  is_public = true
  and share_id is not null
  and coalesce(is_active, true) = true
);

create policy "custom_workout_routines_insert_own"
on public.custom_workout_routines
for insert
to authenticated
with check (user_id = auth.uid());

create policy "custom_workout_routines_update_own"
on public.custom_workout_routines
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "custom_workout_routines_delete_own"
on public.custom_workout_routines
for delete
to authenticated
using (user_id = auth.uid());

create policy "custom_workout_routine_week_shares_select_own"
on public.custom_workout_routine_week_shares
for select
to authenticated
using (user_id = auth.uid());

create policy "custom_workout_routine_week_shares_select_public_shared"
on public.custom_workout_routine_week_shares
for select
to anon, authenticated
using (
  is_public = true
  and share_id is not null
);

create policy "custom_workout_routine_week_shares_insert_own"
on public.custom_workout_routine_week_shares
for insert
to authenticated
with check (user_id = auth.uid());

create policy "custom_workout_routine_week_shares_update_own"
on public.custom_workout_routine_week_shares
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "custom_workout_routine_week_shares_delete_own"
on public.custom_workout_routine_week_shares
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage policies for app buckets.
--
-- Backend uploads with SUPABASE_SERVICE_ROLE_KEY bypass RLS. These policies
-- cover any current/future direct client access and expect object names to be
-- scoped as: <auth.uid()>/<filename>, which matches backend storage.service.js.
-- ---------------------------------------------------------------------------
create policy "food_photos_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "food_photos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "food_photos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "food_photos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "checkins_storage_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'checkins'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "checkins_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'checkins'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "checkins_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'checkins'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'checkins'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "checkins_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'checkins'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
