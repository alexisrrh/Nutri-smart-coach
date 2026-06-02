alter table if exists public.profiles
  add column if not exists premium_source text,
  add column if not exists premium_product_id text,
  add column if not exists premium_platform_transaction_id text,
  add column if not exists premium_expires_at timestamptz,
  add column if not exists premium_last_verified_at timestamptz;

update public.profiles
set premium_source = case
  when premium_source is not null then premium_source
  when stripe_customer_id is not null or stripe_subscription_id is not null or stripe_price_id is not null then 'stripe'
  when plan = 'premium' and is_premium = true then 'manual'
  else null
end
where premium_source is null;

update public.profiles
set premium_product_id = coalesce(premium_product_id, stripe_price_id)
where premium_product_id is null
  and stripe_price_id is not null;

update public.profiles
set premium_platform_transaction_id = coalesce(premium_platform_transaction_id, stripe_subscription_id)
where premium_platform_transaction_id is null
  and stripe_subscription_id is not null;

update public.profiles
set premium_expires_at = coalesce(premium_expires_at, stripe_current_period_end)
where premium_expires_at is null
  and stripe_current_period_end is not null;

update public.profiles
set premium_last_verified_at = coalesce(premium_last_verified_at, updated_at, now())
where premium_last_verified_at is null
  and premium_source is not null;

create index if not exists profiles_premium_source_idx
on public.profiles (premium_source);

create index if not exists profiles_premium_expires_at_idx
on public.profiles (premium_expires_at);

create index if not exists profiles_premium_last_verified_at_idx
on public.profiles (premium_last_verified_at);
