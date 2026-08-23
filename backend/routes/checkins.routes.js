import { Router } from "express";
import { ai } from "../config/gemini.js";
import { uploadSingleImage } from "../config/multer.js";
import { supabase } from "../config/supabase.js";
import {
  assertSameUser,
  requireAuthenticatedUser,
  verifySupabaseUser,
} from "../middleware/auth.js";
import { normalizeCheckinAnalysis } from "../normalizers/checkin.normalizer.js";
import { buildCheckinPrompt } from "../prompts/checkin.prompt.js";
import {
  getSupabaseStoragePath,
  signImageUrlField,
  signImageUrlFields,
  uploadImageToSupabase,
} from "../services/storage.service.js";
import {
  AI_USAGE_RULES,
  checkDailyAiLimit,
  enforceRateLimit,
  registerAiUsage,
} from "../utils/aiUsage.js";
import { cleanGeminiJson } from "../utils/json.js";
import { toNumberOrNull } from "../utils/numbers.js";

const router = Router();
const DAILY_CHECKIN_ANALYSIS_LIMIT = AI_USAGE_RULES.checkin_analysis.freeLimit;
const CHECKIN_ANALYSIS_COOLDOWN_SECONDS = 8;

router.post("/checkins", verifySupabaseUser, uploadSingleImage("image"), async (req, res) => {
  try {
    const requestedUserId = req.body.user_id || null;
    const userId = requireAuthenticatedUser(req, res);
    const language = normalizeCheckinLanguage(
      req.body.language || req.body.preferred_language || req.body.profile_language
    );

    if (!userId) return;

    if (requestedUserId && !assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Falta user_id" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Falta la imagen del check-in" });
    }

    if (process.env.GEMINI_API_KEY) {
      const limitState = await checkDailyAiLimit({
        userId,
        type: "checkin_analysis",
        limit: DAILY_CHECKIN_ANALYSIS_LIMIT,
      });

      if (!limitState.allowed) {
        return res.status(429).json({
          error: "Has alcanzado tu límite de check-in IA en este periodo. Se reinicia pronto.",
          usage: {
            checkin_analysis: serializeUsageState("checkin_analysis", limitState),
          },
          plan: limitState.plan,
          upgradeAvailable: limitState.upgradeAvailable,
        });
      }

      const rateLimitState = enforceRateLimit({
        userId,
        type: "checkin_analysis",
        seconds: CHECKIN_ANALYSIS_COOLDOWN_SECONDS,
      });

      if (!rateLimitState.allowed) {
        return res.status(429).json({
          error: `Espera ${rateLimitState.waitSeconds} segundos antes de guardar otro check-in IA.`,
          usage: {
            checkin_analysis: serializeUsageState("checkin_analysis", limitState),
          },
          plan: limitState.plan,
          upgradeAvailable: false,
        });
      }
    }

    const imageUrl = await uploadImageToSupabase({
      bucket: "checkins",
      userId,
      file: req.file,
    });

    const previousCheckins = await getPreviousCheckins(userId);

    if (process.env.GEMINI_API_KEY) {
      registerAiUsage({ userId, type: "checkin_analysis" });
    }

    const analysis = await analyzeCheckinWithGemini({
      file: req.file,
      weight: req.body.weight,
      waist: req.body.waist,
      chest: req.body.chest,
      hips: req.body.hips,
      notes: req.body.notes,
      previousCheckins,
      language,
    });

    const { data, error } = await supabase
      .from("checkins")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        weight: toNumberOrNull(req.body.weight),
        waist: toNumberOrNull(req.body.waist),
        chest: toNumberOrNull(req.body.chest),
        hips: toNumberOrNull(req.body.hips),
        notes: req.body.notes || "",
        language,
        body_fat_range: analysis.body_fat_range,
        confidence: analysis.confidence,
        visual_changes: analysis.visual_changes,
        recommendation: analysis.recommendation,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "No se pudo guardar el check-in",
      });
    }

    const signedCheckin = await signImageUrlField({
      ...data,
      language,
    }, { bucket: "checkins" });

    return res.json({
      ok: true,
      language,
      checkin: signedCheckin,
    });
  } catch (error) {
    console.error("Error guardando check-in", {
      requestId: req.requestId || null,
      endpoint: "checkins",
      code: error?.code || "CHECKIN_SAVE_FAILED",
    });

    return res.status(500).json({
      error: "Error guardando check-in",
    });
  }
});

router.get("/checkins/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "No se pudieron cargar los check-ins",
      });
    }

    return res.json({
      checkins: await signImageUrlFields(data || [], {
        bucket: "checkins",
      }),
    });
  } catch {
    return res.status(500).json({
      error: "Error cargando check-ins",
    });
  }
});

router.delete("/checkins/:checkinId", verifySupabaseUser, async (req, res) => {
  try {
    const { checkinId } = req.params;
    const requestedUserId = req.query.user_id;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!checkinId) {
      return res.status(400).json({ error: "Falta checkinId" });
    }

    if (requestedUserId && !assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data: checkin, error: fetchError } = await supabase
      .from("checkins")
      .select("id, image_url")
      .eq("id", checkinId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({
        error: "No se pudo cargar el check-in",
      });
    }

    if (!checkin) {
      return res.status(404).json({
        error: "Check-in no encontrado",
      });
    }

    if (checkin.image_url) {
      const imagePath = getSupabaseStoragePath({
        publicUrl: checkin.image_url,
        bucket: "checkins",
      });

      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from("checkins")
          .remove([imagePath]);

        if (storageError) {
          console.error("Error borrando imagen de check-in", {
            code: storageError?.code || "CHECKIN_IMAGE_DELETE_FAILED",
          });
        }
      }
    }

    const { data: deletedCheckins, error: deleteError } = await supabase
      .from("checkins")
      .delete()
      .eq("id", checkinId)
      .eq("user_id", userId)
      .select("id");

    if (deleteError) {
      return res.status(500).json({
        error: "No se pudo borrar el check-in",
      });
    }

    if (!deletedCheckins?.length) {
      return res.status(404).json({
        error: "Check-in no encontrado",
      });
    }

    return res.json({ ok: true, deleted_id: checkinId });
  } catch {
    return res.status(500).json({
      error: "Error borrando check-in",
    });
  }
});

async function getPreviousCheckins(userId) {
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("Error cargando checkins previos", {
      code: error?.code || "CHECKINS_PREVIOUS_LOAD_FAILED",
    });
    return [];
  }

  return data || [];
}

async function analyzeCheckinWithGemini({
  file,
  weight,
  waist,
  chest,
  hips,
  notes,
  previousCheckins,
  language = "es",
}) {
  if (!process.env.GEMINI_API_KEY) {
    return createFallbackCheckinAnalysis({ weight, previousCheckins, language });
  }

  try {
    const base64Image = file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildCheckinPrompt({
                weight,
                waist,
                chest,
                hips,
                notes,
                previousCheckins,
                language,
              }),
            },
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    const cleanText = cleanGeminiJson(response.text || "");
    const data = JSON.parse(cleanText);

    return normalizeCheckinAnalysis(data, language);
  } catch (error) {
    console.error("Error analizando checkin con Gemini", {
      code: error?.code || "CHECKIN_AI_FAILED",
    });
    return createFallbackCheckinAnalysis({ weight, previousCheckins, language });
  }
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

function createFallbackCheckinAnalysis({ weight, previousCheckins, language = "es" }) {
  const normalizedLanguage = normalizeCheckinLanguage(language);
  const previous = previousCheckins?.[0];
  const previousWeight = Number(previous?.weight || 0);
  const currentWeight = Number(weight || 0);

  let visualChanges =
    normalizedLanguage === "en"
      ? "First record saved. From the next check-in we will be able to compare progress."
      : "Primer registro guardado. A partir del próximo check-in podremos comparar evolución.";

  if (previousWeight && currentWeight) {
    const diff = Number((currentWeight - previousWeight).toFixed(1));

      visualChanges =
        diff < 0
        ? normalizedLanguage === "en"
          ? `You have lost approximately ${Math.abs(diff)} kg since the last record.`
          : `Has bajado aproximadamente ${Math.abs(diff)} kg desde el último registro.`
        : diff > 0
          ? normalizedLanguage === "en"
            ? `You have gained approximately ${diff} kg since the last record.`
            : `Has subido aproximadamente ${diff} kg desde el último registro.`
          : normalizedLanguage === "en"
            ? "Your weight has remained stable since the last record."
            : "Tu peso se mantiene estable desde el último registro.";
  }

  return {
    body_fat_range: "No estimable",
    confidence: 50,
    visual_changes: visualChanges,
    recommendation:
      normalizedLanguage === "en"
        ? "Repeat the photo every week with the same light, distance, and pose to compare your progress better."
        : "Repite la foto cada semana con la misma luz, distancia y postura para comparar mejor tu progreso.",
  };
}

function normalizeCheckinLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("es")) return "es";

  return "es";
}

export default router;
