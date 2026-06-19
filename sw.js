const CACHE_NAME = 'drivelogger-v4';
const ASSETS = [
    'index.html',
    'app-logo.png',
    'manifest.json'
];

// Install event – cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event – clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event – serve cached assets, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                // Return cached version if available, otherwise fetch from network
                return cached || fetch(event.request)
                    .then(response => {
                        // Clone and cache new responses (optional)
                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline fallback
                        return new Response('Offline – please connect to the internet.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});
