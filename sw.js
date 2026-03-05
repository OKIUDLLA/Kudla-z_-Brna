/* ============================================
   KUDLA Z BRNA — Service Worker
   Network First for HTML, Cache First for assets
   ============================================ */
const CACHE_NAME = 'kudla-v6';
const OFFLINE_PAGE = '/offline.html';

// Assets to pre-cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/css/style.css?v=2.7',
  '/js/main.js?v=2.7',
  '/img/logo.svg',
  '/img/favicon.png',
  '/manifest.json',
  '/offline.html'
];

// Install — pre-cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network First for HTML, Cache First for assets
self.addEventListener('fetch', e => {
  const { request } = e;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (Google Fonts, YouTube, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  // HTML pages — Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_PAGE)))
    );
    return;
  }

  // Assets — Cache First, then network
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        // Cache successful responses for local assets
        if (res.ok && request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      });
    })
  );
});
