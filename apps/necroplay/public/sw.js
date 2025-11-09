/**
 * Service Worker for NecroPlay PWA
 * Provides offline support and caching
 */

const CACHE_NAME = "necroplay-v1";
const RUNTIME_CACHE = "necroplay-runtime-v1";
const STATIC_CACHE = "necroplay-static-v1";

// Files to cache on install
const STATIC_FILES = [
  "/",
  "/manifest.json",
  "/offline.html",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log("[Service Worker] Caching static files");
      // Cache files individually to handle failures gracefully
      const cachePromises = STATIC_FILES.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
            console.log("[Service Worker] Cached:", url);
          } else {
            console.warn("[Service Worker] Failed to cache (not ok):", url);
          }
        } catch (error) {
          console.warn("[Service Worker] Failed to cache:", url, error);
          // Continue even if one file fails
        }
      });
      await Promise.allSettled(cachePromises);
      console.log("[Service Worker] Static files caching completed");
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== RUNTIME_CACHE && name !== CACHE_NAME;
          })
          .map((name) => {
            console.log("[Service Worker] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Handle pages with network-first strategy
  event.respondWith(networkFirst(request));
});

/**
 * Network-first strategy: try network, fallback to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    throw new Error("Network response not ok");
  } catch (error) {
    console.log("[Service Worker] Network failed, trying cache:", request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // If it's a navigation request, return offline page
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/offline.html");
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy: try cache, fallback to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    // Check if response is ok and not an error
    if (response && response.status >= 200 && response.status < 400) {
      const cache = await caches.open(STATIC_CACHE);
      // Clone response before caching (responses can only be read once)
      cache.put(request, response.clone());
      return response;
    }
    // If response is not ok, try to return cached version if available
    const cachedFallback = await caches.match(request);
    if (cachedFallback) {
      return cachedFallback;
    }
    throw new Error(`Network response not ok: ${response?.status || 'unknown'}`);
  } catch (error) {
    console.warn("[Service Worker] Cache and network failed:", request.url, error);
    // Try to return cached version as last resort
    const cachedFallback = await caches.match(request);
    if (cachedFallback) {
      return cachedFallback;
    }
    // For static assets, we can return a minimal response instead of throwing
    if (request.url.includes('.svg') || request.url.includes('.png') || request.url.includes('.ico')) {
      console.warn("[Service Worker] Returning empty response for failed asset:", request.url);
      return new Response('', { status: 404, statusText: 'Not Found' });
    }
    throw error;
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);
  
  if (event.tag === "sync-files") {
    event.waitUntil(syncFiles());
  }
});

/**
 * Sync files when back online
 */
async function syncFiles() {
  // In a full implementation, this would sync uploaded files
  // when the device comes back online
  console.log("[Service Worker] Syncing files...");
}

/**
 * Push notification handler
 */
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || "NecroPlay";
  const options = {
    body: data.body || "New notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: data.url || "/",
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked");
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || "/")
  );
});

