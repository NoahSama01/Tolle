-- Tolle: everyone's reading, added up, for the landing page. Signed-out visitors may call it.
-- Only totals leave the database, and none until 5 readers have synced, so no one's own
-- progress can be worked out from them. Counts only signed-in readers (the rest never sync).
-- A copy that doesn't look like the app's own is skipped, and a day's count is capped at 1,189,
-- so an edited copy can't inflate the totals.
create function public.reader_totals()
returns jsonb
language sql stable security definer set search_path = '' as $$
  with plans as (
    select c.pack->'plan' as p from public.copies c
    where c.pack->'plan'->>'read' ~ '^[01]{1189}$'
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
revoke all on function public.reader_totals() from public;
grant execute on function public.reader_totals() to anon, authenticated;
