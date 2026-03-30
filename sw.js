const CACHE_NAME = 'boveda-personal-v1';

const urlsToCache = [
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// 1. Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache abierto.');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activa de inmediato sin esperar
});

// 2. Activate — limpia caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim(); // Toma control de las pestañas abiertas de inmediato
});

// 3. Fetch — cache-first, pero deja pasar peticiones externas
self.addEventListener('fetch', event => {
  // No interceptar peticiones cross-origin (GAS, Google APIs, CDNs)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});