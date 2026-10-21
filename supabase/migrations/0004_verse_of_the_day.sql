-- Tolle: the verse of the day, a second daily push at its own time, sent whether or not the
-- reader has read today. The push carries no verse: each phone keeps its own week of verses
-- (they differ by reader and translation) and shows today's when the push arrives.

alter table public.profiles add column verse_at time; -- local time of the verse push; null means off

-- One row per verse push sent, so a retried job never sends twice. Server only.
create table public.verse_log (
  user_id uuid not null references auth.users on delete cascade,
  sent_on date not null,
  primary key (user_id, sent_on)
);
alter table public.verse_log enable row level security; -- no policies: the app gets nothing
revoke all on public.verse_log from anon, authenticated;
grant select, insert on public.verse_log to service_role;

-- People whose verse push is due now: within 15 minutes after verse_at in their own zone
-- (counting across midnight, like due_reminders), and not yet sent today.
create function public.due_verses()
returns table (user_id uuid, local_day date)
language sql stable security definer set search_path = '' as $$
  select p.user_id, (now() at time zone p.tz)::date
  from public.profiles p
  where p.verse_at is not null
    and (extract(epoch from (now() at time zone p.tz)::time)::int - extract(epoch from p.verse_at)::int + 86400) % 86400 < 900
    and not exists (select 1 from public.verse_log l
                    where l.user_id = p.user_id and l.sent_on = (now() at time zone p.tz)::date)
$$;
revoke all on function public.due_verses() from public, anon, authenticated;
grant execute on function public.due_verses() to service_role;
