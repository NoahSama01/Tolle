# Read More and Honest Pace: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- Keep readers reading: "Done" carries on to the next chapter.
- Make missed chapters part of today's goal, so meeting it brings you back on track.
- Give reading past the goal its own visible "ahead / extra" state, as "behind" has.

**Architecture:**
- Everything lives in the single-page app, `bible-plan/public/index.html` (inline JS and CSS).
- The pace model gains one function, `track()`, that both `pace()` and `goal()` read, so the status slip and today's goal can never disagree again.
- Tests are one Node script that drives headless Chrome over the DevTools protocol against a seeded plan. It uses Node built-ins only, the same pattern as `brag-output/work/capture.mjs`.

**Tech Stack:** vanilla JS/CSS (no build, no dependencies); Node 24 + Chrome for the check script.

**Spec:** the request of 29 October 2026, verbatim:
> what are the things we can do to make it addtive so user can read more and also i tested something like when i complete my daily chapters when i click done i go back to index but take me next chapter and other thing is are the behind chapter also being counted if not count them so we can reach our goal and if the reader is reading more chapters then they are required we should do something like excess tab just like the behind tab.

Findings behind this plan (in `index.html` as of `main`, 29 Oct 2026):
- **"Done" goes back.** `finish()`, line ~1184, sends you to Today once `S.log[today] >= goal()`.
- **Missed chapters aren't really counted.** `goal()`, line 480, is `ceil(remaining / daysLeft)`. That spreads every missed chapter over all remaining days, while `pace()`, line 486, measures you against a straight line from plan start to deadline. A reader who meets the goal every day can stay "N behind" for weeks.
- **"Ahead" looks like "On track".** `pace()` already returns `{cls:'ahead'}`, but no CSS styles `.status.ahead`, so it looks identical. Only `.status.late` is styled, line 58.

## Global Constraints

- **No new dependencies.** No build step, nothing added to `public/`. All app code stays in `public/index.html`.
- **Motion:** Tolle's motion only, meaning every change is the 90ms two-frame `var(--hinge)` step. Nothing eases or fades. Respect `prefers-reduced-motion` (the existing block at line ~355).
- **Copy:** plain English, sentence case, no exclamation marks, no guilt ("you failed", "hurry"). Numbers go through `num()` and `plural()`.
- **Release:** bump the service-worker cache `APP` in `public/sw.js` from `app-v36` to `app-v37` in the last task, so phones pick up the change.
- **Commits:** as `Noah <nobelnoah.n@gmail.com>`, with no AI attribution lines. Commit only `bible-plan/` files that the task names.
- **Goal stability:** today's goal must not change while you read today. It may change only at midnight or when the deadline changes, as now.

## Review Focus

1. **The deadline is today or already past.** The goal must cover everything left and never exceed the chapters left. Nothing may show NaN or a negative number. *Test in Task 1:* `deadline_today` and `deadline_past`.
2. **Very far behind** (missed weeks). Today's goal must stay humane: at most twice the daily share, with the catch-up spread over the following days. *Test in Task 1:* `far_behind`.
3. **The whole Bible is read.** No goal and no next chapter: "Done" and Today must not throw, and the status says "Complete". *Test in Task 3:* `finish_last_chapter`.
4. **Re-reading a chapter already read,** opened from the Index. "Done" must not count it or change the goal, and should still carry on to the next unread chapter. *Test in Task 3:* `done_on_read_before`.
5. **The day rolls over at midnight with the app open.** Behind and extra are measured from the start of the day, so tomorrow recomputes cleanly. *Test in Task 1:* `goal_stable_within_day`, which reads goal → reads 3 chapters → goal is unchanged.

---

## File structure

- **Modify `bible-plan/public/index.html`:**
  - pace model, around lines 476–490;
  - `todayView`, around line 600;
  - `stopRow`/Today's chapters, around line 614;
  - `readerView`, around line 994;
  - `finish`, around line 1174;
  - `go`, around line 535;
  - CSS: `.status`, around line 57.
- **Modify `bible-plan/public/sw.js`:** the `APP` version only.
- **Create `bible-plan/scripts/check-pace.mjs`:** the headless test script. It serves `public/`, seeds `localStorage`, runs named checks and exits 1 on any failure.

---

### Task 1: One pace model, where today's goal includes the catch-up

**Files:**
- Create: `bible-plan/scripts/check-pace.mjs`
- Modify: `bible-plan/public/index.html:478-490` (`daysLeft`, `goal`, `perDay`, `pace`)

**Interfaces:**
- **Produces** (globals in `index.html`):
  - `track(): {by:number, through:number, share:number}`:
    - `by` is the on-track chapter count at the start of today, `floor(startDone + perDay()*elapsed)`;
    - `through` is the count at the end of today, `ceil(startDone + perDay()*(elapsed+1))`;
    - `share` is `ceil(perDay())`;
    - `elapsed` is `min(days(start,today), days(start,deadline)+1)`, exactly as `pace()` computes it today.
  - `behindToday(): number`, which is `max(0, track().by - (count() - todayN()))`. It's measured before today's reading, so it's fixed for the day.
  - `goalParts(): {share:number, catchup:number}`, with today's goal = `share + catchup`.
  - `goal(): number` keeps its name and every caller.
  - `extraToday(): number`, which is `max(0, todayN() - goal())`.
- **Rules for `goalParts()`:**
  - `base = ceil((CH.length - (count() - todayN())) / daysLeft())` (the current rule);
  - `left = CH.length - (count() - todayN())`, the chapters left at the start of today;
  - if `behindToday() === 0`, return `{share: base, catchup: 0}`;
  - otherwise use `share = track().share` and `catchup = max(min(behindToday(), share), base - share)`;
  - then clamp so `share + catchup <= left`, reducing `catchup` first, then `share`;
  - all values are integers ≥ 0.
- **`perDay()`** guards against a deadline before the start: `(CH.length - S.startDone) / max(1, days(S.start, S.deadline) + 1)`.
- **`pace()`** keeps its return shape `{cls, text}` but reads `track()` for `by` and `through`.

- [ ] **Step 1: Write the check script and the failing tests.**

  How `check-pace.mjs` works:
  - It starts a static server for `bible-plan/public` on a free port, launches `C:/Program Files/Google/Chrome/Application/chrome.exe --headless=new` with its own profile in `os.tmpdir()`, and talks over CDP (copy the setup from `brag-output/work/capture.mjs`).
  - Each test seeds the plan with `seed(o)`, reloads `/`, then evaluates expressions in the page. `seed(o)` writes `localStorage['bible-plan']`, using dates relative to the real today:
    - `start = today - o.elapsed` days;
    - `deadline = start + 99` days, so the plan is 100 days, unless `o.deadline` is given;
    - `startDone: 189`, so the plan is 1,000 chapters, `perDay = 10`;
    - `read` with the first `o.before + (o.todayN||0)` chapters set to `'1'` (`before` counts chapters read before today);
    - `log` has `{[today]: o.todayN}` if given;
    - `day: {d: today, idx: [...]}` holds the last `o.todayN` read indices.
  - The script prints `PASS name` / `FAIL name: expected X got Y` and exits non-zero if any test fails.

  The tests, with exact expected values (`elapsed = 10` unless stated, so `by = 289`, `through = 299`, `daysLeft = 90`):

```js
test('on_track',      {before:289},            ()=>expect('goal()',10) && expect('goalParts().catchup',0) && expect('pace().text','On track'));
test('behind_counts', {before:279},            ()=>expect('behindToday()',10) && expect('goalParts()',{share:10,catchup:10}) && expect('goal()',20) && expect('pace().text','10 behind'));
test('catchup_meets_track', {before:279,todayN:20}, ()=>expect('pace().text','On track') && expect('goal()',20));
test('far_behind',    {before:200},            ()=>expect('goal()',20) && expect('goalParts().catchup',10));
test('ahead_extra',   {before:289,todayN:13},  ()=>expect('goal()',10) && expect('extraToday()',3) && expect('pace()',{cls:'ahead',text:'3 ahead'}));
test('goal_stable_within_day', {before:279,todayN:3}, ()=>expect('goal()',20));
test('deadline_today',{before:1100,elapsed:99},()=>expect('goal()',89) && expect('Number.isFinite(goal())',true));
test('deadline_past', {before:1180,elapsed:120},()=>expect('goal()',9) && expect('goal()<=1189-1180',true));
```

- [ ] **Step 2: Run them and confirm they fail.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected:
  - `FAIL behind_counts`, because `goal()` currently returns 11;
  - `FAIL` on the cases that call `track` / `goalParts` / `behindToday` / `extraToday`, with "is not defined";
  - exit code 1.

- [ ] **Step 3: Implement the model.**

  In `index.html`, implement `track()`, `behindToday()`, `goalParts()` and `extraToday()`, and re-express `goal()` and `pace()` on top of them, per the Interfaces block. Make the `perDay()` guard change there too. `pace()`'s texts stay exactly `` `${by-n} behind` ``, `` `${n-through} ahead` `` and `'On track'`.

- [ ] **Step 4: Run the tests and confirm they pass.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected: every line is `PASS`, exit code 0.

- [ ] **Step 5: Commit.**

```bash
git -C bible-plan add public/index.html scripts/check-pace.mjs
git -C bible-plan -c user.name=Noah -c user.email=nobelnoah.n@gmail.com commit -m "Count missed chapters in today's goal; one pace model for goal and status"
```

---

### Task 2: Today shows the catch-up, and an "ahead" slip like the "behind" one

**Files:**
- Modify: `bible-plan/public/index.html`:
  - CSS near line 57–58 (`.status`);
  - `todayView()` around lines 600–620.
- Test: `bible-plan/scripts/check-pace.mjs`

**Interfaces:**
- **Consumes:** `goalParts()`, `extraToday()` and `pace()` from Task 1.
- **Produces:**
  - DOM in the Today view:
    - `.status.ahead` styled as a slip;
    - a `.extra` tag in the "Today's chapters" heading when `extraToday() > 0`.
  - Copy, exactly:
    - **Lede when behind:** `` `${g-t} left today, about ${mins(g-t)} minutes: ${plural(share,'chapter')} for today and ${num(catchup)} to catch up.` ``
    - **Extra tag:** `` `+${num(extraToday())} extra` ``

- [ ] **Step 1: Add the failing tests.**

  Each test calls `go('today')` and then queries the DOM.

```js
test('today_shows_catchup', {before:279}, ()=>expectText('.lede', '20 left today, about 70 minutes: 10 chapters for today and 10 to catch up.'));
test('today_ahead_slip',   {before:289,todayN:13}, ()=>expectText('.status.ahead','3 ahead') && expectCss('.status.ahead','background-color','rgb(21, 21, 21)'));
test('today_extra_tag',    {before:289,todayN:13}, ()=>expectText('#stops-h .extra','+3 extra'));
test('today_no_extra_when_short', {before:289,todayN:4}, ()=>expect("document.querySelector('#stops-h .extra')",null));
```

- [ ] **Step 2: Run them and confirm they fail.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected: the 4 new tests FAIL (the selectors aren't found, or the lede text differs).

- [ ] **Step 3: Implement.**
  - **CSS:**
    - `.status.ahead`: `border-color: var(--ink)`, `background: var(--ink)`, `color: var(--milk)`. The ink slip is the counterpart of the errata slip, and it reads on every division's board.
    - `.extra`: the existing `.kind` style (ink tab, mono uppercase), set inline after the h2 text with `margin-left: .5rem`.
  - **`todayView()`:** when `goalParts().catchup > 0` and the goal isn't yet met, use the catch-up lede. Otherwise keep the current lede.
  - **Heading:** append `<span class=extra>…</span>` inside `#stops-h` when `extraToday() > 0`.

- [ ] **Step 4: Run the tests and confirm they pass.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected: all PASS.

- [ ] **Step 5: Commit.**

```bash
git -C bible-plan add public/index.html scripts/check-pace.mjs
git -C bible-plan -c user.name=Noah -c user.email=nobelnoah.n@gmail.com commit -m "Today: show the catch-up, an ahead slip, and extra chapters"
```

---

### Task 3: "Done" carries on to the next chapter, and the goal moment is marked there

**Files:**
- Modify: `bible-plan/public/index.html`:
  - `finish()` around line 1174;
  - `readerView()` around lines 994–1010;
  - `go()` around line 535.
- Test: `bible-plan/scripts/check-pace.mjs`

**Interfaces:**
- **Consumes:** `goal()`, `streak()`, `nextIn()`, `cur()`, `view`, `at`.
- **Produces:** `let metLine = null`, a one-line string shown at the top of the reader as `<p class=gone role=status>`.
  - It's set by `finish()` only on the Done that reaches today's goal: `S.log[d] === goal()` just after recording.
  - The copy is exactly `` `Today's reading is done. ${num(streak())} ${streak()==1?'day':'days'} in a row. Keep going?` ``
  - `go()` clears it whenever the view is not `'reader'`.
  - `finish()` clears it at the start of every call.
- **Navigation rule in `finish()`:**
  - Go to `'reader'` on the next unread chapter after this one (`at = nextIn(S.read, i+1)`) whenever one exists and there's no `cheer`.
  - Go to `'today'` only if there's a `cheer` (book, division, run milestone or the whole Bible, which are shown on Today), or if no unread chapter is left.
  - A chapter that was read before (`isRead(i)` at entry) records nothing and goes to `'reader'` on the next unread chapter after it, rather than `'today'`.
- **Reader "Done" label:**
  - always show `` ` · next: ${nx[0]} ${nx[1]}` `` when `nx` exists, not only while under the goal;
  - the position label keeps `t<g ? `${t+1} of ${g} today` : 'Extra chapter'`.

- [ ] **Step 1: Add the failing tests.**

  Each test opens the reader on the plan's next chapter, calls `finish()` and waits 600ms for the two-frame shut. It then reads `view`, `cur()` and the DOM.

```js
test('done_after_goal_goes_next', {before:289,todayN:10}, ()=>expect('view','reader') && expect('cur()',300)); // 0–298 read; Done on 299 lands on 300
test('done_reaching_goal_marks_it', {before:289,todayN:9}, ()=>expect('view','reader') && expectText('.gone', /^Today's reading is done\. \d+ days? in a row\. Keep going\?$/));
test('done_before_goal_no_mark',  {before:289,todayN:2}, ()=>expect('view','reader') && expect("document.querySelector('.gone')",null));
test('done_on_read_before', {before:289}, /* openCh(5) where chapter 5 is read */ ()=>expect('todayN()',0) && expect('view','reader') && expect('cur()',289));
test('finish_last_chapter', {before:1188}, ()=>expect('view','today') && expectText('.status','Complete'));
```

- [ ] **Step 2: Run them and confirm they fail.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected:
  - `done_after_goal_goes_next` FAILs, because the view is `'today'`;
  - `done_reaching_goal_marks_it` FAILs;
  - `done_on_read_before` FAILs, because the view is `'today'`.

- [ ] **Step 3: Implement.**

  Implement the navigation rule, `metLine` and the Done label per the Interfaces block. Render `metLine` as the first child of the reader, above `.rbar`'s row, reusing `.gone`; it already ink-ins with the hinge.

- [ ] **Step 4: Run the tests and confirm they pass.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected: all PASS.

- [ ] **Step 5: Commit.**

```bash
git -C bible-plan add public/index.html scripts/check-pace.mjs
git -C bible-plan -c user.name=Noah -c user.email=nobelnoah.n@gmail.com commit -m "Done carries on to the next chapter and marks the day's goal"
```

---

### Task 4: The "finish the book" pull, then release

This is the "read more" hook. A near goal is the strongest honest pull: when a book is three chapters or fewer from finished, say so where the next tap is.

**Files:**
- Modify: `bible-plan/public/index.html`:
  - `readerView()` Done label;
  - the `todayView()` lede.
- Modify: `bible-plan/public/sw.js:5` (`APP`)
- Test: `bible-plan/scripts/check-pace.mjs`

**Interfaces:**
- **Produces:** `toFinish(bi): number`, which is `BOOKS[bi][1] - readIn(bi)`.
- **Copy, exactly:**
  - **Reader Done label,** when this chapter is unread and `1 <= toFinish(bi) - 1 <= 3`: the "· next" part becomes `` ` · ${num(toFinish(bi)-1)} more to finish ${BOOKS[bi][0]}` ``. When this chapter finishes the book, it's `` ` · finishes ${BOOKS[bi][0]}` ``.
  - **Today lede,** appended when the next chapter's book has `1 <= toFinish <= 3`: `` ` ${plural(toFinish(bi),'chapter')} to finish ${BOOKS[bi][0]}.` ``

- [ ] **Step 1: Add the failing tests.**

  Joshua is book index 5, chapters 187–210 in canonical order. `seed({joshuaLeft:n})` means `before = 211 - n`, so everything is read up to the last `n` chapters of Joshua, and the reader opens on the next one.

```js
test('reader_finish_pull', {joshuaLeft:2}, ()=>expectText('.actbar .go', /1 more to finish Joshua/));
test('reader_finishes_book', {joshuaLeft:1}, ()=>expectText('.actbar .go', /finishes Joshua/));
test('today_finish_pull', {joshuaLeft:3}, ()=>expectText('.lede', /3 chapters to finish Joshua\.$/));
```

- [ ] **Step 2: Run them and confirm they fail.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected: the 3 new tests FAIL.

- [ ] **Step 3: Implement.**

  Add `toFinish()` and the two copy changes. Then bump `APP` to `'app-v37'` in `public/sw.js`.

- [ ] **Step 4: Run all checks, then a manual pass on a phone-sized viewport.**

  Run: `node bible-plan/scripts/check-pace.mjs`

  Expected: all PASS.

  Then start the preview `bible-plan` (port 5174) at 375×812 and read through a day:
  - Done four times;
  - confirm the goal line appears once and the reader moves on each time;
  - confirm Today shows the ahead slip and the `+N extra` tag after going past the goal.

- [ ] **Step 5: Commit and push.**

```bash
git -C bible-plan add public/index.html public/sw.js scripts/check-pace.mjs
git -C bible-plan -c user.name=Noah -c user.email=nobelnoah.n@gmail.com commit -m "Finish-the-book pull; release app-v37"
git -C bible-plan fetch -q origin && git -C bible-plan push origin HEAD:main
```

---

## Not in this plan (YAGNI: add when asked)

Other "read more" ideas, held back:
- bonus holes on the punch card for extra days;
- a weekly "chapters read" recap;
- streak freezes;
- a "one more chapter" timer.

They're larger, and the four changes above answer the request. Revisit after watching how readers respond to the goal moment and the finish pull.
