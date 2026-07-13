const CACHE = 'bakery-v2';
const STATIC = ['/', '/index.html', '/favicon.ico', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))),
    ])
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) return;
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isHTML = url.pathname === '/' || url.pathname === '/index.html';
  const isStatic = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$/);

  if (isHTML) {
    e.respondWith(networkFirst(e.request));
  } else if (isStatic) {
    e.respondWith(cacheFirst(e.request));
  } else {
    e.respondWith(networkFirst(e.request));
  }
});

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(req, clone));
    }
    return res;
  } catch {
    return caches.match(req) || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const clone = res.clone();
    caches.open(CACHE).then((c) => c.put(req, clone));
  }
  return res;
}
