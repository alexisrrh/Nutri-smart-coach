import { clamp } from "../utils/numbers.js";

export function normalizeFoodAnalysis(data = {}) {
  return {
    food: data.food || "Comida detectada",
    description: data.description || "Análisis visual generado por IA.",
    portion_estimate:
      data.portion_estimate || "Porción aproximada no especificada.",
    ingredients_detected: Array.isArray(data.ingredients_detected)
      ? data.ingredients_detected
      : [],
    calories: Number(data.calories) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fat: Number(data.fat) || 0,
    fiber: Number(data.fiber) || 0,
    sugar: Number(data.sugar) || 0,
    sodium: Number(data.sodium) || 0,
    confidence: clamp(Number(data.confidence) || 70, 1, 100),
    score: clamp(Number(data.score) || 5, 1, 10),
    goal_fit:
      data.goal_fit ||
      "La comida puede encajar según el contexto, pero la estimación depende de la porción real.",
    recommendation:
      data.recommendation ||
      "Estimación aproximada. Para mayor precisión, pesa los alimentos.",
    improvements: Array.isArray(data.improvements)
      ? data.improvements.slice(0, 4)
      : [],
    warning: data.warning || "",
  };
}
