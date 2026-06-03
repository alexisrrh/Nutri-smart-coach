alter table if exists public.subscription_acquisitions
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz;

alter table if exists public.subscription_acquisitions
  drop constraint if exists subscription_acquisitions_trial_source_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscription_acquisitions_trial_source_check'
      and conrelid = 'public.subscription_acquisitions'::regclass
  ) then
    alter table public.subscription_acquisitions
      add constraint subscription_acquisitions_trial_source_check
      check (trial_source in ('none', 'standard_trial', 'influencer_trial'));
  end if;
end $$;
