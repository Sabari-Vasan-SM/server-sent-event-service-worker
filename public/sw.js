const CACHE_NAME = 'sse-sw-demo-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js'
];

// Install event: cache essential files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch event: cache-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});
