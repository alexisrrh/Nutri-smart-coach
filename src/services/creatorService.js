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

export async function copyCreatorLink(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un enlace de creador para copiar.");
  }

  const creatorLink = buildCreatorJoinLink(safeCode);

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(creatorLink);
    return creatorLink;
  }

  throw new Error("No se pudo copiar el enlace.");
}

export async function shareCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un código de creador para compartir.");
  }

  const creatorLink = buildCreatorJoinLink(safeCode);
  const payload = {
    title: "NutriSmart Coach",
    text: buildCreatorShareText(safeCode),
    url: creatorLink,
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

export function buildCreatorJoinLink(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) return "https://nutrismartcoach.com/join";

  const baseUrl = String(
    import.meta.env.VITE_CREATOR_JOIN_BASE_URL ||
      import.meta.env.VITE_APP_URL ||
      import.meta.env.VITE_SITE_URL ||
      "https://nutrismartcoach.com"
  ).replace(/\/+$/, "");

  return `${baseUrl}/join?creator=${encodeURIComponent(safeCode)}`;
}

function normalizeCreatorCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}
