export function normalizeProfile(data) {
  if (!data) return null;

  const age = toNumberOrNull(data.age ?? data.edad);
  const weight = toNumberOrNull(data.weight ?? data.peso);
  const height = toNumberOrNull(data.height ?? data.altura);
  const gender = normalizeGender(data.gender || data.genero);
  const goal = normalizeGoal(data.goal || data.objetivo);
  const activityLevel = normalizeActivityLevel(
    data.activity_level || data.activity || data.actividad
  );

  return {
    ...data,
    id: data.id || data.user_id || null,
    user_id: data.user_id || data.id || null,
    email: data.email || "",
    name: data.name || data.nombre || "",
    age,
    weight,
    height,
    gender,
    goal,
    activity_level: activityLevel,
    edad: age,
    peso: weight,
    altura: height,
    genero: gender,
    objetivo: goal,
    actividad: activityLevel,
    activity: activityLevel,
    preferences: data.preferences || {},
    updated_at: data.updated_at || null,
  };
}

export function normalizeMeal(data) {
  if (!data) return null;

  const createdAt = data.created_at || data.createdAt || null;

  return {
    ...data,
    id: data.id || null,
    user_id: data.user_id || null,
    food: data.food || data.name || data.title || "Comida analizada",
    description: data.description || "",
    image_url: data.image_url || data.image || null,
    calories: toNumber(data.calories ?? data.kcal),
    protein: toNumber(data.protein),
    carbs: toNumber(data.carbs),
    fat: toNumber(data.fat),
    fiber: toNumber(data.fiber),
    sugar: toNumber(data.sugar),
    sodium: toNumber(data.sodium),
    confidence: toNumber(data.confidence),
    score: toNumber(data.score),
    goal_fit: data.goal_fit || "",
    recommendation: data.recommendation || "",
    improvements: Array.isArray(data.improvements) ? data.improvements : [],
    warning: data.warning || "",
    created_at: createdAt,
    createdAt,
  };
}

export function normalizeMeals(list) {
  if (!Array.isArray(list)) return [];

  return list.map(normalizeMeal).filter(Boolean);
}

export function normalizeDietPlan(data) {
  if (!data) return null;

  const week = Array.isArray(data.week)
    ? data.week
    : Array.isArray(data.plan)
      ? data.plan
      : [];

  return {
    ...data,
    id: data.id || data.diet_plan_id || null,
    user_id: data.user_id || null,
    week,
    plan: week,
    profile: normalizeProfile(data.profile),
    preferences: data.preferences || {},
    usedFallback: Boolean(data.usedFallback ?? data.used_fallback),
    warning: data.warning || "",
    created_at: data.created_at || data.createdAt || null,
  };
}

export function normalizeCheckin(data) {
  if (!data) return null;

  return {
    ...data,
    id: data.id || null,
    user_id: data.user_id || null,
    image_url: data.image_url || data.image || null,
    weight: toNumberOrNull(data.weight ?? data.peso),
    waist: toNumberOrNull(data.waist ?? data.cintura),
    chest: toNumberOrNull(data.chest ?? data.pecho),
    hips: toNumberOrNull(data.hips ?? data.cadera),
    notes: data.notes || data.nota || "",
    body_fat_range: data.body_fat_range || "",
    confidence: toNumber(data.confidence),
    visual_changes: data.visual_changes || "",
    recommendation: data.recommendation || "",
    created_at: data.created_at || data.createdAt || null,
  };
}

export function normalizeProgressLog(data) {
  if (!data) return null;

  const weight = toNumberOrNull(data.weight ?? data.peso);
  const note = data.note || data.notes || data.nota || "";
  const createdAt = data.created_at || data.createdAt || null;

  return {
    ...data,
    id: data.id || null,
    user_id: data.user_id || null,
    weight,
    peso: weight,
    note,
    nota: note,
    created_at: createdAt,
    createdAt,
  };
}

export function normalizeProgressLogs(list) {
  if (!Array.isArray(list)) return [];

  return list.map(normalizeProgressLog).filter(Boolean);
}

function normalizeGoal(goal) {
  if (goal === "bajar") return "perder_grasa";
  if (goal === "subir") return "ganar_musculo";
  if (goal === "mantener") return "mantener_peso";

  return goal || "perder_grasa";
}

function normalizeGender(gender) {
  if (gender === "hombre") return "male";
  if (gender === "mujer") return "female";

  return gender || "male";
}

function normalizeActivityLevel(activityLevel) {
  if (activityLevel === "sedentaria") return "low";
  if (activityLevel === "ligera") return "low";
  if (activityLevel === "moderada") return "moderate";
  if (activityLevel === "alta") return "high";

  return activityLevel || "moderate";
}

function toNumber(value) {
  return Number(value) || 0;
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);

  return Number.isNaN(number) ? null : number;
}
