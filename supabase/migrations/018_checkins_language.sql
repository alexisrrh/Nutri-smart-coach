begin;

alter table public.checkins
  add column if not exists language text;

update public.checkins
set language = 'es'
where language is null
   or trim(language) = ''
   or language not in ('es', 'en');

alter table public.checkins
  alter column language set default 'es';

alter table public.checkins
  alter column language set not null;

alter table public.checkins
  drop constraint if exists checkins_language_check;

alter table public.checkins
  add constraint checkins_language_check
  check (language in ('es', 'en'));

commit;
