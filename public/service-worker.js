/* Service Worker for Averqon+ PWA */

const CACHE_NAME = 'averqon-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Skip caching for:
  // 1. Non-GET requests
  // 2. Firebase/Firestore
  // 3. Automation Backend (to avoid CORS issues with SW)
  const isBackend = event.request.url.includes('averqonbill.onrender.com') || 
                    event.request.url.includes('localhost:5000');

  if (event.request.method !== 'GET' || 
      event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase') ||
      isBackend) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful GET responses
        // Note: type 'opaque' or 'cors' is for cross-origin, 'basic' is same-origin
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(err => {
              console.log('[Service Worker] Cache put failed:', err);
            });
          });
        }
        
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // If not in cache and network fails, we must return a valid Response or let it fail
        // For navigation requests, we might return a custom error page
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        // Final fallback: return a 503 error response
        return new Response('Network error occurred', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

// Listen for push events from Firebase Cloud Messaging
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  
  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
    return;
  }

  const title = data.title || data.notification?.title || 'Averqon+ Notification';
  const options = {
    body: data.body || data.notification?.body || 'You have a new notification',
    icon: data.icon || data.notification?.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'averqon-notification',
    requireInteraction: data.priority === 'HIGH',
    data: {
      url: data.click_action || data.notification?.click_action || '/',
      notificationId: data.notificationId,
      entityType: data.entityType,
      entityId: data.entityId
    },
    actions: data.actions || []
  };

  // Add priority-based styling
  if (data.priority === 'HIGH') {
    options.badge = '/icon-192.png';
    options.requireInteraction = true;
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const targetUrl = event.notification.data.url || '/';
  const fullUrl = self.location.origin + targetUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            // Navigate existing window to the target URL
            return client.focus().then(() => {
              return client.navigate(fullUrl);
            });
          }
        }
        
        // No window open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
  
  // Optional: Track notification dismissal analytics
  const notificationData = event.notification.data;
  if (notificationData && notificationData.notificationId) {
    // Could send analytics here
    console.log('[Service Worker] Notification dismissed:', notificationData.notificationId);
  }
});

// Background Sync (for offline actions)
self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Sync any pending notification reads/dismissals
    console.log('[Service Worker] Syncing notifications...');
    // Implementation would go here
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[Service Worker] Loaded successfully');
