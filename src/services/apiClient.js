import { API_URL } from "../config/api";
import { supabase } from "../lib/supabase";

const DEFAULT_TIMEOUT_MS = 15000;

export async function request(path, options = {}, config = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, operation = "" } = config;
  const controller = new AbortController();
  const headers = await buildHeaders(options.headers);
  const requestOptions = { ...options, headers, signal: controller.signal };
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), requestOptions);
    const data = await parseJson(response);

    if (!response.ok) {
      throw createHttpError(response, data, operation);
    }

    return data;
  } catch (error) {
    throw normalizeRequestError(error, operation);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function buildHeaders(headers) {
  const nextHeaders = new Headers(headers || {});
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = String(path || "").replace(/^\/+/, "");

  return `${API_URL}/${cleanPath}`;
}

function createHttpError(response, data, operation) {
  const status = response.status;
  const message =
    data?.error ||
    data?.message ||
    data?.detail ||
    getFriendlyHttpMessage(status, operation);
  const error = new Error(message);

  error.status = status;
  error.code = status === 401 || status === 403 ? "SESSION_INVALID" : "HTTP_ERROR";
  error.operation = operation;
  error.data = data;

  return error;
}

function normalizeRequestError(error, operation) {
  if (error?.code === "SESSION_INVALID") {
    return error;
  }

  if (error?.name === "AbortError") {
    const timeoutError = new Error(
      getFriendlyTimeoutMessage(operation)
    );

    timeoutError.code = "REQUEST_TIMEOUT";
    timeoutError.operation = operation;

    return timeoutError;
  }

  if (isOfflineError(error)) {
    const offlineError = new Error(getFriendlyOfflineMessage(operation));

    offlineError.code = "OFFLINE";
    offlineError.operation = operation;

    return offlineError;
  }

  if (error instanceof Error) {
    return error;
  }

  const genericError = new Error(getFriendlyServerMessage(operation));

  genericError.code = "REQUEST_FAILED";
  genericError.operation = operation;

  return genericError;
}

export function getFriendlyErrorMessage(error, operation = "") {
  if (!error) return getFriendlyServerMessage(operation);

  if (error.code === "SESSION_INVALID" || isSessionError(error)) {
    return "Sesión no válida. Vuelve a iniciar sesión.";
  }

  if (error.code === "REQUEST_TIMEOUT" || error.name === "AbortError") {
    return getFriendlyTimeoutMessage(operation);
  }

  if (error.code === "OFFLINE" || isOfflineError(error)) {
    return getFriendlyOfflineMessage(operation);
  }

  if (typeof error.status === "number") {
    if (error.status === 401 || error.status === 403) {
      return "Sesión no válida. Vuelve a iniciar sesión.";
    }

    if (error.status >= 500) {
      return getFriendlyServerMessage(operation);
    }
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return getFriendlyServerMessage(operation);
}

function getFriendlyOfflineMessage(operation) {
  if (isAiOperation(operation)) {
    return "Sin conexión. La IA no pudo responder ahora mismo.";
  }

  return "Sin conexión. Revisa tu red e inténtalo de nuevo.";
}

function getFriendlyTimeoutMessage(operation) {
  if (isDietOperation(operation)) {
    return "La IA está preparando tu dieta. Puede tardar un poco más. Inténtalo de nuevo.";
  }

  if (isAiOperation(operation)) {
    return "La IA está tardando demasiado. Vuelve a intentarlo en unos segundos.";
  }

  return "La conexión está tardando demasiado. Revisa tu red e inténtalo de nuevo.";
}

function getFriendlyServerMessage(operation) {
  if (isAiOperation(operation)) {
    return "La IA está lenta ahora mismo. Vuelve a intentarlo en unos segundos.";
  }

  if (operation) {
    return `El servidor está lento al ${operation}. Vuelve a intentarlo en unos segundos.`;
  }

  return "El servidor está lento. Vuelve a intentarlo en unos segundos.";
}

function getFriendlyHttpMessage(status, operation) {
  if (status === 401 || status === 403) {
    return "Sesión no válida. Vuelve a iniciar sesión.";
  }

  if (status === 408 || status === 504) {
    return getFriendlyTimeoutMessage(operation);
  }

  if (status === 429) {
    return "Demasiadas peticiones. Espera unos segundos e inténtalo otra vez.";
  }

  if (status >= 500) {
    return getFriendlyServerMessage(operation);
  }

  return "No se pudo completar la solicitud.";
}

function isOfflineError(error) {
  if (!error) return false;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  const message = String(error.message || "").toLowerCase();

  return (
    error instanceof TypeError ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed")
  );
}

function isSessionError(error) {
  const message = String(error.message || "").toLowerCase();

  return (
    message.includes("session") ||
    message.includes("jwt") ||
    message.includes("token") ||
    message.includes("invalid login") ||
    message.includes("not authenticated") ||
    message.includes("auth session missing")
  );
}

function isAiOperation(operation) {
  const normalized = String(operation || "").toLowerCase();

  return (
    normalized.includes("ia") ||
    normalized.includes("análisis") ||
    normalized.includes("analisis") ||
    normalized.includes("analizar")
  );
}

function isDietOperation(operation) {
  const normalized = String(operation || "").toLowerCase();

  return normalized.includes("dieta");
}
