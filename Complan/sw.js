const CACHE_NAME = 'rx-complan-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './mobile/style/style.css',
  './mobile/style/player.css',
  './mobile/style/phoneTemplate.css',
  './mobile/style/template.css',
  './mobile/javascript/jquery-3.5.1.min.js',
  './mobile/javascript/config.js',
  './mobile/javascript/search_config.js',
  './mobile/javascript/bookmark_config.js',
  './mobile/javascript/LoadingJS.js',
  './mobile/javascript/main.js',
  './files/basic-html/index.html',
  './shot.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache install failed:', err);
        // Continue even if some resources fail to cache
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.allSettled(
            urlsToCache.map(url => cache.add(url))
          );
        });
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
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Cache additional magazine content when online
  return caches.open(CACHE_NAME).then(cache => {
    const additionalUrls = [
      './files/thumb/',
      './files/page/',
      './files/large/'
    ];
    
    return Promise.allSettled(
      additionalUrls.map(url => 
        fetch(url).then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        }).catch(() => {
          // Ignore errors for optional content
        })
      )
    );
  });
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
