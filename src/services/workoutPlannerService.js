import { EXERCISE_LIBRARY as exerciseCatalog } from "../data/exerciseLibrary";
import { DAYS_PER_WEEK_OPTIONS, getWorkoutSplit } from "../data/workoutSplits";

const LEVEL_ORDER = {
  Principiante: 0,
  Intermedio: 1,
  Avanzado: 2,
};

const SLOT_ORDER = {
  strength_main: 0,
  compound: 1,
  glute_focus: 2,
  accessory: 3,
  isolation: 4,
  core: 5,
  cardio: 6,
  mobility: 7,
};

export function buildWeeklyWorkoutPlan({
  profile,
  level,
  goal,
  daysPerWeek,
  focus,
  exercises = exerciseCatalog,
} = {}) {
  const resolvedLevel = resolveLevel(level, profile);
  const resolvedGoal = resolveGoal(goal, profile);
  const resolvedFocus = resolveFocus(focus, profile);
  const resolvedDays = resolveDaysPerWeek(daysPerWeek, profile);

  const split = getWorkoutSplit({
    level: resolvedLevel,
    goal: resolvedGoal,
    daysPerWeek: resolvedDays,
    focus: resolvedFocus,
  });

  const days = split.map((day) =>
    buildWorkoutDay({
      day,
      level: resolvedLevel,
      goal: resolvedGoal,
      focus: resolvedFocus,
      profile,
      exercises,
    })
  );

  return {
    days,
    meta: {
      adaptation: "Adaptado a tu objetivo",
      level: resolvedLevel,
      levelLabel: `Nivel: ${resolvedLevel}`,
      goal: resolvedGoal,
      goalLabel: `Objetivo: ${resolvedGoal}`,
      focus: resolvedFocus,
      focusLabel: `Enfoque: ${resolvedFocus}`,
      daysPerWeek: resolvedDays,
      daysLabel: `Días: ${resolvedDays}`,
      planName: getPlanName({
        level: resolvedLevel,
        goal: resolvedGoal,
        focus: resolvedFocus,
        daysPerWeek: resolvedDays,
      }),
      profileHint: getProfileHint(profile, resolvedFocus, resolvedDays),
      recommendedDays: getRecommendedDaysForProfile(profile),
    },
  };
}

export function buildWorkoutDay({
  day,
  level,
  goal,
  focus,
  profile,
  exercises = exerciseCatalog,
} = {}) {
  if (!day) {
    return {
      id: "",
      day: 0,
      name: "Rutina",
      muscles: [],
      focus: "strength_main",
      duration: "45 min",
      intensity: "media",
      exerciseSlots: [],
      brief: "",
      warmupItems: getWarmupItems(),
      finalItems: getFinalItems(goal),
      exercises: [],
    };
  }

  const selectedExercises = selectExercisesForDay({
    day,
    level,
    goal,
    focus,
    profile,
    exercises,
  });

  return {
    ...day,
    exercises: selectedExercises,
    warmupItems: getWarmupItems(day, focus),
    finalItems: getFinalItems(goal, focus),
    brief: day.brief || buildDayBrief(day, focus, goal, profile),
  };
}

export function selectExercisesForDay({
  day,
  level,
  goal,
  focus,
  profile,
  exercises = exerciseCatalog,
  countOverride,
} = {}) {
  if (!day) return [];

  const slotOrder = getDaySlots(day, goal, focus);
  const pool = filterExercisePool({
    exercises,
    day,
    goal,
    level,
    focus,
  });

  const rankedPool = [...pool].sort(
    (a, b) => scoreExercise(b, { day, level, goal, focus, profile }) - scoreExercise(a, { day, level, goal, focus, profile })
  );
  const selected = [];

  for (const slot of slotOrder) {
    if (selected.length >= getTargetExerciseCount({ level, goal, focus, day })) break;

    const remaining = rankedPool.filter((exercise) => !selected.some((item) => item.id === exercise.id));
    const nextExercise = pickBestExerciseForSlot(remaining, {
      slot,
      day,
      level,
      goal,
      focus,
      profile,
    });

    if (nextExercise) {
      selected.push(nextExercise);
    }
  }

  const targetCount = countOverride || getTargetExerciseCount({ level, goal, focus, day });

  for (const exercise of rankedPool) {
    if (selected.length >= targetCount) break;
    if (selected.some((item) => item.id === exercise.id)) continue;
    selected.push(exercise);
  }

  return selected.slice(0, targetCount);
}

export function getExercisePrescription(exercise, level, goal) {
  const levelDefaults = {
    Principiante: { sets: 2, rest: "60-90s" },
    Intermedio: { sets: 3, rest: "60-120s" },
    Avanzado: { sets: 4, rest: "90-150s" },
  };
  const goalDefaults = {
    "Ganar músculo": "8-12",
    Definir: "10-15",
    Fuerza: "4-6",
  };

  const sets = exercise?.setsByLevel?.[level] || levelDefaults[level]?.sets || exercise?.sets || 3;
  const reps = exercise?.repsByGoal?.[goal] || goalDefaults[goal] || exercise?.reps || "8-12";
  const rest =
    exercise?.restByGoal?.[goal] ||
    levelDefaults[level]?.rest ||
    exercise?.rest ||
    "60-90s";

  return {
    sets,
    reps,
    rest,
  };
}

export function getRecommendedDaysForProfile(profile) {
  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;
  const age = Number(profile?.age || profile?.edad || 0);
  const goal = resolveGoal(undefined, profile);

  if (age >= 55 || activity === "low" || activity === "sedentary") {
    return 3;
  }

  if (activity === "high" || activity === "very_high") {
    return goal === "Fuerza" ? 5 : 6;
  }

  if (goal === "Fuerza") return 5;

  return 4;
}

function resolveLevel(level, profile) {
  if (LEVEL_ORDER[level] !== undefined) return level;

  const age = Number(profile?.age || profile?.edad || 0);
  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;

  if (age >= 55 || activity === "low" || activity === "sedentary") return "Principiante";
  if (activity === "high" || activity === "very_high") return "Intermedio";

  return "Intermedio";
}

function resolveGoal(goal, profile) {
  if (goal) return goal;

  const profileGoal = profile?.goal || profile?.objetivo || profile?.preferences?.goal || "";

  if (profileGoal === "perder_grasa" || profileGoal === "bajar") return "Definir";
  if (profileGoal === "ganar_musculo" || profileGoal === "subir") return "Ganar músculo";
  if (profileGoal === "fuerza" || profileGoal === "strength") return "Fuerza";
  if (profileGoal === "mantener_peso" || profileGoal === "mantener") return "Ganar músculo";

  return "Ganar músculo";
}

function resolveFocus(focus, profile) {
  if (focus && focus !== "General") return focus;

  const savedPreference = profile?.preferences?.workout_focus;
  if (savedPreference && savedPreference !== "General") return savedPreference;

  const gender = profile?.gender || profile?.genero || profile?.preferences?.gender;

  if (gender === "female" || gender === "mujer") return "Glúteos y piernas";
  if (gender === "male" || gender === "hombre") return "General";

  return "General";
}

function resolveDaysPerWeek(daysPerWeek, profile) {
  if (DAYS_PER_WEEK_OPTIONS.includes(daysPerWeek)) return daysPerWeek;
  return getRecommendedDaysForProfile(profile);
}

function filterExercisePool({ exercises, day, goal, level }) {
  const levelIndex = LEVEL_ORDER[level] ?? LEVEL_ORDER.Intermedio;

  return exercises.filter((exercise) => {
    const levelMatch = LEVEL_ORDER[exercise.level] ?? LEVEL_ORDER.Principiante;
    const goalMatch = Array.isArray(exercise.goals) ? exercise.goals.includes(goal) : true;
    const muscleMatch =
      day.muscles.includes(exercise.muscle) ||
      (exercise.secondaryMuscles || []).some((muscle) => day.muscles.includes(muscle));
    const levelAllowed = levelMatch <= levelIndex || levelIndex === LEVEL_ORDER.Avanzado;

    return goalMatch && muscleMatch && levelAllowed;
  });
}

function scoreExercise(exercise, { day, level, goal, focus, profile }) {
  const focusScore = Number(exercise.priorityByFocus?.[focus] || exercise.priorityByFocus?.General || 1);
  const muscleScore = getMuscleScore(exercise, day.muscles);
  const goalScore = getGoalScore(exercise, goal);
  const slotScore = getSlotScore(exercise, day.exerciseSlots || []);
  const levelScore = getLevelScore(exercise, level);
  const profileBias = getProfileBias(exercise, profile);

  return focusScore * 12 + muscleScore * 8 + goalScore * 6 + slotScore * 10 + levelScore + profileBias;
}

function getMuscleScore(exercise, muscles) {
  const primary = muscles.includes(exercise.muscle) ? 1 : 0;
  const secondary = (exercise.secondaryMuscles || []).some((muscle) => muscles.includes(muscle)) ? 1 : 0;
  return primary * 2 + secondary;
}

function getGoalScore(exercise, goal) {
  if (goal === "Fuerza") {
    return exercise.movementType === "compound" || exercise.movementType === "accessory" ? 5 : 2;
  }

  if (goal === "Definir") {
    return exercise.movementType === "core" || exercise.movementType === "isolation" ? 5 : 3;
  }

  return exercise.movementType === "compound" ? 5 : exercise.movementType === "accessory" ? 4 : 3;
}

function getSlotScore(exercise, slots) {
  return Math.max(...slots.map((slot) => (matchesSlot(exercise, slot, null, null) ? 5 - SLOT_ORDER[slot] / 2 : 0)), 0);
}

function pickBestExerciseForSlot(remaining, { slot, day, level, goal, focus, profile }) {
  if (!remaining.length) return null;

  const exactMatches = remaining.filter((exercise) => matchesSlot(exercise, slot, day, goal));
  const candidates = exactMatches.length ? exactMatches : remaining;

  return [...candidates].sort(
    (a, b) =>
      scoreSlotCandidate(b, { slot, day, level, goal, focus, profile }) -
      scoreSlotCandidate(a, { slot, day, level, goal, focus, profile })
  )[0];
}

function scoreSlotCandidate(exercise, { slot, day, level, goal, focus, profile }) {
  const baseScore = scoreExercise(exercise, { day, level, goal, focus, profile });
  const slotBonus = matchesSlot(exercise, slot, day, goal) ? 12 : 0;
  const slotPriority = SLOT_ORDER[slot] ?? 0;

  if (slot === "strength_main" && exercise.movementType === "compound") {
    return baseScore + slotBonus + exercise.difficultyScore * 3;
  }

  if (slot === "glute_focus" && exercise.priorityByFocus?.["Glúteos y piernas"] >= 4) {
    return baseScore + slotBonus + 10;
  }

  if (slot === "core" && exercise.movementType === "core") {
    return baseScore + slotBonus + 8;
  }

  return baseScore + slotBonus + Math.max(0, 4 - slotPriority);
}

function getLevelScore(exercise, level) {
  const desired = LEVEL_ORDER[level] ?? LEVEL_ORDER.Intermedio;
  const current = LEVEL_ORDER[exercise.level] ?? LEVEL_ORDER.Principiante;
  const diff = Math.abs(desired - current);

  return Math.max(0, 6 - diff * 2);
}

function getProfileBias(exercise, profile) {
  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;

  if (activity === "high" && exercise.movementType === "compound") return 4;
  if (activity === "low" && exercise.movementType === "mobility") return 4;
  return 0;
}

function matchesSlot(exercise, slot, day, goal) {
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();

  switch (slot) {
    case "strength_main":
      return exercise.movementType === "compound" && exercise.difficultyScore >= 3;
    case "compound":
      return exercise.movementType === "compound";
    case "glute_focus":
      return (
        exercise.muscle === "Glúteos" ||
        (exercise.secondaryMuscles || []).includes("Glúteos") ||
        Number(exercise.priorityByFocus?.["Glúteos y piernas"] || 0) >= 4 ||
        token.includes("hip thrust") ||
        token.includes("sentadilla") ||
        token.includes("zancada")
      );
    case "accessory":
      return exercise.movementType === "accessory";
    case "isolation":
      return exercise.movementType === "isolation";
    case "core":
      return exercise.movementType === "core" || Boolean(day?.muscles?.includes("Abdomen"));
    case "cardio":
      return exercise.movementType === "cardio";
    case "mobility":
      return exercise.movementType === "mobility";
    default:
      return goal === "Fuerza completa" ? exercise.movementType === "compound" : true;
  }
}

function getDaySlots(day, goal, focus) {
  const slots = Array.isArray(day.exerciseSlots) ? [...day.exerciseSlots] : [];

  if (goal === "Fuerza") {
    return compactSlots(["strength_main", "compound", ...slots]);
  }

  if (focus === "Glúteos y piernas") {
    return compactSlots(["strength_main", "compound", "glute_focus", ...slots]);
  }

  if (focus === "Torso y brazos") {
    return compactSlots(["strength_main", "compound", "accessory", ...slots]);
  }

  if (focus === "Core/abdomen") {
    return compactSlots([...slots, "core"]);
  }

  if (focus === "Fuerza completa") {
    return compactSlots(["strength_main", "compound", ...slots]);
  }

  return compactSlots(slots);
}

function getTargetExerciseCount({ level, goal, focus, day }) {
  const dayCount = day.daysPerWeek || 4;
  let count = {
    Principiante: 4,
    Intermedio: 5,
    Avanzado: 6,
  }[level] || 5;

  if (dayCount <= 2) count = Math.max(4, count);
  if (dayCount >= 6 && level === "Avanzado") count = 7;
  if (dayCount >= 5 && level === "Intermedio") count = 6;

  if (goal === "Fuerza") count = Math.max(3, count - 1);
  if (focus === "Core/abdomen") count = Math.min(count, 5);
  if (focus === "Fuerza completa") count = Math.max(4, count - 1);

  return count;
}

function getWarmupItems(day, focus) {
  const mainMuscle = day?.muscles?.[0] || "zona principal";

  if (focus === "Glúteos y piernas") {
    return ["5 min cardio suave", "Movilidad de cadera", "Activación glútea"];
  }

  if (focus === "Torso y brazos") {
    return ["5 min cardio suave", "Movilidad torácica", "Activación escapular"];
  }

  if (focus === "Core/abdomen") {
    return ["5 min cardio suave", "Movilidad lumbar", "Activación abdominal"];
  }

  return [
    "5 min cardio suave",
    `Movilidad de ${mainMuscle.toLowerCase()}`,
    "Activación ligera",
  ];
}

function getFinalItems(goal, focus) {
  if (goal === "Fuerza") {
    return ["Descarga suave", "Respiración", "Movilidad breve"];
  }

  if (focus === "Core/abdomen") {
    return ["Estiramiento corto", "Core ligero", "Respiración"];
  }

  return ["Estiramiento breve", "Respiración y recuperación"];
}

function buildDayBrief(day, focus, goal, profile) {
  const profileHint = getProfileHint(profile, focus, day.daysPerWeek);

  if (focus === "Glúteos y piernas") return "Día enfocado en glúteos con accesorios de pierna";
  if (focus === "Torso y brazos") return "Torso con empuje y tracción priorizados";
  if (focus === "Core/abdomen") return "Core añadido al cierre de la sesión";
  if (goal === "Fuerza") return "Básicos principales y descanso más largo";

  return profileHint;
}

function getProfileHint(profile, focus, daysPerWeek) {
  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;
  const gender = profile?.gender || profile?.genero || profile?.preferences?.gender;

  if (focus === "Glúteos y piernas") return "Más frecuencia de tren inferior";
  if (focus === "Torso y brazos") return "Torso y brazos con menor pierna";
  if (activity === "high") return "Volumen ajustado a tu actividad";
  if (activity === "low" || activity === "sedentary") return "Volumen moderado para progresar";
  if (gender === "female" || gender === "mujer") return "Enfoque sugerido en glúteos y pierna";
  if (daysPerWeek >= 5) return "Más densidad y progresión semanal";

  return "Plan equilibrado y progresivo";
}

function getPlanName({ level, goal, focus, daysPerWeek }) {
  if (goal === "Fuerza") {
    return daysPerWeek >= 5 ? "Plan de fuerza avanzada" : "Plan de fuerza progresiva";
  }

  if (focus === "Glúteos y piernas") {
    return daysPerWeek >= 5 ? "Split de glúteos y pierna" : "Rutina glúteos y pierna";
  }

  if (focus === "Torso y brazos") {
    return daysPerWeek >= 5 ? "Split de torso y brazos" : "Torso y brazos estructurado";
  }

  if (focus === "Core/abdomen") {
    return "Plan con core frecuente";
  }

  if (level === "Principiante") {
    return "Base técnica semanal";
  }

  return daysPerWeek >= 5 ? "Plan semanal de hipertrofia" : "Plan semanal equilibrado";
}

function compactSlots(slots) {
  return [...new Set(slots)].filter(Boolean);
}
