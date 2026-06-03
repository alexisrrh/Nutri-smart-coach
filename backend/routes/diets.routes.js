import { Router } from "express";
import { ai } from "../config/gemini.js";
import { supabase } from "../config/supabase.js";
import {
  assertSameUser,
  requireAuthenticatedUser,
  verifySupabaseUser,
} from "../middleware/auth.js";
import {
  sanitizeDietMeal,
  normalizeGeneratedDiet,
} from "../normalizers/diet.normalizer.js";
import { buildDietPrompt } from "../prompts/diet.prompt.js";
import { createFallbackDiet } from "../services/dietFallback.service.js";
import {
  AI_USAGE_RULES,
  checkDailyAiLimit,
  enforceRateLimit,
  isPremiumProfile,
  registerAiUsage,
} from "../utils/aiUsage.js";
import { cleanGeminiJson } from "../utils/json.js";
import { clamp, toNumberOrNull } from "../utils/numbers.js";
import { createTimingLogger } from "../utils/timing.js";

const router = Router();
const DAILY_DIET_GENERATION_LIMIT = AI_USAGE_RULES.diet_generation.freeLimit;
const DIET_GENERATION_COOLDOWN_SECONDS = 8;

router.post("/generate-diet", verifySupabaseUser, async (req, res) => {
  const timing = createTimingLogger("generate-diet");
  const { profile, preferences, user_id } = req.body || {};
  const userId = requireAuthenticatedUser(req, res);

  if (!userId) return;

  try {
    if (user_id && !assertSameUser(userId, user_id)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    if (!profile || Object.keys(profile).length === 0) {
      return res.status(400).json({
        error: "Falta completar el perfil del usuario",
      });
    }

    if (
      (profile.id && !assertSameUser(userId, profile.id)) ||
      (profile.user_id && !assertSameUser(userId, profile.user_id))
    ) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const dietConfig = buildDietConfig(preferences);

    let week;
    let usedFallback = false;
    let warning = "";

    if (!process.env.GEMINI_API_KEY) {
      week = createFallbackDiet(profile, preferences, dietConfig);
      usedFallback = true;
      warning = "GEMINI_API_KEY no está configurada en Render";
    } else {
      const limitState = await checkDailyAiLimit({
        userId,
        type: "diet_generation",
        limit: DAILY_DIET_GENERATION_LIMIT,
      });

      if (!limitState.allowed) {
        return res.status(429).json({
          error: "Has alcanzado tu límite de dietas IA en este periodo. Se reinicia pronto.",
          usage: {
            diet_generation: serializeUsageState("diet_generation", limitState),
          },
          plan: limitState.plan,
          upgradeAvailable: limitState.upgradeAvailable,
        });
      }

      const rateLimitState = enforceRateLimit({
        userId,
        type: "diet_generation",
        seconds: DIET_GENERATION_COOLDOWN_SECONDS,
      });

      if (!rateLimitState.allowed) {
        return res.status(429).json({
          error: `Espera ${rateLimitState.waitSeconds} segundos antes de generar otra dieta.`,
          usage: {
            diet_generation: serializeUsageState("diet_generation", limitState),
          },
          plan: limitState.plan,
          upgradeAvailable: false,
        });
      }

      registerAiUsage({ userId, type: "diet_generation" });

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          config: {
            temperature: 0.2,
            topP: 0.4,
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: buildDietPrompt(profile, preferences, dietConfig),
                },
              ],
            },
          ],
        });
        timing.mark("Gemini");

        const rawText = response.text || "";
        const cleanText = cleanGeminiJson(rawText);
        const data = JSON.parse(cleanText);

        if (!data.week || !Array.isArray(data.week)) {
          throw new Error("Gemini no devolvió week válido");
        }

        week = normalizeGeneratedDiet(data.week, dietConfig);
        timing.mark("normalize");
      } catch (error) {
        console.error("Error Gemini generate-diet:", error);
        week = createFallbackDiet(profile, preferences, dietConfig);
        usedFallback = true;
        warning = error.message || "Gemini falló generando dieta";
        timing.mark("Gemini");
        timing.mark("normalize");
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      timing.mark("Gemini");
      timing.mark("normalize");
    }

    let savedPlan = null;

    if (userId) {
      savedPlan = await saveDietPlan({
        userId,
        profile,
        preferences: {
          ...(preferences || {}),
          dietConfig,
        },
        week,
        usedFallback,
        warning,
      });

      await upsertUserProfile({
        userId,
        profile,
        preferences,
      });

      timing.mark("save");
    } else {
      timing.mark("save");
    }

    timing.done({ usedFallback });

    return res.json({
      week,
      usedFallback,
      warning,
      saved: Boolean(savedPlan),
      diet_plan_id: savedPlan?.id || null,
    });
  } catch (error) {
    timing.done({ error: true });
    console.error("Error generate-diet completo:", error);

    const dietConfig = buildDietConfig(preferences);

    return res.json({
      week: createFallbackDiet(profile, preferences, dietConfig),
      usedFallback: true,
      warning: error.message,
      saved: false,
    });
  }
});

router.get("/diet-plans/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data, error } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "No se pudieron cargar las dietas",
        detail: error.message,
      });
    }

    return res.json({ diet_plans: data || [] });
  } catch (error) {
    return res.status(500).json({
      error: "Error cargando dietas",
      detail: error.message,
    });
  }
});

router.post("/diet-plans/:dietPlanId/rewrite-meal", verifySupabaseUser, async (req, res) => {
  try {
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;
    const requestedUserId = req.body?.user_id || "";
    const dietPlanId = req.params.dietPlanId;

    if (requestedUserId && !assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const dayIndex = Number(req.body?.day_index);
    const mealId = String(req.body?.meal_id || "").trim();
    const currentMeal = req.body?.meal || null;
    const reason = String(req.body?.reason || "").trim();

    if (!Number.isInteger(dayIndex) || dayIndex < 0 || !mealId || !currentMeal) {
      return res.status(400).json({
        error: "Faltan datos para cambiar la comida.",
      });
    }

    const dietPlan = await getOwnedDietPlan({ dietPlanId, userId });

    if (!dietPlan) {
      return res.status(403).json({
        error: "No autorizado para modificar esta dieta.",
      });
    }

    const premiumProfile = await getPremiumProfile(userId);

    if (!isPremiumProfile(premiumProfile)) {
      return res.status(403).json({
        error: "La edición inteligente de comidas requiere Premium.",
        upgradeAvailable: true,
        plan: "free",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "La edición inteligente no está disponible ahora mismo.",
      });
    }

    const week = Array.isArray(dietPlan.week) ? dietPlan.week : [];
    const day = week[dayIndex];
    const meals = Array.isArray(day?.meals) ? day.meals : [];
    const mealIndex = meals.findIndex((meal, index) =>
      getDietMealId(day?.day, meal, index) === mealId || meal?.id === mealId
    );

    if (!day || mealIndex < 0) {
      return res.status(404).json({
        error: "No se encontró la comida dentro de esta dieta.",
      });
    }

    const replacementMeal = await rewriteDietMealWithGemini({
      currentMeal: meals[mealIndex],
      reason,
      dietPlan,
      day,
      mealIndex,
    });
    const nextWeek = week.map((weekDay, index) => {
      if (index !== dayIndex) return weekDay;

      return {
        ...weekDay,
        meals: weekDay.meals.map((meal, currentIndex) =>
          currentIndex === mealIndex ? replacementMeal : meal
        ),
      };
    });

    const { error: updateError } = await supabase
      .from("diet_plans")
      .update({
        week: nextWeek,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dietPlanId)
      .eq("user_id", userId);

    if (updateError) {
      return res.status(500).json({
        error: "No se pudo guardar la comida actualizada.",
      });
    }

    return res.json({
      meal: replacementMeal,
      week: nextWeek,
      diet_plan_id: dietPlanId,
    });
  } catch (error) {
    console.error("Error cambiando comida de dieta:", error);

    return res.status(error.statusCode || 500).json({
      error: error.expose
        ? error.message
        : "No se pudo cambiar la comida. Inténtalo de nuevo.",
    });
  }
});

router.get("/diet-progress/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const query = supabase
      .from("meal_logs")
      .select("meal_id, completed")
      .eq("user_id", userId)
      .eq("source", "diet_plan");

    if (req.query.diet_plan_id) {
      query.eq("diet_plan_id", req.query.diet_plan_id);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        error: "No se pudo cargar el progreso de la dieta",
        detail: error.message,
      });
    }

    return res.json({
      progress: buildDietProgressMap(data || []),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error cargando progreso de dieta",
      detail: error.message,
    });
  }
});

router.put("/diet-progress/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const mealId = String(req.body?.meal_id || "").trim();

    if (!mealId) {
      return res.status(400).json({ error: "Falta meal_id" });
    }

    const completed = Boolean(req.body?.completed);
    const dietPlanId = req.body?.diet_plan_id || null;
    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      meal_id: mealId,
      diet_plan_id: dietPlanId,
      source: "diet_plan",
      completed,
      completed_at: completed ? now : null,
      updated_at: now,
    };

    const { data, error } = await saveDietMealProgress({
      userId,
      mealId,
      dietPlanId,
      payload,
    });

    if (error) {
      return res.status(500).json({
        error: "No se pudo guardar el progreso de la dieta",
        detail: error.message,
      });
    }

    return res.json({
      ok: true,
      meal: data,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error guardando progreso de dieta",
      detail: error.message,
    });
  }
});

async function saveDietPlan({
  userId,
  profile,
  preferences,
  week,
  usedFallback,
  warning,
}) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("diet_plans")
    .insert({
      user_id: userId,
      profile,
      preferences: preferences || {},
      week,
      used_fallback: usedFallback,
      warning: warning || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Error guardando dieta en Supabase:", error);
    return null;
  }

  return data;
}

async function getOwnedDietPlan({ dietPlanId, userId }) {
  const { data, error } = await supabase
    .from("diet_plans")
    .select("id, user_id, week, profile, preferences")
    .eq("id", dietPlanId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error cargando dieta para edición:", error);
    return null;
  }

  return data || null;
}

async function getPremiumProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      [
        "plan",
        "is_premium",
        "subscription_status",
        "premium_source",
        "premium_product_id",
        "premium_platform_transaction_id",
        "premium_expires_at",
        "premium_last_verified_at",
      ].join(", ")
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error consultando Premium para edición de dieta:", error);
    return null;
  }

  return data || null;
}

async function rewriteDietMealWithGemini({
  currentMeal,
  reason,
  dietPlan,
  day,
  mealIndex,
}) {
  const dietConfig = buildDietConfig({
    ...(dietPlan.preferences || {}),
    ...(dietPlan.preferences?.dietConfig || {}),
    mealsPerDay: Array.isArray(day?.meals) ? day.meals.length : undefined,
  });
  const prompt = buildRewriteMealPrompt({
    currentMeal,
    reason,
    dietPlan,
    day,
    mealIndex,
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      temperature: 0.25,
      topP: 0.45,
    },
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });
  const cleanText = cleanGeminiJson(response.text || "");
  let parsed;

  try {
    parsed = JSON.parse(cleanText);
  } catch {
    const error = new Error("La IA no devolvió una comida válida.");
    error.statusCode = 502;
    error.expose = true;
    throw error;
  }

  const rawMeal = parsed.meal || parsed;

  if (!rawMeal || typeof rawMeal !== "object" || Array.isArray(rawMeal)) {
    const error = new Error("La IA no devolvió una comida válida.");
    error.statusCode = 502;
    error.expose = true;
    throw error;
  }

  const meal = sanitizeDietMeal(
    {
      ...rawMeal,
      time: rawMeal.time || currentMeal.time,
      name: rawMeal.name || currentMeal.name,
    },
    mealIndex,
    dietConfig
  );

  if (!meal.food || !meal.details) {
    const error = new Error("La IA no devolvió una comida completa.");
    error.statusCode = 502;
    error.expose = true;
    throw error;
  }

  return meal;
}

function buildRewriteMealPrompt({ currentMeal, reason, dietPlan, day, mealIndex }) {
  return `
Eres nutricionista de NutriSmart Coach.
Reemplaza SOLO una comida del plan, sin regenerar toda la dieta.

Contexto de dieta:
${JSON.stringify({
    profile: dietPlan.profile || {},
    preferences: dietPlan.preferences || {},
    day: day?.day || `Día ${mealIndex + 1}`,
  })}

Comida actual:
${JSON.stringify(currentMeal)}

Motivo del cambio:
${reason || "El usuario quiere una alternativa equivalente."}

Reglas:
- Mantén el mismo tipo de comida y horario aproximado.
- Mantén calorías y macros lo más parecidos posible.
- Respeta preferencias, exclusiones, presupuesto y objetivo de la dieta original.
- Devuelve solo JSON válido, sin markdown.
- Formato exacto:
{
  "meal": {
    "time": "08:00",
    "name": "Desayuno",
    "food": "Nombre de la comida",
    "details": "ingredientes y cantidades separados por comas",
    "calories": 430,
    "protein": 35,
    "carbs": 40,
    "fat": 14
  }
}
`;
}

function getDietMealId(day, meal, index) {
  return `${day || "day"}-${meal?.id || meal?.type || meal?.name || "meal"}-${index}`;
}

function buildDietProgressMap(mealLogs) {
  return mealLogs.reduce((progress, mealLog) => {
    if (mealLog?.meal_id) {
      progress[mealLog.meal_id] = Boolean(mealLog.completed);
    }

    return progress;
  }, {});
}

async function saveDietMealProgress({ userId, mealId, dietPlanId, payload }) {
  const updateQuery = supabase
    .from("meal_logs")
    .update(payload)
    .eq("user_id", userId)
    .eq("meal_id", mealId)
    .eq("source", "diet_plan");

  if (dietPlanId) {
    updateQuery.eq("diet_plan_id", dietPlanId);
  }

  const { data: updatedRows, error: updateError } = await updateQuery
    .select("meal_id, completed");

  if (updateError) {
    return { data: null, error: updateError };
  }

  if (updatedRows?.length) {
    return { data: updatedRows[0], error: null };
  }

  const { data, error } = await supabase
    .from("meal_logs")
    .insert(payload)
    .select("meal_id, completed")
    .single();

  return { data, error };
}

async function upsertUserProfile({ userId, profile, preferences }) {
  if (!userId || !profile) return null;

  const payload = {
    id: userId,
    age: toNumberOrNull(profile.age || profile.edad),
    weight: toNumberOrNull(profile.weight || profile.peso),
    height: toNumberOrNull(profile.height || profile.altura),
    goal: profile.goal || profile.objetivo || preferences?.goal || null,
    activity_level: profile.activity_level || profile.actividad || null,
    gender: profile.gender || profile.genero || null,
    preferences: preferences || {},
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error guardando perfil en Supabase:", error);
    return null;
  }

  return data;
}

function serializeUsageState(type, usageState) {
  return {
    type,
    usedToday: usageState.count || 0,
    limit: usageState.limit || 0,
    plan: usageState.plan || "free",
    upgradeAvailable: Boolean(usageState.upgradeAvailable),
    remaining:
      typeof usageState.remaining === "number"
        ? usageState.remaining
        : Math.max((usageState.limit || 0) - (usageState.count || 0), 0),
    resetAt: usageState.resetAt || null,
    isLimitReached:
      typeof usageState.isLimitReached === "boolean"
        ? usageState.isLimitReached
        : Boolean(usageState.limit && usageState.count >= usageState.limit),
  };
}

function buildDietConfig(preferences = {}) {
  const rawDays =
    preferences.days ||
    preferences.planDays ||
    preferences.trainingDays ||
    preferences.durationDays ||
    7;

const rawMeals =
  preferences.mealsPerDay ||
  preferences.meals_per_day ||
  preferences.meals ||
  preferences.comidas ||
  preferences.comidasDia ||
  4;
  const days = clamp(Number(rawDays) || 7, 1, 7);
  const mealsPerDay = clamp(Number(rawMeals) || 4, 2, 6);

  const dietType = preferences.dietType || preferences.diet_type || "balanced";

  const isLowCarb =
    dietType === "keto" ||
    dietType === "low_carb" ||
    dietType === "sin_carbohidratos" ||
    preferences.lowCarb === true;

  const intermittentFasting =
    mealsPerDay === 2 ||
    preferences.intermittentFasting === true ||
    preferences.ayuno === true;

  const homeFoods =
    preferences.homeFoods ||
    preferences.foodsAtHome ||
    preferences.availableFoods ||
    "";

  return {
    days,
    mealsPerDay,
    dietType,
    isLowCarb,
    intermittentFasting,
    homeFoods,
  };
}

export default router;
