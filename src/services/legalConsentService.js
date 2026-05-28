import { STORAGE_KEYS } from "../config/storageKeys";

const LEGAL_VERSION = "2026-05-27";

export function buildAcceptedLegalConsent() {
  const now = new Date().toISOString();

  return {
    accepted_terms: true,
    accepted_terms_at: now,
    accepted_privacy: true,
    accepted_privacy_at: now,
    accepted_data_policy: true,
    accepted_data_policy_at: now,
    legal_version: LEGAL_VERSION,
  };
}

export function setPendingLegalConsent(consent = buildAcceptedLegalConsent()) {
  sessionStorage.setItem(STORAGE_KEYS.LEGAL_CONSENT, JSON.stringify(consent));
}

export function getPendingLegalConsent() {
  const raw = sessionStorage.getItem(STORAGE_KEYS.LEGAL_CONSENT);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
}

export function hasPendingLegalConsent() {
  return Boolean(getPendingLegalConsent());
}

export function consumePendingLegalConsent() {
  const consent = getPendingLegalConsent();
  sessionStorage.removeItem(STORAGE_KEYS.LEGAL_CONSENT);
  return consent;
}

export function mergePendingLegalConsent(profile) {
  const consent = getPendingLegalConsent();
  if (!consent) return profile;

  return {
    ...profile,
    ...consent,
  };
}
