alter table if exists public.referral_codes
  add column if not exists customized_at timestamptz;
