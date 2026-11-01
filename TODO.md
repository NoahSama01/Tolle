# Tolle: things to do

Everything deferred so far, grouped by when it matters. Tick items off as they land.

## When we package the app for the Play Store

### Decide first (cannot change later)
- [ ] **The permanent web address.** Saved progress is tied to it, and so is Android's ownership check.
  - Free route (current choice): keep `noahsama01.github.io/Tolle/` and create a second repo named `noahsama01.github.io` holding `.well-known/assetlinks.json`.
  - Paid route: a custom domain (about $10–15 a year). Cleaner, portable, and Tolle's saved data shares the address with nothing else.
- [ ] **The Android package name** (for example `app.tolle`). It can never change after publishing.

### Build the Android app
- [ ] Wrap the site as a Trusted Web Activity (PWABuilder.com, or Bubblewrap on this PC).
- [ ] Back up the signing key and its passwords somewhere safe, permanently.
- [ ] Publish `assetlinks.json` with the app's signing fingerprint (from Play Console → App integrity), so the app opens full-screen with no browser bar.
- [ ] Install the build on a real phone from the file and test before uploading.
- [ ] Home-screen widget showing the verse of the day (needs the Android app; a website can't place widgets). Until then, the verse-of-the-day notification covers it.

### Daily reminders (the strongest reason to come back)
- [x] A daily "you haven't read today" reminder at a time the reader chooses (done with web push from the backend; works in the installed app too).
- [ ] An evening "keep your run" nudge when a streak is about to break.
- [x] A setting to turn reminders off and pick the time.

### Play Console (your part)
- [ ] Developer account: $25 one-time, plus ID verification.
- [ ] Closed test: at least 12 testers opted in for 14 days in a row before applying to publish (aim for 15–20).
- [ ] Store listing: 512px icon (have it), 1024×500 feature graphic, phone screenshots.
- [ ] Privacy policy link: `https://noahsama01.github.io/Tolle/privacy.html`.
- [ ] Data safety form and content rating questionnaire.

## Backend: accounts, sync, reminders (designed, see BACKEND.md)
- [x] Create a free Supabase project and send the Project URL and publishable key.
- [x] Google sign-in: a Web OAuth client with Supabase's redirect URL, basic scopes only; client ID and secret go into Supabase, not chat.
- [x] Run `supabase/migrations/0001_init.sql` (signed-out access refused on every table and function, checked).
- [x] Two-account access test: signed in, an account sees only its own copy, profile and devices (1 of 2 copies), and is refused the server logs, reminder functions and writes as anyone else (checked).
- [x] Sign-in and sync in the app, replacing Drive sync (real Google sign-in confirmed on the phone).
- [x] Account deletion in Settings and on the web (Play requirement); function deployed, refuses unsigned and fake callers (checked).
- [x] Daily reminders: VAPID keys, the `remind` function (refuses outsiders, checked), the 15-minute schedule, a time picker in Settings. A real reminder arrived on the phone (confirmed).
- [x] Privacy page updated for accounts.
- [ ] Play data-safety answers for accounts (filled in on Play Console).
- [ ] Move to Supabase's paid plan before public launch (daily backups, no pausing).
- [ ] Email sign-in once there's a domain and an email service (Resend or Postmark).

## Bible text
- [x] Build the World English Bible into the app (`public/text/web/`, built by `scripts/webtext.py`): it opens offline once a book is read and never depends on bible-api.com. Other English translations still come from bible-api.com.
- [ ] If English ever moves to bible.helloao.org: its WEB says "the LORD" where ours says "Yahweh" (the notes are checked against "Yahweh"), and its Douay-Rheims uses old Latin psalm numbers.

## Languages (Hindi, Tamil, Malayalam, Telugu)
- [x] Bible text in all four.
- [x] Translate the app itself: 257 phrases, book names (from each Bible), dates. `python scripts/i18n.py check` keeps every language complete.
- [ ] The server's push notifications, and the landing and privacy pages, in these languages (still English).
- [ ] Have a native speaker review each language's wording before release.
- [x] "Fill the gap" quiz for these languages: it works in any script now.
- [ ] Hindi IRV as a second Hindi option, once its footnote text can be stripped out of verses.
- [ ] Notes in these languages (largest job; after the English notes are finished).

## Why & How notes
- [x] Every book, Genesis to Revelation (66 books, all 1,189 chapters). Each passes `scripts/notes.py` and `scripts/quotes.py`.

## Smaller things
- [x] A list of highlighted verses, on the Kept page.
- [ ] A note for a whole chapter, if readers ask for it (notes attach to a verse).
- [ ] Refresh `design.json` so it matches `DESIGN.md` (`/impeccable document`).
- [ ] Church or group reading plans (deferred until asked for).
