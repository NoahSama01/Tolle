# Tolle backend

Status: live. Database locked down; Google sign-in, sync, account deletion and daily reminders deployed. A real reminder has arrived on the phone. Still to confirm: the two-account test.

Project: `https://wvzfjqblglbtyjcnklym.supabase.co` (publishable key `sb_publishable_5e2eMODJEOTuvJmaWo70ZQ_IgQLb00L`; both are public by design and go into the app).

## What the backend is for

Tolle works without a server today. Everything is on the phone, with a backup file and an optional Google Drive copy. A backend earns its place for four things only:

1. **Accounts and sync.** Sign in once on any phone or browser and your plan, progress, Kept verses, notes and highlights follow you. This replaces the Drive sync, which needs a Google popup every hour.
2. **Daily reminders.** A push notification at the time you choose, only on days you haven't read yet. That needs something running on a schedule.
3. **Account deletion,** in the app and on the web. Google Play requires it for any app with sign-in.
4. **Room for later:** church or group reading plans, and paid features if Tolle charges. Neither is built now; the schema leaves space for both.

What stays exactly as it is: the app files on GitHub Pages, the Bible text services, the notes files, and the app working fully offline and without an account. Signing in is optional.

## Stack

| Part | Choice | Why |
|---|---|---|
| Database, auth, scheduled jobs, server functions | **Supabase** (Postgres, Auth, Edge Functions, pg_cron) | One managed service with a free plan. Row-level security keeps each person's data private inside the database itself. Works from a static site, so GitHub Pages stays. |
| Sign-in | **Google sign-in** first; email magic link later | Google needs no email sending. Supabase's built-in email sends only a few messages an hour, so email sign-in needs your own email service (Resend or Postmark) and a domain you own. Add it once the domain decision is made (see TODO.md). |
| Push notifications | **Web Push** with your own VAPID keys | Works in Chrome on Android, in the installed app and in the Play Store wrapper (notifications are delegated to Chrome). No Firebase account needed. |
| Payments | **None yet** | No pricing has been decided. When it is: Stripe Checkout and the Customer Portal, subscription status stored by webhooks, one-click cancelling. Sketched below. |

Costs: the free plan covers this comfortably (50,000 monthly users, 500 MB database, 500,000 function calls a month). **One catch: free projects pause after 7 days with no traffic.** Once people use Tolle daily that never happens, and the reminder job runs every 15 minutes regardless. Move to the $25/month plan when you launch publicly, for daily backups and no pausing.

## Data model

The app already has a tested sync engine for the Drive copy: `pack()` builds one copy of everything worth keeping, `clean()` checks a copy field by field, and `merge()` combines two copies when both changed. The backend reuses it rather than splitting the data into many tables:

- **`copies`**: one row per person holding exactly what the backup file holds (`plan`, `kept`, `hl`), plus the copy's stamp `u`. Writes use optimistic concurrency: a write only lands if the stored stamp is the one this phone last saw. Otherwise the server returns the newer copy, the phone merges with the same `merge()`, and writes again. No edit is lost.
- **`profiles`**: the few facts the server itself needs: time zone, reminder time, and the local date of the last chapter read (sent by the phone on each sync, so the reminder job never has to read anyone's copy).
- **`push_subscriptions`**: one row per device that allowed notifications.
- **`reminder_log`**: one row per person per day a reminder was sent, so a retried job never sends twice. Only the server can see it.
- **Verse of the day** (`0004_verse_of_the_day.sql`): `profiles.verse_at`, a `verse_log` like `reminder_log`, and `due_verses()`. The same `remind` run sends it, every day whether read or not. The push carries no verse: each phone keeps the next week's verses with their text (`tolle-dv` in localStorage, mirrored to the `votd` cache) and the service worker shows today's. A phone not opened for over a week gets "Today's verse is waiting in Tolle" instead.

Migration: [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

Why not a table per verse, highlight and chapter? Nothing on the server needs to query inside a person's reading. One row per person keeps sync to one read and one write, keeps the offline-first app in charge, and reuses code already proven by the backup tests. If group plans ever need shared progress, they get their own tables (below), not a rewrite.

## Access rules

Row-level security is on for every table:

- `copies`, `profiles`, `push_subscriptions`: a signed-in person can read and write only rows where `user_id` is their own id. Insert and update also check the id, so nobody can write into someone else's row.
- `reminder_log`: no access from the app at all. Only the server's service role (used by the reminder function) writes it.
- Grants are explicit, as Supabase now requires for new projects: the `authenticated` role gets only the operations listed; `anon` (signed out) gets nothing.

Test before launch: sign in as two different Google accounts; the second must get zero rows from every table and must fail to write a row with the first person's id.

## Server functions (Edge Functions)

- **`remind`**: called every 15 minutes by pg_cron. It finds people whose reminder time has just passed in their own time zone, whose last reading day is before today (in their zone), and who have no `reminder_log` row for today. For each, it sends a Web Push message ("Today's chapters are waiting: Leviticus 4 is next"), records the send, and deletes subscriptions the push service reports as gone (404 or 410). Failures are retried on the next run; the log row is written only after a send succeeds. Times are stored in UTC and computed in the person's zone.
- **`delete-account`**: called from Settings with the person's session. It deletes the auth user with the admin API; every table cascades, so all their data goes with it. The privacy page gets a "Delete my account" section that signs in and calls the same function, which is the web route Play asks for.

## How the app changes

- **Settings → Account**: "Sign in with Google" (optional), then "Signed in as …", "Sign out", and "Delete my account". Backup file stays.
- **Sync**: on sign-in, on open and on return to the app, and two seconds after a change, the same as the Drive sync today but with no hourly popup, because Supabase keeps the session.
- **Reminders**: a Settings row with a time picker; turning it on asks for notification permission and registers the device.
- **Drive sync** is removed once accounts work (one sync path, not two). Anyone who used it keeps their data on the phone and syncs it up when they sign in.
- **Privacy page**: names Supabase as a processor and explains reminders and deletion. The Play data safety form changes from "no data collected" to "account info and app activity, encrypted in transit, deletable".

## Later: group plans (not built)

Sketch only, for when a church asks: `groups` (name, owner, invite code), `group_members` (group, user, role: owner or member), and `group_progress` (group, user, chapters read count, updated by the phone). Access rule: members can read their group's rows, owners can manage members. One function answers "can this person do this to this group".

## Later: payments (not built)

When pricing is decided: Stripe Checkout to subscribe and the Customer Portal to change or cancel (no card forms in Tolle). A `subscriptions` table (user, status, plan, current period end) is written only by a `stripe-webhook` function that verifies the signature, stores each event id so retries are harmless, and handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` and `invoice.payment_failed`. The app reads status from the database, never from the client. Test mode until launch.

## What you set up (Claude never creates accounts or handles live keys)

1. **Supabase**: create a free project at supabase.com (region: Mumbai, ap-south-1, closest to you). Send me the **Project URL** and the **anon public key**. Both are public by design and safe to put in the app. Never send the **service_role** key; it goes only into the function settings in the Supabase dashboard.
2. **Google sign-in**: in the Google Cloud project you'd use for Drive, create an OAuth client of type Web application, with the redirect URL Supabase shows under Authentication → Providers → Google. Scopes: only the basic `openid`, `email`, `profile`, which need no Google verification review. Paste the client ID and secret into Supabase (not into chat).
3. **Push keys**: I give you a one-line command that generates a VAPID key pair on your PC. The public key goes in the app; the private key goes into the Supabase function secrets.

## Build order

1. You create the Supabase project. I run the migration and the two-account access test.
2. Google sign-in and sync, replacing Drive sync, behind a setting until tested on your phone.
3. Account deletion in Settings and on the web.
4. Reminders: the function, the schedule, and the Settings row.
5. Privacy page and Play data-safety answers updated.

## Security checklist

- [ ] Secrets only in Supabase function secrets; the app holds only the public URL, anon key and VAPID public key
- [ ] Row-level security on every table, tested with a second account
- [ ] Every copy checked by `clean()` before it is used, on download as on file restore
- [ ] Copy size capped in the database (2 MB)
- [ ] Rate limits: Supabase Auth's built-in limits on sign-in; `remind` runs only from the schedule, with the service role
- [ ] No personal data in URLs or logs; notification text carries only the chapter name
- [ ] Account deletion removes everything (cascades), tested
- [ ] Privacy policy names every processor: GitHub Pages, bible-api.com, bible.helloao.org, Supabase, Google (sign-in)
- [ ] Daily backups on (paid plan) before public launch

Sources for the platform facts above: Supabase free-plan limits and pausing ([JetAdmin](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/), [AutomationAtlas](https://automationatlas.io/answers/supabase-free-tier-limits-2026/)); Supabase default email limits ([MakerKit](https://makerkit.dev/docs/next-supabase-turbo/going-to-production/authentication)); Google Play account deletion ([Android Authority](https://www.androidauthority.com/google-play-data-safety-3309792/)). Check Supabase's own pricing page and the Play Console help before relying on exact numbers.
