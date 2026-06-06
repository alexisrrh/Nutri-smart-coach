import { request } from "./apiClient";

const CREATOR_SHARE_TRIAL_DAYS = 15;

export async function getCreatorStatus() {
  return request("/creators/me", {}, { operation: "cargar tu panel de creadores" });
}

export async function submitCreatorApplication(payload) {
  return request(
    "/creators/apply",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        socialPlatform: payload?.socialPlatform,
        socialHandle: payload?.socialHandle,
        followersCount: payload?.followersCount,
        proofUrl: payload?.proofUrl,
      }),
    },
    { operation: "enviar tu solicitud de creador" }
  );
}

export async function copyCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un código de creador para copiar.");
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(safeCode);
    return safeCode;
  }

  throw new Error("No se pudo copiar el código.");
}

export async function shareCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un código de creador para compartir.");
  }

  const payload = {
    title: "NutriSmart Coach",
    text: buildCreatorShareText(safeCode),
    url:
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "/perfil",
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share(payload);
    return payload;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${payload.text} ${payload.url}`);
    return payload;
  }

  throw new Error("No se pudo compartir el código.");
}

export function buildCreatorShareText(code) {
  const safeCode = normalizeCreatorCode(code);
  return `Únete a NutriSmart Coach con mi código ${safeCode} y consigue ${CREATOR_SHARE_TRIAL_DAYS} días Premium gratis.`;
}

function normalizeCreatorCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}
