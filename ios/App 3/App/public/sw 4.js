const VERSION = "nutricoach-pwa-v1";
const SHELL_CACHE = `nutricoach-shell-${VERSION}`;
const RUNTIME_CACHE = `nutricoach-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const APP_SHELL_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/logo.png",
  "/icons/bodyscan-icon.png",
  "/icons/bodyscan.png",
  "/icons/diet-icon.png",
  "/icons/dieta.png",
  "/icons/historial-icon.png",
  "/icons/progreso-icon.png",
  "/icons/scan-comida-icon.png",
  "/icons/scan-icon.png",
];

const SAME_ORIGIN = self.location.origin;

function isSameOrigin(url) {
  return url.origin === SAME_ORIGIN;
}

function isCacheableAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    /\.(?:js|css|png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname)
  );
}

async function cacheFromHtml(html, cache) {
  const urls = new Set();
  const regex = /(?:src|href)=["']([^"']+)["']/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1];

    if (!raw || raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("#")) {
      continue;
    }

    try {
      const assetUrl = new URL(raw, SAME_ORIGIN);
      if (isSameOrigin(assetUrl) && isCacheableAsset(assetUrl)) {
        urls.add(assetUrl.href);
      }
    } catch {
      // Ignore malformed URLs.
    }
  }

  await Promise.allSettled(
    [...urls].map((assetUrl) => cache.add(assetUrl)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(APP_SHELL_URLS);

      try {
        const response = await fetch("/");
        if (response.ok) {
          await cache.put("/", response.clone());
          const html = await response.text();
          await cacheFromHtml(html, cache);
        }
      } catch {
        // Allow install to continue even if the network is unavailable.
      }

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== SHELL_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
          return Promise.resolve(false);
        }),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (!isSameOrigin(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);

          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put("/", networkResponse.clone());
          }

          return networkResponse;
        } catch {
          const cachedRoot = await caches.match("/");
          if (cachedRoot) {
            return cachedRoot;
          }

          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }

          return new Response("Offline", {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      })(),
    );
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }

        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          if (request.destination === "image") {
            const fallbackImage = await caches.match("/favicon.png");
            if (fallbackImage) {
              return fallbackImage;
            }
          }

          return Response.error();
        }
      })(),
    );
  }
});
