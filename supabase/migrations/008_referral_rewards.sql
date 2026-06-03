create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.profiles (id) on delete cascade,
  milestone_number integer not null check (milestone_number > 0),
  source_referral_id uuid references public.referrals (id) on delete set null,
  status text not null default 'available' check (status in ('available', 'granted', 'expired')),
  created_at timestamptz not null default now()
);

create unique index if not exists referral_rewards_referrer_milestone_uidx
on public.referral_rewards (referrer_user_id, milestone_number);

create index if not exists referral_rewards_referrer_idx
on public.referral_rewards (referrer_user_id);

create index if not exists referral_rewards_status_idx
on public.referral_rewards (status);
