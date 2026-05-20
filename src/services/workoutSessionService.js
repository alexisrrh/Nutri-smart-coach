const WORKOUT_SESSIONS_KEY = "nutrismart_workout_sessions";

export function getWorkoutSessions() {
  if (typeof localStorage === "undefined") return [];

  try {
    const sessions = JSON.parse(
      localStorage.getItem(WORKOUT_SESSIONS_KEY) || "[]"
    );

    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

export function saveWorkoutSession(session) {
  if (typeof localStorage === "undefined") return null;

  const completedSession = {
    id: session.id || `session-${Date.now()}`,
    date: getLocalDateKey(),
    completedExercises: session.completedExercises || [],
    duration: Math.max(1, Math.round(Number(session.duration || 0))),
    completedAt: session.completedAt || new Date().toISOString(),
    caloriesEstimate: Math.max(0, Math.round(Number(session.caloriesEstimate || 0))),
    dayName: session.dayName || "",
    muscles: session.muscles || [],
  };
  const sessions = getWorkoutSessions();

  localStorage.setItem(
    WORKOUT_SESSIONS_KEY,
    JSON.stringify([completedSession, ...sessions].slice(0, 60))
  );

  return completedSession;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
