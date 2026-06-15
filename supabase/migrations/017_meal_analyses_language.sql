begin;

alter table public.meal_analyses
  add column if not exists language text;

update public.meal_analyses
set language = 'es'
where language is null
   or trim(language) = ''
   or language not in ('es', 'en');

alter table public.meal_analyses
  alter column language set default 'es';

alter table public.meal_analyses
  alter column language set not null;

alter table public.meal_analyses
  drop constraint if exists meal_analyses_language_check;

alter table public.meal_analyses
  add constraint meal_analyses_language_check
  check (language in ('es', 'en'));

commit;
