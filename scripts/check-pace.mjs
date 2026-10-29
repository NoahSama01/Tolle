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

const DBG = 9361, profile = fs.mkdtempSync(path.join(os.tmpdir(), "tolle-check-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", `--remote-debugging-port=${DBG}`, `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ver; for (let i = 0; i < 150 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch { await sleep(200); } }
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
      deadline:plus(-elapsed+99),log:${todayN} ? {[t]:${todayN}} : {},at:{},start:plus(-elapsed),startDone:189,tr:'web',rate:1};
    localStorage.clear();localStorage.setItem('bible-plan',JSON.stringify(S));
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

try {
  await send("Page.enable");
  for (const t of tests) {
    cur = t.name; ok = true;
    try { await seed(t.opts); await t.fn(); } catch (e) { fail(String(e)); }
    if (ok) console.log(`PASS ${t.name}`); else failed++;
  }
  console.log(`${tests.length - failed}/${tests.length} passed`);
} finally { ws.close(); chrome.kill(); server.close(); }
process.exit(failed ? 1 : 0);
