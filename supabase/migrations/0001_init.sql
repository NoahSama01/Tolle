-- Tolle: accounts, sync, reminders. See BACKEND.md.
-- One row per person holds the same copy as the backup file; the phone merges, the server stores.

-- The copy of everything worth keeping: {plan, kept, hl}, stamped by the phone (ms) like tolle-u.
create table public.copies (
  user_id    uuid primary key references auth.users on delete cascade,
  u          bigint not null,
  pack       jsonb  not null,
  updated_at timestamptz not null default now(),
  constraint pack_is_object check (jsonb_typeof(pack) = 'object'),
  constraint pack_size check (pg_column_size(pack) < 2000000)
);

-- What the server itself needs to know: when to remind, and whether today's reading is done.
create table public.profiles (
  user_id    uuid primary key references auth.users on delete cascade,
  tz         text not null default 'UTC',          -- IANA zone from the phone, e.g. Asia/Kolkata
  remind_at  time,                                 -- local time of the daily reminder; null means off
  last_read  date,                                 -- local date of the last chapter read, sent on sync
  next_up    text,                                 -- the next chapter's name for the reminder, e.g. 'Leviticus 4'
  created_at timestamptz not null default now()
);
-- an unknown zone would break the reminder query for everyone, so it is refused on write
create function public.check_tz() returns trigger language plpgsql set search_path = '' as $$
begin perform now() at time zone new.tz; return new; end $$;
create trigger profiles_tz before insert or update of tz on public.profiles
  for each row execute function public.check_tz();

create table public.push_subscriptions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user on public.push_subscriptions (user_id);

-- One row per reminder sent, so a retried job never sends twice. Server only.
create table public.reminder_log (
  user_id uuid not null references auth.users on delete cascade,
  sent_on date not null,
  primary key (user_id, sent_on)
);

-- Row-level security: a person sees and writes only their own rows.
alter table public.copies             enable row level security;
alter table public.profiles           enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminder_log       enable row level security; -- no policies: the app gets nothing

create policy "own copy"     on public.copies             for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own profile"  on public.profiles           for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own devices"  on public.push_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Explicit grants (new Supabase projects no longer expose tables by default). Signed-out visitors get nothing.
revoke all on public.copies, public.profiles, public.push_subscriptions, public.reminder_log from anon, authenticated;
grant select, insert, update          on public.copies             to authenticated;
grant select, insert, update          on public.profiles           to authenticated;
grant select, insert, delete          on public.push_subscriptions to authenticated;

-- Write a copy only if the stored one is the one this phone last saw (its stamp `base`).
-- On a mismatch nothing is written and the stored copy comes back for the phone to merge.
create function public.put_copy(base bigint, new_u bigint, new_pack jsonb)
returns table (ok boolean, u bigint, pack jsonb)
language plpgsql security invoker set search_path = '' as $$
#variable_conflict use_column
declare cur public.copies;
begin
  select * into cur from public.copies c where c.user_id = auth.uid() for update;
  if not found then
    insert into public.copies (user_id, u, pack) values (auth.uid(), new_u, new_pack);
    return query select true, new_u, null::jsonb;
  elsif cur.u = base then
    update public.copies c set u = new_u, pack = new_pack, updated_at = now() where c.user_id = auth.uid();
    return query select true, new_u, null::jsonb;
  else
    return query select false, cur.u, cur.pack;
  end if;
end $$;
revoke all on function public.put_copy(bigint, bigint, jsonb) from public, anon;
grant execute on function public.put_copy(bigint, bigint, jsonb) to authenticated;

-- People whose reminder is due now: their local time has just passed remind_at (within the last
-- 15 minutes, matching the schedule), they haven't read today in their own zone, and today's
-- reminder hasn't gone out. Called by the remind function with the service role.
create function public.due_reminders()
returns table (user_id uuid, local_day date, next_up text)
language sql stable security definer set search_path = '' as $$
  select p.user_id, (now() at time zone p.tz)::date, p.next_up
  from public.profiles p
  where p.remind_at is not null
    -- within 15 minutes after remind_at, counting across midnight (23:55 then 00:05 is 10 minutes)
    and (extract(epoch from (now() at time zone p.tz)::time)::int - extract(epoch from p.remind_at)::int + 86400) % 86400 < 900
    and (p.last_read is null or p.last_read < (now() at time zone p.tz)::date)
    and not exists (select 1 from public.reminder_log l
                    where l.user_id = p.user_id and l.sent_on = (now() at time zone p.tz)::date)
$$;
revoke all on function public.due_reminders() from public, anon, authenticated;
grant execute on function public.due_reminders() to service_role;
grant select on public.profiles to service_role;
grant select, delete on public.push_subscriptions to service_role;
grant select, insert on public.reminder_log to service_role;

-- Every 15 minutes, call the remind Edge Function (needs the pg_cron and pg_net extensions,
-- and the project URL and service key stored in Vault as 'project_url' and 'service_key').
-- select cron.schedule('remind', '*/15 * * * *', $$
--   select net.http_post(
--     url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/remind',
--     headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_key')))
-- $$);
