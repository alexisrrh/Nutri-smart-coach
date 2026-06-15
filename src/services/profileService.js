import { STORAGE_KEYS } from "../config/storageKeys";
import { getCurrentAppLanguage } from "../i18n";
import { supabase } from "../lib/supabase";
import { getFriendlyErrorMessage, request } from "./apiClient";
import { getCache, removeCache, setCache } from "./cacheService";
import { mergePendingLegalConsent } from "./legalConsentService";
import { normalizeLanguage, normalizeProfile } from "./normalizers";

const PROFILE_KEY = STORAGE_KEYS.PROFILE;
const PROFILE_API_ENABLED = import.meta.env.VITE_PROFILE_API_ENABLED === "true";

export function getCachedProfile() {
  return normalizeProfile(getCache(PROFILE_KEY, null));
}

export function cacheProfile(profile) {
  const normalizedProfile = normalizeProfile(profile);

  if (!normalizedProfile) return null;

  setCache(PROFILE_KEY, normalizedProfile);

  return normalizedProfile;
}

export function clearCachedProfile() {
  removeCache(PROFILE_KEY);
}

export async function getProfile(userId, { fallbackToCache = true } = {}) {
  const cachedProfile = getCachedProfile();

  if (!userId) return cachedProfile;

  try {
    const profile = PROFILE_API_ENABLED
      ? await getProfileFromApi(userId)
      : await getProfileFromSupabase(userId);

    if (profile) return cacheProfile(profile);

    return fallbackToCache ? cachedProfile : null;
  } catch (error) {
    if (fallbackToCache && cachedProfile) return cachedProfile;
    throw new Error(getFriendlyErrorMessage(error, "cargar el perfil"), {
      cause: error,
    });
  }
}

export async function saveProfile(profile, { fallbackToCache = true } = {}) {
  const cachedProfile = getCachedProfile();
  const normalizedProfile = normalizeProfile({
    ...cachedProfile,
    ...mergePendingLegalConsent(profile),
  });

  if (!normalizedProfile?.id) {
    throw new Error("No hay usuario conectado.");
  }

  try {
    const savedProfile = PROFILE_API_ENABLED
      ? await saveProfileToApi(normalizedProfile)
      : await saveProfileToSupabase(normalizedProfile);

    return cacheProfile(savedProfile || normalizedProfile);
  } catch (error) {
    if (fallbackToCache) {
      cacheProfile(normalizedProfile);
    }

    throw new Error(getFriendlyErrorMessage(error, "guardar el perfil"), {
      cause: error,
    });
  }
}

async function getProfileFromApi(userId) {
  const data = await request(`/profiles/${userId}`, {}, {
    operation: "cargar el perfil",
  });

  return data?.profile || data;
}

async function saveProfileToApi(profile) {
  const data = await request(
    `/profiles/${profile.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toProfileRow(profile)),
    },
    {
      operation: "guardar el perfil",
    }
  );

  return data?.profile || data;
}

async function getProfileFromSupabase(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(getFriendlyErrorMessage(error, "cargar el perfil"), {
      cause: error,
    });
  }

  return data;
}

async function saveProfileToSupabase(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(toProfileRow(profile), { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw new Error(getFriendlyErrorMessage(error, "guardar el perfil"), {
      cause: error,
    });
  }

  return data;
}

function toProfileRow(profile) {
  const preferences = {
    ...(profile.preferences || {}),
    gender: profile.gender,
    activity: profile.activity_level,
    goal: profile.goal,
    language: normalizeLanguage(
      profile.language ||
        profile.preferences?.language ||
        profile.preferences?.locale ||
        getCurrentAppLanguage()
    ),
    meals_per_day: normalizeMealsPerDay(
      profile.meals_per_day ?? profile.mealsPerDay ?? profile.preferences?.meals_per_day
    ),
  };

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    gender: profile.gender,
    activity_level: profile.activity_level,
    goal: profile.goal,
    preferences,
    accepted_terms: Boolean(profile.accepted_terms),
    accepted_terms_at: profile.accepted_terms_at || null,
    accepted_privacy: Boolean(profile.accepted_privacy),
    accepted_privacy_at: profile.accepted_privacy_at || null,
    accepted_data_policy: Boolean(profile.accepted_data_policy),
    accepted_data_policy_at: profile.accepted_data_policy_at || null,
    legal_version: profile.legal_version || "2026-05-27",
    updated_at: profile.updated_at || new Date().toISOString(),
  };
}

function normalizeMealsPerDay(value) {
  const mealsPerDay = Number(value);

  return [3, 4, 5, 6].includes(mealsPerDay) ? mealsPerDay : 4;
}
