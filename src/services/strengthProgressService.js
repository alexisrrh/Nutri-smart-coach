import { getWorkoutSessions } from "./workoutSessionService";

const DEFAULT_WEIGHT_STEP = 2.5;

export function getExerciseHistoryFromSessions(sessions = getWorkoutSessions()) {
  const orderedSessions = [...(Array.isArray(sessions) ? sessions : [])].sort(
    (a, b) => new Date(a?.completedAt || 0).getTime() - new Date(b?.completedAt || 0).getTime()
  );
  const historyByKey = new Map();

  for (const session of orderedSessions) {
    const completedAt = session?.completedAt || session?.date || new Date().toISOString();
    const exercises = Array.isArray(session?.completedExercises) ? session.completedExercises : [];

    for (const exercise of exercises) {
      const key = getExerciseKey(exercise);
      if (!key) continue;

      const sets = normalizeSets(exercise?.sets);
      const completedSets = Number(exercise?.completedSets) || countCompletedSets(sets);
      const targetSets = Number(exercise?.targetSets) || sets.length;
      const totalVolume = Number(exercise?.totalVolume) || calculateVolume(sets);
      const bestSet = getBestSet(sets);
      const firstCompletedSet = getFirstCompletedSet(sets);
      const currentCompletedSet = getBestTrackedSetForSession(sets);
      const currentWeight = currentCompletedSet.kg || bestSet.kg || 0;
      const existing = historyByKey.get(key);
      const entry = existing || {
        exerciseId: exercise?.exerciseId || exercise?.id || "",
        name: exercise?.name || "",
        muscle: exercise?.muscle || "",
        initialWeight: firstCompletedSet.kg || 0,
        currentWeight,
        bestWeight: bestSet.kg || 0,
        totalVolume,
        lastCompletedAt: completedAt,
        completedSets,
        targetSets,
        sessionsCount: 1,
        lastBestSet: currentCompletedSet,
        bestSet,
      };

      if (!existing) {
        historyByKey.set(key, entry);
      } else {
        entry.currentWeight = currentWeight;
        entry.bestWeight = Math.max(entry.bestWeight || 0, bestSet.kg || 0);
        entry.totalVolume += totalVolume;
        entry.lastCompletedAt = completedAt;
        entry.completedSets = completedSets;
        entry.targetSets = targetSets;
        entry.sessionsCount += 1;
        entry.lastBestSet = currentCompletedSet;
        if (bestSet.kg > (entry.bestSet?.kg || 0) || bestSet.reps > (entry.bestSet?.reps || 0)) {
          entry.bestSet = bestSet;
        }
      }

      if (!entry.initialWeight) {
        entry.initialWeight = firstCompletedSet.kg || currentWeight || 0;
      }
      if (!entry.lastBestSet.kg) {
        entry.lastBestSet = currentCompletedSet;
      }
      if (!entry.bestSet.kg) {
        entry.bestSet = bestSet;
      }
    }
  }

  return [...historyByKey.values()]
    .filter(
      (item) =>
        Number(item.bestWeight || 0) > 0 ||
        Number(item.currentWeight || 0) > 0 ||
        Number(item.totalVolume || 0) > 0
    )
    .map((item) => ({
      ...item,
      difference: Number(((item.currentWeight || 0) - (item.initialWeight || 0)).toFixed(1)),
      lastCompletedAt: item.lastCompletedAt || null,
    }))
    .sort((a, b) => {
      if ((b.difference || 0) !== (a.difference || 0)) {
        return (b.difference || 0) - (a.difference || 0);
      }

      if ((b.currentWeight || 0) !== (a.currentWeight || 0)) {
        return (b.currentWeight || 0) - (a.currentWeight || 0);
      }

      return (b.totalVolume || 0) - (a.totalVolume || 0);
    });
}

export function getLastExercisePerformance(exercise, sessions = getWorkoutSessions()) {
  const key = getExerciseKey(exercise);
  if (!key) return null;

  const orderedSessions = [...(Array.isArray(sessions) ? sessions : [])].sort(
    (a, b) => new Date(b?.completedAt || 0).getTime() - new Date(a?.completedAt || 0).getTime()
  );

  for (const session of orderedSessions) {
    const exercises = Array.isArray(session?.completedExercises) ? session.completedExercises : [];

    for (const item of exercises) {
      if (!matchesExerciseKey(item, key)) continue;

      const sets = normalizeSets(item?.sets);
      const bestSet = getBestSet(sets);
      const completedSets = Number(item?.completedSets) || countCompletedSets(sets);
      const targetSets = Number(item?.targetSets) || sets.length;
      const totalVolume = Number(item?.totalVolume) || calculateVolume(sets);

      return {
        exerciseId: item?.exerciseId || item?.id || "",
        name: item?.name || "",
        muscle: item?.muscle || "",
        completedSets,
        targetSets,
        sets,
        totalVolume,
        bestSet,
        completedAt: session?.completedAt || item?.completedAt || null,
        date: session?.date || null,
        sessionId: session?.id || null,
      };
    }
  }

  return null;
}

export function getWeightRecommendation({
  exercise,
  prescription,
  sessions = getWorkoutSessions(),
}) {
  const lastPerformance = getLastExercisePerformance(exercise, sessions);
  const isBodyweight = isBodyweightExercise(exercise);
  const repRange = parseRepRange(prescription?.reps || exercise?.reps);
  const currentWeight = lastPerformance?.bestSet?.kg || 0;
  const completedAllSets =
    Boolean(lastPerformance) &&
    Number(lastPerformance.completedSets) >= Number(lastPerformance.targetSets || 0) &&
    Number(lastPerformance.targetSets || 0) > 0;
  const withinRange =
    Number(lastPerformance?.bestSet?.reps || 0) >= repRange.min &&
    Number(lastPerformance?.bestSet?.reps || 0) <= repRange.max;

  if (!lastPerformance) {
    return {
      hasHistory: false,
      isBodyweight,
      lastText: "",
      recommendationTitle: isBodyweight ? "Peso corporal" : "Sin historial",
      recommendationValue: isBodyweight ? "Sin kg" : "Aún no hay datos",
      recommendationText: isBodyweight
        ? "Mantén el mismo ritmo y registra tus primeras series."
        : "Completa tu primera sesión para recibir una recomendación.",
    };
  }

  if (isBodyweight) {
    return {
      hasHistory: true,
      isBodyweight,
      lastText: formatLastPerformance(lastPerformance),
      recommendationTitle: "Peso corporal",
      recommendationValue: "Sin kg",
      recommendationText: "Mantén el mismo ritmo y busca rango y control.",
    };
  }

  let recommendedWeight = roundToStep(currentWeight);
  let recommendationText = `Mantén ${formatWeight(currentWeight)} y completa el rango.`;

  if (completedAllSets && withinRange && currentWeight > 0) {
    recommendedWeight = roundToStep(currentWeight + DEFAULT_WEIGHT_STEP);
    recommendationText = `Completa el rango y sube a ${formatWeight(recommendedWeight)}.`;
  } else if (
    completedAllSets &&
    currentWeight > 0 &&
    Number(lastPerformance?.bestSet?.reps || 0) < repRange.min
  ) {
    if (currentWeight > DEFAULT_WEIGHT_STEP) {
      recommendedWeight = roundToStep(currentWeight - DEFAULT_WEIGHT_STEP);
      recommendationText = `Baja a ${formatWeight(recommendedWeight)} o mantén ${formatWeight(currentWeight)} para completar el rango.`;
    }
  }

  return {
    hasHistory: true,
    isBodyweight: false,
    lastText: formatLastPerformance(lastPerformance),
    recommendationTitle: "Hoy recomendado",
    recommendationValue: `${formatWeight(recommendedWeight)} kg`,
    recommendationText,
    recommendationKg: recommendedWeight,
  };
}

export function getStrengthProgressSummary(sessions = getWorkoutSessions(), limit = 5) {
  const items = getExerciseHistoryFromSessions(sessions).slice(0, limit);
  const totalVolume = items.reduce((total, item) => total + Number(item.totalVolume || 0), 0);

  return {
    items,
    totalExercises: items.length,
    totalVolume,
  };
}

function getExerciseKey(exercise) {
  if (!exercise) return "";

  if (typeof exercise === "string") {
    return normalizeKey(exercise);
  }

  return normalizeKey(
    exercise?.exerciseId ||
      exercise?.id ||
      exercise?.name ||
      ""
  );
}

function matchesExerciseKey(exercise, key) {
  if (!exercise || !key) return false;

  return (
    normalizeKey(exercise?.exerciseId || exercise?.id || "") === key ||
    normalizeKey(exercise?.name || "") === key
  );
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSets(sets) {
  return Array.isArray(sets)
    ? sets.map((set, index) => ({
        setIndex: Number(set?.setIndex ?? index),
        kg: Number(set?.kg) || 0,
        reps: Number(set?.reps) || 0,
        completedAt: set?.completedAt || null,
      }))
    : [];
}

function countCompletedSets(sets) {
  return sets.reduce((total, set) => total + (set.completedAt ? 1 : 0), 0);
}

function calculateVolume(sets) {
  return Math.round(
    sets.reduce((total, set) => {
      if (!set.completedAt) return total;

      return total + (Number(set.kg) || 0) * (Number(set.reps) || 0);
    }, 0)
  );
}

function getBestSet(sets) {
  return sets.reduce(
    (best, set) => {
      if (!set.completedAt) return best;

      const kg = Number(set.kg) || 0;
      const reps = Number(set.reps) || 0;

      if (kg > best.kg || (kg === best.kg && reps > best.reps)) {
        return { kg, reps, setIndex: Number(set.setIndex) || 0 };
      }

      return best;
    },
    { kg: 0, reps: 0, setIndex: 0 }
  );
}

function getBestTrackedSetForSession(sets) {
  return getBestSet(sets);
}

function getFirstCompletedSet(sets) {
  const first = sets.find((set) => set.completedAt);

  return first
    ? {
        kg: Number(first.kg) || 0,
        reps: Number(first.reps) || 0,
        setIndex: Number(first.setIndex) || 0,
      }
    : { kg: 0, reps: 0, setIndex: 0 };
}

function parseRepRange(reps) {
  const values = String(reps || "")
    .match(/\d+/g)
    ?.map(Number)
    .filter((value) => Number.isFinite(value) && value > 0) || [8, 12];

  if (values.length === 1) {
    return { min: values[0], max: values[0] };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function isBodyweightExercise(exercise) {
  const equipmentType = String(exercise?.equipmentType || exercise?.equipment || "")
    .trim()
    .toLowerCase();
  const type = String(exercise?.type || "").trim().toLowerCase();

  return (
    equipmentType === "bodyweight" ||
    equipmentType === "peso corporal" ||
    type === "core" && !exercise?.equipmentType
  );
}

function roundToStep(value, step = DEFAULT_WEIGHT_STEP) {
  const safeValue = Number(value) || 0;

  return Number((Math.round(safeValue / step) * step).toFixed(1));
}

function formatWeight(value) {
  const safeValue = Number(value) || 0;

  return Number.isInteger(safeValue)
    ? String(safeValue)
    : safeValue.toFixed(1).replace(/\.0$/, "");
}

function formatLastPerformance(performance) {
  if (!performance) return "";

  const reps = Number(performance.bestSet?.reps) || 0;
  const kg = Number(performance.bestSet?.kg) || 0;

  if (!reps && !kg) return "Sin datos";

  return `${reps} reps · ${formatWeight(kg)} kg`;
}
