// Service Worker for offline support
// Version: 1.2
const CACHE_VERSION = Date.now().toString();
const CACHE_NAME = `menu-app-cache-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `menu-app-data-${CACHE_VERSION}`;

const STATIC_ASSET_EXTENSIONS = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.svg',
    '.ico',
    '.json',
    '.ttf',
    '.woff',
    '.woff2'
];

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
    const isSameOrigin = url.origin === self.location.origin;
    const isStaticAsset = STATIC_ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext));

    const staleWhileRevalidate = (req, cacheName) => {
        return caches.open(cacheName).then(cache => {
            return cache.match(req).then(cached => {
                const fetchPromise = fetch(req)
                    .then(response => {
                        if (response && response.status === 200 && response.type !== 'error') {
                            cache.put(req, response.clone());
                        }
                        return response;
                    })
                    .catch(() => null);

                if (cached) {
                    return cached;
                }

                return fetchPromise.then(response => {
                    return response || cached || new Response('Offline', { status: 503 });
                });
            });
        });
    };

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

    // Navigation - network first with cache update
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put('/index.html', responseClone);
                        });
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

    // Same-origin static assets - stale-while-revalidate
    if (request.method === 'GET' && isSameOrigin && isStaticAsset) {
        event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
        return;
    }

    // Default - try cache, then network
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) {
                return cached;
            }
            return fetch(request).catch(() => new Response('Offline', { status: 503 }));
        })
    );
});
