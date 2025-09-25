const CACHE_NAME = 'rx-lifestyle-v' + Date.now(); // Dynamic cache name for automatic updates
const STATIC_CACHE = 'rx-lifestyle-static-v5';
const API_CACHE = 'rx-lifestyle-api-v5';
const urlsToCache = [
  './',
  './index.html',
  './auth.html',
  './dashboard.html',
  './admin.html',
  './subscription.html',
  './manifest.json',
  './pwa-install.js',
  './js/api-client.js',
  './Complan/index.html',
  './Products/index.html',
  './Complan/manifest.json',
  './Products/manifest.json',
  './Complan/Complan_ico.png',
  './Products/Product_ico.png',
  './Complan/shot.png',
  './Products/shot.png',
  './Complan/files/shot.png',
  './Products/files/shot.png',
  './Complan/files/config.xml',
  './Products/files/config.xml',
  
  // CSS Files
  './Complan/mobile/style/style.css',
  './Complan/mobile/style/player.css',
  './Complan/mobile/style/phoneTemplate.css',
  './Complan/mobile/style/template.css',
  './Products/mobile/style/style.css',
  './Products/mobile/style/player.css',
  './Products/mobile/style/phoneTemplate.css',
  './Products/mobile/style/template.css',
  
  // JavaScript Files - Core
  './Complan/mobile/javascript/jquery-3.5.1.min.js',
  './Products/mobile/javascript/jquery-3.5.1.min.js',
  './Complan/mobile/javascript/config.js',
  './Products/mobile/javascript/config.js',
  './Complan/mobile/javascript/main.js',
  './Products/mobile/javascript/main.js',
  './Complan/mobile/javascript/LoadingJS.js',
  './Products/mobile/javascript/LoadingJS.js',
  './Complan/mobile/javascript/search_config.js',
  './Products/mobile/javascript/search_config.js',
  './Complan/mobile/javascript/bookmark_config.js',
  './Products/mobile/javascript/bookmark_config.js',
  './Complan/mobile/javascript/flv.min.js',
  './Products/mobile/javascript/flv.min.js',
  './Complan/mobile/javascript/html2canvas.min.js',
  './Products/mobile/javascript/html2canvas.min.js',
  
  // Favicons
  './Complan/favicons_folder/android-chrome-192x192.png',
  './Complan/favicons_folder/android-chrome-512x512.png',
  './Complan/favicons_folder/apple-touch-icon.png',
  './Complan/favicons_folder/favicon.ico',
  './Complan/favicons_folder/favicon-16x16.png',
  './Complan/favicons_folder/favicon-32x32.png',
  './Products/favicons_folder/android-chrome-192x192.png',
  './Products/favicons_folder/android-chrome-512x512.png',
  './Products/favicons_folder/apple-touch-icon.png',
  './Products/favicons_folder/favicon.ico',
  './Products/favicons_folder/favicon-16x16.png',
  './Products/favicons_folder/favicon-32x32.png',
  
  // Background images and external files
  './Complan/files/extfiles/mainbgImgUrl.jpg',
  './Products/files/extfiles/mainbgImgUrl.jpg',
  './Complan/files/mobile-ext/backGroundImgURL.jpg',
  './Products/files/mobile-ext/backGroundImgURL.jpg',
  
  // Basic HTML navigation images
  './Complan/files/basic-html/images/bottom_bg.jpg',
  './Complan/files/basic-html/images/content.png',
  './Complan/files/basic-html/images/middle_bg.jpg',
  './Complan/files/basic-html/images/next.png',
  './Complan/files/basic-html/images/next2.png',
  './Complan/files/basic-html/images/next_big.png',
  './Complan/files/basic-html/images/previous.png',
  './Complan/files/basic-html/images/previous2.png',
  './Complan/files/basic-html/images/previous_big.png',
  './Complan/files/basic-html/images/top_bg.jpg',
  './Complan/files/basic-html/images/view.png',
  './Products/files/basic-html/images/bottom_bg.jpg',
  './Products/files/basic-html/images/content.png',
  './Products/files/basic-html/images/middle_bg.jpg',
  './Products/files/basic-html/images/next.png',
  './Products/files/basic-html/images/next2.png',
  './Products/files/basic-html/images/next_big.png',
  './Products/files/basic-html/images/previous.png',
  './Products/files/basic-html/images/previous2.png',
  './Products/files/basic-html/images/previous_big.png',
  './Products/files/basic-html/images/top_bg.jpg',
  './Products/files/basic-html/images/view.png',
  
  // Basic HTML pages
  './Complan/files/basic-html/index.html',
  './Products/files/basic-html/index.html'
];

// Generate ALL slide images and pages for Complan (1-37 pages)
for (let i = 1; i <= 37; i++) {
  urlsToCache.push(`./Complan/mobile/javascript/text_position[${i}].js`);
  urlsToCache.push(`./Complan/files/mobile/${i}.jpg`);
  urlsToCache.push(`./Complan/files/thumb/${i}.jpg`);
  urlsToCache.push(`./Complan/files/basic-html/page${i}.html`);
}

// Generate ALL slide images and pages for Products (1-26 pages)  
for (let i = 1; i <= 26; i++) {
  urlsToCache.push(`./Products/mobile/javascript/text_position[${i}].js`);
  urlsToCache.push(`./Products/files/mobile/${i}.jpg`);
  urlsToCache.push(`./Products/files/thumb/${i}.jpg`);
  urlsToCache.push(`./Products/files/basic-html/page${i}.html`);
}

// Add update notification functionality
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  console.log(`Caching ${urlsToCache.length} files for complete offline access`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('Opened cache, adding all files...');
        // Cache files in batches to avoid overwhelming the browser
        const batchSize = 20;
        const batches = [];
        
        for (let i = 0; i < urlsToCache.length; i += batchSize) {
          batches.push(urlsToCache.slice(i, i + batchSize));
        }
        
        let cachedCount = 0;
        
        return batches.reduce((promise, batch, batchIndex) => {
          return promise.then(() => {
            console.log(`Caching batch ${batchIndex + 1}/${batches.length} (${batch.length} files)...`);
            
            return cache.addAll(batch).then(() => {
              cachedCount += batch.length;
              // Send progress update to main thread
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'CACHE_PROGRESS',
                    cached: cachedCount,
                    total: urlsToCache.length
                  });
                });
              });
            }).catch(err => {
              console.warn('Failed to cache some files in batch:', err);
              // Try to cache files individually if batch fails
              return Promise.allSettled(
                batch.map(url => cache.add(url).then(() => {
                  cachedCount++;
                  // Send progress update for individual files
                  self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                      client.postMessage({
                        type: 'CACHE_PROGRESS',
                        cached: cachedCount,
                        total: urlsToCache.length
                      });
                    });
                  });
                }).catch(e => console.warn(`Failed to cache ${url}:`, e)))
              );
            });
          });
        }, Promise.resolve());
      })
      .then(() => {
        console.log('All files cached successfully! App ready for offline use.');
        // Send completion message to main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_COMPLETE',
              total: urlsToCache.length
            });
          });
        });
        // Notify clients about update availability
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATE_AVAILABLE'
            });
          });
        });
      })
      .catch(err => {
        console.error('Failed to cache files:', err);
      })
  );
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Handle API requests with network-first strategy
  if (url.origin.includes('onrender.com') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If successful, cache the response for offline use
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback for auth endpoints
            if (url.pathname.includes('/auth/')) {
              return new Response(JSON.stringify({
                success: false,
                error: 'Offline - Please check your connection',
                offline: true
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            throw new Error('No cached response available');
          });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // For offline-first strategy, try to fetch and cache everything
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            var responseToCache = response.clone();

            // Cache all assets including images, PDFs, and other presentation files
            const requestUrl = event.request.url;
            if (requestUrl.includes('/files/') || 
                requestUrl.includes('/mobile/') || 
                requestUrl.includes('.js') || 
                requestUrl.includes('.css') || 
                requestUrl.includes('.png') || 
                requestUrl.includes('.jpg') || 
                requestUrl.includes('.jpeg') || 
                requestUrl.includes('.pdf') ||
                requestUrl.includes('.html')) {
              
              caches.open(STATIC_CACHE)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        ).catch(function() {
          // If fetch fails and we're offline, try to return a cached version
          // or a fallback response for essential files
          if (event.request.destination === 'document') {
            // Check if user is authenticated from localStorage
            return caches.match('./dashboard.html').then(dashboardResponse => {
              if (dashboardResponse) {
                return dashboardResponse;
              }
              return caches.match('./index.html');
            });
          }
        });
      })
    );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  var cacheWhitelist = [STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated and ready!');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});
