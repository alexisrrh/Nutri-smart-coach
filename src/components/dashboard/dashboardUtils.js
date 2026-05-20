import { calculateNutritionGoals } from "../../services/nutritionGoalsService";

export function getGoals(profile) {
  return calculateNutritionGoals(profile);
}

export function getSmartTip(
  totals,
  goals,
  mealCount,
  hasDiet
) {
  if (!hasDiet) {
    return "Genera tu dieta IA para activar recomendaciones inteligentes.";
  }

  if (mealCount === 0) {
    return "Escanea tu primera comida para activar el análisis nutricional.";
  }

  if (totals.protein < goals.protein * 0.5) {
    return "Proteína baja. Prioriza pollo, huevos o yogur griego.";
  }

  if (totals.calories > goals.calories) {
    return "Has superado tus calorías objetivo hoy.";
  }

  return "Buen progreso. Mantén constancia y registra tus comidas.";
}

export function getFirstName(name) {
  if (!name) return "Usuario";

  return (
    String(name).trim().split(" ")[0] ||
    "Usuario"
  );
}

export function shortText(text, max) {
  if (!text) return "";

  return text.length > max
    ? text.slice(0, max) + "..."
    : text;
}

export function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
