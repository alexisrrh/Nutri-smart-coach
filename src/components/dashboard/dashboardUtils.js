import { calculateNutritionGoals } from "../../services/nutritionGoalsService";

export function getGoals(profile) {
  return calculateNutritionGoals(profile);
}

export function getSmartTip(
  totals,
  goals,
  mealCount,
  hasDiet,
  t
) {
  if (!hasDiet) {
    return t("dashboard.ai.smartTip.noDiet");
  }

  if (mealCount === 0) {
    return t("dashboard.ai.smartTip.firstMeal");
  }

  if (totals.protein < goals.protein * 0.5) {
    return t("dashboard.ai.smartTip.lowProtein");
  }

  if (totals.calories > goals.calories) {
    return t("dashboard.ai.smartTip.overCalories");
  }

  return t("dashboard.ai.smartTip.goodProgress");
}

export function getFirstName(name) {
  if (!name) return "";

  return String(name).trim().split(" ")[0] || "";
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
