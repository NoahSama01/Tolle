// Checks for Tolle's pace model and reading flow, in headless Chrome over the DevTools protocol
// (Node built-ins only). Each test seeds a plan into localStorage, reloads the app, and checks
// expressions in the page. Run: node scripts/check-pace.mjs   (exits 1 if anything fails)
import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const server = http.createServer((req, res) => {
  let p = path.join(PUBLIC, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (p.endsWith(path.sep)) p = path.join(p, "index.html");
  if (!p.startsWith(PUBLIC) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] ?? "application/octet-stream" }); fs.createReadStream(p).pipe(res);
}).listen(0);
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// a fresh port and profile every run, and the whole Chrome process tree killed at the end
// (on Windows, killing the launcher alone can leave its children holding the profile)
const DBG = 9400 + Math.floor(Math.random() * 500), profile = fs.mkdtempSync(path.join(os.tmpdir(), "tolle-check-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", `--remote-debugging-port=${DBG}`, `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const killChrome = () => { try { spawn("taskkill", ["/pid", String(chrome.pid), "/T", "/F"], { stdio: "ignore" }); } catch { chrome.kill(); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ver; for (let i = 0; i < 150 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch { await sleep(200); } }
if (!ver) { console.log(`FAIL setup: Chrome did not open its debugging port ${DBG}`); killChrome(); server.close(); process.exit(1); }
const tgt = await (await fetch(`http://127.0.0.1:${DBG}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const wait = {};
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && wait[m.id]) { wait[m.id](m); delete wait[m.id]; } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expr) => {
  const m = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  const r = m.result; if (r?.exceptionDetails) return { error: r.exceptionDetails.exception?.description?.split("\n")[0] ?? "exception" };
  return { value: r?.result?.value };
};
const load = async (url) => { await send("Page.navigate", { url }); for (let i = 0; i < 100; i++) { await sleep(50); if ((await js("document.readyState")).value === "complete") break; } await sleep(150); };

// seed: a 100-day plan of 1,000 chapters (startDone 189, so perDay 10), `elapsed` days in.
// `before` chapters read before today, then `todayN` more today. joshuaLeft:n is before = 211 - n.
async function seed(o) {
  const before = o.joshuaLeft != null ? 211 - o.joshuaLeft : o.before, todayN = o.todayN || 0;
  await load(`${ORIGIN}/`);
  await js(`(()=>{
    const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const plus=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
    const elapsed=${o.elapsed ?? 10},n=${before + todayN},t=iso(new Date());
    const S={read:'1'.repeat(n)+'0'.repeat(1189-n),day:{d:t,idx:Array.from({length:${todayN}},(_,k)=>${before}+k)},
      deadline:plus(-elapsed+${o.deadlineFromStart ?? 99}),log:${todayN} ? {[t]:${todayN}} : {},at:{},start:plus(-elapsed),startDone:189,tr:'web',rate:1};
    localStorage.clear();localStorage.setItem('tolle-theme','light');localStorage.setItem('bible-plan',JSON.stringify(S));
  })()`);
  await load(`${ORIGIN}/`);
  if (o.act) { await js(o.act); await sleep(o.wait ?? 0); }
}

const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x));
let failed = 0, cur = "", ok = true;
const fail = (msg) => { if (ok) console.log(`FAIL ${cur}: ${msg}`); ok = false; };
async function expect(expr, want) {
  const r = await js(expr);
  if (r.error) return fail(`${expr} threw ${r.error}`);
  if (canon(r.value) !== canon(want)) fail(`${expr} expected ${canon(want)} got ${canon(r.value)}`);
}
async function expectText(sel, want) {
  const r = await js(`document.querySelector(${JSON.stringify(sel)})?.textContent.replace(/\\s+/g,' ').trim() ?? null`);
  const got = r.value;
  if (got == null) return fail(`${sel} not found`);
  if (want instanceof RegExp ? !want.test(got) : got !== want) fail(`${sel} expected ${want} got ${JSON.stringify(got)}`);
}
async function expectCss(sel, prop, want) {
  const r = await js(`(e=>e?getComputedStyle(e).getPropertyValue(${JSON.stringify(prop)}):null)(document.querySelector(${JSON.stringify(sel)}))`);
  if (r.value !== want) fail(`${sel} ${prop} expected ${want} got ${r.value}`);
}
const tests = [];
const test = (name, opts, fn) => tests.push({ name, opts, fn });

// ---- Task 1: one pace model; today's goal includes the catch-up (elapsed 10: by 289, through 299, 90 days left)
test("on_track", { before: 289 }, async () => { await expect("goal()", 10); await expect("goalParts().catchup", 0); await expect("pace().text", "On track"); });
test("behind_counts", { before: 279 }, async () => { await expect("behindToday()", 10); await expect("goalParts()", { share: 10, catchup: 10 }); await expect("goal()", 20); await expect("pace().text", "10 behind"); });
test("catchup_meets_track", { before: 279, todayN: 20 }, async () => { await expect("pace().text", "On track"); await expect("goal()", 20); });
test("far_behind", { before: 200 }, async () => { await expect("goal()", 20); await expect("goalParts().catchup", 10); });
test("ahead_extra", { before: 289, todayN: 13 }, async () => { await expect("goal()", 10); await expect("extraToday()", 3); await expect("pace()", { cls: "ahead", text: "3 ahead" }); });
test("goal_stable_within_day", { before: 279, todayN: 3 }, async () => { await expect("goal()", 20); });
test("deadline_today", { before: 1100, elapsed: 99 }, async () => { await expect("goal()", 89); await expect("Number.isFinite(goal())", true); });
test("deadline_past", { before: 1180, elapsed: 120 }, async () => { await expect("goal()", 9); await expect("goal()<=1189-1180", true); });

// ---- Task 2: Today shows the catch-up, an ahead slip, and extra chapters
const today = { act: "go('today')" };
test("today_shows_catchup", { before: 279, ...today }, async () => { await expectText(".lede", "20 left today, about 70 minutes: 10 chapters for today and 10 to catch up."); });
test("today_ahead_slip", { before: 289, todayN: 13, ...today }, async () => { await expectText(".status.ahead", "3 ahead"); await expectCss(".status.ahead", "background-color", "rgb(21, 21, 21)"); });
test("today_extra_tag", { before: 289, todayN: 13, ...today }, async () => { await expectText("#stops-h .extra", "+3 extra"); });
test("today_no_extra_when_short", { before: 289, todayN: 4, ...today }, async () => { await expect("document.querySelector('#stops-h .extra')", null); });

// ---- Task 3: Done carries on to the next chapter, and marks the day's goal there
const done = { act: "go('reader');finish()", wait: 700 };
test("done_after_goal_goes_next", { before: 289, todayN: 10, ...done }, async () => { await expect("view", "reader"); await expect("cur()", 300); }); // 0–298 read; Done on 299 lands on 300
test("done_reaching_goal_marks_it", { before: 289, todayN: 9, ...done }, async () => { await expect("view", "reader"); await expectText(".gone", /^Today's reading is done\. \d+ days? in a row\. Keep going\?$/); });
test("done_before_goal_no_mark", { before: 289, todayN: 2, ...done }, async () => { await expect("view", "reader"); await expect("document.querySelector('.gone')", null); });
test("done_on_read_before", { before: 289, act: "openCh(5);finish()", wait: 700 }, async () => { await expect("todayN()", 0); await expect("view", "reader"); await expect("cur()", 289); });
test("finish_last_chapter", { before: 1188, ...done }, async () => { await expect("view", "today"); await expectText(".status", "Complete"); });

// ---- Task 4: the pull to finish a book (Joshua: chapters 187–210)
test("reader_finish_pull", { joshuaLeft: 2, act: "go('reader')" }, async () => { await expectText(".actbar .go", /1 more to finish Joshua/); });
test("reader_finishes_book", { joshuaLeft: 1, act: "go('reader')" }, async () => { await expectText(".actbar .go", /finishes Joshua/); });
test("today_finish_pull", { joshuaLeft: 3, act: "go('today')" }, async () => { await expectText(".lede", /3 chapters to finish Joshua\.$/); });

// ---- Final review fixes
// 30 behind at the start of today (goal 20, capped catch-up), then 25 read: still 5 behind, so nothing is "extra"
test("behind_no_extra", { before: 259, todayN: 25, act: "go('today')" }, async () => { await expect("pace().text", "5 behind"); await expect("extraToday()", 0); await expect("document.querySelector('#stops-h .extra')", null); });
test("behind_reader_label", { before: 259, todayN: 25, act: "go('reader')" }, async () => { await expectText(".pos", "Catching up"); });
// Done on the Bible's last chapter, opened out of order, carries on to the plan's next unread chapter
test("done_wraps_to_plan", { before: 289, act: "openCh(1188);finish()", wait: 700 }, async () => { await expect("view", "reader"); await expect("cur()", 289); });
// partway through a catch-up day the line still adds up
test("lede_partly_read", { before: 279, todayN: 8, act: "go('today')" }, async () => { await expectText(".lede", "12 left of today's 20, about 42 minutes: 10 chapters for today and 10 to catch up."); });
// a deadline before the plan's start gives sane numbers, and a past date can't be set
test("deadline_before_start", { before: 289, deadlineFromStart: -5 }, async () => { await expect("pace()", { cls: "ok", text: "On track" }); await expect("goal()<=900", true); });
// screen readers: a space before the extra tag, and the goal line said by a live region that outlives the view
test("extra_tag_spaced", { before: 289, todayN: 13, ...today }, async () => { await expectText("#stops-h", "Today's chapters +3 extra"); });
test("met_line_announced", { before: 289, todayN: 9, ...done }, async () => { await expect("document.querySelector('#app #told')", null); await expectText("#told", /^Today's reading is done\./); await expect("document.querySelector('.gone[role]')", null); });
test("set_past_deadline_ignored", { before: 289, act: "window._d=S.deadline;setDeadline('2000-01-01')" }, async () => { await expect("S.deadline===window._d", true); });

// ---- The WEB text ships with the app: no call to bible-api.com
const noApi = (ref) => `(async()=>{const f=window.fetch;window.fetch=u=>String(u).includes('bible-api')?Promise.reject(new Error('api')):f(u);try{const j=await passage(${JSON.stringify(ref)});return [j.verses.map(v=>v.verse).join(),j.text.replace(/\\s+/g,' ').trim().slice(0,40)]}finally{window.fetch=f}})()`;
test("web_text_builtin", {}, async () => { await expect(noApi("Genesis 1:2-3"), ["2,3", "The earth was formless and empty. Darkne"]); });
test("web_text_one_chapter_book", {}, async () => { await expect(noApi("Jude 1").replace("[j.verses.map(v=>v.verse).join(),", "[j.verses.length,"), [25, "Jude, a servant of Jesus Christ, and bro"]); });
test("web_text_single_verse", {}, async () => { await expect(noApi("Psalms 23:1"), ["1", "Yahweh is my shepherd: I shall lack noth"]); });

// ---- The evening "keep your run" nudge: the account learns the run, and Settings offers the nudge
const days2 = "(()=>{const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return iso(x)};S.log={[d(1)]:2,[d(2)]:1,[d(4)]:3};S.day=null;window._y=d(1)})()";
test("facts_carry_run", { before: 289, act: days2 }, async () => { await expect("facts().run_days", 2); await expect("facts().last_read===window._y", true); });
test("settings_offer_run_nudge", { before: 289, act: "AU={id:'x'};go('settings')" }, async () => { await expectText("#kr-h", "Keep your run"); });

// ---- The landing page shows everyone's totals from the backend, and nothing below the privacy floor
async function landingWith(reply) {
  const { result } = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.fetch=async u=>String(u).includes('reader_totals')?{ok:true,json:async()=>(${JSON.stringify(reply)})}:Promise.reject()` });
  await load(`${ORIGIN}/landing.html`); await sleep(200);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: result.identifier });
}
test("landing_totals", {}, async () => { await landingWith({ readers: 56, chapters: 12345, week: 1234, finished: 2 }); await expectText("#all", "Together · 12,345 chapters read · 1,234 this week · 56 readers · 2 finished the whole Bible"); });
test("landing_totals_floor", {}, async () => { await landingWith({ readers: 3, chapters: null, week: null, finished: null }); await expect("document.getElementById('all')?.hidden", true); });

try {
  await send("Page.enable");
  for (const t of tests) {
    cur = t.name; ok = true;
    try { await seed(t.opts); await t.fn(); } catch (e) { fail(String(e)); }
    if (ok) console.log(`PASS ${t.name}`); else failed++;
  }
  console.log(`${tests.length - failed}/${tests.length} passed`);
} finally { ws.close(); killChrome(); server.close(); }
process.exit(failed ? 1 : 0);
