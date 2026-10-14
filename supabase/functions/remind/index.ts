// Every 15 minutes (pg_cron): send today's reminder to each person whose time has just passed
// in their own zone and who hasn't read today. Logged once sent, so a rerun never sends twice;
// subscriptions the push service reports gone (404, 410) are removed.
// Only the schedule may call it: it presents CRON_SECRET, a random string kept in the function's secrets and in Vault.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const serverKeys = () =>
  [Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), ...Object.values(JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"))]
    .filter(Boolean) as string[];

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  const caller = req.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || caller !== secret) return new Response("Forbidden", { status: 403 });
  const keys = serverKeys();

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "https://noahsama01.github.io/Tolle/",
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );
  const db = createClient(Deno.env.get("SUPABASE_URL")!, keys[0], { auth: { persistSession: false } });

  const { data: due, error } = await db.rpc("due_reminders");
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0, gone = 0;
  for (const d of due ?? []) {
    const { data: subs } = await db.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", d.user_id);
    const payload = JSON.stringify({
      title: "Tolle",
      body: d.next_up ? `Today's chapters are waiting: ${d.next_up} is next.` : "Today's chapters are waiting.",
    });
    let reached = false;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
        reached = true; sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) { await db.from("push_subscriptions").delete().eq("id", s.id); gone++; }
      }
    }
    if (reached) await db.from("reminder_log").insert({ user_id: d.user_id, sent_on: d.local_day });
  }
  return Response.json({ due: due?.length ?? 0, sent, gone });
});
