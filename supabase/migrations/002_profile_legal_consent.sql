alter table if exists public.profiles
  add column if not exists accepted_terms boolean not null default false,
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_privacy boolean not null default false,
  add column if not exists accepted_privacy_at timestamptz,
  add column if not exists accepted_data_policy boolean not null default false,
  add column if not exists accepted_data_policy_at timestamptz,
  add column if not exists legal_version text not null default '2026-05-27';
