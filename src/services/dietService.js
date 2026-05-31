import { STORAGE_KEYS } from "../config/storageKeys";
import { request } from "./apiClient";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeDietPlan } from "./normalizers";

const DIET_PLAN_KEY = STORAGE_KEYS.DIET_PLAN;
const DIET_PROGRESS_KEY = STORAGE_KEYS.DIET_PROGRESS;
const DIET_GENERATION_KEY = STORAGE_KEYS.DIET_GENERATION;

const DEFAULT_GENERATION_STATE = {
  status: "idle",
  startedAt: null,
  updatedAt: null,
  requestId: null,
  result: null,
  error: "",
};

export function getCachedDietPlans() {
  const cachedValue = getCache(DIET_PLAN_KEY, []);

  return normalizeCachedDietPlans(cachedValue);
}

export function getCachedDietPlan() {
  return getCachedDietPlans()[0] || null;
}

export function cacheDietPlans(dietPlans) {
  const normalizedPlans = normalizeDietPlans(dietPlans);
  const activePlan = normalizedPlans[0];

  if (activePlan) {
    setCache(DIET_PLAN_KEY, activePlan.week);
  } else {
    setCache(DIET_PLAN_KEY, []);
  }

  return normalizedPlans;
}

export function cacheDietPlan(dietPlan) {
  return cacheDietPlans([dietPlan])[0] || null;
}

export function clearDietPlanCache() {
  removeCache(DIET_PLAN_KEY);
}

export function getDietProgress() {
  return getCache(DIET_PROGRESS_KEY, {});
}

export function cacheDietProgress(progress) {
  setCache(DIET_PROGRESS_KEY, progress || {});

  return progress || {};
}

export function clearDietProgress() {
  removeCache(DIET_PROGRESS_KEY);
}

export async function listDietProgress(
  userId,
  { dietPlanId = null, fallbackToCache = true } = {}
) {
  const cachedProgress = getDietProgress();

  if (!userId) return cachedProgress;

  const query = dietPlanId
    ? `?diet_plan_id=${encodeURIComponent(dietPlanId)}`
    : "";

  try {
    const data = await request(`/diet-progress/${userId}${query}`, {}, {
      operation: "cargar el progreso de la dieta",
    });
    const remoteProgress =
      data?.progress && typeof data.progress === "object"
        ? data.progress
        : {};
    const mergedProgress = {
      ...cachedProgress,
      ...remoteProgress,
    };

    cacheDietProgress(mergedProgress);
    return mergedProgress;
  } catch (error) {
    if (fallbackToCache) return cachedProgress;
    throw error;
  }
}

export async function syncDietMealProgress({
  userId,
  mealId,
  completed,
  dietPlanId = null,
}) {
  if (!userId || !mealId) return null;

  return request(
    `/diet-progress/${userId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meal_id: mealId,
        completed,
        diet_plan_id: dietPlanId,
      }),
    },
    {
      operation: "guardar el progreso de la dieta",
    }
  );
}

export function getDietGenerationState() {
  const state = getCache(DIET_GENERATION_KEY, DEFAULT_GENERATION_STATE);

  return normalizeDietGenerationState(state);
}

export function setDietGenerationState(nextState) {
  const normalizedState = normalizeDietGenerationState({
    ...getDietGenerationState(),
    ...nextState,
  });

  setCache(DIET_GENERATION_KEY, normalizedState);

  return normalizedState;
}

export function clearDietGenerationState() {
  removeCache(DIET_GENERATION_KEY);
}

export async function listDietPlans(userId, { fallbackToCache = true } = {}) {
  const cachedPlans = getCachedDietPlans();

  if (!userId) return cachedPlans;

  try {
    const data = await request(`/diet-plans/${userId}`);

    if (!Array.isArray(data?.diet_plans)) {
      throw new Error("Respuesta inválida al cargar dietas.");
    }

    const remotePlans = normalizeDietPlans(data.diet_plans);

    cacheDietPlans(remotePlans);
    return remotePlans;
  } catch (error) {
    if (fallbackToCache) return cachedPlans;
    throw error;
  }
}

export async function generateDietPlan({ profile, preferences, userId }) {
  const data = await request("/generate-diet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile,
      preferences,
      user_id: userId || profile?.id || profile?.user_id || "",
    }),
  }, {
    timeoutMs: 120000,
    operation: "generar dieta",
  });

  const generatedPlan = cacheDietPlan({
    ...data,
    id: data?.diet_plan_id || data?.id || null,
    user_id: userId || profile?.id || profile?.user_id || null,
    week: data?.week || [],
    profile,
    preferences,
  });

  return {
    ...data,
    dietPlan: generatedPlan,
    week: generatedPlan?.week || [],
  };
}

function normalizeDietGenerationState(state) {
  if (!state || typeof state !== "object") {
    return { ...DEFAULT_GENERATION_STATE };
  }

  return {
    status:
      state.status === "loading" ||
      state.status === "success" ||
      state.status === "error"
        ? state.status
        : "idle",
    startedAt: state.startedAt || null,
    updatedAt: state.updatedAt || null,
    requestId: state.requestId || null,
    result: state.result || null,
    error: state.error || "",
  };
}

export function getDietPlanWeek(dietPlan) {
  return normalizeDietWeek(dietPlan?.week || dietPlan?.plan || []);
}

export function normalizeDietWeek(weekArray) {
  if (!Array.isArray(weekArray)) return [];

  return weekArray.map((day, dayIndex) => {
    const mealsArray = Array.isArray(day?.meals)
      ? day.meals
      : Object.values(day?.meals || {});

    return {
      day: day?.day || `Día ${dayIndex + 1}`,
      meals: mealsArray.map((meal, index) => ({
        id: meal?.id || `${day?.day || dayIndex}-${index}`,
        time: meal?.time || defaultMealTime(index, mealsArray.length),
        name: meal?.name || defaultMealName(index, mealsArray.length),
        food: meal?.food || meal?.title || "Comida",
        title: meal?.food || meal?.title || "Comida",
        details: meal?.details || "",
        ingredients: meal?.details
          ? meal.details.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        calories: Number(meal?.calories || meal?.kcal || 0),
        protein: Number(meal?.protein || 0),
        carbs: Number(meal?.carbs || 0),
        fat: Number(meal?.fat || 0),
      })),
    };
  });
}

function normalizeCachedDietPlans(cachedValue) {
  if (!cachedValue) return [];

  if (Array.isArray(cachedValue)) {
    if (
      cachedValue.some(
        (item) => Array.isArray(item?.week) || Array.isArray(item?.plan)
      )
    ) {
      return normalizeDietPlans(cachedValue);
    }

    const week = normalizeDietWeek(cachedValue);

    return week.length > 0
      ? [
          normalizeDietPlan({
            id: "legacy-local-plan",
            week,
            plan: week,
          }),
        ]
      : [];
  }

  return normalizeDietPlans([cachedValue]);
}

function normalizeDietPlans(dietPlans) {
  if (!Array.isArray(dietPlans)) return [];

  return dietPlans
    .map((dietPlan) => {
      const normalizedPlan = normalizeDietPlan(dietPlan);

      if (!normalizedPlan) return null;

      const week = normalizeDietWeek(normalizedPlan.week);

      if (week.length === 0) return null;

      return {
        ...normalizedPlan,
        week,
        plan: week,
      };
    })
    .filter(Boolean);
}

function defaultMealTime(index, total = 4) {
  if (total === 2) return ["13:00", "20:00"][index] || "13:00";
  if (total === 3) return ["08:30", "14:00", "20:30"][index] || "08:30";
  if (total === 5) {
    return (
      ["08:00", "11:30", "14:30", "18:00", "21:00"][index] || "08:00"
    );
  }
  if (total >= 6) {
    return (
      ["08:00", "10:30", "13:30", "16:30", "19:30", "22:00"][index] ||
      "08:00"
    );
  }

  return ["08:00", "13:30", "17:30", "21:00"][index] || "08:00";
}

function defaultMealName(index, total = 4) {
  if (total === 2) return ["Comida 1", "Comida 2"][index] || `Comida ${index + 1}`;
  if (total === 3) {
    return ["Desayuno", "Comida", "Cena"][index] || `Comida ${index + 1}`;
  }
  if (total === 5) {
    return (
      ["Desayuno", "Snack", "Comida", "Merienda", "Cena"][index] ||
      `Comida ${index + 1}`
    );
  }
  if (total >= 6) {
    return (
      ["Desayuno", "Snack 1", "Comida", "Snack 2", "Cena", "Extra"][index] ||
      `Comida ${index + 1}`
    );
  }

  return (
    ["Desayuno", "Comida", "Merienda", "Cena"][index] ||
    `Comida ${index + 1}`
  );
}
