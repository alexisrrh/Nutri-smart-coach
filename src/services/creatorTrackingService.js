import { request } from "./apiClient";
import { finalizeReferralCodeApplication } from "./referralOnboardingService";

const STORAGE_KEY = "nutrismart_pending_creator_code";

export function normalizeCreatorTrackingCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function getStoredCreatorCode() {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(STORAGE_KEY) || "";
}

export function setStoredCreatorCode(code) {
  if (typeof window === "undefined") return "";

  const normalized = normalizeCreatorTrackingCode(code);
  if (!normalized) {
    clearStoredCreatorCode();
    return "";
  }

  window.localStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function clearStoredCreatorCode() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
}

export async function trackCreatorLinkClick(code, options = {}) {
  const normalized = normalizeCreatorTrackingCode(code);
  if (!normalized) {
    return { ok: true, tracked: false };
  }

  try {
    return await request(
      "/creators/track-click",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalized,
          visitorId: options.visitorId || null,
        }),
      },
      { operation: "registrar un clic de creador" }
    );
  } catch {
    return { ok: true, tracked: false };
  }
}

export async function applyPendingCreatorCode(options = {}) {
  const code = getStoredCreatorCode();
  if (!code) {
    return {
      applied: false,
      code: "",
      message: "",
      result: null,
    };
  }

  try {
    const result = await finalizeReferralCodeApplication(code, options);
    clearStoredCreatorCode();
    return result;
  } catch (error) {
    clearStoredCreatorCode();
    throw error;
  }
}
