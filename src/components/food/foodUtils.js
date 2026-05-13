import { STORAGE_KEYS } from "../../config/storageKeys";

export function saveMealToLocalStorage(result, preview) {
  if (!result) return;

  const previousMeals = safeParse(
    localStorage.getItem(STORAGE_KEYS.MEALS),
    []
  );

  const meal = {
    id: result.id || crypto.randomUUID(),
    ...result,
    image: preview || result.image_url || result.image || null,
    createdAt:
      result.createdAt ||
      result.created_at ||
      new Date().toISOString(),
  };

  const mealsWithoutDuplicate = previousMeals.filter(
    (item) => item.id !== meal.id
  );

  localStorage.setItem(
    STORAGE_KEYS.MEALS,
    JSON.stringify([meal, ...mealsWithoutDuplicate])
  );
}

export function getFoodScoreLabel(score) {
  const value = Number(score || 0);

  if (value >= 9) return "Excelente";
  if (value >= 7) return "Muy buena";
  if (value >= 5) return "Aceptable";

  return "Mejorable";
}

export function getMainFoodAction(result) {
  if (!result) return "Sube una foto para comenzar.";

  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);
  const score = Number(result.score || 0);

  if (score >= 8) {
    return "Buena elección. Mantén la porción y prioriza agua.";
  }

  if (protein < 20) {
    return "Añade una fuente de proteína para mejorar la saciedad.";
  }

  if (calories > 850) {
    return "Reduce salsas, fritos o porción para bajar calorías.";
  }

  return "Puedes mejorarla ajustando porción o acompañamientos.";
}

export function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}