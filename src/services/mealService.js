import { STORAGE_KEYS } from "../config/storageKeys";
import { getFriendlyErrorMessage, request } from "./apiClient";
import { getCache, removeCache, setCache } from "./cacheService";
import { normalizeMeal, normalizeMeals } from "./normalizers";

const MEALS_KEY = STORAGE_KEYS.MEALS;

export function getCachedMeals() {
  const meals = getCache(MEALS_KEY, []);

  return normalizeMeals(Array.isArray(meals) ? meals : []);
}

export function cacheMeals(meals) {
  setCache(MEALS_KEY, normalizeMeals(meals));
}

export function cacheMeal(meal, preview) {
  const normalizedMeal = normalizeMeal({
    ...meal,
    image: preview || meal?.image_url || meal?.image || null,
  });

  if (!normalizedMeal) return getCachedMeals();

  const previousMeals = getCachedMeals();
  const mealsWithoutDuplicate = previousMeals.filter(
    (item) => item.id !== normalizedMeal.id
  );
  const updatedMeals = [normalizedMeal, ...mealsWithoutDuplicate];

  cacheMeals(updatedMeals);

  return updatedMeals;
}

export async function listMeals(userId, { fallbackToCache = true } = {}) {
  const cachedMeals = getCachedMeals();

  if (!userId) return cachedMeals;

  try {
    const data = await request(`/meal-analyses/${userId}`, {}, {
      operation: "cargar el historial de comidas",
    });
    const remoteMeals = normalizeMeals(data?.meal_analyses);

    if (remoteMeals.length > 0 || cachedMeals.length === 0) {
      cacheMeals(remoteMeals);
      return remoteMeals;
    }

    return cachedMeals;
  } catch (error) {
    if (fallbackToCache && cachedMeals.length > 0) return cachedMeals;
    throw new Error(
      getFriendlyErrorMessage(error, "cargar el historial de comidas"),
      { cause: error }
    );
  }
}

export async function analyzeMeal({
  image,
  description = "",
  goal = "perder_grasa",
  userId,
}) {
  const formData = new FormData();
  formData.append("goal", goal);

  if (image) {
    formData.append("image", image);
  }

  if (description) {
    formData.append("description", description);
  }

  if (userId) {
    formData.append("user_id", userId);
  }

  const data = await request("/analyze-food", {
    method: "POST",
    body: formData,
  }, {
    timeoutMs: 120000,
    operation: "analizar comida con IA",
  });

  return normalizeMeal({
    ...data,
    user_id: userId || data?.user_id || null,
  });
}

export async function deleteMeal(mealId, userId) {
  if (!mealId) return { ok: true };

  return request(
    `/meal-analyses/${mealId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    },
    {
      operation: "borrar una comida",
    }
  );
}

export async function clearMeals(userId) {
  const response = await request(
    `/meal-analyses/user/${userId}`,
    {
      method: "DELETE",
    },
    {
      operation: "limpiar el historial de comidas",
    }
  );

  removeCache(MEALS_KEY);

  return response;
}

export function removeMealFromCache(mealToDelete) {
  const updatedMeals = getCachedMeals().filter((meal) => {
    if (meal.id && mealToDelete?.id) {
      return meal.id !== mealToDelete.id;
    }

    return (
      (meal.createdAt || meal.created_at) !==
      (mealToDelete?.createdAt || mealToDelete?.created_at)
    );
  });

  cacheMeals(updatedMeals);

  return updatedMeals;
}
