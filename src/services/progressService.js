import { STORAGE_KEYS } from "../config/storageKeys";
import { ACHIEVEMENTS, XP_PER_LEVEL } from "../config/gamification";
import { supabase } from "../lib/supabase";
import { getCache, removeCache, setCache } from "./cacheService";
import { getCachedCheckins, listCheckins } from "./checkinService";
import { getCachedMeals, listMeals } from "./mealService";
import { getCachedDietPlans, listDietPlans } from "./dietService";
import { getLocalDateKey, getWorkoutCompletions } from "./gamificationService";
import {
  getWorkoutSessions,
  listWorkoutSessions,
} from "./workoutSessionService";
import { normalizeProgressLog, normalizeProgressLogs } from "./normalizers";

const PROGRESS_LOGS_KEY = STORAGE_KEYS.PROGRESS_LOGS;
const DIET_PLAN_XP_REWARD = 25;
const LEVEL_GOAL_REQUIREMENTS = {
  2: { meals: 15, checkins: 4, workouts: 4, diets: 2 },
  3: { meals: 30, checkins: 8, workouts: 8, diets: 4 },
  4: { meals: 60, checkins: 12, workouts: 15, diets: 6 },
  5: { meals: 100, checkins: 20, workouts: 25, diets: 10 },
};
const LEVEL_GOAL_GROWTH = {
  meals: 40,
  checkins: 8,
  workouts: 10,
  diets: 4,
};
const ACHIEVEMENT_RULES = [
  {
    id: "first_meal",
    label: ACHIEVEMENTS.find((item) => item.id === "first_meal")?.label || "Primera comida analizada",
    description: "Analiza tu primera comida.",
    metric: "mealsCount",
    target: 1,
  },
  {
    id: "meals_10",
    label: "10 comidas analizadas",
    description: "Mantén el ritmo con 10 análisis de comida.",
    metric: "mealsCount",
    target: 10,
  },
  {
    id: "first_checkin",
    label: ACHIEVEMENTS.find((item) => item.id === "first_checkin")?.label || "Primer check-in",
    description: "Completa tu primer check-in corporal.",
    metric: "checkinsCount",
    target: 1,
  },
  {
    id: "checkins_5",
    label: "5 check-ins completados",
    description: "Refuerza la constancia con 5 check-ins.",
    metric: "checkinsCount",
    target: 5,
  },
  {
    id: "first_workout",
    label: ACHIEVEMENTS.find((item) => item.id === "first_workout")?.label || "Primer entreno completado",
    description: "Completa tu primer entrenamiento.",
    metric: "workoutsCount",
    target: 1,
  },
  {
    id: "workouts_5",
    label: "5 entrenos completados",
    description: "Suma 5 sesiones completadas.",
    metric: "workoutsCount",
    target: 5,
  },
  {
    id: "first_diet",
    label: "Primera dieta creada",
    description: "Genera tu primera dieta IA.",
    metric: "dietPlansCount",
    target: 1,
  },
  {
    id: "streak_3",
    label: ACHIEVEMENTS.find((item) => item.id === "three_day_streak")?.label || "3 días seguidos",
    description: "Mantén 3 días consecutivos de actividad.",
    metric: "streak",
    target: 3,
  },
  {
    id: "streak_7",
    label: "7 días seguidos",
    description: "Consigue una semana completa de constancia.",
    metric: "streak",
    target: 7,
  },
  {
    id: "level_2",
    label: "Nivel 2",
    description: "Alcanza el Nivel 2.",
    metric: "level",
    target: 2,
  },
  {
    id: "level_3",
    label: "Nivel 3",
    description: "Alcanza el Nivel 3.",
    metric: "level",
    target: 3,
  },
  {
    id: "level_4",
    label: "Nivel 4",
    description: "Alcanza el Nivel 4.",
    metric: "level",
    target: 4,
  },
  {
    id: "level_5",
    label: "Nivel 5",
    description: "Alcanza el Nivel 5.",
    metric: "level",
    target: 5,
  },
];

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

export function getCachedProgressSummary(userId) {
  return buildProgressSummary({
    meals: getCachedMeals(),
    checkins: getCachedCheckins(userId),
    dietPlans: getCachedDietPlans(),
    workoutSessions: getWorkoutSessions(userId),
    workoutCompletions: getWorkoutCompletions(),
  });
}

export async function loadProgressSummary(
  userId,
  { fallbackToCache = true } = {}
) {
  if (!userId) {
    return getCachedProgressSummary(userId);
  }

  await Promise.allSettled([
    listMeals(userId, { fallbackToCache }),
    listCheckins(userId, { fallbackToCache }),
    listDietPlans(userId, { fallbackToCache }),
    listWorkoutSessions(userId, { fallbackToCache }),
  ]);

  return getCachedProgressSummary(userId);
}

export function buildProgressSummary({
  meals = [],
  checkins = [],
  dietPlans = [],
  workoutSessions = [],
  workoutCompletions = [],
}) {
  const normalizedMeals = Array.isArray(meals) ? meals : [];
  const normalizedCheckins = Array.isArray(checkins) ? checkins : [];
  const normalizedDietPlans = Array.isArray(dietPlans) ? dietPlans : [];
  const normalizedWorkoutSessions = Array.isArray(workoutSessions)
    ? workoutSessions
    : [];
  const normalizedWorkoutCompletions = Array.isArray(workoutCompletions)
    ? workoutCompletions
    : [];

  const mealsCount = normalizedMeals.length;
  const checkinsCount = normalizedCheckins.length;
  const dietPlansCount = normalizedDietPlans.length;
  const workoutsCount = collectWorkoutCount({
    workoutSessions: normalizedWorkoutSessions,
    workoutCompletions: normalizedWorkoutCompletions,
  });
  const xp =
    mealsCount * 10 +
    checkinsCount * 20 +
    workoutsCount * 15 +
    dietPlansCount * DIET_PLAN_XP_REWARD;
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpWithinLevel = xp % XP_PER_LEVEL;
  const percent = xp === 0 ? 0 : Math.round((xpWithinLevel / XP_PER_LEVEL) * 100);
  const remainingXp = xp === 0 ? XP_PER_LEVEL : XP_PER_LEVEL - xpWithinLevel;
  const nextLevel = level + 1;
  const counters = {
    mealsCount,
    checkinsCount,
    workoutsCount,
    dietPlansCount,
    streak: 0,
  };

  const activityDateKeys = collectActivityDateKeys({
    meals: normalizedMeals,
    checkins: normalizedCheckins,
    dietPlans: normalizedDietPlans,
    workoutSessions: normalizedWorkoutSessions,
    workoutCompletions: normalizedWorkoutCompletions,
  });
  const streak = getCurrentStreakFromDates(activityDateKeys);
  counters.streak = streak;
  const nextLevelRequirements = getNextLevelRequirements(nextLevel);
  const nextLevelGoals = {
    meals: {
      current: mealsCount,
      required: nextLevelRequirements.meals,
    },
    checkins: {
      current: checkinsCount,
      required: nextLevelRequirements.checkins,
    },
    workouts: {
      current: workoutsCount,
      required: nextLevelRequirements.workouts,
    },
    diets: {
      current: dietPlansCount,
      required: nextLevelRequirements.diets,
    },
  };
  const achievements = buildAchievementLists({
    counters,
    level,
  });

  return {
    streak,
    mealsCount,
    checkinsCount,
    dietPlansCount,
    workoutsCount,
    xp,
    level,
    percent,
    remainingXp,
    nextLevel,
    counters,
    nextLevelGoals,
    unlockedAchievements: achievements.unlockedAchievements,
    lockedAchievements: achievements.lockedAchievements,
  };
}

function getNextLevelRequirements(level) {
  if (LEVEL_GOAL_REQUIREMENTS[level]) {
    return LEVEL_GOAL_REQUIREMENTS[level];
  }

  if (level <= 2) {
    return LEVEL_GOAL_REQUIREMENTS[2];
  }

  const extraLevels = Math.max(0, level - 5);
  const base = LEVEL_GOAL_REQUIREMENTS[5];

  return {
    meals: base.meals + LEVEL_GOAL_GROWTH.meals * extraLevels,
    checkins: base.checkins + LEVEL_GOAL_GROWTH.checkins * extraLevels,
    workouts: base.workouts + LEVEL_GOAL_GROWTH.workouts * extraLevels,
    diets: base.diets + LEVEL_GOAL_GROWTH.diets * extraLevels,
  };
}

function buildAchievementLists({ counters, level }) {
  const normalizedCounters = {
    mealsCount: Math.max(0, Number(counters?.mealsCount) || 0),
    checkinsCount: Math.max(0, Number(counters?.checkinsCount) || 0),
    workoutsCount: Math.max(0, Number(counters?.workoutsCount) || 0),
    dietPlansCount: Math.max(0, Number(counters?.dietPlansCount) || 0),
    streak: Math.max(0, Number(counters?.streak) || 0),
  };

  const mappedAchievements = ACHIEVEMENT_RULES.map((rule) => {
    const current = getMetricValue(rule.metric, normalizedCounters, level);
    const target = Math.max(1, Number(rule.target) || 1);
    const progress = Math.min(1, current / target);
    const unlocked = current >= target;

    return {
      id: rule.id,
      label: rule.label,
      description: rule.description,
      metric: rule.metric,
      current,
      target,
      progress,
      unlocked,
    };
  });

  const unlockedAchievements = mappedAchievements
    .filter((achievement) => achievement.unlocked)
    .sort((left, right) => left.target - right.target || left.label.localeCompare(right.label));

  const lockedAchievements = mappedAchievements
    .filter((achievement) => !achievement.unlocked)
    .sort((left, right) => right.progress - left.progress || left.target - right.target);

  return {
    unlockedAchievements,
    lockedAchievements,
  };
}

function getMetricValue(metric, counters, level) {
  if (metric === "level") return Math.max(1, Number(level) || 1);
  if (metric === "streak") return Math.max(0, Number(counters.streak) || 0);
  if (metric === "mealsCount") return Math.max(0, Number(counters.mealsCount) || 0);
  if (metric === "checkinsCount") return Math.max(0, Number(counters.checkinsCount) || 0);
  if (metric === "workoutsCount") return Math.max(0, Number(counters.workoutsCount) || 0);
  if (metric === "dietPlansCount") return Math.max(0, Number(counters.dietPlansCount) || 0);

  return 0;
}

function collectActivityDateKeys({
  meals = [],
  checkins = [],
  dietPlans = [],
  workoutSessions = [],
  workoutCompletions = [],
}) {
  const dateKeys = new Set();

  [
    ...meals.map((item) => item?.created_at || item?.createdAt),
    ...checkins.map((item) => item?.created_at || item?.createdAt),
    ...dietPlans.map((item) => item?.created_at || item?.createdAt),
    ...workoutSessions.map((item) => item?.completedAt || item?.completed_at || item?.date),
    ...workoutCompletions.map((item) => item?.completedAt || item?.completed_at || item?.date),
  ]
    .map(normalizeDateKey)
    .filter(Boolean)
    .forEach((dateKey) => dateKeys.add(dateKey));

  return dateKeys;
}

function getCurrentStreakFromDates(dateKeys) {
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const dateKey = getLocalDateKey(cursor);

    if (!dateKeys.has(dateKey)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function collectWorkoutCount({ workoutSessions = [], workoutCompletions = [] }) {
  const sessionDateKeys = new Set(
    workoutSessions
      .map((item) => item?.completedAt || item?.completed_at || item?.date)
      .map(normalizeDateKey)
      .filter(Boolean)
  );

  const extraCompletions = workoutCompletions.filter((item) => {
    const dateKey = normalizeDateKey(
      item?.completedAt || item?.completed_at || item?.date
    );

    return Boolean(dateKey) && !sessionDateKeys.has(dateKey);
  });

  return workoutSessions.length + extraCompletions.length;
}

function normalizeDateKey(value) {
  if (!value) return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return getLocalDateKey(date);
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
