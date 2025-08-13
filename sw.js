// Service Worker for offline support and caching

const CACHE_NAME = 'parthmah-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/photos.html',
    '/bookshelf.html',
    '/404.html',
    '/styles/critical.css',
    '/styles/gallery.css',
    '/styles.css',
    '/js/bundle.js',
    '/js/gallery.js',
    '/js/bookshelf.js',
    '/components/header.html',
    '/components/footer.html',
    '/components/button.html',
    '/components/card.html',
    '/fav/favicon.svg',
    '/fav/favicon-96x96.png',
    '/fav/apple-touch-icon.png',
    '/fav/site.webmanifest'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Don't cache HTML files (except 404.html)
                                if (event.request.url.endsWith('.html') && 
                                    !event.request.url.endsWith('404.html')) {
                                    return;
                                }
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('/404.html');
                }
            })
    );
}); 