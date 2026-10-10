"""Check quotations that scripts/notes.py can't: those from other chapters or other books.
usage: python scripts/quotes.py <Book>
A quote passes if its words appear in the book itself or in one of the verses its note cites (WEB)."""
import json, os, re, sys, time, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
book = sys.argv[1]; slug = book.lower().replace(" ", "-")
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", re.sub(r"\s+", " ", s.lower().replace("’", "'"))).strip()
cache_f = os.path.join(HERE, ".web", "refs.json")
cache = json.load(open(cache_f, encoding="utf-8")) if os.path.exists(cache_f) else {}
def fetch(ref):
    if ref not in cache:
        for _ in range(6):
            try:
                cache[ref] = json.load(urllib.request.urlopen(f"https://bible-api.com/{urllib.parse.quote(ref)}?translation=web", timeout=30))["text"]; break
            except Exception: time.sleep(10)
        else: cache[ref] = ""
        json.dump(cache, open(cache_f, "w", encoding="utf-8"), ensure_ascii=False); time.sleep(2.3)
    return cache[ref]
data = json.load(open(os.path.join(ROOT, "public", "insights", f"{slug}.json"), encoding="utf-8"))
own = ""
for c in data:
    f = os.path.join(HERE, ".web", f"{slug}-{c}.json")
    if c.isdigit() and os.path.exists(f): own += " " + " ".join(v["text"] for v in json.load(open(f, encoding="utf-8"))["verses"])
own = norm(own); bad = 0
for c, x in data.items():
    if not c.isdigit(): continue
    for i in x["insights"]:
        for q in [q for q in re.findall(r"\"([^\"]*)\"", i["body"]) if len(q) >= 18]:
            pieces = [norm(s) for s in re.split(r"\.\.\.|…", q) if norm(s)]
            if all(p in own for p in pieces): continue
            cited = norm(" ".join(fetch(r) for r in i["refs"]))
            if not all(p in cited for p in pieces):
                bad += 1; print(f"{book} {c} [{i['title']}]: \"{q}\"  refs={i['refs']}")
print(f"{bad} quotation(s) not found in the book or in the cited verses")
