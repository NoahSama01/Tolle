// Every 15 minutes (pg_cron): send today's reminder to each person whose time has just passed
// in their own zone and who hasn't read today, the verse of the day to each person whose
// verse time has just passed (read or not), and the evening nudge to each person whose run of
// days in a row would break at midnight. Logged once sent, so a rerun never sends twice;
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

  const [reminders, verses, runs] = await Promise.all([db.rpc("due_reminders"), db.rpc("due_verses"), db.rpc("due_runs")]);
  if (reminders.error) return new Response(reminders.error.message, { status: 500 }); // a verse or run failure alone never stops the reminders

  let sent = 0, gone = 0;
  // one push to every phone of one person, logged once any phone takes it
  const push = async (userId: string, day: string, payload: object, log: string) => {
    const { data: subs } = await db.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", userId);
    let reached = false;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600 });
        reached = true; sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) { await db.from("push_subscriptions").delete().eq("id", s.id); gone++; }
      }
    }
    if (reached) await db.from(log).insert({ user_id: userId, sent_on: day });
  };
  const jobs = [
    // kind and the facts let the phone word it in the reader's language; title and body are the English, for phones without the newer Tolle
    ...(reminders.data ?? []).map((d) => () => push(d.user_id, d.local_day, {
      kind: "reminder", next_up: d.next_up,
      title: "Tolle",
      body: d.next_up ? `Today's chapters are waiting: ${d.next_up} is next.` : "Today's chapters are waiting.",
    }, "reminder_log")),
    // the phone fills in its own verse for today; title and body stand in on phones without the newer Tolle
    ...(verses.data ?? []).map((d) => () => push(d.user_id, d.local_day,
      { kind: "verse", title: "A verse for today", body: "Today's verse is waiting in Tolle." }, "verse_log")),
    ...(runs.data ?? []).map((d) => () => push(d.user_id, d.local_day, {
      kind: "run", next_up: d.next_up, run_days: d.run_days,
      title: "Keep your run",
      body: `Keep your ${d.run_days}-day run going${d.next_up ? `: ${d.next_up} is next.` : ". One chapter before midnight keeps it."}`,
    }, "run_log")),
  ];
  // ponytail: 50 people at a time keeps a run of a few thousand to about a minute; well beyond that, queue the sends across runs
  for (let i = 0; i < jobs.length; i += 50) await Promise.all(jobs.slice(i, i + 50).map((j) => j()));
  return Response.json({ reminders: reminders.data?.length ?? 0, verses: verses.data?.length ?? 0, versesError: verses.error?.message, runs: runs.data?.length ?? 0, runsError: runs.error?.message, sent, gone });
});
