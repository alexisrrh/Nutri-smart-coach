begin;

-- RLS baseline for monetization / creator tables.
-- Keep service_role fully functional while limiting authenticated users to
-- read-only access on their own rows when applicable.

-- referral_codes
alter table if exists public.referral_codes enable row level security;
revoke all on public.referral_codes from anon, authenticated;
grant select on public.referral_codes to authenticated;
grant all on public.referral_codes to service_role;

drop policy if exists "referral_codes_select_own" on public.referral_codes;

create policy "referral_codes_select_own"
on public.referral_codes
for select
to authenticated
using (user_id = auth.uid());

-- referrals
alter table if exists public.referrals enable row level security;
revoke all on public.referrals from anon, authenticated;
grant select on public.referrals to authenticated;
grant all on public.referrals to service_role;

drop policy if exists "referrals_select_involved" on public.referrals;

create policy "referrals_select_involved"
on public.referrals
for select
to authenticated
using (
  referrer_user_id = auth.uid()
  or referred_user_id = auth.uid()
);

-- subscription_acquisitions
alter table if exists public.subscription_acquisitions enable row level security;
revoke all on public.subscription_acquisitions from anon, authenticated;
grant select on public.subscription_acquisitions to authenticated;
grant all on public.subscription_acquisitions to service_role;

drop policy if exists "subscription_acquisitions_select_own" on public.subscription_acquisitions;

create policy "subscription_acquisitions_select_own"
on public.subscription_acquisitions
for select
to authenticated
using (user_id = auth.uid());

-- affiliate_commissions
alter table if exists public.affiliate_commissions enable row level security;
revoke all on public.affiliate_commissions from anon, authenticated;
grant select on public.affiliate_commissions to authenticated;
grant all on public.affiliate_commissions to service_role;

drop policy if exists "affiliate_commissions_select_own" on public.affiliate_commissions;

create policy "affiliate_commissions_select_own"
on public.affiliate_commissions
for select
to authenticated
using (influencer_user_id = auth.uid());

-- creator_link_clicks
alter table if exists public.creator_link_clicks enable row level security;
revoke all on public.creator_link_clicks from anon, authenticated;
grant select on public.creator_link_clicks to authenticated;
grant all on public.creator_link_clicks to service_role;

drop policy if exists "creator_link_clicks_select_own" on public.creator_link_clicks;

create policy "creator_link_clicks_select_own"
on public.creator_link_clicks
for select
to authenticated
using (creator_user_id = auth.uid());

-- creator_payout_requests
alter table if exists public.creator_payout_requests enable row level security;
revoke all on public.creator_payout_requests from anon, authenticated;
grant select on public.creator_payout_requests to authenticated;
grant all on public.creator_payout_requests to service_role;

drop policy if exists "creator_payout_requests_select_own" on public.creator_payout_requests;

create policy "creator_payout_requests_select_own"
on public.creator_payout_requests
for select
to authenticated
using (creator_user_id = auth.uid());

commit;
