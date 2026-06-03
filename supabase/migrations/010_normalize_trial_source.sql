do $$
begin
  if to_regclass('public.subscription_acquisitions') is null then
    return;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscription_acquisitions'
      and column_name = 'trial_source'
  ) then
    alter table public.subscription_acquisitions
      add column trial_source text not null default 'none';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscription_acquisitions'
      and column_name = 'trial_started_at'
  ) then
    alter table public.subscription_acquisitions
      add column trial_started_at timestamptz;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscription_acquisitions'
      and column_name = 'trial_ends_at'
  ) then
    alter table public.subscription_acquisitions
      add column trial_ends_at timestamptz;
  end if;

  update public.subscription_acquisitions
  set trial_source = 'influencer_trial'
  where trial_source = 'influencer_code';

  alter table public.subscription_acquisitions
    drop constraint if exists subscription_acquisitions_trial_source_check;

  alter table public.subscription_acquisitions
    add constraint subscription_acquisitions_trial_source_check
    check (trial_source in ('none', 'standard_trial', 'influencer_trial'));
end $$;
