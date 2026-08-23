import { createHash, randomUUID } from "node:crypto";

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const requestId = getRequestId(req);

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        method: req.method,
        route: getSafeRoute(req),
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
        client: getSafeClientIdentifier(req),
      })
    );
  });

  next();
}

function getSafeRoute(req) {
  if (req.route?.path) {
    return `${req.baseUrl || ""}${req.route.path}`;
  }

  return req.path || "/";
}

function getRequestId(req) {
  const incomingRequestId = req.get("X-Request-Id")?.trim();

  if (incomingRequestId && incomingRequestId.length <= 128) {
    return incomingRequestId;
  }

  return randomUUID();
}

function getSafeClientIdentifier(req) {
  const ip =
    req.ip ||
    getForwardedIp(req) ||
    req.socket?.remoteAddress ||
    "unknown";

  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function getForwardedIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(",")[0]?.trim() || "";
  }

  return forwardedFor?.split(",")[0]?.trim() || "";
}
