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
        detail: error.message,
      });
    }

    return res.json({
      ok: true,
      checkin: data,
    });
  } catch (error) {
    console.error("Error checkins:", error);

    return res.status(500).json({
      error: "Error guardando check-in",
      detail: error.message,
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
        detail: error.message,
      });
    }

    return res.json({ checkins: data || [] });
  } catch (error) {
    return res.status(500).json({
      error: "Error cargando check-ins",
      detail: error.message,
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
        detail: fetchError.message,
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
          console.error("Error borrando imagen de check-in:", storageError);
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
        detail: deleteError.message,
      });
    }

    if (!deletedCheckins?.length) {
      return res.status(404).json({
        error: "Check-in no encontrado",
      });
    }

    return res.json({ ok: true, deleted_id: checkinId });
  } catch (error) {
    return res.status(500).json({
      error: "Error borrando check-in",
      detail: error.message,
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
    console.error("Error cargando checkins previos:", error);
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
}) {
  if (!process.env.GEMINI_API_KEY) {
    return createFallbackCheckinAnalysis({ weight, previousCheckins });
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

    return normalizeCheckinAnalysis(data);
  } catch (error) {
    console.error("Error analizando checkin con Gemini:", error);
    return createFallbackCheckinAnalysis({ weight, previousCheckins });
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

function createFallbackCheckinAnalysis({ weight, previousCheckins }) {
  const previous = previousCheckins?.[0];
  const previousWeight = Number(previous?.weight || 0);
  const currentWeight = Number(weight || 0);

  let visualChanges = "Primer registro guardado. A partir del próximo check-in podremos comparar evolución.";

  if (previousWeight && currentWeight) {
    const diff = Number((currentWeight - previousWeight).toFixed(1));

    visualChanges =
      diff < 0
        ? `Has bajado aproximadamente ${Math.abs(diff)} kg desde el último registro.`
        : diff > 0
          ? `Has subido aproximadamente ${diff} kg desde el último registro.`
          : "Tu peso se mantiene estable desde el último registro.";
  }

  return {
    body_fat_range: "No estimable",
    confidence: 50,
    visual_changes: visualChanges,
    recommendation:
      "Repite la foto cada semana con la misma luz, distancia y postura para comparar mejor tu progreso.",
  };
}

export default router;
