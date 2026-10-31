-- Tolle: the evening "keep your run" nudge, a third daily push at its own time. It goes only to
-- someone whose run of days in a row would break at midnight: they read yesterday, not yet today,
-- and the run is at least 2 days long.

alter table public.profiles
  add column run_at   time,                                                 -- local time of the nudge; null means off
  add column run_days int not null default 0 check (run_days between 0 and 100000); -- the run up to last_read, sent on sync

-- One row per nudge sent, so a retried job never sends twice. Server only.
create table public.run_log (
  user_id uuid not null references auth.users on delete cascade,
  sent_on date not null,
  primary key (user_id, sent_on)
);
alter table public.run_log enable row level security; -- no policies: the app gets nothing
revoke all on public.run_log from anon, authenticated;
grant select, insert on public.run_log to service_role;

-- People whose nudge is due now: within 15 minutes after run_at in their own zone (counting across
-- midnight, like due_reminders), last read yesterday in that zone, a run of 2 or more, not yet sent today.
create function public.due_runs()
returns table (user_id uuid, local_day date, run_days int, next_up text)
language sql stable security definer set search_path = '' as $$
  select p.user_id, (now() at time zone p.tz)::date, p.run_days, p.next_up
  from public.profiles p
  where p.run_at is not null
    and p.run_days >= 2
    and p.last_read = (now() at time zone p.tz)::date - 1
    and (extract(epoch from (now() at time zone p.tz)::time)::int - extract(epoch from p.run_at)::int + 86400) % 86400 < 900
    and not exists (select 1 from public.run_log l
                    where l.user_id = p.user_id and l.sent_on = (now() at time zone p.tz)::date)
$$;
revoke all on function public.due_runs() from public, anon, authenticated;
grant execute on function public.due_runs() to service_role;
