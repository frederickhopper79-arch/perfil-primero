// Perfil Primero — Service Worker v4
const CACHE_STATIC = "pp-static-v4";
const CACHE_PAGES = "pp-pages-v4";
const CACHE_API = "pp-api-v4";
const OFFLINE_URL = "/offline";

// Assets a pre-cachear en install
const PRECACHE = [
  "/",
  "/como-funciona",
  "/precios",
  "/bienvenida",
  "/offline",
  "/logo-perfil-primero.png",
  "/manifest.json",
  "/robots.txt",
];

// Estrategias
const STATIC_PATTERNS = [/\.(?:js|css|png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/];
const API_PATTERNS = [/cloudfunctions\.net/, /firebaseio\.com/, /googleapis\.com/, /identitytoolkit/];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const KEEP = [CACHE_STATIC, CACHE_PAGES, CACHE_API];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar: auth Firebase, non-GET, chrome-extension
  if (url.pathname.startsWith("/__/") || request.method !== "GET" || url.protocol === "chrome-extension:") return;

  // APIs / Cloud Functions → NetworkOnly + JSON fallback
  if (API_PATTERNS.some((p) => p.test(request.url))) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "offline", code: "NETWORK_UNAVAILABLE" }), {
          status: 503,
          headers: { "Content-Type": "application/json", "X-SW-Offline": "1" },
        })
      )
    );
    return;
  }

  // Assets estáticos → CacheFirst (son inmutables)
  if (STATIC_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Navegación → NetworkFirst (con fallback offline)
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Mismo origen, otros → StaleWhileRevalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, CACHE_PAGES));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_PAGES);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline ?? new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached ?? (await fetchPromise) ?? new Response("Not found", { status: 404 });
}

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "pp-retry-queue") {
    event.waitUntil(flushRetryQueue());
  }
  if (event.tag === "pp-analytics-flush") {
    event.waitUntil(flushAnalytics());
  }
});

async function flushRetryQueue() {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SW_SYNC_READY" });
  }
}

async function flushAnalytics() {
  // Vaciar cola de eventos de analytics guardados offline
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SW_ANALYTICS_FLUSH" });
  }
}

// ── Periodic Background Sync ──────────────────────────────────────────────────
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "pp-daily-sync") {
    event.waitUntil(dailySync());
  }
});

async function dailySync() {
  // Notificar a cliente que hay sync disponible (actualizar matches, etc.)
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SW_DAILY_SYNC" });
  }
}

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: "Perfil Primero", body: event.data.text() }; }

  const options = {
    body: payload.body || "",
    icon: "/logo-perfil-primero.png",
    badge: "/logo-perfil-primero.png",
    image: payload.image,
    tag: payload.tag || "pp-notification",
    renotify: Boolean(payload.renotify),
    data: { url: payload.url || "/" },
    requireInteraction: Boolean(payload.requireInteraction),
    silent: Boolean(payload.silent),
    vibrate: payload.vibrate ?? [200, 100, 200],
    actions: payload.actions ?? [
      { action: "view", title: "Ver" },
      { action: "dismiss", title: "Descartar" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Perfil Primero", options)
  );
});

// ── Notification Click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  const { action } = event;
  event.notification.close();

  if (action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ── Message handler ───────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CACHE_WARM") {
    const urls = event.data.urls ?? [];
    caches.open(CACHE_PAGES).then((cache) =>
      Promise.allSettled(urls.map((url) => cache.add(url)))
    );
  }
  if (event.data?.type === "CACHE_CLEAR") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
