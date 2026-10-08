---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: ["public/landing.html"]
---

# Surface brief: Tolle app (public/index.html)

Scope: the whole app shell — setup, Today, Index (the whole-Bible view), Settings, and the chapter reader. Visitor mode: Operate (Today, Index, Settings), Read (reader). The landing page (public/landing.html) follows the same world as a Persuade surface.

Audience and job: daily readers finishing the Bible by their own date, and preachers/students going deep, weighted equally; people read in any order. Job: see today's chapters, read them, understand each chapter through the Why & How notes, see the whole Bible and what they've read at a glance, and know whether they are on track. Constraints: phone-first Android PWA, offline, read-aloud, no client dependencies, no fabricated claims.

History: "The Bible Lines" (metro map), then "The Garden Room" (fresco). On 2026-10-07 the user asked to see other designs; from the re-roll hand they chose the fused challenger "The Thumb Index" (optionId challenger-tabs, recorded in .impeccable/questions/a148f026.answer.json), replacing the Garden Room.

## Direction contract

THESIS: Tolle is a Bible's thumb index made into an interface: the six divisions of Scripture sit on a stepped tab rail down the fore edge, each tab as tall as its share of the Bible, every book a band inside it that fills as you read, in any order. The current division's tab extends and becomes the board you read on. It refuses the white reading app with a progress ring, and the cream-paper bookish default.

OWN-WORLD: A board of one division hue at full strength (Law oxide orange, History chrome yellow, Wisdom grass, Prophets teal, Gospels and Acts ultramarine, Letters and Revelation violet); milk-acetate leaves whose alpha is solved per board so the reading field holds one luminance band; two punch holes on each leaf's bound edge and one short hard shadow on its cut side; print-ink black primary buttons; vermilion held out for errata only. Archivo (a Univers stand-in) in caps for heads, EB Garamond (a Sabon stand-in) for Scripture, JetBrains Mono only for counts, times and references. Selected is a punched hole.

STORY: The reader sees today's chapters on the top leaf of the board for their current division and, down the fore edge, the whole Bible as tabs with everything they have read filled in, in any order. They read, mark the chapter done, the leaf hinges over to the next chapter, and that book's band on the rail fills.

FIRST VIEWPORT: Phone, 390 wide. The board is the current division's hue. Top: TOLLE wordmark in wide Archivo caps and an on-track chip. The top-ply clear acetate leaf: the chapter name large in condensed Archivo caps, a mono meta line (division, n of m today, minutes), and the black primary action "Read Leviticus 3". Beneath it a milk leaf lists today's chapters, read ones punched. The fore-edge tab rail runs the full height at the right edge with the current tab extended. Bottom tabs: Today, Index, Settings. Desktop: rail navigation on the left, leaves on a four-column grid with heads hanging in a fifth margin column, and a wide tab rail at the right edge carrying division names.

FORM: Boxed-software reference manual lying open at a tabbed section (catalog challenger rw-manual-acetate-tab-board, fused with the product as "The Thumb Index"; verdict "competitive" in re-roll round 1, chosen by the user), seed key 82794e2d. Signature move: the fore-edge thumb-index rail, always present, sized by extent, filled by what has been read. Motion grammar: nothing eases or fades; every change is a 90 ms two-frame step hinged at the punched edge (a leaf hinging in, a rail band advancing, a book panel opening); under reduced motion changes are instant.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

Marking a chapter done: the leaf hinges over in two hard frames and the book's band on the fore-edge rail steps forward.

## Unresolved

Accounts/sync, church plans, paid tier, Catholic canon and non-English translations remain undecided product facts.
