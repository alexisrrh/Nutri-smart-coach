import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { STORAGE_KEYS } from "../config/storageKeys";
import es from "./es.json";
import en from "./en.json";

const STORAGE_KEY = STORAGE_KEYS.LANGUAGE;
const LEGACY_STORAGE_KEY = "nutrismart-language";

function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("es")) return "es";

  return "es";
}

export function getStoredLanguage() {
  if (typeof window === "undefined") return "es";

  try {
    const currentValue = window.localStorage.getItem(STORAGE_KEY);
    if (currentValue) return normalizeLanguage(currentValue);

    const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyValue) {
      const normalizedLegacy = normalizeLanguage(legacyValue);
      window.localStorage.setItem(STORAGE_KEY, normalizedLegacy);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return normalizedLegacy;
    }

    return null;
  } catch {
    return null;
  }
}

export function setStoredLanguage(language) {
  if (typeof window === "undefined") return;

  try {
    const nextLanguage = normalizeLanguage(language);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function getBrowserLanguage() {
  if (typeof navigator === "undefined") return null;

  const candidate =
    navigator.languages?.find(Boolean) ||
    navigator.language ||
    navigator.userLanguage ||
    "";

  return normalizeLanguage(candidate);
}

function getInitialLanguage() {
  return getStoredLanguage() || getBrowserLanguage() || "es";
}

function applyDocumentLanguage(language) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = normalizeLanguage(language);
}

export function getPreferredLanguageFromProfile(profile) {
  const language =
    profile?.preferences?.language ||
    profile?.language ||
    profile?.preferences?.locale ||
    profile?.locale;

  return language ? normalizeLanguage(language) : null;
}

export function getCurrentAppLanguage() {
  return normalizeLanguage(
    i18n.resolvedLanguage ||
      i18n.language ||
      getStoredLanguage() ||
      getBrowserLanguage() ||
      "es"
  );
}

export function getInitialAppLanguage() {
  return getInitialLanguage();
}

export async function setAppLanguage(language) {
  const nextLanguage = normalizeLanguage(language);

  if (i18n.resolvedLanguage !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage);
  }

  setStoredLanguage(nextLanguage);
  applyDocumentLanguage(nextLanguage);

  return nextLanguage;
}

export async function syncAppLanguageFromProfile(profile, fallbackLanguage = "es") {
  const nextLanguage =
    getPreferredLanguageFromProfile(profile) ||
    normalizeLanguage(fallbackLanguage) ||
    getInitialLanguage();

  return setAppLanguage(nextLanguage);
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

applyDocumentLanguage(getInitialLanguage());

export default i18n;
