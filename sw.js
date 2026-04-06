const CACHE_NAME = 'boveda-personal-v2'; // ← bumpeá esto con cada deploy

const urlsToCache = [
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// 1. Install — NO skipWaiting aquí; esperamos confirmación del usuario
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache abierto.');
      return cache.addAll(urlsToCache);
    })
  );
  // Sin self.skipWaiting() — el SW esperará en "waiting"
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
  self.clients.claim();
});

// 3. Fetch — network-first para GAS, cache-first para el resto
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 4. Mensaje desde el cliente — permite activar el nuevo SW bajo demanda
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});