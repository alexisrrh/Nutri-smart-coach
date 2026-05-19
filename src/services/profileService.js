import { STORAGE_KEYS } from "../config/storageKeys";
import { supabase } from "../lib/supabase";
import { getFriendlyErrorMessage, request } from "./apiClient";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeProfile } from "./normalizers";

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
  const normalizedProfile = normalizeProfile(profile);

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
    preferences: profile.preferences || {
      gender: profile.gender,
      activity: profile.activity_level,
      goal: profile.goal,
    },
    updated_at: profile.updated_at || new Date().toISOString(),
  };
}
