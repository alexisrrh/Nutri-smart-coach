alter table if exists public.profiles
  add column if not exists subscription_status text default 'inactive',
  add column if not exists stripe_price_id text,
  add column if not exists stripe_current_period_end timestamptz,
  add column if not exists stripe_cancel_at_period_end boolean default false;

update public.profiles
set subscription_status = case
  when is_premium = true then 'active'
  else 'inactive'
end
where subscription_status is null;

update public.profiles
set stripe_cancel_at_period_end = false
where stripe_cancel_at_period_end is null;

create index if not exists profiles_stripe_customer_id_idx
on public.profiles (stripe_customer_id)
where stripe_customer_id is not null;

create index if not exists profiles_stripe_subscription_id_idx
on public.profiles (stripe_subscription_id)
where stripe_subscription_id is not null;

create index if not exists profiles_subscription_status_idx
on public.profiles (subscription_status);

revoke update (
  plan,
  is_premium,
  premium_started_at,
  premium_expires_at,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  stripe_price_id,
  stripe_current_period_end,
  stripe_cancel_at_period_end
) on public.profiles from authenticated, anon;

grant update (
  plan,
  is_premium,
  premium_started_at,
  premium_expires_at,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  stripe_price_id,
  stripe_current_period_end,
  stripe_cancel_at_period_end
) on public.profiles to service_role;
