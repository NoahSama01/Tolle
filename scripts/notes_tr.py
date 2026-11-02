"""Merge translated notes into public/insights/<lang>/<book>.json and check them against the English and that language's Bible.
usage: python scripts/notes_tr.py <hi|ta|ml|te> <Book Name> part1.json [part2.json ...]
Checks: every note of the English is there, in order, with the same kind, refs and verse tab; outline and key verse unchanged;
the text is in the language's script; each name occurs in the chapter as the reader's Bible spells it; and every quotation
in double quotes is that Bible's wording, from this book or a passage the note cites. Non-Scripture phrases go in ‘single quotes’."""
import json, os, re, sys, time, urllib.request
import regex

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
html = open(os.path.join(ROOT, "public", "index.html"), encoding="utf-8").read()
BOOKS = json.loads(re.search(r"const BOOKS=(\[.*?\]\]);", html).group(1)); NAMES = [b[0] for b in BOOKS]
USFM = re.search(r"const USFM='([^']+)'", html).group(1).split()
BIBLES = {"hi": ["hin_cvb"], "ta": ["tam_irv"], "ml": ["mal_irv", "mal_fbf"], "te": ["tel_irv"]}  # every Bible the app offers in that language
SCRIPT = {"hi": r"\p{Devanagari}", "ta": r"\p{Tamil}", "ml": r"\p{Malayalam}", "te": r"\p{Telugu}"}
lang, book, parts = sys.argv[1], sys.argv[2], sys.argv[3:]
slug = book.lower().replace(" ", "-")

def chapter(bid, b, c):  # [verse text], as the app joins helloao's pieces; cached beside the WEB chapters
    f = os.path.join(HERE, ".web", bid, f"{USFM[NAMES.index(b)]}-{c}.json")
    if not os.path.exists(f):
        os.makedirs(os.path.dirname(f), exist_ok=True)
        for _ in range(6):
            try:
                d = urllib.request.urlopen(f"https://bible.helloao.org/api/{bid}/{USFM[NAMES.index(b)]}/{c}.json", timeout=30).read()
                open(f, "wb").write(d); break
            except Exception:
                time.sleep(5)
        time.sleep(0.5)
    piece = lambda p: p if isinstance(p, str) else (p["text"] + (" " if p.get("poem") else "")) if p.get("text") is not None else " " if p.get("lineBreak") else ""
    return [re.sub(r"\s+", " ", "".join(piece(p) for p in x["content"])).strip()
            for x in json.load(open(f, encoding="utf-8"))["chapter"]["content"] if x["type"] == "verse"]

CHILLU = str.maketrans({"ൺ": "ണ്", "ൻ": "ന്", "ർ": "ര്", "ൽ": "ല്", "ൾ": "ള്", "ൿ": "ക്"})  # Malayalam writes these either way; joiners only shape them
norm = lambda s: " ".join(regex.sub(r"[^\p{L}\p{M}\p{N}]+", " ", regex.sub(r"[​-‍]", "", s).translate(CHILLU)).split())
texts = lambda b, c: [" ".join(chapter(bid, b, c)) for bid in BIBLES[lang]]
REF = re.compile(r"^(.+) (\d+)(?::(\d+)(?:-(\d+))?)?$")
anchor = lambda body, c: int((re.search(rf"\({c}:(\d+)", body) or re.search(r"\b[Vv]erse (\d+)", body) or [0, 0])[1])  # as the app tabs a note
local = lambda s: len(regex.findall(SCRIPT[lang], s)) > len(regex.findall(r"\p{Latin}", s))  # written in the language, Latin only for transliterations
quotes = lambda s: [q for q in re.findall(r"[\"“]([^\"”]*)[\"”]", s) if len(q) >= 18]
nchap = dict(BOOKS)[book]
JOINS = lang in ("ta", "ml", "te")  # as the app's nameRe: there endings join on and the last sound may change, so the stem starts a word
CHILLU_BASE = {"ൺ": "ണ", "ൻ": "ന", "ർ": "രറ", "ൽ": "ല", "ൾ": "ള"}  # as the app's CHILLU: താമാർ → താമാറിൽ
def name_re(n):
    if not JOINS: return r"(?<![\p{L}\p{M}])" + regex.escape(n) + r"(?![\p{L}\p{M}])"
    n = re.sub(r"[்్്]$", "", re.sub(r"ம்$|[ంം]$", "", n.rstrip("‍")))
    tail = f"[{n[-1]}{CHILLU_BASE[n[-1]]}]" if n[-1] in CHILLU_BASE else ""  # a final chillu stays, or becomes its consonant before an ending
    return r"(?<![\p{L}\p{M}])" + regex.escape(n[:-1] if tail else n) + tail

en = json.load(open(os.path.join(ROOT, "public", "insights", f"{slug}.json"), encoding="utf-8"))
out_path = os.path.join(ROOT, "public", "insights", lang, f"{slug}.json")
data = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {}
book_text = None
problems = []
for p in parts:
    for c, x in json.load(open(p, encoding="utf-8")).items():
        e = en[c]; where = f"{book} {c}"
        if c == "intro":
            for k in ("who", "when", "why"):
                if not local(x.get(k, "")): problems.append(f"{where}: {k} not in the language")
            if [o["chapters"] for o in x["outline"]] != [o["chapters"] for o in e["outline"]]: problems.append(f"{where}: outline differs from the English")
            if any(not local(o["title"]) for o in x["outline"]): problems.append(f"{where}: an outline title is not in the language")
            if x.get("verse") != e.get("verse"): problems.append(f"{where}: key verse must stay '{e.get('verse')}'")
            data[c] = x; continue
        n = int(c); here = texts(book, n); nhere = [norm(t) for t in here]
        for k in ("summary", "lookfor"):
            if not local(x.get(k, "")): problems.append(f"{where}: {k} not in the language")
        ek = iter(m["kind"] for m in e["names"])  # the English names in order; one may be left out where this Bible's chapter lacks it
        if not all(k in ek for k in (m["kind"] for m in x["names"])): problems.append(f"{where}: names differ from the English in order or kind")
        if len(x["names"]) < len(e["names"]): problems.append(f"{where}: note: {len(e['names']) - len(x['names'])} name(s) left out (fine only if this Bible's chapter lacks them)")
        for m in x["names"]:
            if not any(regex.search(name_re(m["name"]), t) for t in here): problems.append(f"{where}: name '{m['name']}' not in the chapter")
            if not local(m["gloss"]): problems.append(f"{where}: gloss of '{m['name']}' not in the language")
        if x["skim"]["key"] != e["skim"]["key"] or bool(x["skim"]["advice"]) != bool(e["skim"]["advice"]): problems.append(f"{where}: skim differs from the English")
        if len(x["insights"]) != len(e["insights"]): problems.append(f"{where}: {len(x['insights'])} notes, the English has {len(e['insights'])}"); continue
        for i, (t, s) in enumerate(zip(x["insights"], e["insights"]), 1):
            w = f"{where} note {i}"
            if t["kind"] != s["kind"] or t["refs"] != s["refs"]: problems.append(f"{w}: kind or refs differ from the English")
            if anchor(t["body"], n) != anchor(s["body"], n): problems.append(f"{w}: tabs to verse {anchor(t['body'], n)}, the English to {anchor(s['body'], n)} (write it as ({n}:V))")
            if not (local(t["title"]) and local(t["body"])): problems.append(f"{w}: not in the language")
            for a, b in re.findall(r"\((\d+):(\d+)", t["body"]):
                if int(a) > nchap or int(b) > len(chapter(BIBLES[lang][0], book, int(a))): problems.append(f"{w}: inline {a}:{b} out of range")
            for q in quotes(t["body"]):
                pieces = [norm(s) for s in re.split(r"\.\.\.|…", q) if norm(s)]
                found = lambda pool: all(any(pc in t2 for t2 in pool) for pc in pieces)
                if found(nhere): continue
                cited = [norm(tx) for r in t["refs"] if (m := REF.match(r)) for tx in texts(m[1], int(m[2]))]
                if found(cited): continue
                book_text = book_text or [norm(tx) for k in range(1, nchap + 1) for tx in texts(book, k)]
                if not found(book_text): problems.append(f"{w}: quote not in this Bible (cite its verse in refs, or use ‘single quotes’ if not Scripture): \"{q}\"")
        data[c] = x
data = {k: data[k] for k in en if k in data}  # the English order
os.makedirs(os.path.dirname(out_path), exist_ok=True)
json.dump(data, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{lang} {book}: {sum(k.isdigit() for k in data)} of {nchap} chapters, intro {'yes' if 'intro' in data else 'no'}")
print("\n".join(problems) or "no problems")
