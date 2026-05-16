import { STORAGE_KEYS } from "../config/storageKeys";
import { supabase } from "../lib/supabase";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeProgressLog, normalizeProgressLogs } from "./normalizers";

const PROGRESS_LOGS_KEY = STORAGE_KEYS.PROGRESS_LOGS;

function getProgressLogsKey(userId) {
  return userId ? `${PROGRESS_LOGS_KEY}:${userId}` : PROGRESS_LOGS_KEY;
}

export function getCachedProgressLogs(userId) {
  return normalizeProgressLogs(getCache(getProgressLogsKey(userId), []));
}

export function cacheProgressLogs(userId, logs) {
  const normalizedLogs = normalizeProgressLogs(logs);

  setCache(getProgressLogsKey(userId), normalizedLogs);

  return normalizedLogs;
}

export function cacheProgressLog(userId, log) {
  const normalizedLog = normalizeProgressLog(log);

  if (!normalizedLog) return getCachedProgressLogs(userId);

  const previousLogs = getCachedProgressLogs(userId);
  const logsWithoutDuplicate = previousLogs.filter(
    (item) => item.id !== normalizedLog.id
  );
  const updatedLogs = [normalizedLog, ...logsWithoutDuplicate];

  cacheProgressLogs(userId, updatedLogs);

  return updatedLogs;
}

export function clearProgressLogsCache(userId) {
  removeCache(getProgressLogsKey(userId));
}

export async function listProgressLogs(
  userId,
  { fallbackToCache = true, includeMeta = false } = {}
) {
  const cachedLogs = getCachedProgressLogs(userId);

  if (!userId) {
    return includeMeta
      ? { logs: cachedLogs, fromCache: true, error: null }
      : cachedLogs;
  }

  try {
    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const remoteLogs = normalizeProgressLogs(data || []);
    cacheProgressLogs(userId, remoteLogs);

    return includeMeta
      ? { logs: remoteLogs, fromCache: false, error: null }
      : remoteLogs;
  } catch (error) {
    if (fallbackToCache) {
      return includeMeta
        ? { logs: cachedLogs, fromCache: true, error }
        : cachedLogs;
    }

    throw error;
  }
}

export async function createProgressLog({ userId, weight, note }) {
  const normalizedWeight = validateWeight(weight);

  const payload = {
    user_id: userId,
    peso: normalizedWeight,
    nota: note,
  };

  const { data, error } = await supabase
    .from("progress_logs")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  const progressLog = normalizeProgressLog(data || payload);

  if (!progressLog) {
    throw new Error("No se pudo guardar el progreso.");
  }

  cacheProgressLog(userId, progressLog);

  return progressLog;
}

function validateWeight(weight) {
  if (weight === null || weight === undefined || weight === "") {
    throw new Error("Introduce tu peso actual.");
  }

  const normalizedWeight = Number(weight);

  if (Number.isNaN(normalizedWeight)) {
    throw new Error("Introduce un peso válido.");
  }

  if (normalizedWeight <= 0) {
    throw new Error("El peso debe ser mayor que 0.");
  }

  if (normalizedWeight < 25 || normalizedWeight > 350) {
    throw new Error("Introduce un peso entre 25 y 350 kg.");
  }

  return normalizedWeight;
}
