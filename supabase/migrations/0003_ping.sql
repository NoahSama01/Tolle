-- Tolle: a harmless function anyone may call, so a daily request from GitHub keeps the
-- free project from pausing after 7 quiet days. It reads no table and returns 1.
create function public.ping() returns int language sql stable set search_path = '' as 'select 1';
revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
