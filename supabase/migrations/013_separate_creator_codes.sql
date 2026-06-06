do $$
begin
  if to_regclass('public.referral_codes') is not null then
    alter table public.referral_codes
      drop constraint if exists referral_codes_type_check;

    alter table public.referral_codes
      add constraint referral_codes_type_check
      check (type in ('user', 'influencer', 'creator'));
  end if;

  if to_regclass('public.referrals') is not null then
    alter table public.referrals
      drop constraint if exists referrals_type_check;

    alter table public.referrals
      add constraint referrals_type_check
      check (type in ('user', 'influencer', 'creator'));
  end if;

  if to_regclass('public.subscription_acquisitions') is not null then
    alter table public.subscription_acquisitions
      drop constraint if exists subscription_acquisitions_acquisition_source_check;

    alter table public.subscription_acquisitions
      add constraint subscription_acquisitions_acquisition_source_check
      check (acquisition_source in ('normal', 'referral', 'influencer', 'creator', 'manual'));

    alter table public.subscription_acquisitions
      drop constraint if exists subscription_acquisitions_trial_source_check;

    alter table public.subscription_acquisitions
      add constraint subscription_acquisitions_trial_source_check
      check (trial_source in ('none', 'standard_trial', 'influencer_trial', 'creator_trial'));
  end if;
end $$;
