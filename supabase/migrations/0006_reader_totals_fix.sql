-- Fix for 0005: Postgres regexes can't repeat more than 255 times, so '^[01]{1189}$' failed.
-- A valid plan is exactly 1,189 flags, each 0 or 1.
create or replace function public.reader_totals()
returns jsonb
language sql stable security definer set search_path = '' as $$
  with plans as (
    select c.pack->'plan' as p from public.copies c
    where length(c.pack->'plan'->>'read') = 1189 and c.pack->'plan'->>'read' !~ '[^01]'
  ), t as (
    select count(*) as readers,
      coalesce(sum(length(replace(p->>'read', '0', ''))), 0) as chapters,
      count(*) filter (where p->>'read' !~ '0') as finished
    from plans
  ), w as ( -- chapters logged over the last 7 days (each phone logs its own local dates)
    select coalesce(sum(least(l.value::int, 1189)), 0) as week
    from plans, jsonb_each_text(case when jsonb_typeof(p->'log') = 'object' then p->'log' else '{}'::jsonb end) l
    where l.key ~ '^\d{4}-\d{2}-\d{2}$' and l.value ~ '^\d{1,6}$' and l.key >= to_char(current_date - 6, 'YYYY-MM-DD')
  )
  select case when t.readers >= 5
    then jsonb_build_object('readers', t.readers, 'chapters', t.chapters, 'week', w.week, 'finished', t.finished)
    else jsonb_build_object('readers', t.readers, 'chapters', null, 'week', null, 'finished', null) end
  from t, w
$$;
