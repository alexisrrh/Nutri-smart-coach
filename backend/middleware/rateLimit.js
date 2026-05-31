import { createHash } from "node:crypto";

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

export function createRateLimiter({
  windowMs = DEFAULT_WINDOW_MS,
  max = 100,
  name = "rate_limit",
  message = "Demasiadas peticiones. Inténtalo de nuevo en unos minutos.",
} = {}) {
  const hitsByKey = new Map();
  const safeWindowMs = Math.max(1000, Number(windowMs) || DEFAULT_WINDOW_MS);
  const safeMax = Math.max(1, Number(max) || 100);

  const cleanupInterval = setInterval(() => {
    const now = Date.now();

    for (const [key, state] of hitsByKey.entries()) {
      if (state.resetAt <= now) {
        hitsByKey.delete(key);
      }
    }
  }, safeWindowMs);

  cleanupInterval.unref?.();

  return function rateLimiter(req, res, next) {
    const key = getRateLimitKey(req, name);
    const now = Date.now();
    const currentState = hitsByKey.get(key);
    const state =
      currentState && currentState.resetAt > now
        ? currentState
        : { count: 0, resetAt: now + safeWindowMs };

    state.count += 1;
    hitsByKey.set(key, state);

    const remaining = Math.max(safeMax - state.count, 0);
    const retryAfter = Math.max(Math.ceil((state.resetAt - now) / 1000), 1);

    res.setHeader("RateLimit-Limit", String(safeMax));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));

    if (state.count <= safeMax) {
      return next();
    }

    res.setHeader("Retry-After", String(retryAfter));

    return res.status(429).json({
      error: message,
      code: "RATE_LIMITED",
      retryAfter,
      limit: {
        name,
        max: safeMax,
        windowMs: safeWindowMs,
      },
    });
  };
}

export const globalRateLimiter = createRateLimiter({
  name: "global",
  windowMs: 15 * 60 * 1000,
  max: 300,
});

export const authRateLimiter = createRateLimiter({
  name: "auth",
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Demasiados intentos de autenticación. Inténtalo de nuevo en unos minutos.",
});

export const analyzeFoodRateLimiter = createRateLimiter({
  name: "analyze_food",
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Demasiados análisis de comida en poco tiempo. Inténtalo de nuevo en unos minutos.",
});

export const generateDietRateLimiter = createRateLimiter({
  name: "generate_diet",
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Demasiadas generaciones de dieta en poco tiempo. Inténtalo de nuevo más tarde.",
});

export const checkinsRateLimiter = createRateLimiter({
  name: "checkins",
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Demasiadas peticiones de check-in en poco tiempo. Inténtalo de nuevo en unos minutos.",
});

function getRateLimitKey(req, name) {
  const userId = req.authUser?.id || "";
  const authTokenHash = getAuthorizationTokenHash(req);
  const ip =
    req.ip ||
    getForwardedIp(req) ||
    req.socket?.remoteAddress ||
    "unknown";

  return `${name}:${userId || authTokenHash || ip}`;
}

function getAuthorizationTokenHash(req) {
  const authorization = req.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return createHash("sha256").update(token).digest("hex");
}

function getForwardedIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(",")[0]?.trim() || "";
  }

  return forwardedFor?.split(",")[0]?.trim() || "";
}
