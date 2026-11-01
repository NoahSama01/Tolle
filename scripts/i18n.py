"""The app's phrases, and the four language files checked against them.

  python scripts/i18n.py keys    every phrase the app shows, as the English key
  python scripts/i18n.py check   each public/i18n/<lang>.json has every key (and no stale ones), the same
                                 {0} placeholders and HTML tags as the English, and all 66 book names
  python scripts/i18n.py books   fill in each file's book names from its Bible on bible.helloao.org

A phrase is marked in index.html, landing.html or privacy.html as L`...` (a tagged template: `${x}` becomes {0}, {1}...),
a word given to plural(n,'word'), a division, note kind or highlighter name, or static markup carrying data-t or aria-label.
"""
import html, json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = (ROOT / 'public' / 'index.html').read_text(encoding='utf-8')
PAGES = ['index.html', 'landing.html', 'privacy.html']  # the app, then the two pages words.js translates
LANGS = {'hi': 'hin_cvb', 'ta': 'tam_irv', 'ml': 'mal_irv', 'te': 'tel_irv'}  # the Bible each language's book names come from


def skip_string(s, i):  # i on the opening quote; returns the index after the closing one
    q = s[i]; i += 1
    while s[i] != q:
        i += 2 if s[i] == '\\' else 1
    return i + 1


def skip_expr(s, i):  # i just after ${; returns the index after its closing }
    depth = 1
    while depth:
        c = s[i]
        if c in '\'"':
            i = skip_string(s, i); continue
        if c == '`':
            i = template(s, i + 1)[1]; continue
        depth += c == '{'
        depth -= c == '}'
        i += 1
    return i


def template(s, i):  # i just after the opening backtick; returns (key, index after the closing backtick)
    parts, cur = [], ''
    while True:
        if s[i] == '\\':
            cur += s[i + 1]; i += 2
        elif s[i] == '`':
            return ''.join(p + '{%d}' % k for k, p in enumerate(parts)) + cur, i + 1
        elif s.startswith('${', i):
            parts.append(cur); cur = ''; i = skip_expr(s, i + 2)
        else:
            cur += s[i]; i += 1


def keys():
    out = []
    for name in PAGES:
        page = (ROOT / 'public' / name).read_text(encoding='utf-8')
        cut = page.index('<script>\nconst BOOKS') if name == 'index.html' else page.index('<script')
        script, markup = page[cut:], page[page.index('<body>') if name == 'index.html' else 0:cut]
        out += [template(script, m.end())[0] for m in re.finditer(r'(?<![\w$\\])L`', script)]
        out += [m[1] for m in re.finditer(r'L\\`(.*?)\\`', script)]  # inside an onclick: L\`...\`
        for w in set(re.findall(r"plural\([^;]*?,'([^']+)'\)", script)):
            out += ['{0} ' + w, '{0} ' + w + 's']
        # data-t: the element's text, or its HTML when it holds a link or other markup (as words.js looks it up)
        out += [c if '<' in c else html.unescape(c) for _, c in re.findall(r'<(\w+)\b[^>]*\bdata-t\b[^>]*>(.*?)</\1>', markup, re.S)]
        out += [html.unescape(a) for a in re.findall(r'aria-label="([^"]+)"', markup) + re.findall(r'placeholder="([^"]+)"', markup)]
    script = HTML[HTML.index('<script>\nconst BOOKS'):]
    out += [x for b in re.findall(r"\['\w+','([^']+)',\d+,[.\d]+,'#\w+','([^']+)'\]", re.search(r'const BEDS=.*?;', script)[0]) for x in b]
    out += re.findall(r"\w+:\['([^']+)','\w+'\]", re.search(r'const KINDS=\{.*?\};', script)[0])
    out += re.findall(r"\['\w+','(\w+)'\]", re.search(r'const HUES=.*?;', script)[0])
    return sorted(set(out))


def shape(s):  # what a translation must keep: its placeholders and its tags
    return sorted(re.findall(r'\{\d\}', s)), sorted(re.findall(r'</?\w+', s))


def check():
    want, bad = keys(), 0
    for lang in LANGS:
        f = ROOT / 'public' / 'i18n' / f'{lang}.json'
        d = json.loads(f.read_text(encoding='utf-8'))
        for k in want:
            if k not in d['s']:
                print(f'{lang}: missing {k!r}'); bad += 1
            elif shape(d['s'][k]) != shape(k):
                print(f'{lang}: placeholders or tags differ in {k!r}'); bad += 1
        for k in d['s'].keys() - set(want):
            print(f'{lang}: stale {k!r}'); bad += 1
        if len(d['books']) != 66 or not all(d['books']):
            print(f'{lang}: needs 66 book names'); bad += 1
    print(f'{len(want)} phrases, {len(LANGS)} languages: ' + ('all present' if not bad else f'{bad} problems'))
    sys.exit(bool(bad))


def books():
    for lang, bible in LANGS.items():
        f = ROOT / 'public' / 'i18n' / f'{lang}.json'
        d = json.loads(f.read_text(encoding='utf-8')) if f.exists() else {'s': {}}
        with urllib.request.urlopen(f'https://bible.helloao.org/api/{bible}/books.json') as r:
            d['books'] = [b['name'].strip() for b in json.load(r)['books']]
        f.parent.mkdir(exist_ok=True)
        f.write_text(json.dumps({'books': d['books'], 's': d['s']}, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(lang, d['books'][0], d['books'][-1])


{'keys': lambda: print('\n'.join(keys())), 'check': check, 'books': books}[sys.argv[1]]()
