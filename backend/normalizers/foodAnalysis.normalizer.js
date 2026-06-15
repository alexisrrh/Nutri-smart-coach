import { clamp } from "../utils/numbers.js";

const FOOD_ANALYSIS_COPY = {
  es: {
    food: "Comida detectada",
    description: "Análisis visual generado por IA.",
    portion_estimate: "Porción aproximada no especificada.",
    goal_fit:
      "La comida puede encajar según el contexto, pero la estimación depende de la porción real.",
    recommendation:
      "Estimación aproximada. Para mayor precisión, pesa los alimentos.",
  },
  en: {
    food: "Detected meal",
    description: "AI-generated visual analysis.",
    portion_estimate: "Approximate portion not specified.",
    goal_fit:
      "The meal may fit depending on the context, but the estimate depends on the actual portion.",
    recommendation:
      "Approximate estimate. For higher accuracy, weigh the foods.",
  },
};

export function normalizeFoodAnalysis(data = {}, language = "es") {
  const normalizedLanguage = normalizeLanguage(language);
  const copy = FOOD_ANALYSIS_COPY[normalizedLanguage] || FOOD_ANALYSIS_COPY.es;

  return {
    language: normalizedLanguage,
    food: data.food || copy.food,
    description: data.description || copy.description,
    portion_estimate:
      data.portion_estimate || copy.portion_estimate,
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
    goal_fit: data.goal_fit || copy.goal_fit,
    recommendation: data.recommendation || copy.recommendation,
    improvements: Array.isArray(data.improvements)
      ? data.improvements.slice(0, 4)
      : [],
    warning: data.warning || "",
  };
}

function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  return normalized.startsWith("en") ? "en" : "es";
}
