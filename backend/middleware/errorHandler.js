export function errorHandler(err, req, res, next) {
  void next;

  const statusCode = getStatusCode(err);
  const requestId = req.requestId || res.getHeader("X-Request-Id") || "unknown";
  const safeMessage = getSafeMessage(err, statusCode);

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      route: getSafeRoute(req),
      statusCode,
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
