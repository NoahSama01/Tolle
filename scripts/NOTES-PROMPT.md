# Writing the "Why & How" notes for a book

Paste this into a Claude Code session on this repo, with the last line filled in. One book per pull request.

---

Hand-write the "Why & How" notes for the books named at the bottom, one at a time, in the order given. Each book gets every chapter plus a book intro. Finish one book completely (checked, committed, pull request opened) before starting the next. Do NOT call the Anthropic API or run `scripts/insights.mjs`; you write the notes yourself.

## Format

Output file per book: `public/insights/<slug>.json`, where slug is the book name lowercased with spaces as hyphens ("1 Samuel" → `1-samuel.json`). Study `public/insights/leviticus.json` and `judges.json` first: they are the model to match in structure, tone and length.

- `"intro"`: `{who, when, why, outline, verse}`. who/when/why are 1–2 sentences each, giving traditional and modern-scholarly views where they differ. `outline` is 3–8 sections `{chapters: "1–10" (en dash) or "16", title (<6 words)}` covering every chapter in order. `verse` is `"<Book> C:V"`.
- `"1"`…`"N"`: `{summary, lookfor, names, skim, insights}`.
  - `summary`: one sentence.
  - `lookfor`: one sentence naming concrete things to watch for, without giving away the ending.
  - `names`: at most 8 `{name, kind: person|place|group, gloss}` that a first-time reader may not know. Leave out God, Jesus and very famous names unless the chapter centres on them. Spell each name EXACTLY as it appears in the World English Bible text of that chapter.
  - `skim`: `{advice, key}`. If the chapter is mostly a list (genealogy, census, inventory, itinerary, boundary list, repeated ritual steps), `advice` is one sentence on what to skim and what to read closely, and `key` is the 1–4 verse numbers that matter most. Otherwise `advice` is `""` and `key` is `[]`.
  - `insights`: 6–8 of `{kind, title (<8 words), body (2–4 plain sentences that explain rather than exhort), refs}`.
- Kinds: `why` (the situation behind the text), `connection` (links to other passages, the New Testament's use of the Old), `word` (a Hebrew, Aramaic or Greek word, with transliteration), `culture` (ancient history, customs, archaeology), `detail` (something easy to read past), `bigpicture` (place in the Bible's story), `ponder` (one open question; at most one per chapter). Use at least FIVE different kinds per chapter.
- `refs`: `"Book C:V"` or `"Book C:V-V"`, or `[]`. Book names exactly as in the `BOOKS` list in `public/index.html` ("Psalms", "Song of Solomon", "1 Samuel").
- When a body points at a verse of the same chapter, write it inline like `(14:9)`: the app turns those into tabs on the page edge.

## Quality bar (most important)

Readers range from first-timers to pastors, and a pastor who has preached the chapter should still learn something. Accuracy matters more than novelty, because preachers will repeat this. Stay with what is well established in scholarship and the historic traditions. Where Jewish, Catholic, Orthodox and Protestant readers or scholars disagree, say so in a clause rather than picking a side. Never invent quotations, figures, statistics or sources. Handle violent and troubling passages honestly and soberly.

## Quotations must match the World English Bible

Any Scripture in double quotes must match the WEB wording word for word. WEB wording often differs from familiar translations (it says "Yahweh"; Matthew 6:9 reads "may your name be kept holy"). Check against `https://bible-api.com/ruth%201?translation=web` (any reference works; about one request per 2 seconds, it rate-limits). Quotes from other books must be checked too. If unsure of the wording, paraphrase without quote marks.

## Check, then submit (per book)

1. Write the notes into part files (for example `/tmp/part-a.json` with keys `"intro"`, `"1"`…`"9"`), each a JSON object of chapters.
2. Run `python scripts/notes.py "<Book>" /tmp/part-a.json /tmp/part-b.json …`. It merges into `public/insights/<slug>.json` and checks shape, kinds, refs, names-in-text, verse ranges and in-chapter WEB quotations. Fix every problem it reports. Then run `python scripts/quotes.py "<Book>"`, which checks quotations from other chapters and books against the verses each note cites; list every quoted verse in that note's `refs`. Lines saying "quote not in chapter (check if from elsewhere)" are acceptable ONLY for quotes verified from other books, or for non-Scripture terms in quotes (name meanings, scholars' terms).
3. Confirm the file has every chapter and an intro.
4. From an up-to-date `main`, create branch `notes/<slug>`, commit only that book's JSON with the message `Notes for <Book>`. Do NOT add any "Co-Authored-By" trailer or any AI/Claude attribution to commits or pull requests: the repo owner has forbidden it.
5. Open a pull request to `main` titled `Notes for <Book>`. Do not merge it.

Report each pull request URL, the checker's final output, and any judgement calls you were unsure about.

**Books: <fill in, in order — for example: Numbers, Deuteronomy>**

## Progress

Done: Leviticus, Numbers, Judges, Ruth.
Next, in reading order: Deuteronomy, Joshua, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, then Job onward. Genesis and Exodus are still to do as well.
