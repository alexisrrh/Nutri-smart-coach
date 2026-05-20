import {
  ACHIEVEMENTS,
  DAILY_PROGRESS_ITEMS,
  DEFAULT_DAILY_MEAL_GOAL,
  GAMIFICATION_STORAGE_KEY,
  WORKOUT_COMPLETIONS_KEY,
  XP_PER_LEVEL,
  XP_REWARDS,
} from "../config/gamification";
import { getCache, setCache } from "./cacheService";

const DEFAULT_GAMIFICATION_STATE = {
  currentStreak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  xp: 0,
  awardedEvents: [],
};

export function getGamificationState() {
  return normalizeGamificationState(
    getCache(GAMIFICATION_STORAGE_KEY, DEFAULT_GAMIFICATION_STATE)
  );
}

export function syncGamificationState(activity) {
  const state = getGamificationState();
  const todayKey = getLocalDateKey();
  const activeToday = Boolean(
    activity?.hasMealToday || activity?.hasWorkoutToday || activity?.hasCheckinToday
  );

  let nextState = { ...state };

  if (activeToday && state.lastCompletedDate !== todayKey) {
    const yesterdayKey = getOffsetDateKey(-1);
    const keepsStreak = state.lastCompletedDate === yesterdayKey;
    const currentStreak = keepsStreak ? state.currentStreak + 1 : 1;

    nextState = {
      ...nextState,
      currentStreak,
      bestStreak: Math.max(state.bestStreak, currentStreak),
      lastCompletedDate: todayKey,
    };
  }

  const awardableEvents = getAwardableEvents(activity, todayKey);
  const awardedEvents = new Set(nextState.awardedEvents);
  let xpToAdd = 0;

  awardableEvents.forEach((event) => {
    if (!awardedEvents.has(event.id)) {
      awardedEvents.add(event.id);
      xpToAdd += event.xp;
    }
  });

  if (xpToAdd > 0 || awardedEvents.size !== nextState.awardedEvents.length) {
    nextState = {
      ...nextState,
      xp: nextState.xp + xpToAdd,
      awardedEvents: Array.from(awardedEvents),
    };
  }

  setCache(GAMIFICATION_STORAGE_KEY, nextState);

  return buildGamificationSnapshot(nextState, activity);
}

export function buildGamificationSnapshot(state, activity) {
  const normalizedState = normalizeGamificationState(state);
  const dailyItems = getDailyProgressItems(activity);
  const completedCount = dailyItems.filter((item) => item.completed).length;
  const progressPercent = Math.round(
    (completedCount / DAILY_PROGRESS_ITEMS.length) * 100
  );
  const level = Math.max(1, Math.floor(normalizedState.xp / XP_PER_LEVEL) + 1);

  return {
    ...normalizedState,
    dailyItems,
    progressPercent,
    level,
    dailyMealGoal: normalizeDailyMealGoal(activity?.dailyMealGoal),
    xpToNextLevel: XP_PER_LEVEL,
    achievements: getUnlockedAchievements(normalizedState, activity),
    dailySummary: getDailySummary(normalizedState, activity),
  };
}

export function getWorkoutCompletions() {
  const completions = getCache(WORKOUT_COMPLETIONS_KEY, []);

  return Array.isArray(completions) ? completions.filter(Boolean) : [];
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isSameLocalDate(value, dateKey = getLocalDateKey()) {
  if (!value) return false;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value === dateKey;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return getLocalDateKey(date) === dateKey;
}

function getDailyProgressItems(activity) {
  return DAILY_PROGRESS_ITEMS.map((item) => {
    const completed = {
      diet: Boolean(activity?.hasActiveDiet || activity?.hasMealToday),
      protein: Boolean(activity?.proteinCompleted),
      workout: Boolean(activity?.hasWorkoutToday),
      checkin: Boolean(activity?.hasCheckinToday),
    }[item.id];

    return {
      ...item,
      completed,
    };
  });
}

function getAwardableEvents(activity, todayKey) {
  return [
    activity?.hasMealToday
      ? { id: `meal:${todayKey}`, xp: XP_REWARDS.meal }
      : null,
    activity?.hasWorkoutToday
      ? { id: `workout:${todayKey}`, xp: XP_REWARDS.workout }
      : null,
    activity?.hasCheckinToday
      ? { id: `checkin:${todayKey}`, xp: XP_REWARDS.checkin }
      : null,
    activity?.proteinCompleted
      ? { id: `protein:${todayKey}`, xp: XP_REWARDS.protein }
      : null,
  ].filter(Boolean);
}

function getUnlockedAchievements(state, activity) {
  const unlockedIds = new Set();

  if (activity?.totalMeals > 0) unlockedIds.add("first_meal");
  if (state.currentStreak >= 3 || state.bestStreak >= 3) {
    unlockedIds.add("three_day_streak");
  }
  if (activity?.totalCheckins > 0) unlockedIds.add("first_checkin");
  if (activity?.totalWorkouts > 0) unlockedIds.add("first_workout");

  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id),
  }));
}

function getDailySummary(state, activity) {
  const dailyMealGoal = normalizeDailyMealGoal(activity?.dailyMealGoal);
  const proteinMissing = Math.max(
    0,
    Math.round(Number(activity?.proteinGoal || 0) - Number(activity?.protein || 0))
  );

  if (activity?.proteinCompleted && activity?.hasMealToday) {
    return "Hoy vas muy bien. Mantén el ritmo.";
  }

  if (proteinMissing > 0 && activity?.hasMealToday) {
    return `Te faltan ${proteinMissing}g de proteína.`;
  }

  if (state.currentStreak >= 2) {
    return `Llevas ${state.currentStreak} días seguidos.`;
  }

  if (activity?.hasActiveDiet) {
    return `Tienes el plan listo: ${dailyMealGoal} comidas marcadas para hoy.`;
  }

  return "Empieza con una comida o check-in pequeño hoy.";
}

function getOffsetDateKey(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return getLocalDateKey(date);
}

function normalizeGamificationState(state) {
  if (!state || typeof state !== "object") {
    return { ...DEFAULT_GAMIFICATION_STATE };
  }

  return {
    currentStreak: Math.max(0, Number(state.currentStreak) || 0),
    bestStreak: Math.max(0, Number(state.bestStreak) || 0),
    lastCompletedDate: state.lastCompletedDate || null,
    xp: Math.max(0, Number(state.xp) || 0),
    awardedEvents: Array.isArray(state.awardedEvents)
      ? state.awardedEvents.filter(Boolean)
      : [],
  };
}

function normalizeDailyMealGoal(value) {
  const mealGoal = Number(value);

  return [3, 4, 5, 6].includes(mealGoal) ? mealGoal : DEFAULT_DAILY_MEAL_GOAL;
}
