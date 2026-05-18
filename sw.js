const CACHE_NAME = 'lattoneria-masha-v1';
const ASSETS = [
  'https://ales99.github.io/lattoneria-masha/',
  'https://ales99.github.io/lattoneria-masha/index.html',
  'https://ales99.github.io/lattoneria-masha/manifest.json',
  'https://ales99.github.io/lattoneria-masha/icon-192.png',
  'https://ales99.github.io/lattoneria-masha/icon-512.png'
];

// Installazione: metti in cache i file principali
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Attivazione: rimuovi cache vecchie
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: prima prova dalla rete, poi dalla cache (offline fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Aggiorna la cache con la risposta fresca
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Offline: servi dalla cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback generico per navigazione offline
          return caches.match('https://ales99.github.io/lattoneria-masha/');
        });
      })
  );
});
