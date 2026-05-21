const WORKOUT_SESSIONS_KEY = "nutrismart_workout_sessions";

export function getWorkoutSessions() {
  if (typeof localStorage === "undefined") return [];

  try {
    const sessions = JSON.parse(
      localStorage.getItem(WORKOUT_SESSIONS_KEY) || "[]"
    );

    return Array.isArray(sessions)
      ? sessions.map(normalizeWorkoutSession).sort(sortByCompletedAtDesc)
      : [];
  } catch {
    return [];
  }
}

export function getRecentWorkoutSessions(limit = 5) {
  return getWorkoutSessions().slice(0, limit);
}

export function getLastExercisePerformance(exerciseName) {
  const normalizedName = normalizeExerciseName(exerciseName);

  if (!normalizedName) return null;

  for (const session of getWorkoutSessions()) {
    const exercise = session.completedExercises.find(
      (item) => normalizeExerciseName(item.name) === normalizedName
    );

    if (exercise) {
      const sets = normalizeExerciseSets(exercise.sets);
      const bestSet = getBestSet(sets);

      return {
        completedAt: session.completedAt,
        exerciseName: exercise.name,
        maxKg: bestSet.kg,
        reps: bestSet.reps,
        sets,
      };
    }
  }

  return null;
}

export function saveWorkoutSession(session) {
  if (typeof localStorage === "undefined") return null;

  const completedSession = {
    id: session.id || `session-${Date.now()}`,
    date: getLocalDateKey(),
    completedExercises: normalizeCompletedExercises(session.completedExercises),
    duration: Math.max(1, Math.round(Number(session.duration || 0))),
    completedAt: session.completedAt || new Date().toISOString(),
    caloriesEstimate: Math.max(0, Math.round(Number(session.caloriesEstimate || 0))),
    dayName: session.dayName || "",
    muscles: session.muscles || [],
    newRecords: Array.isArray(session.newRecords) ? session.newRecords : [],
    totalWeightMoved: Math.max(0, Math.round(Number(session.totalWeightMoved || 0))),
    bestExercise: session.bestExercise || null,
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

function normalizeWorkoutSession(session) {
  return {
    id: session?.id || `session-${session?.completedAt || Date.now()}`,
    date: session?.date || getLocalDateKeyFromValue(session?.completedAt),
    completedExercises: normalizeCompletedExercises(session?.completedExercises),
    duration: Math.max(0, Math.round(Number(session?.duration || 0))),
    completedAt: session?.completedAt || new Date().toISOString(),
    caloriesEstimate: Math.max(
      0,
      Math.round(Number(session?.caloriesEstimate || 0))
    ),
    dayName: session?.dayName || "",
    muscles: Array.isArray(session?.muscles) ? session.muscles : [],
    newRecords: Array.isArray(session?.newRecords) ? session.newRecords : [],
    totalWeightMoved: Math.max(0, Math.round(Number(session?.totalWeightMoved || 0))),
    bestExercise: session?.bestExercise || null,
  };
}

function normalizeCompletedExercises(exercises) {
  return Array.isArray(exercises)
    ? exercises.map((exercise) => ({
        ...exercise,
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
        completedAt: set?.completedAt || null,
      }))
    : [];
}

function normalizeSetNumber(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}

function getBestSet(sets) {
  return sets.reduce(
    (best, set) => {
      const kg = Number(set.kg) || 0;
      const reps = Number(set.reps) || 0;

      if (kg > best.kg || (kg === best.kg && reps > best.reps)) {
        return { kg, reps };
      }

      return best;
    },
    { kg: 0, reps: 0 }
  );
}

function normalizeExerciseName(name) {
  return String(name || "").trim().toLowerCase();
}

function sortByCompletedAtDesc(a, b) {
  return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
}

function getLocalDateKeyFromValue(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) return getLocalDateKey();

  return getLocalDateKey(date);
}
