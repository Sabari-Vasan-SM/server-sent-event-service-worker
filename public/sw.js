// sw.js
// ---
// Service Worker for offline caching (cache-first strategy)
// 1. Caches app shell (index.html, app.js)
// 2. Loads from cache when offline
// 3. Cleans up old caches on activate
// 4. Handles fetch with cache-first logic

const CACHE_NAME = 'live-counter-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js'
];

// Install event: cache app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting(); // Activate worker immediately
});

// Activate event: cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim(); // Take control of all clients
});

// Fetch event: cache-first strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    // Ignore SSE and API endpoints
    if (url.pathname.startsWith('/events') || url.pathname.startsWith('/chat') || url.pathname.startsWith('/admin')) {
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cached =>
            cached || fetch(event.request).catch(() => {
                // Fallback to cache if offline
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
        )
    );
});
