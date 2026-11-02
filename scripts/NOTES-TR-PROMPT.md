# Translating the "Why & How" notes

Paste this into a Claude Code session on this repo, with the last line filled in. One language and book per pull request.

---

Translate the English "Why & How" notes of the books named at the bottom into the language named there, one book at a time. Finish one book completely (checked, committed, pull request opened) before starting the next. Do NOT call the Anthropic API; you translate the notes yourself.

## What to read first

- `public/insights/<slug>.json`: the English notes, the source. Translate every field a reader sees; keep `kind`, `refs`, `skim.key`, the outline's `chapters` and the intro's `verse` exactly as they are.
- `public/insights/ml/jonah.json` (and `hi/`, `ta/`, `te/`): finished translations to match in tone and form.
- The book in that language's Bible, chapter by chapter: run `python scripts/notes_tr.py <lang> "<Book>"` with a part file once and it caches the text in `scripts/.web/<bible id>/`; or open `https://bible.helloao.org/api/<id>/<USFM>/<chapter>.json`. The Bibles: Hindi `hin_cvb`, Tamil `tam_irv`, Malayalam `mal_irv` (and `mal_fbf`), Telugu `tel_irv`.

## How to translate

- Write natural, plain prose for readers of that language, as a careful Christian writer of it would, not word-for-word English. Keep every fact, caution and "some scholars say" of the English; add nothing.
- Follow that Bible's wording: its name for God (याहवेह, யெகோவா, യഹോവ, యెహోవా), its spellings of people and places, its book names (the app's `public/i18n/<lang>.json` `books` list), its terms (Sheol is what that Bible calls it in the chapter).
- Where an English note turns on an English word (for example "the word great"), use the word that Bible actually uses in that verse.
- Hebrew and Greek words: write them in the script, with the Latin transliteration in brackets, as Jonah does: യാരദ് (yarad).
- Keep every inline verse pointer like `(1:3, 1:5)` exactly as in the English, in the same order: the app tabs each note to the first one. Where the English says "verse 5", write `(<chapter>:5)`.
- `names`: the same names, same kinds, same order. Spell each one as it appears in that chapter of the Bible, in its plain form. In Tamil, Malayalam and Telugu the app matches a name's stem, so அமித்தாய் finds அமித்தாயின்.
- Double quotes “…” mean Scripture, copied exactly from that Bible: from this book, or from a passage listed in the note's `refs`. Anything else in quotes (a word's meaning, a scholar's term) goes in single quotes ‘…’.

## Check, then submit (per book)

1. Write the translation into part files (for example `/tmp/part-a.json` with keys `"intro"`, `"1"`…`"9"`), each a JSON object of chapters.
2. Run `python scripts/notes_tr.py <lang> "<Book>" /tmp/part-a.json …`. It merges into `public/insights/<lang>/<slug>.json` and checks that every note is there with the English's kind, refs and verse tab, that the text is in the language, that each name occurs in the chapter, and that every quotation is that Bible's wording. Fix every problem it reports.
3. Confirm the file has every chapter and the intro.
4. Before committing, set the author to the repo owner: `git config user.name "Noah"` and `git config user.email "nobelnoah.n@gmail.com"`. Check with `git log -1 --format='%an <%ae>'` after committing; it must not say Claude or anthropic.com. From an up-to-date `main`, create branch `notes-<lang>/<slug>`, commit only that file with the message `<Language> notes for <Book>`. Do NOT add any "Co-Authored-By" trailer or any AI/Claude attribution to commits or pull requests: the repo owner has forbidden it.
5. Open a pull request to `main` with the same title. Do not merge it.

Report each pull request URL, the checker's final output, and any wording you were unsure of, so a native speaker can look at it.

**Language and books: <fill in, for example: Malayalam (ml): Mark, Ruth>**

## Progress

Done: Jonah in Hindi, Tamil, Malayalam and Telugu.

Several sessions can run at once as long as no two are given the same language and book: each is its own file and its own pull request. Do not start several from one chat at once; they share its session limit.
