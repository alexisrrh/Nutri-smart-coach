import { STORAGE_KEYS } from "../config/storageKeys";
import { request } from "./apiClient";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeCheckin } from "./normalizers";

const CHECKINS_KEY = STORAGE_KEYS.CHECKINS;

function getCheckinsKey(userId) {
  return userId ? `${CHECKINS_KEY}:${userId}` : CHECKINS_KEY;
}

export function getCachedCheckins(userId) {
  return normalizeCheckins(getCache(getCheckinsKey(userId), []));
}

export function cacheCheckins(userId, checkins) {
  const normalizedCheckins = normalizeCheckins(checkins);

  setCache(getCheckinsKey(userId), normalizedCheckins);

  return normalizedCheckins;
}

export function cacheCheckin(userId, checkin) {
  const normalizedCheckin = normalizeCheckin(checkin);

  if (!normalizedCheckin) return getCachedCheckins(userId);

  const previousCheckins = getCachedCheckins(userId);
  const checkinsWithoutDuplicate = previousCheckins.filter(
    (item) => item.id !== normalizedCheckin.id
  );
  const updatedCheckins = [normalizedCheckin, ...checkinsWithoutDuplicate];

  cacheCheckins(userId, updatedCheckins);

  return updatedCheckins;
}

export function clearCheckinsCache(userId) {
  removeCache(getCheckinsKey(userId));
}

export async function listCheckins(userId, { fallbackToCache = true } = {}) {
  const cachedCheckins = getCachedCheckins(userId);

  if (!userId) return cachedCheckins;

  try {
    const data = await request(`/checkins/${userId}`);
    const remoteCheckins = normalizeCheckins(data?.checkins);

    if (remoteCheckins.length > 0 || cachedCheckins.length === 0) {
      cacheCheckins(userId, remoteCheckins);
      return remoteCheckins;
    }

    return cachedCheckins;
  } catch (error) {
    if (fallbackToCache) return cachedCheckins;
    throw error;
  }
}

export async function createCheckin({
  userId,
  image,
  weight,
  waist,
  chest,
  hips,
  notes,
}) {
  const formData = new FormData();

  formData.append("user_id", userId);
  formData.append("image", image);
  formData.append("weight", weight);
  formData.append("waist", waist);
  formData.append("chest", chest);
  formData.append("hips", hips);
  formData.append("notes", notes);

  const data = await request("/checkins", {
    method: "POST",
    body: formData,
  });
  const checkin = normalizeCheckin(data?.checkin);

  if (!checkin) {
    throw new Error("No se pudo guardar el check-in.");
  }

  cacheCheckin(userId, checkin);

  return checkin;
}

export async function deleteCheckin(checkinId, userId) {
  if (!checkinId) {
    throw new Error("Falta el check-in a borrar.");
  }

  if (!userId) {
    throw new Error("Necesitas iniciar sesión para borrar el check-in.");
  }

  const data = await request(
    `/checkins/${checkinId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );

  const updatedCheckins = getCachedCheckins(userId).filter(
    (item) => String(item.id) !== String(checkinId)
  );

  cacheCheckins(userId, updatedCheckins);

  return data;
}

function normalizeCheckins(checkins) {
  if (!Array.isArray(checkins)) return [];

  return checkins.map(normalizeCheckin).filter(Boolean);
}
