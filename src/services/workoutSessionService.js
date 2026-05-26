import { supabase } from "../lib/supabase";

const WORKOUT_SESSIONS_KEY = "nutrismart_workout_sessions";
const MAX_SESSIONS_TO_CACHE = 60;

export function getWorkoutSessions(userId) {
  if (typeof localStorage === "undefined") return [];

  try {
    const sessions = JSON.parse(
      localStorage.getItem(getWorkoutSessionsKey(userId)) || "[]"
    );

    return Array.isArray(sessions)
      ? sessions.map(normalizeWorkoutSession).sort(sortByCompletedAtDesc)
      : [];
  } catch {
    return [];
  }
}

export function getRecentWorkoutSessions(limit = 5, userId) {
  return getWorkoutSessions(userId).slice(0, limit);
}

export async function listWorkoutSessions(userId, { fallbackToCache = true } = {}) {
  const cachedSessions = getWorkoutSessions(userId);

  if (!userId) return cachedSessions;

  try {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    const remoteSessions = normalizeWorkoutSessions(data);
    cacheWorkoutSessions(userId, remoteSessions);

    return remoteSessions;
  } catch (error) {
    if (fallbackToCache && cachedSessions.length > 0) return cachedSessions;
    throw error instanceof Error ? error : new Error("No se pudo cargar el historial.");
  }
}

export async function saveWorkoutSession(userIdOrSession, maybeSession) {
  const hasExplicitUserId = maybeSession !== undefined;
  const userId = hasExplicitUserId ? userIdOrSession || null : userIdOrSession?.userId || null;
  const session = hasExplicitUserId ? maybeSession || {} : userIdOrSession || {};

  const completedSession = normalizeWorkoutSession({
    id: session.id || `session-${Date.now()}`,
    user_id: userId || session.userId || null,
    userId: userId || session.userId || null,
    date: session.date || getLocalDateKey(),
    completed_exercises: normalizeCompletedExercises(session.completedExercises),
    completedExercises: normalizeCompletedExercises(session.completedExercises),
    duration: Math.max(1, Math.round(Number(session.duration || 0))),
    completed_at: session.completedAt || new Date().toISOString(),
    completedAt: session.completedAt || new Date().toISOString(),
    calories_estimate: Math.max(0, Math.round(Number(session.caloriesEstimate || 0))),
    caloriesEstimate: Math.max(0, Math.round(Number(session.caloriesEstimate || 0))),
    day_name: session.dayName || "",
    dayName: session.dayName || "",
    day_id: session.dayId || "",
    dayId: session.dayId || "",
    routine_id: session.routineId || "",
    routineId: session.routineId || "",
    routine_name: session.routineName || "",
    routineName: session.routineName || "",
    routine_type: session.routineType || session.source || "ia",
    routineType: session.routineType || session.source || "ia",
    source: session.source || session.routineType || "ia",
    muscles: session.muscles || [],
    new_records: Array.isArray(session.newRecords) ? session.newRecords : [],
    newRecords: Array.isArray(session.newRecords) ? session.newRecords : [],
    total_volume: Math.max(0, Math.round(Number(session.totalWeightMoved || session.totalVolume || 0))),
    totalWeightMoved: Math.max(0, Math.round(Number(session.totalWeightMoved || session.totalVolume || 0))),
    best_exercise: session.bestExercise || null,
    bestExercise: session.bestExercise || null,
  });

  if (userId) {
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([
          {
            user_id: userId,
            date: completedSession.date,
            completed_exercises: completedSession.completedExercises,
            duration: completedSession.duration,
            completed_at: completedSession.completedAt,
            calories_estimate: completedSession.caloriesEstimate,
            day_name: completedSession.dayName,
            day_id: completedSession.dayId,
            routine_id: completedSession.routineId,
            routine_name: completedSession.routineName,
            routine_type: completedSession.routineType,
            muscles: completedSession.muscles,
            new_records: completedSession.newRecords,
            total_volume: completedSession.totalWeightMoved,
            best_exercise: completedSession.bestExercise,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      const remoteSession = normalizeWorkoutSession(data);
      cacheWorkoutSession(userId, remoteSession);
      return remoteSession;
    } catch (error) {
      console.error("Error guardando entrenamiento en Supabase:", error);
    }
  }

  cacheWorkoutSession(userId, completedSession);
  return completedSession;
}

export async function deleteWorkoutSession(sessionId) {
  if (!sessionId) {
    throw new Error("Falta la sesión a borrar.");
  }

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  if (userId) {
    const { error } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
  }

  clearWorkoutSessionsCache(userId);
  return { success: true };
}

export function cacheWorkoutSessions(userId, sessions) {
  const normalizedSessions = normalizeWorkoutSessions(sessions);

  if (typeof localStorage === "undefined") return normalizedSessions;

  localStorage.setItem(
    getWorkoutSessionsKey(userId),
    JSON.stringify(normalizedSessions.slice(0, MAX_SESSIONS_TO_CACHE))
  );

  if (userId) {
    localStorage.setItem(
      WORKOUT_SESSIONS_KEY,
      JSON.stringify(normalizedSessions.slice(0, MAX_SESSIONS_TO_CACHE))
    );
  }

  return normalizedSessions;
}

export function cacheWorkoutSession(userId, session) {
  const normalizedSession = normalizeWorkoutSession(session);

  if (!normalizedSession) return getWorkoutSessions(userId);

  const previousSessions = getWorkoutSessions(userId);
  const sessionsWithoutDuplicate = previousSessions.filter(
    (item) => item.id !== normalizedSession.id
  );
  const updatedSessions = [normalizedSession, ...sessionsWithoutDuplicate];

  cacheWorkoutSessions(userId, updatedSessions);

  return updatedSessions;
}

export function clearWorkoutSessionsCache(userId) {
  if (typeof localStorage === "undefined") return;

  localStorage.removeItem(getWorkoutSessionsKey(userId));

  if (userId) {
    localStorage.removeItem(WORKOUT_SESSIONS_KEY);
  }
}

function getWorkoutSessionsKey(userId) {
  return userId ? `${WORKOUT_SESSIONS_KEY}:${userId}` : WORKOUT_SESSIONS_KEY;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeWorkoutSessions(sessions) {
  if (!Array.isArray(sessions)) return [];

  return sessions
    .map(normalizeWorkoutSession)
    .filter(Boolean)
    .sort(sortByCompletedAtDesc);
}

function normalizeWorkoutSession(session) {
  if (!session) return null;

  const completedExercises = normalizeCompletedExercises(
    session.completedExercises ||
      session.completed_exercises ||
      session.exercises
  );
  const duration = Math.max(
    0,
    Math.round(Number(session.duration || session.duration_minutes || 0))
  );
  const caloriesEstimate = Math.max(
    0,
    Math.round(Number(session.caloriesEstimate || session.calories_estimate || 0))
  );
  const totalWeightMoved = Math.max(
    0,
    Math.round(Number(session.totalWeightMoved || session.total_volume || session.total_weight_moved || 0))
  );
  const routineType = String(
    session.routineType || session.routine_type || session.source || "ia"
  ).toLowerCase();
  const source = String(session.source || routineType || "ia").toLowerCase();

  return {
    id: session.id || `session-${session.completedAt || session.completed_at || Date.now()}`,
    userId: session.userId || session.user_id || null,
    date: session.date || getLocalDateKeyFromValue(session.completedAt || session.completed_at),
    completedExercises,
    duration,
    completedAt: session.completedAt || session.completed_at || new Date().toISOString(),
    caloriesEstimate,
    dayName: session.dayName || session.day_name || "",
    dayId: session.dayId || session.day_id || "",
    routineId: session.routineId || session.routine_id || "",
    routineName: session.routineName || session.routine_name || "",
    routineType,
    source,
    muscles: Array.isArray(session.muscles) ? session.muscles : [],
    newRecords: Array.isArray(session.newRecords || session.new_records)
      ? session.newRecords || session.new_records
      : [],
    totalWeightMoved,
    bestExercise: session.bestExercise || session.best_exercise || null,
  };
}

function normalizeCompletedExercises(exercises) {
  return Array.isArray(exercises)
    ? exercises.map((exercise) => ({
        ...exercise,
        exerciseId: exercise?.exerciseId || exercise?.id || "",
        id: exercise?.id || exercise?.exerciseId || "",
        name: exercise?.name || "",
        muscle: exercise?.muscle || "",
        completedSets: Number(exercise?.completedSets || 0),
        targetSets: Number(exercise?.targetSets || 0),
        completedAt: exercise?.completedAt || exercise?.completed_at || null,
        totalVolume: Math.max(
          0,
          Math.round(Number(exercise?.totalVolume || exercise?.total_volume || 0))
        ),
        bestSet: exercise?.bestSet || exercise?.best_set || null,
        sets: normalizeExerciseSets(exercise?.sets),
      }))
    : [];
}

function normalizeExerciseSets(sets) {
  return Array.isArray(sets)
    ? sets.map((set, index) => ({
        setIndex: Number(set?.setIndex ?? index),
        kg: normalizeSetNumber(set?.kg),
        reps: normalizeSetNumber(set?.reps),
        completedAt: set?.completedAt || set?.completed_at || null,
      }))
    : [];
}

function normalizeSetNumber(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}

function sortByCompletedAtDesc(a, b) {
  return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
}

function getLocalDateKeyFromValue(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) return getLocalDateKey();

  return getLocalDateKey(date);
}
