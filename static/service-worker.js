/**
 * Service Worker for AMK Command Center
 * Provides offline support, caching, and background sync
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `amk-cc-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/daily",
  "/urgent",
  "/people",
  "/metrics",
  "/offline",
  "/manifest.json",
];

// Routes that should always go network-first
const NETWORK_FIRST_ROUTES = ["/api/", "/auth/"];

// Routes that should be cached
const CACHE_FIRST_ROUTES = ["/assets/", "/_app/", "/fonts/", "/images/"];

/**
 * Install event - cache critical assets
 */
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Precaching assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log("[ServiceWorker] Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[ServiceWorker] Installation failed:", error);
      }),
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[ServiceWorker] Activation complete");
        return self.clients.claim();
      }),
  );
});

/**
 * Fetch event - handle network requests with caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Network-first strategy for API routes
  if (NETWORK_FIRST_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first with cache fallback for everything else
  event.respondWith(networkFirst(request));
});

/**
 * Network-first strategy: Try network, fall back to cache, then offline page
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[ServiceWorker] Network failed, trying cache:", request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/offline");
      if (offlinePage) {
        return offlinePage;
      }
    }

    // Return a basic offline response
    return new Response("Offline - No cached version available", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({
        "Content-Type": "text/plain",
      }),
    });
  }
}

/**
 * Cache-first strategy: Try cache, fall back to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[ServiceWorker] Cache and network failed:", error);
    return new Response("Resource not available offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Background sync for draft entries
 */
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync triggered:", event.tag);

  if (event.tag === "sync-drafts") {
    event.waitUntil(syncDrafts());
  }
});

/**
 * Sync draft entries with server
 */
async function syncDrafts() {
  try {
    // Get pending drafts from IndexedDB or localStorage
    const drafts = await getPendingDrafts();

    for (const draft of drafts) {
      try {
        const response = await fetch("/api/entries/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        });

        if (response.ok) {
          await removePendingDraft(draft.id);
          console.log("[ServiceWorker] Draft synced:", draft.id);
        }
      } catch (error) {
        console.error("[ServiceWorker] Failed to sync draft:", error);
      }
    }

    console.log("[ServiceWorker] Drafts sync complete");
  } catch (error) {
    console.error("[ServiceWorker] Sync failed:", error);
  }
}

/**
 * Open IndexedDB database
 */
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("amk-command-center-offline", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("drafts")) {
        const draftStore = db.createObjectStore("drafts", { keyPath: "id" });
        draftStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains("voice-recordings")) {
        const voiceStore = db.createObjectStore("voice-recordings", {
          keyPath: "id",
        });
        voiceStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains("pending-requests")) {
        const requestStore = db.createObjectStore("pending-requests", {
          keyPath: "id",
        });
        requestStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

/**
 * Get pending drafts from IndexedDB
 */
async function getPendingDrafts() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(["drafts"], "readonly");
    const store = transaction.objectStore("drafts");

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[ServiceWorker] Failed to get drafts:", error);
    return [];
  }
}

/**
 * Remove synced draft from IndexedDB
 */
async function removePendingDraft(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(["drafts"], "readwrite");
    const store = transaction.objectStore("drafts");

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        console.log("[ServiceWorker] Draft removed:", id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[ServiceWorker] Failed to remove draft:", error);
  }
}

/**
 * Push notification handler
 */
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push notification received:", event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || "AMK Command Center";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-96.png",
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Notification click handler
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification clicked:", event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      }),
  );
});

console.log("[ServiceWorker] Script loaded");
