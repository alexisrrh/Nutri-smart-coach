alter table if exists public.referral_rewards
  add column if not exists claimed_at timestamptz;

do $$
begin
  if to_regclass('public.referral_rewards') is not null then
    update public.referral_rewards
    set status = 'claimed'
    where status = 'granted';

    if exists (
      select 1
      from pg_constraint
      where conname = 'referral_rewards_status_check'
        and conrelid = 'public.referral_rewards'::regclass
    ) then
      alter table public.referral_rewards
        drop constraint referral_rewards_status_check;
    end if;

    alter table public.referral_rewards
      add constraint referral_rewards_status_check
      check (status in ('available', 'claimed', 'expired', 'cancelled'));
  end if;
end $$;
