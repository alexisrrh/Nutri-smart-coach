import {
  applyReferralCode as applyReferralCodeRequest,
  validateReferralCode as validateReferralCodeRequest,
} from "./referralService";
import { trackEvent } from "./analytics";

const STORAGE_KEY = "nutrismart_referral_code";
const OAUTH_PENDING_KEY = "nutrismart_referral_oauth_pending";

export function getStoredReferralCode() {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(STORAGE_KEY) || "";
}

export function setStoredReferralCode(code) {
  if (typeof window === "undefined") return;

  const normalizedCode = normalizeReferralCode(code);
  if (normalizedCode) {
    window.localStorage.setItem(STORAGE_KEY, normalizedCode);
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function clearStoredReferralCode() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
}

export function markOAuthReferralFlowPending() {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(OAUTH_PENDING_KEY, "1");
}

export function clearOAuthReferralFlowPending() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(OAUTH_PENDING_KEY);
}

export function isOAuthReferralFlowPending() {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(OAUTH_PENDING_KEY) === "1";
}

export function prepareOAuthReferralCode(code) {
  if (typeof window === "undefined") return "";

  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) {
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
    return "";
  }

  setStoredReferralCode(normalizedCode);
  markOAuthReferralFlowPending();
  return normalizedCode;
}

export function normalizeReferralCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function getReferralApplyOutcome(result) {
  if (result?.referral?.type === "creator") {
    return {
      eventName: "creator_code_applied",
      message: "Código de creador aplicado. 15 días Premium gratis.",
    };
  }

  if (result?.referral?.type === "influencer") {
    return {
      eventName: "influencer_code_applied",
      message: "🎉 Has desbloqueado 15 días Premium gratis",
    };
  }

  return {
    eventName: "referral_code_applied",
    message: "Invitación aplicada correctamente",
  };
}

export async function finalizeReferralCodeApplication(code, options = {}) {
  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) {
    return {
      applied: false,
      code: "",
      message: "",
      result: null,
    };
  }

  const applyReferralCodeFn =
    options.applyReferralCodeFn || applyReferralCodeRequest;
  const trackEventFn = options.trackEventFn || trackEvent;

  try {
    const result = await applyReferralCodeFn(normalizedCode);
    const outcome = getReferralApplyOutcome(result);

    trackEventFn(outcome.eventName, { code: normalizedCode });

    return {
      applied: true,
      code: normalizedCode,
      result,
      ...outcome,
    };
  } catch (error) {
    trackEventFn("referral_code_invalid", { code: normalizedCode });

    const message =
      error?.message ||
      "El código de invitación no es válido o ya no está disponible.";

    const nextError = new Error(message);
    nextError.status = error?.status;
    nextError.code = error?.code;
    nextError.data = error?.data;
    throw nextError;
  }
}

export async function validateAndStoreReferralCode(code, options = {}) {
  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) {
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
    return {
      valid: false,
      type: null,
      trialDays: 0,
      code: "",
      message: "Código no válido o expirado.",
    };
  }

  const validateReferralCodeFn =
    options.validateReferralCodeFn || validateReferralCodeRequest;

  const result = await validateReferralCodeFn(normalizedCode);

  if (!result?.valid) {
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
    return {
      valid: false,
      type: null,
      trialDays: 0,
      code: normalizedCode,
      message: "Código no válido o expirado.",
    };
  }

  setStoredReferralCode(normalizedCode);
  clearOAuthReferralFlowPending();

  return {
    valid: true,
    type: result.type,
    trialDays: Number(result.trialDays || 0),
    code: normalizedCode,
    message:
      result.type === "creator"
        ? `Código aplicado al crear tu cuenta. ${Number(result.trialDays || 15)} días Premium gratis.`
        : result.type === "influencer"
        ? `Código aplicado al crear tu cuenta. ${Number(result.trialDays || 15)} días Premium gratis.`
        : "Código aplicado al crear tu cuenta.",
  };
}

export async function applyPendingOAuthReferralCode(options = {}) {
  if (!isOAuthReferralFlowPending()) {
    return {
      applied: false,
      code: "",
      message: "",
      result: null,
    };
  }

  const code = getStoredReferralCode();
  if (!code) {
    clearOAuthReferralFlowPending();
    return {
      applied: false,
      code: "",
      message: "",
      result: null,
    };
  }

  try {
    const result = await finalizeReferralCodeApplication(code, options);
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
    return result;
  } catch (error) {
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
    throw error;
  }
}
