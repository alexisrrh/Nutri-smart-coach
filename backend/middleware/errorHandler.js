export function errorHandler(err, req, res, next) {
  void next;

  const statusCode = getStatusCode(err);
  const requestId = req.requestId || res.getHeader("X-Request-Id") || "unknown";
  const safeMessage = getSafeMessage(err, statusCode);

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      route: getSafeRoute(req),
      statusCode,
      errorCode: err?.code || null,
      errorName: err?.name || "Error",
    })
  );

  res.status(statusCode).json({
    error: safeMessage,
    requestId,
  });
}

function getSafeRoute(req) {
  if (req.route?.path) {
    return `${req.baseUrl || ""}${req.route.path}`;
  }

  return req.path || "/";
}

function getStatusCode(err) {
  const statusCode = Number(err?.statusCode || err?.status);

  if (statusCode >= 400 && statusCode < 600) {
    return statusCode;
  }

  if (isForbiddenLikeError(err)) {
    return 403;
  }

  if (isAuthLikeError(err)) {
    return 401;
  }

  return 500;
}

function getSafeMessage(err, statusCode) {
  if (err?.expose === true && typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }

  if (statusCode >= 500) {
    return "Error interno del servidor.";
  }

  return "No se pudo procesar la solicitud.";
}

function isAuthLikeError(err) {
  const code = String(err?.code || "").toLowerCase();
  const message = String(err?.message || "").toLowerCase();

  return (
    code.includes("auth") ||
    code.includes("jwt") ||
    code.includes("token") ||
    message.includes("no autorizado") ||
    message.includes("unauthorized") ||
    message.includes("not authorized") ||
    message.includes("invalid token") ||
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("token")
  );
}

function isForbiddenLikeError(err) {
  const code = String(err?.code || "").toLowerCase();
  const message = String(err?.message || "").toLowerCase();

  return (
    code.includes("forbidden") ||
    message.includes("no autorizado para este usuario") ||
    message.includes("forbidden") ||
    message.includes("not allowed") ||
    message.includes("permission denied")
  );
}
