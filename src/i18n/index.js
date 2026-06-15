import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { STORAGE_KEYS } from "../config/storageKeys";
import es from "./es.json";
import en from "./en.json";

const STORAGE_KEY = STORAGE_KEYS.LANGUAGE;
const SUPPORTED_LANGUAGES = new Set(["es", "en"]);

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.has(language) ? language : "es";
}

function getStoredLanguage() {
  if (typeof window === "undefined") return "es";

  try {
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "es";
  }
}

function setStoredLanguage(language) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, normalizeLanguage(language));
  } catch {
    // Ignore storage failures.
  }
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

  return normalizeLanguage(language);
}

export function getCurrentAppLanguage() {
  return normalizeLanguage(i18n.resolvedLanguage || i18n.language || getStoredLanguage());
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
    getPreferredLanguageFromProfile(profile) || normalizeLanguage(fallbackLanguage);

  return setAppLanguage(nextLanguage);
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

applyDocumentLanguage(getStoredLanguage());

export default i18n;
