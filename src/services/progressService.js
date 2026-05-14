import { STORAGE_KEYS } from "../config/storageKeys";
import { supabase } from "../lib/supabase";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeProgressLog, normalizeProgressLogs } from "./normalizers";

const PROGRESS_LOGS_KEY = STORAGE_KEYS.PROGRESS_LOGS;

export function getCachedProgressLogs() {
  return normalizeProgressLogs(getCache(PROGRESS_LOGS_KEY, []));
}

export function cacheProgressLogs(logs) {
  const normalizedLogs = normalizeProgressLogs(logs);

  setCache(PROGRESS_LOGS_KEY, normalizedLogs);

  return normalizedLogs;
}

export function cacheProgressLog(log) {
  const normalizedLog = normalizeProgressLog(log);

  if (!normalizedLog) return getCachedProgressLogs();

  const previousLogs = getCachedProgressLogs();
  const logsWithoutDuplicate = previousLogs.filter(
    (item) => item.id !== normalizedLog.id
  );
  const updatedLogs = [normalizedLog, ...logsWithoutDuplicate];

  cacheProgressLogs(updatedLogs);

  return updatedLogs;
}

export function clearProgressLogsCache() {
  removeCache(PROGRESS_LOGS_KEY);
}

export async function listProgressLogs(
  userId,
  { fallbackToCache = true } = {}
) {
  const cachedLogs = getCachedProgressLogs();

  if (!userId) return cachedLogs;

  try {
    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const remoteLogs = normalizeProgressLogs(data || []);
    cacheProgressLogs(remoteLogs);

    return remoteLogs;
  } catch (error) {
    if (fallbackToCache) return cachedLogs;
    throw error;
  }
}

export async function createProgressLog({ userId, weight, note }) {
  const payload = {
    user_id: userId,
    peso: Number(weight),
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

  cacheProgressLog(progressLog);

  return progressLog;
}
