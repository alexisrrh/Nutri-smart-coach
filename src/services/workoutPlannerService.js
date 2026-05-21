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

const GOAL_PROFILES = {
  "Ganar músculo": {
    compound: 1.25,
    accessory: 1.1,
    isolation: 0.9,
    core: 0.75,
    cardio: 0.4,
    restDelta: 18,
    setDelta: 1,
    heavyBias: 1.3,
    cardioFinish: false,
    supersets: false,
  },
  Definir: {
    compound: 1.1,
    accessory: 1,
    isolation: 1.05,
    core: 1.15,
    cardio: 1.3,
    restDelta: -18,
    setDelta: 0,
    heavyBias: 0.9,
    cardioFinish: true,
    supersets: true,
  },
  Fuerza: {
    compound: 1.4,
    accessory: 1,
    isolation: 0.55,
    core: 0.75,
    cardio: 0.2,
    restDelta: 28,
    setDelta: 0,
    heavyBias: 1.45,
    cardioFinish: false,
    supersets: false,
  },
};

const LEVEL_PROFILES = {
  Principiante: {
    targetDelta: -1,
    simpleBias: 1.3,
    density: 0.85,
    samePatternPenalty: 16,
    sameEquipmentPenalty: 10,
    repeatPenalty: 30,
  },
  Intermedio: {
    targetDelta: 0,
    simpleBias: 1,
    density: 1,
    samePatternPenalty: 18,
    sameEquipmentPenalty: 12,
    repeatPenalty: 34,
  },
  Avanzado: {
    targetDelta: 1,
    simpleBias: 0.88,
    density: 1.15,
    samePatternPenalty: 20,
    sameEquipmentPenalty: 14,
    repeatPenalty: 38,
  },
};

const FOCUS_PROFILES = {
  General: {
    general: 1,
    push: 1,
    pull: 1,
    lower: 1,
    core: 1.1,
  },
  "Glúteos y piernas": {
    general: 1,
    lower: 1.5,
    glute: 1.7,
    squat: 1.35,
    hinge: 1.25,
    core: 1,
  },
  "Torso y brazos": {
    general: 1,
    push: 1.35,
    pull: 1.35,
    arms: 1.25,
    lower: 0.85,
    core: 1,
  },
  "Core/abdomen": {
    general: 1,
    core: 1.8,
    lower: 0.9,
    push: 0.9,
    pull: 0.9,
  },
  "Fuerza completa": {
    general: 1,
    compound: 1.45,
    push: 1.15,
    pull: 1.15,
    lower: 1.15,
    core: 1.05,
  },
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
  const planState = createPlanState({
    level: resolvedLevel,
    goal: resolvedGoal,
    focus: resolvedFocus,
    daysPerWeek: resolvedDays,
  });

  const days = split.map((day, dayIndex) => {
    const builtDay = buildWorkoutDay({
      day,
      level: resolvedLevel,
      goal: resolvedGoal,
      focus: resolvedFocus,
      profile,
      exercises,
      planState,
      dayIndex,
    });

    updatePlanState(planState, builtDay);
    return builtDay;
  });

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
      trainingStyle: getTrainingStyle(resolvedGoal, resolvedFocus, resolvedLevel),
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
  planState,
  dayIndex = 0,
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
    planState,
    dayIndex,
  });
  const decoratedExercises = decorateExercises(selectedExercises, {
    day,
    level,
    goal,
    focus,
    profile,
    planState,
    dayIndex,
  });
  const mainLiftIndex = pickMainLiftIndex(decoratedExercises);
  const exercisesWithMainLift = decoratedExercises.map((exercise, index) => {
    if (index !== mainLiftIndex) {
      return {
        ...exercise,
        mainLift: false,
      };
    }

    const mainLiftPrescription = getPersonalizedPrescription(exercise, level, goal, true);

    return {
      ...exercise,
      ...mainLiftPrescription,
      setsByLevel: {
        ...(exercise.setsByLevel || {}),
        [level]: mainLiftPrescription.sets,
      },
      repsByGoal: {
        ...(exercise.repsByGoal || {}),
        [goal]: mainLiftPrescription.reps,
      },
      restByGoal: {
        ...(exercise.restByGoal || {}),
        [goal]: mainLiftPrescription.rest,
      },
      mainLift: true,
      superseries: false,
      exerciseScore: Math.round((exercise.exerciseScore || 0) + 10),
      volumeScore: Math.max(1, Math.round((exercise.volumeScore || 0) * 1.15)),
      fatigueScore: Math.max(1, Math.round((exercise.fatigueScore || 0) * 1.1)),
    };
  });
  const mainLift = exercisesWithMainLift[mainLiftIndex] || null;

  return {
    ...day,
    exercises: exercisesWithMainLift,
    warmupItems: getWarmupItems(day, focus),
    finalItems: getFinalItems(goal, focus, day, exercisesWithMainLift),
    mainLift,
    mainLiftName: mainLift?.name || "",
    trainingStyle: getTrainingStyle(goal, focus, level),
    volumeScore: exercisesWithMainLift.reduce((total, item) => total + Number(item.volumeScore || 0), 0),
    fatigueScore: exercisesWithMainLift.reduce((total, item) => total + Number(item.fatigueScore || 0), 0),
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
  planState,
  dayIndex = 0,
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
  const targetCount = countOverride || getTargetExerciseCount({ level, goal, focus, day, profile });
  const rankedPool = [...pool].sort(
    (a, b) =>
      scoreExercise(b, {
        day,
        level,
        goal,
        focus,
        profile,
        planState,
        selected: [],
        targetCount,
        dayIndex,
      }) -
      scoreExercise(a, {
        day,
        level,
        goal,
        focus,
        profile,
        planState,
        selected: [],
        targetCount,
        dayIndex,
      })
  );
  const selected = [];

  for (const slot of slotOrder) {
    if (selected.length >= targetCount) break;

    const remaining = rankedPool.filter((exercise) => !selected.some((item) => item.id === exercise.id));
    const nextExercise = pickBestExerciseForSlot(remaining, {
      slot,
      day,
      level,
      goal,
      focus,
      profile,
      planState,
      selected,
      targetCount,
      dayIndex,
    });

    if (nextExercise) {
      selected.push(nextExercise);
    }
  }

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
  if (gender === "male" || gender === "hombre") return "Torso y brazos";

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

function scoreExercise(exercise, { day, level, goal, focus, profile, planState, selected = [], dayIndex = 0 }) {
  const focusScore = Number(exercise.priorityByFocus?.[focus] || exercise.priorityByFocus?.General || 1);
  const muscleScore = getMuscleScore(exercise, day.muscles);
  const goalScore = getGoalScore(exercise, goal);
  const slotScore = getSlotScore(exercise, day.exerciseSlots || [], day, goal);
  const levelScore = getLevelScore(exercise, level);
  const profileBias = getProfileBias(exercise, profile);
  const varietyScore = getVarietyScore(exercise, planState, selected, dayIndex);
  const patternScore = getPatternScore(exercise, day, planState);
  const equipmentScore = getEquipmentScore(exercise, planState, selected);
  const roleScore = getRoleScore(exercise, day?.role);
  const focusBias = getFocusBias(exercise, focus);
  const goalBias = getGoalBias(exercise, goal);
  const levelBias = getLevelBias(exercise, level);

  return (
    focusScore * 14 +
    muscleScore * 10 +
    goalScore * 8 +
    slotScore * 10 +
    levelScore * 5 +
    profileBias +
    varietyScore +
    patternScore +
    equipmentScore +
    roleScore +
    focusBias +
    goalBias +
    levelBias
  );
}

function getMuscleScore(exercise, muscles) {
  const primary = muscles.includes(exercise.muscle) ? 1 : 0;
  const secondary = (exercise.secondaryMuscles || []).some((muscle) => muscles.includes(muscle)) ? 1 : 0;
  return primary * 2 + secondary;
}

function getGoalScore(exercise, goal) {
  if (goal === "Fuerza") {
    return exercise.movementType === "compound" ? 7 : exercise.movementType === "accessory" ? 4 : 1;
  }

  if (goal === "Definir") {
    return exercise.movementType === "compound"
      ? 5
      : exercise.movementType === "cardio"
        ? 5
        : exercise.movementType === "core"
          ? 4
          : 3;
  }

  return exercise.movementType === "compound"
    ? 6
    : exercise.movementType === "accessory"
      ? 4
      : exercise.movementType === "isolation"
        ? 3
        : 2;
}

function getSlotScore(exercise, slots, day, goal) {
  return Math.max(
    ...slots.map((slot) => (matchesSlot(exercise, slot, day, goal) ? 7 - (SLOT_ORDER[slot] ?? 0) / 2 : 0)),
    0
  );
}

function pickBestExerciseForSlot(remaining, { slot, day, level, goal, focus, profile, planState, selected = [], dayIndex = 0 }) {
  if (!remaining.length) return null;

  const exactMatches = remaining.filter((exercise) => matchesSlot(exercise, slot, day, goal));
  const candidates = exactMatches.length ? exactMatches : remaining;

  return [...candidates].sort(
    (a, b) =>
      scoreSlotCandidate(b, { slot, day, level, goal, focus, profile, planState, selected, dayIndex }) -
      scoreSlotCandidate(a, { slot, day, level, goal, focus, profile, planState, selected, dayIndex })
  )[0];
}

function scoreSlotCandidate(exercise, { slot, day, level, goal, focus, profile, planState, selected, dayIndex }) {
  const baseScore = scoreExercise(exercise, {
    day,
    level,
    goal,
    focus,
    profile,
    planState,
    selected,
    dayIndex,
  });
  const slotBonus = matchesSlot(exercise, slot, day, goal) ? 12 : 0;
  const slotPriority = SLOT_ORDER[slot] ?? 0;

  if (slot === "strength_main" && exercise.movementType === "compound") {
    return baseScore + slotBonus + Number(exercise.difficultyScore || 2) * 4;
  }

  if (slot === "glute_focus" && exercise.priorityByFocus?.["Glúteos y piernas"] >= 4) {
    return baseScore + slotBonus + 10;
  }

  if (slot === "core" && exercise.movementType === "core") {
    return baseScore + slotBonus + 8;
  }

  return baseScore + slotBonus + Math.max(0, 5 - slotPriority);
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

function getVarietyScore(exercise, planState, selected, dayIndex) {
  const pattern = getExercisePattern(exercise);
  const equipmentType = getEquipmentType(exercise.equipment);
  const levelProfile = getLevelProfile(exercise.level);
  let score = 0;

  if (!selected.some((item) => getExercisePattern(item) === pattern)) {
    score += 5 * (levelProfile.simpleBias || 1);
  }

  if (!selected.some((item) => getEquipmentType(item.equipment) === equipmentType)) {
    score += 2 + (dayIndex % 2 === 0 ? 1 : 0);
  }

  if (planState?.recentPatterns?.includes(pattern)) {
    score -= levelProfile.samePatternPenalty || 12;
  }

  if (planState?.recentEquipmentTypes?.includes(equipmentType)) {
    score -= levelProfile.sameEquipmentPenalty || 8;
  }

  if (planState?.usedExerciseIds?.has(exercise.id)) {
    score -= levelProfile.repeatPenalty || 24;
  }

  return score;
}

function getPatternScore(exercise, day, planState) {
  const pattern = getExercisePattern(exercise);
  const dayRole = day?.role || inferDayRole(day);
  const currentCount = Number(planState?.patternCounts?.[pattern] || 0);

  const base = {
    push: dayRole === "push" || dayRole === "mixed_upper" ? 4 : 0,
    pull: dayRole === "pull" || dayRole === "mixed_upper" ? 4 : 0,
    lower: dayRole === "lower" ? 5 : 0,
    glute: dayRole === "lower" ? 4 : 0,
    squat: dayRole === "lower" ? 3 : 0,
    hinge: dayRole === "lower" ? 3 : 0,
    core: dayRole === "core" ? 5 : day?.muscles?.includes("Abdomen") ? 3 : 0,
    arms: dayRole === "push" || dayRole === "pull" || dayRole === "mixed_upper" ? 3 : 0,
    bodyweight: 1,
  }[pattern] ?? 0;

  return Math.max(0, base + Math.max(0, 4 - currentCount));
}

function getEquipmentScore(exercise, planState, selected) {
  const equipmentType = getEquipmentType(exercise.equipment);
  const currentCount = selected.filter((item) => getEquipmentType(item.equipment) === equipmentType).length;
  const recentCount = Number(planState?.equipmentCounts?.[equipmentType] || 0);

  return Math.max(0, 4 - currentCount) + Math.max(0, 3 - recentCount);
}

function getRoleScore(exercise, role) {
  const pattern = getExercisePattern(exercise);
  if (role === "lower") {
    return ["glute", "squat", "hinge"].includes(pattern) ? 4 : 0;
  }
  if (role === "push") {
    return ["push", "arms"].includes(pattern) ? 4 : 0;
  }
  if (role === "pull") {
    return ["pull", "arms"].includes(pattern) ? 4 : 0;
  }
  if (role === "core") {
    return pattern === "core" ? 5 : 0;
  }
  if (role === "mixed_upper") {
    return ["push", "pull", "arms"].includes(pattern) ? 3 : 0;
  }
  return 0;
}

function getFocusBias(exercise, focus) {
  const pattern = getExercisePattern(exercise);
  const muscle = exercise.muscle;
  const focusProfile = getFocusProfile(focus);

  if (muscle === "Glúteos") return Number(focusProfile.glute || focusProfile.lower || focusProfile.general || 1) * 2;
  if (muscle === "Piernas") return Number(focusProfile.lower || focusProfile.general || 1) * 2;
  if (muscle === "Pecho" || muscle === "Hombros" || muscle === "Tríceps") {
    return Number(focusProfile.push || focusProfile.general || 1) * 2;
  }
  if (muscle === "Espalda" || muscle === "Bíceps") {
    return Number(focusProfile.pull || focusProfile.general || 1) * 2;
  }
  if (muscle === "Abdomen") return Number(focusProfile.core || focusProfile.general || 1) * 3;
  if (pattern === "glute") return Number(focusProfile.glute || 1) * 2;
  if (pattern === "squat" || pattern === "hinge") return Number(focusProfile.lower || 1) * 1.5;
  return Number(focusProfile.general || 1);
}

function getGoalBias(exercise, goal) {
  const goalProfile = getGoalProfile(goal);
  const pattern = getExercisePattern(exercise);
  const movementType = exercise.movementType || "accessory";

  if (movementType === "compound") return Number(goalProfile.compound || 1) * 2;
  if (movementType === "accessory") return Number(goalProfile.accessory || 1);
  if (movementType === "isolation") return Number(goalProfile.isolation || 1);
  if (movementType === "core") return Number(goalProfile.core || 1) * 2;
  if (movementType === "cardio") return Number(goalProfile.cardio || 1) * 2;
  if (pattern === "glute") return Number(goalProfile.compound || 1);
  return 0;
}

function getLevelBias(exercise, level) {
  const profile = getLevelProfile(level);
  const difficultyScore = Number(exercise.difficultyScore || 2);
  const target = level === "Principiante" ? 2 : level === "Intermedio" ? 3 : 4;
  const closeness = Math.max(0, 6 - Math.abs(difficultyScore - target) * 2);

  return closeness * (profile.density || 1) * 0.5;
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

function getTargetExerciseCount({ level, goal, focus, day, profile }) {
  const dayCount = day.daysPerWeek || 4;
  let count = {
    Principiante: 4,
    Intermedio: 5,
    Avanzado: 6,
  }[level] || 5;

  const levelProfile = getLevelProfile(level);

  if (dayCount <= 2) count = Math.max(4, count);
  if (dayCount >= 6 && level === "Avanzado") count = 7;
  if (dayCount >= 5 && level === "Intermedio") count = 6;

  if (goal === "Fuerza") count = Math.max(3, count - 1);
  if (goal === "Definir" && level !== "Principiante") count += 1;
  if (focus === "Core/abdomen") count = Math.min(count, 5);
  if (focus === "Fuerza completa") count = Math.max(4, count - 1);
  if (focus === "Glúteos y piernas" && (profile?.gender === "female" || profile?.genero === "mujer")) count += 1;
  if (focus === "Torso y brazos" && (profile?.gender === "male" || profile?.genero === "hombre")) count += 1;
  if (level === "Principiante") count = Math.max(3, count + levelProfile.targetDelta);
  if (level === "Avanzado") count = Math.min(7, count + levelProfile.targetDelta);

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

  if (goal === "Definir") {
    return ["Estiramiento breve", "Cardio suave", "Respiración"];
  }

  if (focus === "Core/abdomen") {
    return ["Estiramiento corto", "Core ligero", "Respiración"];
  }

  return ["Estiramiento breve", "Respiración y recuperación"];
}

function buildDayBrief(day, focus, goal, profile) {
  const profileHint = getProfileHint(profile, focus, day.daysPerWeek);

  if (focus === "Glúteos y piernas") return "Glúteos y pierna con prioridad";
  if (focus === "Torso y brazos") return "Torso y brazos con más frecuencia";
  if (focus === "Core/abdomen") return "Core añadido al cierre de la sesión";
  if (goal === "Fuerza") return "Básicos principales y descanso más largo";
  if (goal === "Definir") return "Más densidad y superseries";

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
  if (gender === "male" || gender === "hombre") return "Enfoque sugerido en torso y espalda";
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

  if (goal === "Definir") {
    return daysPerWeek >= 5 ? "Plan semanal de definición" : "Plan equilibrado de definición";
  }

  return daysPerWeek >= 5 ? "Plan semanal de hipertrofia" : "Plan semanal equilibrado";
}

function compactSlots(slots) {
  return [...new Set(slots)].filter(Boolean);
}

function getGoalProfile(goal) {
  return GOAL_PROFILES[goal] || GOAL_PROFILES["Ganar músculo"];
}

function getLevelProfile(level) {
  return LEVEL_PROFILES[level] || LEVEL_PROFILES.Intermedio;
}

function getFocusProfile(focus) {
  return FOCUS_PROFILES[focus] || FOCUS_PROFILES.General;
}

function getTrainingStyle(goal, focus, level) {
  if (goal === "Definir") return "Superseries + cardio final";
  if (goal === "Fuerza") return "Básicos pesados";
  if (focus === "Glúteos y piernas") return "Volumen de tren inferior";
  if (focus === "Torso y brazos") return "Torso y brazos";
  if (focus === "Core/abdomen") return "Core y estabilidad";
  if (level === "Avanzado") return "Hipertrofia densa";
  return "Plan equilibrado";
}

function createPlanState({ level, goal, focus, daysPerWeek } = {}) {
  return {
    level,
    goal,
    focus,
    daysPerWeek,
    usedExerciseIds: new Set(),
    recentPatterns: [],
    recentEquipmentTypes: [],
    patternCounts: {},
    equipmentCounts: {},
    muscleCounts: {},
  };
}

function updatePlanState(planState, day) {
  if (!planState || !day?.exercises?.length) return;

  for (const exercise of day.exercises) {
    planState.usedExerciseIds.add(exercise.id);

    const pattern = getExercisePattern(exercise);
    const equipmentType = getEquipmentType(exercise.equipment);
    const muscle = exercise.muscle;

    planState.patternCounts[pattern] = (planState.patternCounts[pattern] || 0) + 1;
    planState.equipmentCounts[equipmentType] = (planState.equipmentCounts[equipmentType] || 0) + 1;
    planState.muscleCounts[muscle] = (planState.muscleCounts[muscle] || 0) + 1;
    planState.recentPatterns.push(pattern);
    planState.recentEquipmentTypes.push(equipmentType);
  }

  planState.recentPatterns = planState.recentPatterns.slice(-4);
  planState.recentEquipmentTypes = planState.recentEquipmentTypes.slice(-4);
}

function decorateExercises(exercises, context) {
  return exercises.map((exercise, index) => {
    const isMainLift = false;
    const prescription = getPersonalizedPrescription(exercise, context.level, context.goal, isMainLift);
    const patternGroup = exercise.patternGroup || getExercisePattern(exercise);
    const equipmentType = exercise.equipmentType || getEquipmentType(exercise.equipment);
    const exerciseScore = Math.round(
      scoreExercise(exercise, {
        ...context,
        selected: exercises.slice(0, index),
      })
    );
    const fatigueScore = Math.max(
      1,
      Math.round(
        (Number(exercise.difficultyScore || 2) +
          (exercise.movementType === "compound" ? 2 : 0) +
          (isMainLift ? 1 : 0) +
          (context.goal === "Fuerza" ? 1 : 0)) * 1.2
      )
    );
    const volumeScore = Math.max(
      1,
      Math.round(
        prescription.sets *
          repSpanToAverage(prescription.reps) *
          (exercise.movementType === "compound" ? 1.4 : exercise.movementType === "accessory" ? 1.1 : 0.9)
      )
    );

    return {
      ...exercise,
      ...prescription,
      setsByLevel: {
        ...(exercise.setsByLevel || {}),
        [context.level]: prescription.sets,
      },
      repsByGoal: {
        ...(exercise.repsByGoal || {}),
        [context.goal]: prescription.reps,
      },
      restByGoal: {
        ...(exercise.restByGoal || {}),
        [context.goal]: prescription.rest,
      },
      patternGroup,
      equipmentType,
      exerciseScore,
      fatigueScore,
      volumeScore,
      targetVolume: volumeScore,
      superseries: context.goal === "Definir" && !isMainLift,
      mainLift: isMainLift,
    };
  });
}

function pickMainLiftIndex(exercises) {
  if (!exercises.length) return 0;

  return exercises.reduce((bestIndex, exercise, index) => {
    const best = exercises[bestIndex];
    const currentScore = getMainLiftScore(exercise);
    const bestScore = getMainLiftScore(best);
    return currentScore > bestScore ? index : bestIndex;
  }, 0);
}

function getMainLiftScore(exercise) {
  const movementScore = exercise.movementType === "compound" ? 8 : exercise.movementType === "accessory" ? 4 : 1;
  const difficultyScore = Number(exercise.difficultyScore || 2);
  const patternScore = ["glute", "squat", "hinge", "push", "pull"].includes(getExercisePattern(exercise)) ? 2 : 0;
  return movementScore * 3 + difficultyScore * 2 + patternScore + Number(exercise.exerciseScore || 0) / 10;
}

function getPersonalizedPrescription(exercise, level, goal, isMainLift) {
  const levelDefaults = {
    Principiante: { sets: 2, rest: "60-90s" },
    Intermedio: { sets: 3, rest: "60-120s" },
    Avanzado: { sets: 4, rest: "90-150s" },
  };

  const setsByLevel = exercise?.setsByLevel || {};
  const repsByGoal = exercise?.repsByGoal || {};
  const restByGoal = exercise?.restByGoal || {};

  let sets = Number(setsByLevel[level] || exercise?.sets || levelDefaults[level]?.sets || 3);
  let reps = repsByGoal[goal] || exercise?.reps || "8-12";
  let rest = restByGoal[goal] || exercise?.rest || levelDefaults[level]?.rest || "60-90s";

  if (goal === "Definir") {
    if (!isMainLift) {
      sets = Math.max(2, sets - 1);
    }
    rest = shortenRest(rest, 15);
  }

  if (goal === "Ganar músculo") {
    if (isMainLift && exercise.movementType === "compound") {
      sets += 1;
      rest = lengthenRest(rest, 20);
    } else if (exercise.movementType === "accessory") {
      rest = lengthenRest(rest, 10);
    }
  }

  if (goal === "Fuerza") {
    if (isMainLift && exercise.movementType === "compound") {
      sets += 1;
      rest = lengthenRest(rest, 30);
    }
    reps = repsByGoal[goal] || "4-6";
  }

  if (level === "Principiante") {
    sets = Math.max(2, Math.min(3, sets));
  } else if (level === "Intermedio") {
    sets = Math.max(3, Math.min(4, sets));
  } else {
    sets = Math.max(3, sets);
  }

  if (exercise.movementType === "core") {
    rest = shortenRest(rest, goal === "Definir" ? 15 : 5);
  }

  if (exercise.movementType === "cardio") {
    rest = goal === "Definir" ? "20-30s" : "30-45s";
  }

  return {
    sets,
    reps,
    rest,
    setsByLevel: {
      ...(exercise?.setsByLevel || {}),
      [level]: sets,
    },
    repsByGoal: {
      ...(exercise?.repsByGoal || {}),
      [goal]: reps,
    },
    restByGoal: {
      ...(exercise?.restByGoal || {}),
      [goal]: rest,
    },
    estimatedCalories: exercise?.estimatedCalories || 0,
  };
}

function getExercisePattern(exercise) {
  const token = normalizeExerciseToken(`${exercise.id} ${exercise.name}`);
  const patternGroup = exercise.patternGroup;
  if (patternGroup) return patternGroup;

  if (exercise.movementType === "core") return "core";
  if (exercise.movementType === "cardio") return "cardio";
  if (exercise.movementType === "mobility") return "mobility";
  if (token.includes("hip thrust") || token.includes("abduccion") || token.includes("glute")) return "glute";
  if (token.includes("sentadilla") || token.includes("prensa") || token.includes("zancada")) return "squat";
  if (token.includes("peso muerto") || token.includes("rumano") || token.includes("pull-through")) return "hinge";
  if (token.includes("press") || token.includes("flexion") || token.includes("fondos")) return "push";
  if (token.includes("remo") || token.includes("dominadas") || token.includes("jalon") || token.includes("pull")) return "pull";
  if (token.includes("curl") || token.includes("extension")) return "arms";
  return exercise.movementType || "accessory";
}

function getEquipmentType(equipment = "") {
  const token = normalizeExerciseToken(equipment);
  if (token.includes("barra") || token.includes("barbell") || token.includes("z")) return "barbell";
  if (token.includes("mancuerna") || token.includes("dumbbell")) return "dumbbell";
  if (token.includes("polea") || token.includes("cable")) return "cable";
  if (token.includes("máquina") || token.includes("maquina")) return "machine";
  if (token.includes("banda")) return "band";
  if (token.includes("peso corporal") || token.includes("corporal")) return "bodyweight";
  return "other";
}

function inferDayRole(day) {
  if (day?.role) return day.role;
  const muscles = Array.isArray(day?.muscles) ? day.muscles : [];
  const normalized = muscles.map((muscle) => normalizeExerciseToken(muscle));
  const hasPush = normalized.some((item) => ["pecho", "hombros", "triceps"].includes(item));
  const hasPull = normalized.some((item) => ["espalda", "biceps"].includes(item));
  const hasLower = normalized.some((item) => ["piernas", "gluteos"].includes(item));
  const hasCore = normalized.some((item) => ["abdomen", "core"].includes(item));

  if (day?.focus === "Core/abdomen" || (hasCore && !hasPush && !hasPull && !hasLower)) return "core";
  if (day?.focus === "Glúteos y piernas" || hasLower) return "lower";
  if (day?.focus === "Torso y brazos" || (hasPush && hasPull)) return "mixed_upper";
  if (hasPush) return "push";
  if (hasPull) return "pull";
  return "mixed";
}

function shortenRest(rest, delta) {
  const value = parseRestValue(rest);
  if (!value) return rest;
  const next = Math.max(20, value - delta);
  return `${next}s`;
}

function lengthenRest(rest, delta) {
  const value = parseRestValue(rest);
  if (!value) return rest;
  const next = Math.max(value + delta, value);
  return `${next}s`;
}

function parseRestValue(rest) {
  const match = String(rest || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function repSpanToAverage(reps) {
  const value = String(reps || "");
  const match = value.match(/(\d+)\s*-\s*(\d+)/);
  if (match) return (Number(match[1]) + Number(match[2])) / 2;
  const single = value.match(/(\d+)/);
  return single ? Number(single[1]) : 10;
}

function normalizeExerciseToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
