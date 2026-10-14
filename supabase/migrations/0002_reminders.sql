-- Tolle: run the remind function every 15 minutes. See BACKEND.md.
-- Before running this, store two secrets in Vault (in the SQL editor, with your own values):
--   select vault.create_secret('https://wvzfjqblglbtyjcnklym.supabase.co', 'project_url');
--   select vault.create_secret('<the same random CRON_SECRET you gave the remind function>', 'cron_secret');
-- The secret never goes into this file or into the app.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('tolle-remind', '*/15 * * * *', $$
  select net.http_post(
    url     := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/remind',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body    := '{}'::jsonb)
$$);
