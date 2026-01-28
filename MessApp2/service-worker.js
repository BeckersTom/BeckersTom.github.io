// Service Worker for offline support
// Version: 1.1
const CACHE_VERSION = Date.now().toString();
const CACHE_NAME = `menu-app-cache-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `menu-app-data-${CACHE_VERSION}`;

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/images/background.png',
    '/images/header.png',
    '/images/soep.png',
    '/images/vlees.png',
    '/images/veggie.png',
    '/images/grill.png',
    '/images/groentvdw.png',
    '/fonts/Filmcryptic.ttf'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                urlsToCache.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn(`Failed to cache ${url}:`, err);
                    });
                })
            );
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // JSON data - network first with cache fallback
    if (request.method === 'GET' && url.pathname.includes('.json')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(DATA_CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
        return;
    }

    // Navigation - network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        return response;
                    }
                    return caches.match(request) || caches.match('/index.html');
                })
                .catch(() => {
                    return caches.match(request) || caches.match('/index.html');
                })
        );
        return;
    }

    // Assets - cache first
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }
            return fetch(request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return new Response('Offline', { status: 503 });
                });
        })
    );
});
