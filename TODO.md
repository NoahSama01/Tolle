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

### Daily reminders (the strongest reason to come back)
- [ ] A daily "you haven't read today" notification at a time the reader chooses, using Android's own scheduled notifications (no server needed).
- [ ] An evening "keep your run" nudge when a streak is about to break.
- [ ] A setting to turn reminders off and pick the time.

### Play Console (your part)
- [ ] Developer account: $25 one-time, plus ID verification.
- [ ] Closed test: at least 12 testers opted in for 14 days in a row before applying to publish (aim for 15–20).
- [ ] Store listing: 512px icon (have it), 1024×500 feature graphic, phone screenshots.
- [ ] Privacy policy link: `https://noahsama01.github.io/Tolle/privacy.html`.
- [ ] Data safety form and content rating questionnaire.

## Google Drive sync (built, waiting on you)
- [ ] Create the Google Cloud project, turn on the Drive API, set up the OAuth consent screen (scope `drive.appdata`, yourself as a test user).
- [ ] Create a Web OAuth client with origins `https://noahsama01.github.io` and `http://localhost:5174`, and send the Client ID (never the client secret).
- [ ] Put the Client ID into `GID` in `public/index.html`, then test the real Google sign-in end to end.
- [ ] Test the Google sign-in popup inside the packaged Android app.
- [ ] Publish the consent screen so people beyond the test list can sign in.

## Bible text
- [ ] Build the English text into the app, so chapters open offline from the first read and never depend on bible-api.com (which limits requests per internet connection).
- [ ] If English ever moves to bible.helloao.org: its WEB says "the LORD" where ours says "Yahweh" (the notes are checked against "Yahweh"), and its Douay-Rheims uses old Latin psalm numbers.

## Languages (Hindi, Tamil, Malayalam, Telugu)
- [x] Bible text in all four.
- [ ] Translate the app itself: buttons, headings, book names, dates, "Look for" (about 150 phrases per language).
- [ ] Have a native speaker review each language's wording before release.
- [ ] "Fill the gap" quiz for these languages (its word-picking is English-only).
- [ ] Hindi IRV as a second Hindi option, once its footnote text can be stripped out of verses.
- [ ] Notes in these languages (largest job; after the English notes are finished).

## Why & How notes
- [x] Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel.
- [ ] Every other book. Instructions and the progress list are in `scripts/NOTES-PROMPT.md`; cloud credit expires 5 November 2026.
- [ ] Use high effort for the hardest books: Job, Psalms, Isaiah, Romans, Hebrews, Revelation.

## Smaller things
- [ ] Refresh `design.json` so it matches `DESIGN.md` (`/impeccable document`).
- [ ] Church or group reading plans (deferred until asked for).
