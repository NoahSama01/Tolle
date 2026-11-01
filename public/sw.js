// Offline support.
// App files + insights: stale-while-revalidate, so weak signal never blocks the app
// (an update shows on the next launch).
// Scripture text, built in (text/) or fetched: cache first, since it never changes.
const APP = 'app-v41', TEXT = 'text', VOTD = 'votd'; // VOTD: the week of verses the page sets aside, read for the verse-of-the-day push
const SHELL = ['./', 'landing.html', 'tokens.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'board-grain.png',
  ...['archivo-400-800', 'eb-garamond', 'jetbrains-mono'].map(f => `fonts/${f}.woff2`)];
const put = (name, req, res) => { if (res.ok) { const c = res.clone(); caches.open(name).then(x => x.put(req, c)) } return res };

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => ![APP, TEXT, VOTD].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// The local date as the page writes it (YYYY-MM-DD)
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` };
// Today's verse from the week the page set aside; the push itself carries no verse, since each reader's differs
const verseNote = () => caches.match('votd.json').then(r => r ? r.json() : []).catch(() => []).then(q => {
  const v = q.find(x => x.d === today() && x.t);
  return v ? { title: v.r, body: v.t, tag: 'tolle-verse' } : { title: 'A verse for today', body: "Today's verse is waiting in Tolle.", tag: 'tolle-verse' };
});
// Daily reminder and verse of the day: shown even with Tolle closed; a tap opens Tolle, or brings it forward if it's open
self.addEventListener('push', e => {
  const m = e.data ? e.data.json() : { title: 'Tolle', body: "Today's chapters are waiting." };
  e.waitUntil((m.kind === 'verse' ? verseNote() : Promise.resolve({ ...m, tag: 'tolle-daily' }))
    .then(n => self.registration.showNotification(n.title, { body: n.body, icon: 'icon-192.png', badge: 'icon-192.png', tag: n.tag })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(ws => ws[0] ? ws[0].focus() : self.clients.openWindow('./')));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin === location.origin && url.pathname.includes('/text/')) e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => put(TEXT, req, r))));
  else if (url.origin === location.origin) {
    const net = fetch(req).then(r => put(APP, req, r));
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(req).then(m => m || net));
  }
  else if (url.host === 'bible-api.com' || url.host === 'bible.helloao.org') e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => put(TEXT, req, r))));
});
