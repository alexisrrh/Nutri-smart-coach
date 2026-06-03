import crypto from "crypto";
import { Router } from "express";
import { ai } from "../config/gemini.js";
import { uploadSingleImage } from "../config/multer.js";
import { supabase } from "../config/supabase.js";
import {
  assertSameUser,
  requireAuthenticatedUser,
  verifySupabaseUser,
} from "../middleware/auth.js";
import { normalizeFoodAnalysis } from "../normalizers/foodAnalysis.normalizer.js";
import { buildFoodAnalysisPrompt } from "../prompts/foodAnalysis.prompt.js";
import {
  getSupabaseStoragePath,
  uploadImageToSupabase,
} from "../services/storage.service.js";
import { createImageHash } from "../utils/files.js";
import {
  AI_USAGE_RULES,
  checkDailyAiLimit,
  enforceRateLimit,
  registerAiUsage,
} from "../utils/aiUsage.js";
import { cleanGeminiJson } from "../utils/json.js";
import { createTimingLogger } from "../utils/timing.js";

const router = Router();
const DAILY_FOOD_ANALYSIS_LIMIT = AI_USAGE_RULES.food_analysis.freeLimit;
const FOOD_ANALYSIS_COOLDOWN_MS = 8 * 1000;

function normalizeFoodGoal(goal) {
  const normalized = String(goal || "").trim().toLowerCase();

  if (
    normalized === "ganar_musculo" ||
    normalized === "ganar musculo" ||
    normalized === "subir"
  ) {
    return "ganar_musculo";
  }

  if (
    normalized === "perder_grasa" ||
    normalized === "perder grasa" ||
    normalized === "bajar"
  ) {
    return "perder_grasa";
  }

  if (normalized === "mantener_peso" || normalized === "mantener") {
    return "mantener_peso";
  }

  if (
    normalized === "recomposicion" ||
    normalized === "recomposición" ||
    normalized === "recomp"
  ) {
    return "recomposicion";
  }

  return normalized || "fitness_general";
}

function parseFoodContext(rawContext) {
  if (!rawContext) return null;

  if (typeof rawContext === "object") return rawContext;

  try {
    return JSON.parse(String(rawContext));
  } catch {
    return null;
  }
}

router.post("/analyze-food", verifySupabaseUser, uploadSingleImage("image"), async (req, res) => {
  const timing = createTimingLogger("analyze-food");

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta configurar GEMINI_API_KEY en Render",
      });
    }

    const description = String(req.body.description || "").trim();
    const hasImage = Boolean(req.file);

    if (!hasImage && !description) {
      return res.status(400).json({
        error: "Sube una foto o describe tu comida.",
      });
    }

    if (hasImage && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "El archivo debe ser una imagen",
      });
    }

    const profileContext = parseFoodContext(req.body.profile_context);
    const goal = normalizeFoodGoal(profileContext?.goal || req.body.goal || "fitness_general");
    const requestedUserId = req.body.user_id || null;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (requestedUserId && !assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const imageHash = hasImage ? createImageHash(req.file.buffer) : null;
    timing.mark("hash");

    if (userId && imageHash) {
      const existingAnalysis = await findMealAnalysisByImageHash({
        userId,
        imageHash,
      });
      timing.mark("lookup");

      if (existingAnalysis) {
        let reusedImageUrl = existingAnalysis.image_url || null;

        if (hasImage && !reusedImageUrl) {
          reusedImageUrl = await uploadImageToSupabase({
            bucket: "food-photos",
            userId,
            file: req.file,
          });
        }

        const reusedRecord = await saveMealAnalysis({
          userId,
          imageUrl: reusedImageUrl,
          imageHash,
          goal,
          analysis: existingAnalysis,
        });

        if (!reusedRecord) {
          throw new Error("No se pudo guardar el análisis reutilizado");
        }

        timing.mark("upload");
        timing.mark("insert");
        timing.done({ reused: true });

        return res.json({
          ...reusedRecord,
          image_hash: imageHash,
          image_url: reusedRecord.image_url || reusedImageUrl || null,
          reused: true,
          saved: true,
        });
      }
    } else {
      timing.mark("lookup");
    }

    const limitState = await checkDailyAiLimit({
      userId,
      type: "food_analysis",
      limit: DAILY_FOOD_ANALYSIS_LIMIT,
    });

    if (!limitState.allowed) {
      return res.status(429).json({
        error: `Has alcanzado tu límite de ${limitState.limit} análisis IA en este periodo. Se reinicia pronto.`,
        usage: {
          food_analysis: serializeUsageState("food_analysis", limitState),
        },
        plan: limitState.plan,
        upgradeAvailable: limitState.upgradeAvailable,
      });
    }

    const rateLimitState = enforceRateLimit({
      userId,
      type: "food_analysis",
      seconds: FOOD_ANALYSIS_COOLDOWN_MS / 1000,
    });

    if (!rateLimitState.allowed) {
      return res.status(429).json({
        error: `Espera ${rateLimitState.waitSeconds} segundos antes de analizar otra comida.`,
        usage: {
          food_analysis: serializeUsageState("food_analysis", limitState),
        },
        plan: limitState.plan,
        upgradeAvailable: false,
      });
    }

    registerAiUsage({ userId, type: "food_analysis" });

    const prompt = buildFoodAnalysisPrompt({
      goal,
      description,
      hasImage,
      profileContext,
    });

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    if (hasImage) {
      const base64Image = req.file.buffer.toString("base64");

      contents[0].parts.push({
        inlineData: {
          mimeType: req.file.mimetype,
          data: base64Image,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        temperature: 0.1,
        topP: 0.3,
      },
      contents,
    });
    timing.mark("Gemini");

    const rawText = response.text || "";
    const cleanText = cleanGeminiJson(rawText);

    let data;

    try {
      data = JSON.parse(cleanText);
    } catch {
      console.error("Gemini no devolvió JSON en analyze-food:", rawText);

      return res.status(500).json({
        error: "La IA no devolvió un análisis válido",
        detail: rawText.slice(0, 300),
      });
    }

    const analysis = normalizeFoodAnalysis(data);
    if (description) {
      analysis.description = analysis.description || description;
    }

    let imageUrl = null;
    let savedRecord = null;

    if (userId) {
      if (hasImage) {
        imageUrl = await uploadImageToSupabase({
          bucket: "food-photos",
          userId,
          file: req.file,
        });
      }

      timing.mark("upload");

      savedRecord = await saveMealAnalysis({
        userId,
        imageUrl,
        imageHash,
        goal,
        analysis,
      });
      timing.mark("insert");
    } else {
      timing.mark("upload");
      timing.mark("insert");
    }

    timing.done({ reused: false });

    return res.json({
      ...(savedRecord || analysis),
      image_hash: imageHash,
      image_url: imageUrl,
      description: description || (savedRecord || analysis)?.description || "",
      saved: Boolean(savedRecord),
    });
  } catch (error) {
    timing.done({ error: true });
    console.error("Error analyze-food completo:", error);

    return res.status(500).json({
      error: "Error analizando imagen",
      detail: error.message,
    });
  }
});

router.get("/meal-analyses/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data, error } = await supabase
      .from("meal_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "No se pudieron cargar los análisis de comida",
        detail: error.message,
      });
    }

    return res.json({ meal_analyses: data || [] });
  } catch (error) {
    return res.status(500).json({
      error: "Error cargando análisis de comida",
      detail: error.message,
    });
  }
});

router.delete("/meal-analyses/user/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!requestedUserId) {
      return res.status(400).json({ error: "Falta userId" });
    }

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data: meals, error: fetchError } = await supabase
      .from("meal_analyses")
      .select("id, image_url")
      .eq("user_id", userId);

    if (fetchError) {
      return res.status(500).json({
        error: "No se pudieron cargar los análisis de comida",
        detail: fetchError.message,
      });
    }

    const imagePaths = (meals || [])
      .map((meal) =>
        meal.image_url
          ? getSupabaseStoragePath({
              publicUrl: meal.image_url,
              bucket: "food-photos",
            })
          : null
      )
      .filter(Boolean);

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("food-photos")
        .remove(imagePaths);

      if (storageError) {
        console.error("Error borrando imágenes de comidas:", storageError);
      }
    }

    const { error: deleteError } = await supabase
      .from("meal_analyses")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return res.status(500).json({
        error: "No se pudieron borrar los análisis de comida",
        detail: deleteError.message,
      });
    }

    return res.json({ ok: true, deleted: meals?.length || 0 });
  } catch (error) {
    return res.status(500).json({
      error: "Error borrando historial de comidas",
      detail: error.message,
    });
  }
});

router.delete("/meal-analyses/:mealId", verifySupabaseUser, async (req, res) => {
  try {
    const { mealId } = req.params;
    const requestedUserId = req.query.user_id;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!mealId) {
      return res.status(400).json({ error: "Falta mealId" });
    }

    if (!requestedUserId) {
      return res.status(400).json({ error: "Falta user_id" });
    }

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data: meal, error: fetchError } = await supabase
      .from("meal_analyses")
      .select("id, image_url")
      .eq("id", mealId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({
        error: "No se pudo cargar el análisis de comida",
        detail: fetchError.message,
      });
    }

    if (!meal) {
      return res.status(404).json({
        error: "Análisis de comida no encontrado",
      });
    }

    if (meal.image_url) {
      const imagePath = getSupabaseStoragePath({
        publicUrl: meal.image_url,
        bucket: "food-photos",
      });

      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from("food-photos")
          .remove([imagePath]);

        if (storageError) {
          console.error("Error borrando imagen de comida:", storageError);
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("meal_analyses")
      .delete()
      .eq("id", mealId)
      .eq("user_id", userId);

    if (deleteError) {
      return res.status(500).json({
        error: "No se pudo borrar el análisis de comida",
        detail: deleteError.message,
      });
    }

    return res.json({ ok: true, deleted_id: mealId });
  } catch (error) {
    return res.status(500).json({
      error: "Error borrando análisis de comida",
      detail: error.message,
    });
  }
});

async function findMealAnalysisByImageHash({ userId, imageHash }) {
  if (!userId || !imageHash) return null;

  const { data, error } = await supabase
    .from("meal_analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("image_hash", imageHash)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error buscando análisis por image_hash:", error);
    throw new Error("No se pudo comprobar si la imagen ya fue analizada");
  }

  return data?.[0] || null;
}

async function saveMealAnalysis({ userId, imageUrl, imageHash, goal, analysis }) {
  if (!userId) return null;

  const mealId = crypto.randomUUID();

  const { data, error } = await supabase
    .from("meal_analyses")
    .insert({
      id: mealId,
      user_id: userId,
      image_url: imageUrl,
      image_hash: imageHash,
      goal,
      food: analysis.food,
      description: analysis.description,
      portion_estimate: analysis.portion_estimate,
      ingredients_detected: analysis.ingredients_detected,
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fat: analysis.fat,
      fiber: analysis.fiber,
      sugar: analysis.sugar,
      sodium: analysis.sodium,
      confidence: analysis.confidence,
      score: analysis.score,
      goal_fit: analysis.goal_fit,
      recommendation: analysis.recommendation,
      improvements: analysis.improvements,
      warning: analysis.warning,
    })
    .select()
    .single();

  if (error) {
    console.error("Error guardando análisis en Supabase:", error);
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

export default router;
