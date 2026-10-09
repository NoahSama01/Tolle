// Offline support.
// App files + insights: stale-while-revalidate, so weak signal never blocks the app
// (an update shows on the next launch).
// Scripture text: cache first, since it never changes.
const APP = 'app-v23', TEXT = 'text';
const SHELL = ['./', 'landing.html', 'tokens.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'board-grain.png',
  ...['archivo-400-800', 'eb-garamond', 'jetbrains-mono'].map(f => `fonts/${f}.woff2`)];
const put = (name, req, res) => { if (res.ok) { const c = res.clone(); caches.open(name).then(x => x.put(req, c)) } return res };

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => ![APP, TEXT].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin === location.origin) {
    const net = fetch(req).then(r => put(APP, req, r));
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(req).then(m => m || net));
  }
  else if (url.host === 'bible-api.com') e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => put(TEXT, req, r))));
});
