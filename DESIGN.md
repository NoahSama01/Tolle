---
name: Tolle
description: Read the whole Bible by a date you choose, on a thumb-indexed reference manual.
colors:
  ink: "#151515"
  ink-2: "#4a4a46"
  ink-down: "#2b2b29"
  milk: "#fbfbf6"
  rule: "rgba(21,21,21,.16)"
  on-board-light: "#ffffff"
  law: "#df6a2e"
  history: "#f0bf2c"
  wisdom: "#4e9a3e"
  prophets: "#1a9b9b"
  gospels: "#2e4fb0"
  letters: "#7350ad"
  errata: "#d63a22"
  night-ink: "#ecece4"
  night-ink-2: "#b1b1a7"
  night-milk: "#1f1f1d"
  night-errata: "#ff8a6e"
  night-bar: "#0b0b0a"
  print: "#151515"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 7vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
    fontVariation: "\"wdth\" 72"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.005em"
    fontVariation: "\"wdth\" 72"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    letterSpacing: "0.04em"
    fontVariation: "\"wdth\" 85"
  wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.2em"
    fontVariation: "\"wdth\" 125"
  button:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    letterSpacing: "0.06em"
    fontVariation: "\"wdth\" 82"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  scripture:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\" 1"
rounded:
  slip: "1px"
  control: "2px"
  leaf: "3px"
  tab: "5px 0 0 5px"
  hole: "50%"
spacing:
  rail-mobile: "2rem"
  rail-app-desktop: "4.5rem"
  rail-landing-desktop: "4.75rem"
  tab-bar: "4.25rem"
  touch: "2.75rem"
  leaf-padding: "1.15rem 1.15rem 1.3rem 2.4rem"
  measure-mobile: "30rem"
  measure-scripture: "30em"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.milk}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.1rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-down}"
    textColor: "{colors.milk}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.1rem"
    height: "3.25rem"
  status-slip:
    backgroundColor: "transparent"
    typography: "{typography.data}"
    rounded: "{rounded.control}"
    padding: "0.35rem 0.6rem"
  status-slip-late:
    backgroundColor: "{colors.errata}"
    textColor: "{colors.on-board-light}"
  erase-slip:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.errata}"
    rounded: "{rounded.control}"
    padding: "0 0.9rem"
    height: "2.75rem"
  input:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 0.8rem"
    height: "3rem"
  nav-tab-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.milk}"
    typography: "{typography.label}"
    height: "{spacing.tab-bar}"
  note-kind-tab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.milk}"
    typography: "{typography.data}"
    rounded: "2px 2px 0 0"
    padding: "0.15rem 0.45rem"
  rail-label-slip:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.slip}"
    padding: "0.3rem 0.05rem"
---

# Design System: Tolle

## Overview

**Creative North Star: "The Thumb Index"**

Tolle is a boxed-software reference manual lying open at a tabbed section. The six divisions of Scripture run down the fore edge as a stepped tab rail, each tab as tall as its share of the Bible's 1,189 chapters, every book a band inside it that fills as it is read, in any order. The current division's tab extends and becomes the board: the whole ground of the screen takes that division's hue at full strength, pressed with the fibre of a divider card (`board-grain.png`). Content sits on milk-acetate leaves laid over the board, each with two punch holes on its bound edge and a short hard shadow on its cut side.

The voice is printed and mechanical, not soft. Heads are condensed Archivo caps set like a manual's section heads; Scripture is set in EB Garamond on a plate; counts, times and references are set in JetBrains Mono like catalog matter. Primary actions are print-ink black slabs. Selection is shown as a hole punched through the leaf to the board beneath. Nothing eases or fades: every change is a 90ms two-frame step hinged at the punched edge.

It rejects the white reading app with a progress ring and the cream-paper bookish default.

**Key Characteristics:**
- One division hue at full strength as the whole board; the board changes with the reader's current division.
- Milk-acetate leaves whose opacity is solved per board so the reading field always lands at luminance 0.80.
- The fore-edge thumb-index rail is always present, sized by extent and filled by what has been read.
- Selected is a punched hole.
- Vermilion is held out for errata only.
- Two-frame stepped motion; reduced motion is instant.

## Colors

Six saturated division boards under black ink and milk acetate, with one vermilion reserved for errata.

### Primary
- **Print Ink** (`ink`): text, rules, outlines, the primary button slab, the bottom tab bar, the note-kind tab and the pressed state of icon buttons and references. Its hover/press tone is **Ink Down** (`ink-down`).

### Secondary: the six division boards
Each division owns one hue at full strength. It fills the board when that division is current, its rail tab, its index divider, its chips and swatches, and the cells of the reading log for days that reached it.
- **Oxide Orange** (`law`): Law.
- **Chrome Yellow** (`history`): History. It is also the landing page's board.
- **Grass** (`wisdom`): Wisdom.
- **Teal** (`prophets`): Prophets.
- **Ultramarine** (`gospels`): Gospels & Acts.
- **Violet** (`letters`): Letters & Revelation.

Ink reads on Law, History, Wisdom and Prophets; white (`on-board-light`) reads on Gospels and Letters. The app sets `--on-board` to match.

### Tertiary
- **Errata Vermilion** (`errata`): used for errata only. It appears in exactly three places: the "behind" status slip (filled vermilion, white text), the erase-everything slip in Settings (vermilion underlined text on a milk slip), and inline form errors.

### Neutral
- **Milk** (`milk`): the acetate. It fills inputs, chip faces and rail label slips, and it is mixed over the board to make leaves.
- **Ink 2** (`ink-2`): secondary text, read rows, meta lines and counts.
- **Rule** (`rule`): the hairlines between table rows and notes.
- **Night** (`night-*`): under `prefers-color-scheme: dark`, in the app only (`html.app`). `--hue` holds the division hue, and the board becomes `color-mix(hue 20%, #090908)`. Leaves become dark acetate (`#262624` at 90% plus the hue; the clear top ply is `#2c2c29` at 84%). Ink and milk swap to chalk (`night-ink`) and a dark surface (`night-milk`), so ink buttons become chalk buttons, and errata lightens to `night-errata` with print-ink text. `print`, `bar`, `bar-ink` and `bar-dim` never flip: they are the ink on a hue tab and the ink tab bar.

### Derived leaf colors (computed, not primitives)
- **Leaf** = `color-mix(in srgb, milk calc(--leaf-a * 100%), board)`. Each alpha was solved offline: milk is composited over the board in sRGB until relative luminance reaches 0.80. That gives Law .841, History .661, Wisdom .835, Prophets .840, Gospels .886 and Letters .875, stored in `BEDS` (re-solve if a hue changes). The landing page sets History's .661 directly.
- **Clear leaf** = the same mix at `--leaf-a - .1`. Only the top ply may be clear.

### Named Rules
**The One Board Rule.** A screen has one board, the current division's hue at full strength. The other five hues appear only as tabs, swatches, bands and dividers.

**The Errata Rule.** Vermilion marks something wrong or destructive and nothing else: the late slip, the erase slip, form errors. It is never decoration, emphasis or a brand accent.

**The Solved Leaf Rule.** Leaf opacity is never hand-picked. It is solved so that every leaf on every board lands at luminance 0.80.

## Typography

**Display Font:** Archivo variable (wdth 62–125%, wght 400–800), with system-ui. It stands in for Univers.
**Body Font:** Archivo at 100% width.
**Scripture Font:** EB Garamond 400/500, with Georgia. It stands in for Sabon.
**Label/Mono Font:** JetBrains Mono 400/500, with ui-monospace.

All three are self-hosted latin subsets declared in `tokens.css`.

**Character:** A technical manual's grotesque, squeezed for heads and stretched for the mark, set against a book face kept for Scripture alone.

### Hierarchy
- **Display** (800, 72% width, `clamp(2.9rem, 7vw, 5.75rem)`, line-height .92, caps, balanced): landing page h1 and closing h2. Landing section h2s use the same face at `clamp(2rem, 4vw, 3rem)`.
- **Headline / Station** (800, 72% width, 2.6rem rising to 3.3rem at 960px, line-height .95, caps): the next chapter on the top ply. It never exceeds the leaf: its size is min(2.6rem, leaf width ÷ (longest word × .6)), so on a 360px phone "1 Thessalonians" steps down instead of overflowing. The clear leaf is a size container, and `--w` is set from the longest word. Page titles use the same face at 2.2rem.
- **Title / Divider** (800, 85% width, 1.25rem, .04em, caps): each division's coloured divider on the Index.
- **Wordmark** (800, 125% width, 1.45rem, .2em, caps): TOLLE.
- **Button** (700, 82% width, .95rem, .06em, caps): primary and ghost buttons. Jump chips use the same setting at .75rem.
- **Section head** (700, 100% width, .85rem, .12em, caps): section heads on leaves (hung in the margin column on desktop Today) and the introduction's summary.
- **Label** (700 or 800, 100% width, .75rem, .12em, caps): form labels, fieldset legends, tab-bar labels, setup division names and jump chips.
- **Body** (400, 1rem/1.5; 1.0625rem/1.55 on the landing page): UI copy, chapter names in tables, and note text (31em measure).
- **Reading** (`--read`, 400, 1.1875rem/1.6; 1.125rem/1.55 on phones under 600px; 30em measure): chapter text, the Fill-the-gap verse and kept verses share this one role. Lines hold about 42 characters at 390px, 49–73 on tablets and about 72 on desktop. The verse for today is the display size of the same face at 1.3125rem; quoted cross-references are 1.0625rem/1.5. Verse numbers are mono superscripts at .58em. At night, reading text is set at weight 450 with .006em tracking and .05 more leading.
- **Data** (JetBrains Mono 500, tabular figures, usually caps) in three steps only: .8125rem for counts, references, chapter keys and the Keep button; .75rem for status, facts, position and tags; .6875rem for kind tabs, axis labels, "See also", the credit line and small notes. The rail's label slips scale in em with the tab (.6rem, .75rem on desktop).

### Named Rules
**The Three Voices Rule.** Archivo speaks for the interface, EB Garamond speaks only for Scripture, and JetBrains Mono speaks only for catalog matter (counts, times, references, index labels). Mono never sets running prose.

**The Width Axis Rule.** Hierarchy is carried by Archivo's width axis as much as by size: 72% for station heads, 82% for buttons, 85% for dividers, 100% for labels and body, 125% for the wordmark alone.

## Layout

### Sizes and input
- **Phones (under 600px):** gutters narrow to .75rem, the plate's lanes narrow (binding 1.9rem, tab lane 2.2rem, tabs 2rem wide poking .4rem), and the reading size steps down. Under 360px, Done drops its "next" text, buttons step to .85rem, and the section numeral to 4.5rem.
- **Tablets (600px and up):** a 40rem column.
- **Landscape phones (height under 520px):** the reader's top bar scrolls away; the tab and action bars slim to 3rem and 2.75rem.
- **Desktop (960px and up):** the left nav column and hung heads. The Index column beside Today appears only at 1200px and up; below that Today is one column capped at 36rem.
- **Hover** effects sit behind `@media (hover: hover)`, so a tap never leaves a control looking hovered.
- **Fonts:** Archivo and EB Garamond are preloaded for the first screen.

The app is phone-first. On mobile, `main` is capped at 30rem, with right padding equal to the rail width plus 1rem so content never runs under the rail. A fixed ink tab bar (4.25rem plus the safe-area inset) runs along the bottom; it is hidden in the reader and in setup. The fore-edge rail is fixed at the right edge, full height down to the tab bar, 2rem wide. The reader's primary action sits in a fixed bar on the board just left of the rail.

At 960px and up, the rail widens to 4.5rem in the app and 4.75rem on the landing page, and its label slips grow to .75rem / .78rem. The tab bar turns into a 6.5rem ink column on the left. `main` widens to 76rem; reader, setup and settings are narrower (47rem / 56rem). Today becomes a two-column split (28rem leaves column, then the Index column), offset 11rem so that section heads hang right-aligned in that margin column.

The landing page uses a 70rem wrap. Each section is a leaf pair in a grid: 1.25fr / .75fr for the hero, and .85fr / 1.15fr alternating (`flip`) for the rows. Sections are 2.5rem tall, 3.5rem on desktop.

Rhythm: leaves stack with a 1rem gap. Table rows and every interactive control have a minimum height of 2.75rem.

## Elevation & Depth

Depth is physical and hard-edged: plies of acetate over a board, never ambient blur. Every shadow has zero blur and is offset toward the cut side.

### Shadow Vocabulary
- **Leaf cut-side shadow** (`box-shadow: 3px 3px 0 rgba(21,21,21,.24)`): every leaf in the app.  The landing page uses the same shadow and holes, because both pages load the shared parts from tokens.css.
- **Rail tab shadow** (`box-shadow: -2px 2px 0 rgba(21,21,21,.22)`): every non-current rail tab. The current tab has none, because it is flush with the board.
- **Punch hole** (`background: var(--board); box-shadow: inset 1.5px 1.5px 0 rgba(21,21,21,.35–.5)`): leaf binding holes and every selected-state hole.
- **Index tick** (`box-shadow: inset 0 -2px 0 rgba(21,21,21,.25)`): read chapter ticks in the every-chapter field and in book panels.

### Named Rules
**The Hard Ply Rule.** Shadows have zero blur and only say "this sheet lies on that one." Nothing glows, floats or lifts on hover.

**The Night Board Rule.** Night is the app's `data-theme="dark"`, chosen in Settings (Night mode: Off, On, Follow phone; Follow phone is the default and tracks `prefers-color-scheme`). A head script sets it before first paint, and the choice is stored apart from the plan (`tolle-theme`). At night the whole board sinks to a dark wash of its own hue, and its leaves become dark acetate with chalk text. Punched holes still show the board, the rail and division bars dim to 78% brightness, and `color-scheme` turns dark, so native fields match. The phone's theme colour follows the board as drawn. The landing page stays a daylight page.

## Shapes

Corners are barely softened: 2px on controls, 3px on leaves, and 1px on slips, log cells and swatches. Rail tabs are rounded only on their leading edge (5px 0 0 5px), like die-cut index tabs. Circles are kept for holes: punch holes, unread row rings, and the active-nav hole. The next chapter's marker is a 2px-radius ink square. Note-kind tabs round only their top corners (2px 2px 0 0), so they sit on the title row like a tab. Outlines are 1.5px ink; hairline table rules are 1px.

## Components

### Buttons
- **Shape:** sharp slab (2px radius).
- **Primary:** print-ink slab, milk text in Archivo 700 caps at 82% width and .06em, 3.25rem tall, with label left and arrow right. On the app it spans the full leaf width.
- **Hover / Active:** shifts to Ink Down; on press it translates 1px 1px. Under reduced motion a press dims it to .72 opacity instead. Focus is a 2.5px ink outline offset 3px.
- **Ghost:** transparent with a 1.5px ink border and the same type; hover fills with 7–8% ink.
- **Slim:** 2.75rem tall at .85rem, used for in-panel marking.

### Chips
- **Jump chip:** a leaf-coloured face with a 1.5px ink border, a division swatch, and button type at .75rem. Hover turns it milk.
- **Book pick:** a milk face with a 1.5px ink border, in Archivo 500. **Selected** fills with the division hue and punches a hole through to the board before the label.
- **Reference:** a mono .8rem chip with an ink border and a division swatch. When expanded it inverts to ink.

### Cards / Containers: the leaf
- **Corner Style:** 3px.
- **Background:** solved milk-acetate leaf; the top ply only may use the clear leaf.
- **Binding:** two punch holes (.75rem) at left .75rem, 1.05rem from the top and bottom, showing the board through.
- **Shadow Strategy:** leaf cut-side shadow (see Elevation).
- **Internal Padding:** 1.15rem 1.15rem 1.3rem 2.4rem. The extra left inset clears the holes.
- A division **divider** (division hue, 3px top corners) may cap a leaf, which then squares its top corners.

### Inputs / Fields
- **Style:** milk ground, 1.5px ink border, 2px radius, 3rem tall.
- **Focus:** 2.5px ink outline offset 1px.
- **Error:** errata-vermilion bold text beneath.

### Navigation
- **Wordmark:** TOLLE in the top bar links to the landing page.
- **Tab bar:** ink ground with Archivo 700 caps labels at .72rem/.12em under a 1.25rem square-capped stroke icon. Labels are muted (#b9b9b2) and turn milk on hover and when active. **Active** adds a .6rem punched hole in the board hue under the label. On desktop it becomes the left ink column.

### Signature: the fore-edge thumb-index rail
- Six division tabs flex in proportion to their chapter count. Tabs are inset .35rem. Each tab holds one band per book, flexed by that book's chapter count and filled left-to-right with 50% ink by its read fraction. Book bands are separated by milk hairlines at 35%.
- The **current** division's tab extends to the screen edge (no inset, no shadow): it is the board. Other tabs cast the rail tab shadow.
- The book holding the next chapter carries a 5px milk stripe on its right edge.
- Every tab carries its division name on a milk label slip in vertical mono caps (.6rem, .75rem on desktop; spacing in em of the label). Each tab is a size container. A tab at least 9.5em tall shows the full name, wrapping to two columns when needed. A shorter tab shows the short form of the two-word divisions (Gosp. Acts, Lett. Rev.). Every tab has a 6.2em floor, so the short form always fits: a label is never clipped and never missing.
- Tapping a tab opens the Index at that division. On the landing page the tabs step in from the edge one after another at 90ms intervals.

### Reader
- **Sticky bar:** back, position, a moon or sun (day or night at once, set in place without redrawing the chapter, stored as an explicit Settings choice) and listen controls on the board, above the **verse strip**: the chapter's own thumb index laid flat. It holds one cell per verse in on-board ink at 22%. A cell fills to full ink, in one hard step, when its verse passes a reading line 40% down the viewport. Verses with a tabbed note stand taller (.8rem against .45rem). The strip is also a slider: tapping a bar (inside a 27px touch band) jumps instantly so that verse sits just under the sticky bar, and arrow keys, Home and End step verse by verse. Its value is the verse at the top of the reading area; the fill still follows the 40% reading line.
- **Opener:** the book name as the station head, then a section numeral (Archivo 800 at 72%, 5.5rem, 6rem on desktop, line-height .76) beside two mono meta lines: division and chapter, then verses and tabbed notes. The numeral is decorative; the h1 carries the chapter number for screen readers.
- **Text:** EB Garamond 1.1875rem/1.6 at a 30em measure with `text-wrap: pretty`. A new paragraph starts where a verse opens a speech, as long as the paragraph so far holds at least two verses. Paragraphs are separated by .8em. Verse numbers are mono at .58em, raised with relative positioning and line-height 0, so they never stretch a line.
- **Tabbed notes:** a note that names a verse of its chapter, as "(2:11)" or "verse 9", becomes an ink tab (2.25×2rem, corners 0 4px 4px 0) floated into the plate's 2.6rem fore-edge lane. It sticks out .65rem past the leaf at the line where its verse starts and carries the note kind's icon. Pulling a tab hinges a milk **pull card** open under the verse. In the card the kind tab hangs from the top edge and the references stack. The verse takes a board tint, and the tab shows a punched hole. Notes without a verse stay in the Why & How leaf.
- **Look for:** one sentence under the summary in the opener, led by an ink `.kind` tab reading "Look for", saying what to watch for before reading.
- **About the book:** a leaf holding a native `<details>`: who wrote it, when, why, and the book's outline as a chapters table. The section this chapter sits in gets the next-row ink square and "You are here". It opens above the text when no chapter of the book has been read yet. Otherwise it sits closed after Fill the gap.
- **Skim guide and key verses:** for list-heavy or repetitive chapters, a "Skim guide" line opens the scripture plate under a hairline. It ends with the key verse numbers as inverted plate-ink badges, and those verses' numbers are inverted in the text too.
- **Names:** the first appearance of each person, place or group in the chapter's notes is a dotted-underline button. It opens a native popover styled as a milk bottom sheet (punch hole, mono kind, the name in station caps, a one-sentence gloss, and "Back to the text"), which rises in two frames over a 35% ink backdrop.
- **Keeping a verse:** tapping a verse selects it with a board tint, and a **Keep c:v** button joins Done in the action bar. It is a milk button with an open ring, which becomes a punched hole once the verse is kept. While Keep is showing, Done drops its "next" text so the bar stays one line. A kept verse carries a punched hole in the plate's binding column (the same column as the leaf's own holes) at the line where it starts.
- **Kept tab:** a fourth tab with a page-with-a-hole icon. Each kept verse is a leaf, newest first, with its reference as a mono tab in its division's hue hanging from the top edge, the verse in EB Garamond, a mono date and translation line, and Share (Android share sheet) and Remove. Remove shows an ink "Removed … Undo" slip. Kept verses are stored apart from the plan (`tolle-kept`), so erasing progress never erases them.
- **Any chapter:** inside an opened book on the Index, every chapter is a 2.75rem key. Read chapters are filled in the division's hue, and the plan's next chapter is ink. A go-to field above the division chips takes "John 3:16", "ps 23" or "1 cor 13", with the book names offered as a datalist, and opens that chapter landing on the verse. A kept verse's "Read Book N" link does the same. A chosen chapter counts like any other, and Done carries on to the next unread chapter after it. A chapter read before is labelled "Read before" and records nothing.
- **Chapter switcher:** the opener's section numeral and its "chapter c of n" link open a bottom sheet (the name-card sheet, up to 85dvh tall and scrollable). A pinned header holds "Choose a chapter", the book name, a native book select, and ghost buttons for the chapters either side, which cross into the next or previous book. Below it, every chapter of the book is a key from the same builder the Index uses; the open chapter is ringed, takes focus, and is scrolled into view.
- **A verse for today:** the second leaf on Today, the verse in EB Garamond 1.3125rem, then a mono reference line with Keep and "Read Book N". It is chosen from a hand-picked list of 86 hopeful verses checked against the WEB text, never at random. The verse comes from the book being read if the list has one, else from its division, else the next in canonical order, and none repeats until all have been shown. It is a gift, not a task, so it adds nothing to progress.
- **Fill the gap:** after the text, one verse comes back with its rarest long word blanked, plus three word buttons. The answer and two distractors all come from the same chapter. A right answer turns ink with a punched hole. A wrong pick becomes an errata slip, and the right answer is then shown. The blank fills with a board tint and a mono line gives the verse reference.

### Status slip
- Mono caps in a 1.5px current-colour outline (2px radius), reading On track or N ahead. When behind it becomes the errata slip: a vermilion fill with white text.

### Today's chapters table
- Rows are separated by rule hairlines and are 2.75rem tall. The marker is an open ink ring for unread, a punched hole for read (with dimmed text) and an ink square for next (with bold text). The trailing tag is mono caps.

### Motion
- `--hinge: 90ms steps(2, jump-end)`. One helper, `step()`, runs every two-frame move, hinged at an edge.
- **Focal moment (Done):** the Done button is punched, and the verse strip fills. The chapter's opener and text leaves then hinge shut at the punched edge (rotateY to -75deg, origin left), and the next chapter's top leaf hinges in. The book's band on the rail steps from its old read fraction to its new one, because `--f` is a registered `<number>` animated with WAAPI. The same band step, plus the Index bar, runs when a book is marked read.
- **Entrances:** only the top ply hinges in on a new view (rotateY -16deg). In-place re-renders (marking a book, undo) replay nothing.
- **Attention and feedback:** a rail tab or division chip lands on a division head that hinges down (rotateX -20deg). Book panels and pulled notes open the same way. The active tab's hole, the right answer's hole and the just-read row markers punch in (scale 0 to 1). A wrong answer is struck 5px out of register for two frames. The filled-in word prints in as a two-frame clip from left to right.
- **Landing:** the rail tabs step in from the edge at 90ms intervals. After that, a scroll timeline drives a registered `--p`, so each tab fills top to bottom across its share of the Bible as the page is read. The 1,189-chapter grid unveils row by row in 12 hard steps, from a single view timeline on its container. Both fills are colour-only and keep running under reduced motion.
- **Under the finger, motion is continuous; on release, it is the hinge.**
  - **Sheets:** the names card and the chapter switcher rise from the bottom edge and leave the same way, in the hinge. They are a popover transition with `@starting-style` and `allow-discrete`, and the backdrop dims in step.
  - **Pulling a sheet down:** the sheet follows the thumb 1:1. Its header always drags it; its body drags it only when scrolled to the top. Past the top it gives with a rubber band. On release it projects the flick (Apple's deceleration .998: `y + v·0.499`). If the projection passes half the sheet's height, the sheet drops away; otherwise it settles back. Either way it moves in the hinge, from where the finger let go.
  - **Verse strip:** it scrubs. A press jumps to the bar under it, and a drag carries the text along with the finger (pointer capture, `touch-action:none`).
- **Press:** every button, link and summary answers on press with a 1px push into the board. A note tab is pulled 2px instead.
- **Day and night:** they trade places through a view transition, a 200ms cross-fade in four hard steps, so the brightness never jumps. It is a fade, not movement, so it stays under reduced motion.
- **Interruption:** a tab tapped during Done's page turn wins over the turn's destination.
- **Marks of progress are punched holes too.**
  - **The run:** a count of days in a row, the best run, and this week as seven holes punched on the days read.
  - **The punch card:** one hole a book, punched in its division's hue when the book is finished.
  - **The mark:** finishing a book, a division or a run of 7, 30, 100 or 365 days puts one leaf at the top of Today: a 3.4rem hole (`punch`) and the name printed in (`inkin`), with a longer vibration. It shows once and leaves with the page.
  - **The whole Bible:** the board steps through all six division hues, 220ms apart, and Today keeps the journey in figures with a Share button.
- **Small bridges, all in the hinge:** a removed Kept verse shuts like Done's leaves, and its Undo slip prints in (`inkin`). Undo hinges the verse back where it was. A book's intro and a pulled passage hinge down like book panels. Keep steps in from its edge the first time it appears. In setup, a ticked book's bar steps to its new fill.
- **Under `prefers-reduced-motion: reduce`:**
  - `step()` and the band step return early, and the CSS removes animations and sheet transitions.
  - A press dims the control to .72 opacity instead of moving it.
  - State changes (holes, fills, slips) are then instant, but every state change, and every press, still answers.

## Do's and Don'ts

### Do:
- **Do** set the board to the current division's hue at full strength and set `--on-board` (ink on Law, History, Wisdom and Prophets; white on Gospels and Letters).
- **Do** derive every leaf from its board's solved alpha in `BEDS`, so it lands at luminance 0.80. Make only the top ply clear (alpha minus .1).
- **Do** give every leaf two punch holes on its bound edge and the 3px hard cut-side shadow.
- **Do** show selection as a punched hole (board-coloured circle, inset ink shadow): read chapters, picked books, the active tab or nav item.
- **Do** keep the fore-edge rail on every screen except setup, with tabs sized by chapter extent, bands filling by read fraction, the current tab extended and full division names on milk slips.
- **Do** set primary actions as print-ink slabs in Archivo 700 caps at 82% width and .06em.
- **Do** use `--hinge` (90ms, two hard steps) for every change, and make it instant under reduced motion. Anything the finger holds tracks it 1:1 until release.
- **Do** keep touch targets at least 2.75rem.

### Don't:
- **Don't** use errata vermilion for anything but errata: the late slip, the erase slip and form errors.
- **Don't** ease, fade, slide smoothly or blur. No cubic-bezier curves, opacity transitions or soft shadows.
- **Don't** set Scripture in anything but EB Garamond on the plate, and don't set Archivo or mono as reading text.
- **Don't** set running prose in JetBrains Mono. It is for counts, times, references and index labels.
- **Don't** abbreviate division names on the rail. Let the slip wrap to two columns.
- **Don't** hard-code light-page colours (`#fff`, ink alphas as fills): mix from `--ink`, `--milk` or `--hue`, so night works. Keep `--print` for ink on a hue.
- **Don't** hand-pick a leaf opacity or tint a leaf with a second hue.
