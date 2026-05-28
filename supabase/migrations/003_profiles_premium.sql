alter table if exists public.profiles
  add column if not exists plan text default 'free',
  add column if not exists is_premium boolean default false,
  add column if not exists premium_started_at timestamptz,
  add column if not exists premium_expires_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

update public.profiles
set plan = 'free'
where plan is null;

update public.profiles
set is_premium = false
where is_premium is null;
