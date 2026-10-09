"""Merge hand-written notes into public/insights/<book>.json and check them against the WEB text.
usage: python scripts/notes.py <Book Name> part1.json [part2.json ...]
Checks: shape, kinds, ref book names and chapter counts, names present in the chapter text,
skim/inline verse numbers in range, and quotations from the chapter matching WEB word for word."""
import json, os, re, sys, time, urllib.request, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
html = open(os.path.join(ROOT, "public", "index.html"), encoding="utf-8").read()
BOOKS = dict(json.loads(re.search(r"const BOOKS=(\[.*?\]\]);", html).group(1)))
KINDS = {"why", "connection", "word", "culture", "detail", "bigpicture", "ponder"}
book, parts = sys.argv[1], sys.argv[2:]
slug = book.lower().replace(" ", "-")

def text(c):  # the WEB chapter, cached
    f = os.path.join(HERE, ".web", f"{slug}-{c}.json")
    if not os.path.exists(f):
        os.makedirs(os.path.dirname(f), exist_ok=True)
        for _ in range(6):
            try:
                d = urllib.request.urlopen(f"https://bible-api.com/{urllib.parse.quote(f'{book} {c}')}?translation=web", timeout=30).read()
                open(f, "wb").write(d); break
            except Exception:
                time.sleep(8)
        time.sleep(2.2)
    return json.load(open(f, encoding="utf-8"))["verses"]

norm = lambda s: re.sub(r"[^a-z0-9 ]", "", re.sub(r"\s+", " ", s.lower().replace("\u2019", "'"))).strip()
REF = re.compile(r"^(.+) (\d+)(?::(\d+)(?:-(\d+))?)?$")
out_path = os.path.join(ROOT, "public", "insights", f"{slug}.json")
data = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {}
problems = []
for p in parts:
    for c, x in json.load(open(p, encoding="utf-8")).items():
        if c == "intro":
            data[c] = x; continue
        vs = text(int(c)); n = len(vs); full = " ".join(v["text"] for v in vs); nfull = norm(full)
        where = f"{book} {c}"
        for k in ("summary", "lookfor", "names", "skim", "insights"):
            if k not in x: problems.append(f"{where}: missing {k}")
        kinds = [i["kind"] for i in x["insights"]]
        if not set(kinds) <= KINDS: problems.append(f"{where}: bad kind {set(kinds) - KINDS}")
        if len(set(kinds)) < 5: problems.append(f"{where}: only {len(set(kinds))} kinds")
        if kinds.count("ponder") > 1: problems.append(f"{where}: two ponders")
        for nm in x["names"]:
            if nm["name"] not in full: problems.append(f"{where}: name '{nm['name']}' not in text")
            if nm["kind"] not in ("person", "place", "group"): problems.append(f"{where}: name kind {nm['kind']}")
        for v in x["skim"]["key"]:
            if not 1 <= v <= n: problems.append(f"{where}: skim key {v} > {n}")
        for i in x["insights"]:
            for r in i["refs"]:
                m = REF.match(r)
                if not m or m.group(1) not in BOOKS: problems.append(f"{where}: bad ref '{r}'"); continue
                if int(m.group(2)) > BOOKS[m.group(1)]: problems.append(f"{where}: ref chapter out of range '{r}'")
                if m.group(1) == book and m.group(3):
                    vv = text(int(m.group(2)))
                    if int(m.group(4) or m.group(3)) > len(vv): problems.append(f"{where}: ref verse out of range '{r}'")
            for a, b in re.findall(r"\((\d+):(\d+)", i["body"]):  # inline (c:v) in this book
                if int(a) > BOOKS[book] or int(b) > len(text(int(a))): problems.append(f"{where}: inline {a}:{b} out of range")
            for q in [q for q in re.findall(r"\"([^\"]*)\"", i["body"]) if len(q) >= 18]:  # long quotations should be this chapter's WEB words
                parts_q = [s for s in re.split(r"\.\.\.|\u2026", q) if norm(s)]
                if not all(norm(s) in nfull for s in parts_q):
                    problems.append(f"{where}: quote not in chapter (check if from elsewhere): \"{q}\"")
        data[c] = x
data = dict(sorted(data.items(), key=lambda kv: (kv[0] == "intro", int(kv[0]) if kv[0].isdigit() else 0)))
json.dump(data, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{book}: {sum(k.isdigit() for k in data)} of {BOOKS[book]} chapters, intro {'yes' if 'intro' in data else 'no'}")
print("\n".join(problems) or "no problems")
