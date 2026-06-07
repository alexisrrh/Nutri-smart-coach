alter table if exists public.affiliate_commissions
  add column if not exists source_code text,
  add column if not exists payment_reference text;

create index if not exists affiliate_commissions_source_code_idx
  on public.affiliate_commissions (source_code);

create index if not exists affiliate_commissions_payment_reference_idx
  on public.affiliate_commissions (payment_reference);

create table if not exists public.creator_link_clicks (
  id uuid primary key default gen_random_uuid(),
  creator_code text not null,
  creator_user_id uuid not null references public.profiles (id) on delete cascade,
  visitor_id text null,
  ip_hash text null,
  user_agent text null,
  created_at timestamptz not null default now()
);

create index if not exists creator_link_clicks_creator_user_id_idx
  on public.creator_link_clicks (creator_user_id);

create index if not exists creator_link_clicks_creator_code_idx
  on public.creator_link_clicks (creator_code);

create index if not exists creator_link_clicks_created_at_idx
  on public.creator_link_clicks (created_at desc);

create table if not exists public.creator_payout_requests (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected', 'cancelled')),
  requested_at timestamptz not null default now(),
  paid_at timestamptz null,
  notes text null
);

create index if not exists creator_payout_requests_creator_user_id_idx
  on public.creator_payout_requests (creator_user_id);

create index if not exists creator_payout_requests_status_idx
  on public.creator_payout_requests (status);

create index if not exists creator_payout_requests_requested_at_idx
  on public.creator_payout_requests (requested_at desc);

create unique index if not exists creator_payout_requests_pending_uidx
  on public.creator_payout_requests (creator_user_id)
  where status = 'pending';
