const CACHE = 'blueprint-v3.86';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './dict.json',
  './form_dict.json',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(ASSETS.map((u) => c.add(u).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  if (isDoc) {
    // HTML は network-first。HTTP キャッシュも避けて常に最新を取得（no-store）。失敗時のみキャッシュへ。
    e.respondWith(
      fetch(new Request(req.url, {cache: 'no-store'})).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html').then((h) => h || caches.match('./')))
    );
    return;
  }
  // dict / form_dict / names_ja / blocktex は network-first（MOD から sync した最新を常に反映。オフラインのみキャッシュ）
  if (/\/(dict|form_dict|names_ja|blocktex)\.json$/.test(new URL(req.url).pathname)) {
    e.respondWith(
      fetch(new Request(req.url, {cache: 'no-store'})).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // 静的資産（three.js / icon / manifest / assets/blocks の画像）は cache-first。
  // 200 以外（404 等）はキャッシュしない＝配信遅延中の 404 でキャッシュが汚染されるのを防ぐ。
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      })
    )
  );
});
