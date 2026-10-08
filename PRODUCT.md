# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Daily readers on a plan**: people reading the whole Bible by a date they chose. The founder is one: Genesis and Exodus done, aiming to finish by 31 December 2026 (about 13 chapters a day), reading on an Android phone.
- **Preachers and Bible students**: people who reread and study, and who should find something new on every visit.
- Both audiences are weighted equally. The product is for all Christian traditions (ecumenical), on the 66-book canon today.

## Product Purpose

Tolle helps a person read the entire Bible by a date they choose, and makes each chapter make sense: why it is there, how it connects to the rest of Scripture, and what an ordinary reading misses. Success means the reader finishes on time and keeps coming back because each chapter rewards their attention.

## Positioning

Reading-plan apps usually fix a calendar (a year, 90 days) and stop at the text. Tolle sets the daily goal from the reader's own deadline, raising it the day after a miss, and pairs every chapter with "Why & How" notes: situation, cross-references, original-language words, history and culture, easy-to-miss details, the big picture, and one question to ponder. The notes are written to be accurate enough for preachers and neutral across traditions.

## Operating Context

- Phone-first: Android Chrome, installed to the home screen as a PWA. Today's chapters are cached for offline reading; read-aloud is used on commutes.
- The daily ritual: open the app, see today's goal and pace, read chapter after chapter (marking one done opens the next until the goal is met), then check the streak and history.
- The motivation model the founder asked for is "something similar to Duolingo": a daily goal, a streak, and visible progress. This describes the mechanism, not a visual reference.
- Scripture text comes from bible-api.com in public-domain translations: World English Bible (default), KJV, ASV, Bible in Basic English, Darby, Douay-Rheims, WEB British.

## Capabilities and Constraints

- Static PWA (`public/index.html`, `sw.js`, manifest) with no build step and no client dependencies. Progress lives in localStorage only.
- Reading in any order: progress is tracked per chapter, not as a bookmark. At setup the reader ticks every book they've already read (with a "fill in up to" shortcut for straight-through readers), and any book can be marked read or unread later from the Index. The next chapter is always the first unread one in canonical order.
- Daily goal = unread chapters ÷ days left, recomputed each day; ahead/behind against a straight-line pace from plan start; streak; 12-week reading calendar; undo; reset.
- Any chapter can be opened from the Index (chapter keys or a go-to field such as "John 3:16") and from a kept verse; it counts toward the day like any chapter. A verse for today comes from a hand-picked list of hopeful verses, preferring the book being read; it does not count as progress.
- Kept verses: tap any verse while reading to keep it; the Kept tab lists them newest first with Share and Remove (with undo). They are stored separately from the plan, so erasing progress keeps them.
- Reader: chapter text with verse numbers, read-aloud with the current verse highlighted, adjustable speed, translation choice.
- Insights: one file per book in `public/insights/<book>.json`, with a summary plus 6–8 insights per chapter of the kinds why, connection, word, culture, detail, bigpicture, ponder. Tapping a reference shows that passage inline. Each chapter can also carry a look-for line, its people, places and groups with one-sentence glosses, and a skim guide with key verses for list-heavy chapters. Each book can carry an introduction (who wrote it, when, why, and an outline). They are generated with Claude by `scripts/insights.mjs`; only Leviticus 1–3 exist so far.
- Undecided: accounts and sync, church/group plans, a paid tier (for example live "Ask why" questions), non-English translations, and a Catholic 73-book canon option.

## Brand Commitments

- Name: **Tolle**, from Augustine's "tolle lege" ("take up and read"). Chosen 2026-10-06; trademark and app-store availability are not yet checked.
- Voice: plain and explanatory, never preachy. Where traditions or scholars disagree, the notes say so rather than pick a side.

## Evidence on Hand

- Real: public-domain scripture text, and insights for Leviticus 1–3 in `public/insights/leviticus.json`. These are AI-written and not yet reviewed by a pastor or scholar.
- None yet: users, testimonials, church partners, reviews, press, pricing. Never fabricate any of these.

## Product Principles

1. The reader's deadline sets the pace. Falling behind raises tomorrow's goal; it never shames.
2. Scripture comes first. The insights serve the reading and never replace it.
3. Accuracy over novelty: name disagreements, don't settle them.
4. It must work on a phone, offline, on a commute, in a few spare minutes.
5. Give the pastor depth without intimidating the first-time reader.

## Accessibility & Inclusion

- WCAG 2.2 AA. Long-form reading comfort (measure, size, line height) matters as much as contrast. Read-aloud must stay fully usable. Respect reduced-motion preferences.
