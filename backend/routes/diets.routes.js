import { Router } from "express";
import { ai } from "../config/gemini.js";
import { supabase } from "../config/supabase.js";
import {
  assertSameUser,
  verifySupabaseUser,
} from "../middleware/auth.js";
import {
  normalizeGeneratedDiet,
} from "../normalizers/diet.normalizer.js";
import { buildDietPrompt } from "../prompts/diet.prompt.js";
import { createFallbackDiet } from "../services/dietFallback.service.js";
import {
  checkDailyAiLimit,
  enforceRateLimit,
  registerAiUsage,
} from "../utils/aiUsage.js";
import { cleanGeminiJson } from "../utils/json.js";
import { clamp, toNumberOrNull } from "../utils/numbers.js";
import { createTimingLogger } from "../utils/timing.js";

const router = Router();
const DAILY_DIET_GENERATION_LIMIT = 1;
const DIET_GENERATION_COOLDOWN_SECONDS = 8;

router.post("/generate-diet", verifySupabaseUser, async (req, res) => {
  const timing = createTimingLogger("generate-diet");
  const { profile, preferences, user_id } = req.body || {};
  const userId = req.authUser.id;

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
          error: "Has alcanzado el límite diario de generación de dietas.",
          usage: {
            diet_generation: serializeUsageState("diet_generation", limitState),
          },
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
    const userId = req.authUser.id;

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

router.get("/diet-progress/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = req.authUser.id;

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
    const userId = req.authUser.id;

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
