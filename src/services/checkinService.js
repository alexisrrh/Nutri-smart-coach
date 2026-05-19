import { STORAGE_KEYS } from "../config/storageKeys";
import { getFriendlyErrorMessage, request } from "./apiClient";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeCheckin } from "./normalizers";

const CHECKINS_KEY = STORAGE_KEYS.CHECKINS;
const CHECKIN_PROCESS_KEY = STORAGE_KEYS.CHECKIN_PROCESS;

const DEFAULT_CHECKIN_PROCESS_STATE = {
  status: "idle",
  startedAt: null,
  updatedAt: null,
  requestId: null,
  result: null,
  error: "",
};

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

export function getCheckinProcessState() {
  return normalizeCheckinProcessState(
    getCache(CHECKIN_PROCESS_KEY, DEFAULT_CHECKIN_PROCESS_STATE)
  );
}

export function setCheckinProcessState(nextState) {
  const normalizedState = normalizeCheckinProcessState({
    ...getCheckinProcessState(),
    ...nextState,
  });

  setCache(CHECKIN_PROCESS_KEY, normalizedState);

  return normalizedState;
}

export function clearCheckinProcessState() {
  removeCache(CHECKIN_PROCESS_KEY);
}

export async function listCheckins(userId, { fallbackToCache = true } = {}) {
  const cachedCheckins = getCachedCheckins(userId);

  if (!userId) return cachedCheckins;

  try {
    const data = await request(`/checkins/${userId}`, {}, {
      operation: "cargar el historial de check-ins",
    });
    const remoteCheckins = normalizeCheckins(data?.checkins);

    if (remoteCheckins.length > 0 || cachedCheckins.length === 0) {
      cacheCheckins(userId, remoteCheckins);
      return remoteCheckins;
    }

    return cachedCheckins;
  } catch (error) {
    if (fallbackToCache && cachedCheckins.length > 0) return cachedCheckins;
    throw new Error(
      getFriendlyErrorMessage(error, "cargar el historial de check-ins"),
      { cause: error }
    );
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

  const data = await request(
    "/checkins",
    {
      method: "POST",
      body: formData,
    },
    {
      timeoutMs: 120000,
      operation: "guardar un check-in",
    }
  );
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
    },
    {
      operation: "borrar un check-in",
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

function normalizeCheckinProcessState(state) {
  if (!state || typeof state !== "object") {
    return { ...DEFAULT_CHECKIN_PROCESS_STATE };
  }

  return {
    status:
      state.status === "loading" ||
      state.status === "success" ||
      state.status === "error"
        ? state.status
        : "idle",
    startedAt: state.startedAt || null,
    updatedAt: state.updatedAt || null,
    requestId: state.requestId || null,
    result: state.result || null,
    error: state.error || "",
  };
}
