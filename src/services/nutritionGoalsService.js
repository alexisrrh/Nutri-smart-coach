const FALLBACK_GOALS = {
  calories: 2200,
  protein: 120,
  mealsPerDay: 4,
};

const ACTIVITY_FACTORS = {
  low: 1.2,
  sedentary: 1.2,
  sedentaria: 1.2,
  ligera: 1.2,
  moderate: 1.45,
  moderada: 1.45,
  high: 1.7,
  alta: 1.7,
};

const GOAL_CALORIE_FACTORS = {
  perder_grasa: 0.82,
  bajar: 0.82,
  lose_fat: 0.82,
  mantener_peso: 1,
  mantener: 1,
  maintain: 1,
  recomposicion: 0.98,
  recomposición: 0.98,
  ganar_musculo: 1.12,
  subir: 1.12,
  gain_muscle: 1.12,
};

const GOAL_PROTEIN_FACTORS = {
  perder_grasa: 2,
  bajar: 2,
  lose_fat: 2,
  mantener_peso: 1.6,
  mantener: 1.6,
  maintain: 1.6,
  recomposicion: 1.9,
  recomposición: 1.9,
  ganar_musculo: 2,
  subir: 2,
  gain_muscle: 2,
};

export function calculateBmr(profile) {
  const normalizedProfile = normalizeProfileInput(profile);

  if (!hasRequiredBodyData(normalizedProfile)) return null;

  const base =
    10 * normalizedProfile.weight +
    6.25 * normalizedProfile.height -
    5 * normalizedProfile.age;

  return Math.round(
    normalizedProfile.gender === "female" || normalizedProfile.gender === "mujer"
      ? base - 161
      : base + 5
  );
}

export function calculateTdee(profile) {
  const bmr = calculateBmr(profile);
  if (!bmr) return null;

  const normalizedProfile = normalizeProfileInput(profile);
  const activityFactor =
    ACTIVITY_FACTORS[normalizedProfile.activityLevel] || ACTIVITY_FACTORS.moderate;

  return Math.round(bmr * activityFactor);
}

export function calculateDailyCalorieGoal(profile) {
  const tdee = calculateTdee(profile);
  if (!tdee) return FALLBACK_GOALS.calories;

  const normalizedProfile = normalizeProfileInput(profile);
  const goalFactor =
    GOAL_CALORIE_FACTORS[normalizedProfile.goal] ||
    GOAL_CALORIE_FACTORS.perder_grasa;

  return roundToNearest(tdee * goalFactor, 50);
}

export function calculateDailyProteinGoal(profile) {
  const normalizedProfile = normalizeProfileInput(profile);

  if (!normalizedProfile.weight) return FALLBACK_GOALS.protein;

  const proteinFactor =
    GOAL_PROTEIN_FACTORS[normalizedProfile.goal] ||
    GOAL_PROTEIN_FACTORS.perder_grasa;

  return Math.round(normalizedProfile.weight * proteinFactor);
}

export function calculateNutritionGoals(profile) {
  const calories = calculateDailyCalorieGoal(profile);
  const protein = calculateDailyProteinGoal(profile);

  return {
    calories,
    protein,
    carbs: estimateCarbsGoal({ calories, protein }),
    fat: estimateFatGoal(calories),
    mealsPerDay: getProfileMealsPerDay(profile),
  };
}

export function getProfileMealsPerDay(profile) {
  const mealsPerDay = Number(
    profile?.preferences?.meals_per_day ||
      profile?.preferences?.mealsPerDay ||
      profile?.meals_per_day ||
      profile?.mealsPerDay
  );

  return [3, 4, 5, 6].includes(mealsPerDay)
    ? mealsPerDay
    : FALLBACK_GOALS.mealsPerDay;
}

function normalizeProfileInput(profile) {
  return {
    weight: Number(profile?.weight ?? profile?.peso),
    height: Number(profile?.height ?? profile?.altura),
    age: Number(profile?.age ?? profile?.edad),
    gender: profile?.gender || profile?.genero || "male",
    activityLevel:
      profile?.activity_level ||
      profile?.activity ||
      profile?.actividad ||
      "moderate",
    goal: profile?.goal || profile?.objetivo || "perder_grasa",
  };
}

function hasRequiredBodyData(profile) {
  return profile.weight > 0 && profile.height > 0 && profile.age > 0;
}

function roundToNearest(value, step) {
  return Math.round(Number(value || 0) / step) * step;
}

function estimateFatGoal(calories) {
  return Math.round((calories * 0.27) / 9);
}

function estimateCarbsGoal({ calories, protein }) {
  const proteinCalories = protein * 4;
  const fatCalories = calories * 0.27;

  return Math.max(0, Math.round((calories - proteinCalories - fatCalories) / 4));
}
