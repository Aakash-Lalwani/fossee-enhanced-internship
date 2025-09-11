/**
 * Service Worker for FOSSEE Workshops PWA
 * Features: Offline functionality, caching, background sync
 */

const CACHE_NAME = 'fossee-workshops-v1.0.0';
const STATIC_CACHE_NAME = 'fossee-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'fossee-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/index-offline.html',
  '/styles.css',
  '/script.js',
  '/dark-mode.js',
  '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network and cache dynamic content
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not a successful response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();
            
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Fallback for offline - serve offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index-offline.html');
            }
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'workshop-registration') {
    event.waitUntil(syncWorkshopRegistration());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New workshop available!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Workshops',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FOSSEE Workshops', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#workshops')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper functions
async function syncWorkshopRegistration() {
  try {
    // Get queued registrations from IndexedDB
    const registrations = await getQueuedRegistrations();
    
    for (const registration of registrations) {
      try {
        // Attempt to submit registration
        await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registration.data)
        });
        
        // Remove from queue if successful
        await removeFromQueue(registration.id);
        
        // Show success notification
        await self.registration.showNotification('Registration Successful', {
          body: `Your registration for ${registration.data.workshopName} has been submitted!`,
          icon: '/icon-192.png'
        });
        
      } catch (error) {
        console.error('Failed to sync registration:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getQueuedRegistrations() {
  // This would typically use IndexedDB to store offline data
  // For demo purposes, returning empty array
  return [];
}

async function removeFromQueue(id) {
  // Remove registration from IndexedDB queue
  console.log('Removing registration from queue:', id);
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  const startTime = performance.now();
  
  event.respondWith(
    handleFetchRequest(event.request)
      .then((response) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log performance metrics
        console.log(`Request for ${event.request.url} took ${duration}ms`);
        
        return response;
      })
  );
});

async function handleFetchRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return await fetch(request);
  } catch (error) {
    console.error('Fetch failed:', error);
    
    // Return offline fallback
    if (request.destination === 'document') {
      return await caches.match('/index-offline.html');
    }
    
    throw error;
  }
}
