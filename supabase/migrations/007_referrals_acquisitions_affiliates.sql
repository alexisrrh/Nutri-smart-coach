create extension if not exists pgcrypto;

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  code text not null,
  type text not null check (type in ('user', 'influencer')),
  trial_days integer not null default 0 check (trial_days >= 0),
  commission_percent numeric(5,2) not null default 0 check (commission_percent >= 0),
  commission_months_limit integer not null default 0 check (commission_months_limit >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists referral_codes_code_uidx
on public.referral_codes (code);

create index if not exists referral_codes_user_id_idx
on public.referral_codes (user_id);

create index if not exists referral_codes_type_idx
on public.referral_codes (type);

create index if not exists referral_codes_is_active_idx
on public.referral_codes (is_active);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid references public.referral_codes (id) on delete set null,
  referrer_user_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('user', 'influencer')),
  status text not null check (status in ('pending', 'trialing', 'premium_active', 'rewarded', 'expired', 'cancelled')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  premium_started_at timestamptz,
  reward_available boolean not null default false,
  created_at timestamptz not null default now(),
  constraint referrals_no_self_referral check (referrer_user_id <> referred_user_id)
);

create unique index if not exists referrals_referred_user_id_uidx
on public.referrals (referred_user_id);

create index if not exists referrals_referral_code_id_idx
on public.referrals (referral_code_id);

create index if not exists referrals_referrer_user_id_idx
on public.referrals (referrer_user_id);

create index if not exists referrals_status_idx
on public.referrals (status);

create index if not exists referrals_type_idx
on public.referrals (type);

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  influencer_user_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid not null references public.profiles (id) on delete cascade,
  referral_id uuid references public.referrals (id) on delete set null,
  subscription_id text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'eur',
  commission_percent numeric(5,2) not null default 30,
  commission_month_number integer not null check (commission_month_number between 1 and 12),
  status text not null check (status in ('pending', 'payable', 'paid', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  constraint affiliate_commissions_no_self check (influencer_user_id <> referred_user_id)
);

create unique index if not exists affiliate_commissions_subscription_id_uidx
on public.affiliate_commissions (subscription_id)
where subscription_id is not null;

create index if not exists affiliate_commissions_influencer_user_id_idx
on public.affiliate_commissions (influencer_user_id);

create index if not exists affiliate_commissions_referred_user_id_idx
on public.affiliate_commissions (referred_user_id);

create index if not exists affiliate_commissions_status_idx
on public.affiliate_commissions (status);

create table if not exists public.subscription_acquisitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  premium_source text not null check (premium_source in ('stripe', 'apple', 'google', 'manual')),
  acquisition_source text not null check (acquisition_source in ('normal', 'referral', 'influencer', 'manual')),
  referral_code_id uuid references public.referral_codes (id) on delete set null,
  referrer_user_id uuid references public.profiles (id) on delete set null,
  influencer_user_id uuid references public.profiles (id) on delete set null,
  trial_source text not null default 'none' check (trial_source in ('none', 'influencer_code')),
  trial_ends_at timestamptz,
  commission_percent numeric(5,2) not null default 0 check (commission_percent >= 0),
  commission_months_limit integer not null default 0 check (commission_months_limit >= 0),
  commission_started_at timestamptz,
  commission_ends_at timestamptz,
  platform_subscription_id text,
  status text,
  created_at timestamptz not null default now(),
  constraint subscription_acquisitions_no_self_referrer check (
    referrer_user_id is null or referrer_user_id <> user_id
  ),
  constraint subscription_acquisitions_no_self_influencer check (
    influencer_user_id is null or influencer_user_id <> user_id
  )
);

create unique index if not exists subscription_acquisitions_platform_subscription_id_uidx
on public.subscription_acquisitions (platform_subscription_id)
where platform_subscription_id is not null;

create index if not exists subscription_acquisitions_user_id_idx
on public.subscription_acquisitions (user_id);

create index if not exists subscription_acquisitions_acquisition_source_idx
on public.subscription_acquisitions (acquisition_source);

create index if not exists subscription_acquisitions_referrer_user_id_idx
on public.subscription_acquisitions (referrer_user_id);

create index if not exists subscription_acquisitions_influencer_user_id_idx
on public.subscription_acquisitions (influencer_user_id);

create index if not exists subscription_acquisitions_status_idx
on public.subscription_acquisitions (status);
