const CACHE_NAME = 'messapp-cache-v1';
const urlsToCache = [
  '/MessApp/',
  '/MessApp/index.html',
  '/MessApp/styles.css',
  '/MessApp/app.js',
  '/MessApp/icon-192.png',
  '/MessApp/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});