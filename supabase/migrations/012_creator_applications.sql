create table if not exists public.influencer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  social_platform text not null check (social_platform in ('instagram', 'tiktok', 'youtube', 'other')),
  social_handle text not null,
  followers_count integer not null default 0 check (followers_count >= 0),
  proof_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index if not exists influencer_applications_user_id_idx
  on public.influencer_applications (user_id);

create index if not exists influencer_applications_status_idx
  on public.influencer_applications (status);

create index if not exists influencer_applications_social_platform_idx
  on public.influencer_applications (social_platform);

create unique index if not exists influencer_applications_active_user_uidx
  on public.influencer_applications (user_id)
  where status in ('pending', 'approved');

alter table if exists public.influencer_applications enable row level security;

drop policy if exists "influencer_applications_select_own" on public.influencer_applications;
drop policy if exists "influencer_applications_insert_own" on public.influencer_applications;

create policy "influencer_applications_select_own"
  on public.influencer_applications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "influencer_applications_insert_own"
  on public.influencer_applications
  for insert
  to authenticated
  with check (auth.uid() = user_id);
