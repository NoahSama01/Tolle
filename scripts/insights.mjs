// Generates the "Why & How" notes, plus each chapter's look-for line, names and skim guide and each
// book's introduction, into public/insights/<book>.json with the
// Message Batches API (half price; most batches finish within an hour).
// Rerunnable: it resumes a running batch, and chapters already saved are skipped,
// so running it again after failures retries only what's missing.
//
//   node scripts/insights.mjs                  -> every missing chapter
//   node scripts/insights.mjs Ruth "1 John"    -> only these books (try a small one first)
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// the book list lives in the app; read it from there rather than keep a second copy
const BOOKS = JSON.parse(fs.readFileSync(path.join(root, "public/index.html"), "utf8").match(/const BOOKS=(\[.*?\]\]);/)[1]);
const outDir = path.join(root, "public/insights");
const batchFile = path.join(root, "scripts/.batch-id");
const slug = (b) => b.toLowerCase().replaceAll(" ", "-");
const load = (s) => { try { return JSON.parse(fs.readFileSync(path.join(outDir, `${s}.json`), "utf8")); } catch { return {}; } };

const SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    lookfor: { type: "string" },
    names: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, kind: { type: "string", enum: ["person", "place", "group"] }, gloss: { type: "string" } },
        required: ["name", "kind", "gloss"],
        additionalProperties: false,
      },
    },
    skim: {
      type: "object",
      properties: { advice: { type: "string" }, key: { type: "array", items: { type: "integer" } } },
      required: ["advice", "key"],
      additionalProperties: false,
    },
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["why", "connection", "word", "culture", "detail", "bigpicture", "ponder"] },
          title: { type: "string" },
          body: { type: "string" },
          refs: { type: "array", items: { type: "string" } },
        },
        required: ["kind", "title", "body", "refs"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "lookfor", "names", "skim", "insights"],
  additionalProperties: false,
};

const INTRO_SCHEMA = {
  type: "object",
  properties: {
    who: { type: "string" },
    when: { type: "string" },
    why: { type: "string" },
    outline: {
      type: "array",
      items: { type: "object", properties: { chapters: { type: "string" }, title: { type: "string" } }, required: ["chapters", "title"], additionalProperties: false },
    },
    verse: { type: "string" },
  },
  required: ["who", "when", "why", "outline", "verse"],
  additionalProperties: false,
};

const SYSTEM = `You write the "Why & How" notes in a Bible reading app. Readers range from people reading the Bible for the first time to pastors preparing sermons, and both should come away having learned something real about the chapter they just read: why it is there, how it connects to the rest of Scripture, and what an ordinary reading misses. A pastor who has preached this chapter many times should still find something new.

For the chapter you are given, write a one-sentence summary and 6-8 insights covering at least five of these kinds:
- why: the situation behind the text - why this happens, or why it was written, at this point in the story
- connection: links to other passages - earlier echoes, later fulfillments, the New Testament's use of the Old, recurring patterns
- word: a Hebrew, Aramaic or Greek word whose meaning adds depth (include a transliteration)
- culture: ancient history, customs or archaeology that illuminate the text
- detail: something in the text itself that is easy to read past
- bigpicture: where this chapter sits in the Bible's overall story
- ponder: one open question worth sitting with or preaching on (at most one)

Accuracy matters more than novelty, because preachers will repeat what you write. Stay with what is well established in scholarship and the historic traditions. Where Jewish, Catholic, Orthodox and Protestant readers, or scholars, disagree, say so in a clause rather than picking a side. Never invent quotations, figures or sources.

Titles: under 8 words. Bodies: 2-4 plain sentences that explain rather than exhort. refs: the passages an insight relies on, written as "Book Chapter:Verse" or "Book Chapter:Verse-Verse" using exactly these book names: ${BOOKS.map(([b]) => b).join(", ")}. Use an empty list when an insight cites no other passage.

Three more fields help people read the chapter well:
- lookfor: one sentence the reader sees before the text, saying what to watch for: a contrast, a repeated phrase, a turn in the story, who does what. Name concrete things in the chapter, and don't give away how it ends.
- names: the people, places and groups in this chapter that a first-time reader may not know, at most 8 and none if there are none. Leave out God and Jesus. Spell each name exactly as it first appears in the World English Bible text of this chapter. gloss: one sentence on who or what it is and why it matters here.
- skim: if the chapter is mostly a list (a genealogy, census, inventory, boundary list or building measurements) or the same ritual steps repeated, advice is one sentence saying what can be skimmed and what to read closely, and key lists the 1 to 4 verse numbers that matter most. Otherwise advice is an empty string and key is an empty list.`;

const INTRO_SYSTEM = `You write the short introduction a Bible reading app shows when someone starts a book of the Bible. Readers range from first-timers to pastors. Accuracy matters more than novelty: stay with what is well established, and where Jewish, Catholic, Orthodox and Protestant readers or scholars disagree, say so in a clause rather than picking a side. Never invent quotations, figures or sources.
- who: who wrote it, traditionally and in modern scholarship, in 1-2 sentences.
- when: when it is set and when it was written, as ranges where views differ, in 1-2 sentences.
- why: what the book is for, in 1-2 sentences.
- outline: 3 to 8 sections that together cover every chapter in order. chapters is a range such as "1–7" (with an en dash) or a single number; title is under 6 words.
- verse: one key verse, written as "Book Chapter:Verse" with the exact book name you are given.`;

const client = new Anthropic();
fs.mkdirSync(outDir, { recursive: true });

let id = fs.existsSync(batchFile) && fs.readFileSync(batchFile, "utf8").trim();
if (!id) {
  const only = process.argv.slice(2);
  const requests = BOOKS.filter(([b]) => !only.length || only.includes(b)).flatMap(([b, n]) => {
    const have = load(slug(b));
    const intro = have.intro ? [] : [{
      custom_id: `${slug(b)}_intro`,
      params: {
        model: "claude-opus-5-5",
        max_tokens: 16000,
        system: INTRO_SYSTEM,
        output_config: { effort: "high", format: { type: "json_schema", schema: INTRO_SCHEMA } },
        messages: [{ role: "user", content: `${b} (${n} chapter${n > 1 ? "s" : ""})` }],
      },
    }];
    // chapters saved before the look-for, names and skim fields existed are written again
    return intro.concat(Array.from({ length: n }, (_, i) => i + 1).filter((c) => !have[c]?.lookfor).map((c) => ({
      custom_id: `${slug(b)}_${c}`,
      params: {
        model: "claude-opus-5-5",
        max_tokens: 16000,
        system: SYSTEM,
        output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
        messages: [{ role: "user", content: `${b} ${c}` }],
      },
    })));
  });
  if (!requests.length) { console.log("Nothing missing."); process.exit(); }
  id = (await client.messages.batches.create({ requests })).id;
  fs.writeFileSync(batchFile, id);
  console.log(`Submitted ${requests.length} chapters as batch ${id}. Safe to Ctrl+C; rerun to resume.`);
}

let batch;
while ((batch = await client.messages.batches.retrieve(id)).processing_status !== "ended") {
  const n = batch.request_counts;
  console.log(`${new Date().toLocaleTimeString()}  ${n.succeeded} done, ${n.errored} failed, ${n.processing} processing`);
  await new Promise((r) => setTimeout(r, 60_000));
}

const books = {}; // slug -> that book's file contents, written once at the end
let ok = 0, bad = 0;
for await (const r of await client.messages.batches.results(id)) {
  const [s, c] = r.custom_id.split("_");
  const m = r.result.type === "succeeded" ? r.result.message : null;
  // refusal or max_tokens leave unusable JSON: skip and let the next run retry it
  const text = m?.stop_reason === "end_turn" && m.content.find((b) => b.type === "text")?.text;
  if (!text) { bad++; console.warn(`✗ ${r.custom_id}: ${r.result.type} ${m?.stop_reason ?? ""}`); continue; }
  (books[s] ??= load(s))[c] = JSON.parse(text);
  ok++;
}
for (const [s, data] of Object.entries(books)) fs.writeFileSync(path.join(outDir, `${s}.json`), JSON.stringify(data, null, 1));
fs.rmSync(batchFile);
console.log(`Saved ${ok} chapters${bad ? `, ${bad} failed - run again to retry them` : ""}.`);
