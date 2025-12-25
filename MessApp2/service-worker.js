// Service Worker for offline support
// Update version timestamp to force cache invalidation and updates
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
    '/images/groentevdw.png',
    '/fonts/Filmcryptic.ttf'
];

// Install event - cache essential files
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

// Activate event - clean up old caches
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle data requests (JSON)
    if (request.method === 'GET' && request.headers.get('accept')?.includes('application/json')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type === 'error') {
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

    // Handle document requests
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

    // Handle other requests (CSS, JS, images, fonts)
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }
            return fetch(request)
                .then(response => {
                    // Don't cache non-successful responses
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
                    // Return a fallback for failed requests
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
        })
    );
});
