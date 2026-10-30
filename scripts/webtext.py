# Builds the World English Bible into the app: public/text/web/<book>.json, one list of verse texts per chapter.
# Chapters come from scripts/.web (bible-api.com, the text the notes are checked against); missing ones are fetched.
# Run: python scripts/webtext.py
import json, os, re, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CACHE, OUT = os.path.join(HERE, ".web"), os.path.join(ROOT, "public", "text", "web")
BOOKS = json.loads(re.search(r"const BOOKS=(\[.*?\]\]);", open(os.path.join(ROOT, "public", "index.html"), encoding="utf-8").read()).group(1))
ONE = {"Obadiah": 21, "Philemon": 25, "2 John": 13, "3 John": 14, "Jude": 25}  # bible-api reads "Jude 1" as verse 1
slug = lambda b: b.lower().replace(" ", "-")

def chapter(b, c):
    f = os.path.join(CACHE, f"{slug(b)}-{c}.json")
    if not os.path.exists(f):
        ref = f"{b} {c}:1-{ONE[b]}" if b in ONE else f"{b} {c}"
        j = json.load(urllib.request.urlopen(f"https://bible-api.com/{urllib.parse.quote(ref)}?translation=web", timeout=30))
        json.dump(j, open(f, "w", encoding="utf-8"), ensure_ascii=False); time.sleep(2.3)  # bible-api.com allows ~15 requests per 30s
    verses = json.load(open(f, encoding="utf-8"))["verses"]
    nums = [v["verse"] for v in verses]
    assert nums == list(range(1, len(nums) + 1)), f"{b} {c}: verses not 1..n: {nums[:5]}..."
    assert all(v["chapter"] == c for v in verses), f"{b} {c}: wrong chapter in cache"
    return [v["text"] for v in verses]

os.makedirs(OUT, exist_ok=True)
for b, n in BOOKS:
    json.dump([chapter(b, c) for c in range(1, n + 1)], open(os.path.join(OUT, f"{slug(b)}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(BOOKS)} books, {sum(n for _, n in BOOKS)} chapters -> {OUT}")
