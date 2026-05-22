import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://www.nutrismartcoach.com",
  "https://nutrismartcoach.com",
  "https://nutri-smart-coach.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS no permitido: ${origin}`));
    },
  })
);

app.use(express.json({ limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "NutriSmartCoach backend activo",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "Backend funcionando correctamente",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
});

app.get("/exercise-image/:id", async (req, res) => {
  const exerciseId = String(req.params.id || "").trim();

  if (!exerciseId) {
    return res.status(400).json({ error: "Falta exerciseId" });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY || "";
  const rapidApiHost = process.env.RAPIDAPI_HOST || process.env.VITE_RAPIDAPI_HOST || "exercisedb.p.rapidapi.com";

  if (!rapidApiKey) {
    console.error("[exercise-image] Falta RAPIDAPI_KEY");
    return res.status(500).json({ error: "Falta configurar RAPIDAPI_KEY" });
  }

  try {
    const remoteUrl = new URL("https://exercisedb.p.rapidapi.com/image");
    remoteUrl.searchParams.set("exerciseId", exerciseId);
    remoteUrl.searchParams.set("resolution", "180");

    const response = await fetch(remoteUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
      },
    });

    if (!response.ok) {
      console.error("[exercise-image] RapidAPI error", {
        exerciseId,
        status: response.status,
      });
      return res.status(500).json({
        error: "RapidAPI devolvió un error al cargar la imagen",
        status: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("[exercise-image] Falló el proxy", {
      exerciseId,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      error: "No se pudo cargar la imagen de ExerciseDB",
    });
  }
});

app.get("/search-exercise", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Falta q" });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY || "";
  const rapidApiHost = process.env.RAPIDAPI_HOST || process.env.VITE_RAPIDAPI_HOST || "exercisedb.p.rapidapi.com";

  if (!rapidApiKey) {
    console.error("[search-exercise] Falta RAPIDAPI_KEY");
    return res.status(500).json({ error: "Falta configurar RAPIDAPI_KEY" });
  }

  try {
    const remoteUrl = new URL("https://exercisedb.p.rapidapi.com/exercises/name/" + encodeURIComponent(query));
    const response = await fetch(remoteUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[search-exercise] RapidAPI error", {
        query,
        status: response.status,
        body,
      });
      return res.status(500).json({
        error: "RapidAPI devolvió un error al buscar ejercicios",
        status: response.status,
      });
    }

    const payload = await response.json();
    const results = Array.isArray(payload)
      ? payload
      : payload?.results || payload?.data || payload?.response || payload?.exercises || [];

    return res.json({
      results,
    });
  } catch (error) {
    console.error("[search-exercise] Falló el proxy", {
      query,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      error: "No se pudo buscar ejercicios en ExerciseDB",
    });
  }
});

function createTimingLogger(label) {
  const start = performance.now();
  let previous = start;
  const marks = {};

  return {
    mark(name) {
      const now = performance.now();
      marks[name] = Math.round(now - previous);
      previous = now;
    },
    done(extra = {}) {
      console.info(`[timing:${label}]`, {
        ...marks,
        total: Math.round(performance.now() - start),
        ...extra,
      });
    },
  };
}

app.post("/analyze-food", upload.single("image"), async (req, res) => {
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

    const goal = req.body.goal || "perder_grasa";
    const userId = req.body.user_id || null;
    const imageHash = hasImage ? createImageHash(req.file.buffer) : null;
    timing.mark("hash");

    if (userId && imageHash) {
      const existingAnalysis = await findMealAnalysisByImageHash({
        userId,
        imageHash,
      });
      timing.mark("lookup");

      if (existingAnalysis) {
        timing.done({ reused: true });

        return res.json({
          ...existingAnalysis,
          image_hash: imageHash,
          image_url: existingAnalysis.image_url || null,
          reused: true,
          saved: true,
        });
      }
    } else {
      timing.mark("lookup");
    }

    const prompt = buildFoodAnalysisPrompt({
      goal,
      description,
      hasImage,
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

function buildFoodAnalysisPrompt({ goal, description, hasImage }) {
  const mode = hasImage
    ? "Analiza la comida visible de la foto"
    : "Analiza la comida descrita por el usuario";

  return `
${mode} para NutriSmart Coach. Objetivo: ${goal}.
${description ? `Descripción del usuario: ${description}` : ""}
Devuelve SOLO JSON válido, sin markdown ni texto extra.
No inventes ingredientes no visibles. Si hay imagen, estima porciones visibles de forma conservadora. Si solo hay descripción, estima calorías y macros con base en el texto y sé conservador. Si hay duda, baja confidence y explícalo en warning o recommendation. Evita valores extremos salvo evidencia clara.
JSON exacto:
{
  "food": "nombre claro de la comida",
  "description": "breve descripción clara de la comida o resumen de la descripción",
  "portion_estimate": "porción visible o estimada",
  "ingredients_detected": ["ingrediente 1", "ingrediente 2"],
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "sugar": 0,
  "sodium": 0,
  "confidence": 0,
  "score": 0,
  "goal_fit": "explica si esta comida encaja o no con el objetivo del usuario",
  "recommendation": "recomendación clara y accionable",
  "improvements": ["mejora concreta 1", "mejora concreta 2", "mejora concreta 3"],
  "warning": "advertencia breve si aplica; si no aplica, usa string vacío"
}
Números: sodium en mg, confidence 1-100, score 1-10. Si imagen clara confidence 70-90; si incierta 40-65. Mantén criterios estables.
`.trim();
}

app.post("/generate-diet", async (req, res) => {
  const timing = createTimingLogger("generate-diet");
  const { profile, preferences, user_id } = req.body || {};
  const userId = user_id || profile?.id || profile?.user_id || null;

  try {
    if (!profile || Object.keys(profile).length === 0) {
      return res.status(400).json({
        error: "Falta completar el perfil del usuario",
      });
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

app.post("/checkins", upload.single("image"), async (req, res) => {
  try {
    const userId = req.body.user_id || null;

    if (!userId) {
      return res.status(400).json({ error: "Falta user_id" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Falta la imagen del check-in" });
    }

    const imageUrl = await uploadImageToSupabase({
      bucket: "checkins",
      userId,
      file: req.file,
    });

    const previousCheckins = await getPreviousCheckins(userId);

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

async function uploadImageToSupabase({ bucket, userId, file }) {
  if (!process.env.SUPABASE_URL) {
    throw new Error("Falta SUPABASE_URL en Render");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en Render");
  }

  if (!file) {
    throw new Error("No se recibió archivo para subir");
  }

  const extension = getFileExtension(file.mimetype);
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error("ERROR STORAGE SUPABASE:", uploadError);

    throw new Error(
      `No se pudo subir imagen al bucket ${bucket}: ${uploadError.message}`
    );
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!publicData?.publicUrl) {
    throw new Error("Supabase no devolvió publicUrl");
  }

  console.log("Imagen subida correctamente:", publicData.publicUrl);

  return publicData.publicUrl;
}

function getSupabaseStoragePath({ publicUrl, bucket }) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}


async function findMealAnalysisByImageHash({ userId, imageHash }) {
  if (!userId || !imageHash) return null;

  const { data, error } = await supabase
    .from("meal_analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("image_hash", imageHash)
    .maybeSingle();

  if (error) {
    console.error("Error buscando análisis por image_hash:", error);
    throw new Error("No se pudo comprobar si la imagen ya fue analizada");
  }

  return data || null;
}

async function saveMealAnalysis({ userId, imageUrl, imageHash, goal, analysis }) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("meal_analyses")
    .insert({
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

function normalizeFoodAnalysis(data = {}) {
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

function cleanGeminiJson(text = "") {
  const cleaned = String(text)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
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

function buildDietPrompt(profile, preferences = {}, dietConfig) {
  const dayNames = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ].slice(0, dietConfig.days);

  const forbiddenLowCarb = `
Si la dieta es sin carbohidratos, low carb o keto:
- NO incluir pan.
- NO incluir arroz.
- NO incluir pasta.
- NO incluir avena.
- NO incluir cereales.
- NO incluir azúcar.
- NO incluir bollería.
- NO incluir tortillas de trigo.
- NO incluir patata, boniato o yuca salvo que el usuario lo permita.
- Priorizar huevos, pollo, pescado, carne magra, yogur griego natural, queso fresco, aguacate, verduras bajas en carbohidratos y ensaladas.
`;

  return `
Devuelve SOLO JSON válido, sin markdown ni texto extra.
Crea dieta para NutriSmartCoach con perfil=${JSON.stringify(profile)} y preferencias=${JSON.stringify(preferences || {})}.
Obligatorio: exactamente ${dietConfig.days} días (${dayNames.join(", ")}), exactamente ${dietConfig.mealsPerDay} comidas/día, macros realistas, cantidades claras en details, comida común y práctica, sin repetir la misma comida todos los días.
Horarios: 2 comidas = ayuno 13:00/20:00; 3 = desayuno/comida/cena; 4 = desayuno/comida/merienda/cena; 5-6 = añade snacks.
Alimentos en casa: ${dietConfig.homeFoods || "No especificado"}. Úsalos principalmente si existen.
${dietConfig.isLowCarb ? forbiddenLowCarb : ""}
JSON exacto:
{
  "week": [
    {
      "day": "Lunes",
      "meals": [
        {
          "time": "13:00",
          "name": "Comida 1",
          "food": "Pollo con ensalada y aguacate",
          "details": "180g pollo, 1 plato ensalada, 80g aguacate",
          "calories": 520,
          "protein": 48,
          "carbs": 12,
          "fat": 28
        }
      ]
    }
  ]
}
`;
}

function normalizeGeneratedDiet(week = [], dietConfig) {
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ].slice(0, dietConfig.days);

  return days.map((dayName, dayIndex) => {
    const sourceDay = week[dayIndex] || {};
    const rawMeals = Array.isArray(sourceDay.meals) ? sourceDay.meals : [];

    let meals = rawMeals
      .slice(0, dietConfig.mealsPerDay)
      .map((meal, index) =>
        sanitizeDietMeal(meal, index, dietConfig)
      );

    while (meals.length < dietConfig.mealsPerDay) {
      meals.push(
        createDefaultMeal(meals.length, dietConfig)
      );
    }

    return {
      day: dayName,
      meals,
    };
  });
}
function sanitizeDietMeal(meal = {}, index, dietConfig) {
  let food = meal.food || "Comida personalizada";
  let details = meal.details || "Cantidades no especificadas";

  if (dietConfig.isLowCarb) {
    const cleaned = removeForbiddenLowCarbFoods(food, details);
    food = cleaned.food;
    details = cleaned.details;
  }

  return {
    time: meal.time || defaultDietMealTime(index, dietConfig.mealsPerDay),
    name: meal.name || defaultDietMealName(index, dietConfig.mealsPerDay),
    food,
    details,
    calories: Number(meal.calories) || 0,
    protein: Number(meal.protein) || 0,
    carbs: dietConfig.isLowCarb
      ? Math.min(Number(meal.carbs) || 8, 18)
      : Number(meal.carbs) || 0,
    fat: Number(meal.fat) || 0,
  };
}

function removeForbiddenLowCarbFoods(food = "", details = "") {
  const forbidden = [
    "pan",
    "arroz",
    "pasta",
    "avena",
    "cereal",
    "cereales",
    "azúcar",
    "tortilla",
    "tortillas",
    "patata",
    "boniato",
    "yuca",
    "harina",
    "galleta",
    "galletas",
    "maíz",
  ];

  let newFood = String(food);
  let newDetails = String(details);

  const text = `${newFood} ${newDetails}`.toLowerCase();

  const hasForbidden = forbidden.some((item) =>
    text.includes(item)
  );

  if (!hasForbidden) {
    return { food: newFood, details: newDetails };
  }

  return {
    food: "Proteína con verduras bajas en carbohidratos",
    details:
      "180g pollo, pescado o huevos; ensalada verde; aguacate; aceite de oliva",
  };
}

function createDefaultMeal(index, dietConfig) {
  if (dietConfig.isLowCarb) {
    return {
      time: defaultDietMealTime(index, dietConfig.mealsPerDay),
      name: defaultDietMealName(index, dietConfig.mealsPerDay),
      food: "Huevos con aguacate y ensalada",
      details: "2-3 huevos, 80g aguacate, ensalada verde",
      calories: 420,
      protein: 28,
      carbs: 8,
      fat: 30,
    };
  }

  return {
    time: defaultDietMealTime(index, dietConfig.mealsPerDay),
    name: defaultDietMealName(index, dietConfig.mealsPerDay),
    food: "Pollo con verduras",
    details: "180g pollo, 200g verduras, aceite de oliva",
    calories: 430,
    protein: 45,
    carbs: 20,
    fat: 16,
  };
}

function defaultDietMealTime(index, mealsPerDay) {
  if (mealsPerDay === 2) {
    return ["13:00", "20:00"][index] || "13:00";
  }

  if (mealsPerDay === 3) {
    return ["08:30", "14:00", "20:30"][index] || "08:30";
  }

  if (mealsPerDay === 4) {
    return ["08:00", "13:30", "17:30", "21:00"][index] || "08:00";
  }

  if (mealsPerDay === 5) {
    return ["08:00", "11:30", "14:30", "18:00", "21:00"][index] || "08:00";
  }

  return ["08:00", "10:30", "13:30", "16:30", "19:30", "22:00"][index] || "08:00";
}

function defaultDietMealName(index, mealsPerDay) {
  if (mealsPerDay === 2) {
    return ["Comida 1", "Comida 2"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 3) {
    return ["Desayuno", "Comida", "Cena"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 4) {
    return ["Desayuno", "Comida", "Merienda", "Cena"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 5) {
    return ["Desayuno", "Snack", "Comida", "Merienda", "Cena"][index] || `Comida ${index + 1}`;
  }

  return ["Desayuno", "Snack 1", "Comida", "Snack 2", "Cena", "Extra"][index] || `Comida ${index + 1}`;
}

function createFallbackDiet(profile = {}, preferences = {}, dietConfig = buildDietConfig(preferences)) {
  const rawGoal =
    profile?.goal || profile?.objetivo || preferences?.goal || "mantener_peso";

  const goal = mapGoal(rawGoal);

 const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
].slice(0, dietConfig.days);

  const baseMeals = {
    perder_grasa: [
      {
        time: "08:00",
        name: "Desayuno",
        food: "Tortilla de claras con fruta",
        details: "4 claras, 1 huevo entero, 1 plátano",
        calories: 350,
        protein: 32,
        carbs: 30,
        fat: 9,
      },
      {
        time: "13:30",
        name: "Almuerzo",
        food: "Pollo con verduras y arroz pequeño",
        details: "180g pollo, 70g arroz, 200g verduras",
        calories: 520,
        protein: 48,
        carbs: 45,
        fat: 14,
      },
      {
        time: "18:00",
        name: "Merienda",
        food: "Yogur griego con frutos rojos",
        details: "200g yogur griego, 80g frutos rojos",
        calories: 220,
        protein: 20,
        carbs: 20,
        fat: 5,
      },
      {
        time: "21:00",
        name: "Cena",
        food: "Pescado blanco con ensalada y patata",
        details: "180g pescado, 200g patata cocida, 1 plato ensalada",
        calories: 430,
        protein: 42,
        carbs: 35,
        fat: 10,
      },
    ],

    ganar_musculo: [
      {
        time: "08:00",
        name: "Desayuno",
        food: "Avena con leche, plátano y huevos",
        details: "80g avena, 250ml leche, 1 plátano, 2 huevos",
        calories: 620,
        protein: 35,
        carbs: 80,
        fat: 18,
      },
      {
        time: "13:30",
        name: "Almuerzo",
        food: "Pollo con arroz, aguacate y verduras",
        details: "220g pollo, 100g arroz, 80g aguacate, 200g verduras",
        calories: 780,
        protein: 55,
        carbs: 85,
        fat: 22,
      },
      {
        time: "18:00",
        name: "Merienda",
        food: "Yogur griego con frutos secos",
        details: "250g yogur griego, 30g frutos secos",
        calories: 420,
        protein: 28,
        carbs: 30,
        fat: 20,
      },
      {
        time: "21:00",
        name: "Cena",
        food: "Salmón con patata y ensalada",
        details: "200g salmón, 250g patata, 1 plato ensalada",
        calories: 650,
        protein: 50,
        carbs: 45,
        fat: 24,
      },
    ],

    mantener_peso: [
      {
        time: "08:00",
        name: "Desayuno",
        food: "Avena con yogur y fruta",
        details: "60g avena, 200g yogur natural, 1 pieza fruta",
        calories: 450,
        protein: 25,
        carbs: 60,
        fat: 12,
      },
      {
        time: "13:30",
        name: "Almuerzo",
        food: "Pavo con arroz y verduras",
        details: "180g pavo, 90g arroz, 200g verduras",
        calories: 620,
        protein: 45,
        carbs: 70,
        fat: 16,
      },
      {
        time: "18:00",
        name: "Merienda",
        food: "Tostada integral con queso fresco",
        details: "2 rebanadas pan integral, 80g queso fresco",
        calories: 300,
        protein: 18,
        carbs: 35,
        fat: 10,
      },
      {
        time: "21:00",
        name: "Cena",
        food: "Huevos con ensalada y pan integral",
        details: "3 huevos, 1 plato ensalada, 1 rebanada pan integral",
        calories: 480,
        protein: 38,
        carbs: 30,
        fat: 20,
      },
    ],
  };

  const selectedMeals = baseMeals[goal] || baseMeals.mantener_peso;

return days.map((day, dayIndex) => ({
  day,
  meals: selectedMeals
    .slice(0, dietConfig.mealsPerDay)
    .map((meal, mealIndex) => ({
      ...meal,
      time: defaultDietMealTime(mealIndex, dietConfig.mealsPerDay),
      name: defaultDietMealName(mealIndex, dietConfig.mealsPerDay),
      food: varyMeal(meal.food, goal, dayIndex, mealIndex),
      details: varyDetails(meal.details, goal, dayIndex, mealIndex),
    })),
}));
}

function mapGoal(goal) {
  if (goal === "lose_fat") return "perder_grasa";
  if (goal === "gain_muscle") return "ganar_musculo";
  if (goal === "maintain") return "mantener_peso";

  if (goal === "perder_grasa") return "perder_grasa";
  if (goal === "ganar_musculo") return "ganar_musculo";
  if (goal === "mantener_peso") return "mantener_peso";

  return "mantener_peso";
}

function varyMeal(food, goal, dayIndex, mealIndex) {
  const variations = {
    perder_grasa: [
      "Tortilla de claras con fruta",
      "Yogur griego con avena y frutos rojos",
      "Pollo con arroz pequeño y verduras",
      "Pavo con ensalada y boniato",
      "Merluza con patata cocida y ensalada",
      "Atún con arroz integral y tomate",
      "Huevos con verduras salteadas",
    ],
    ganar_musculo: [
      "Avena con leche, plátano y huevos",
      "Pollo con arroz, aguacate y verduras",
      "Pasta integral con carne magra",
      "Salmón con patata y ensalada",
      "Yogur griego con frutos secos",
      "Tortilla con pan integral y fruta",
      "Pavo con quinoa y verduras",
    ],
    mantener_peso: [
      "Avena con yogur y fruta",
      "Pavo con arroz y verduras",
      "Huevos con ensalada y pan integral",
      "Pescado con patata cocida",
      "Tostada integral con queso fresco",
      "Pollo con verduras y arroz",
      "Yogur natural con fruta y frutos secos",
    ],
  };

  const list = variations[goal] || variations.mantener_peso;
  return list[(dayIndex + mealIndex) % list.length] || food;
}

function varyDetails(details, goal, dayIndex, mealIndex) {
  const variations = {
    perder_grasa: [
      "4 claras, 1 huevo entero, 1 pieza de fruta",
      "200g yogur griego, 40g avena, 80g frutos rojos",
      "180g pollo, 70g arroz, 200g verduras",
      "160g pavo, 200g ensalada, 150g boniato",
      "180g merluza, 200g patata cocida, ensalada",
      "1 lata de atún, 80g arroz integral, tomate",
      "2 huevos, 200g verduras salteadas",
    ],
    ganar_musculo: [
      "80g avena, 250ml leche, 1 plátano, 2 huevos",
      "220g pollo, 100g arroz, 80g aguacate, verduras",
      "100g pasta integral, 180g carne magra",
      "200g salmón, 250g patata, ensalada",
      "250g yogur griego, 30g frutos secos",
      "3 huevos, 2 rebanadas pan integral, 1 fruta",
      "180g pavo, 90g quinoa, 200g verduras",
    ],
    mantener_peso: [
      "60g avena, 200g yogur natural, 1 pieza fruta",
      "180g pavo, 90g arroz, 200g verduras",
      "3 huevos, ensalada, 1 rebanada pan integral",
      "180g pescado, 200g patata cocida",
      "2 tostadas integrales, 80g queso fresco",
      "180g pollo, 80g arroz, 200g verduras",
      "200g yogur natural, 1 fruta, 20g frutos secos",
    ],
  };

  const list = variations[goal] || variations.mantener_peso;
  return list[(dayIndex + mealIndex) % list.length] || details;
}

function getFileExtension(mimeType = "") {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("jpg")) return "jpg";
  return "jpg";
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createImageHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

app.get("/checkins/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

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

app.delete("/checkins/:checkinId", async (req, res) => {
  try {
    const { checkinId } = req.params;
    const userId = req.query.user_id;

    if (!checkinId) {
      return res.status(400).json({ error: "Falta checkinId" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Falta user_id" });
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

    const { error: deleteError } = await supabase
      .from("checkins")
      .delete()
      .eq("id", checkinId)
      .eq("user_id", userId);

    if (deleteError) {
      return res.status(500).json({
        error: "No se pudo borrar el check-in",
        detail: deleteError.message,
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

app.get("/diet-plans/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

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

app.get("/meal-analyses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

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

app.delete("/meal-analyses/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Falta userId" });
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

app.delete("/meal-analyses/:mealId", async (req, res) => {
  try {
    const { mealId } = req.params;
    const userId = req.query.user_id;

    if (!mealId) {
      return res.status(400).json({ error: "Falta mealId" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Falta user_id" });
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
      .eq("id", mealId);

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
              text: `
Eres un coach fitness experto para NutriSmart Coach.

Analiza la foto corporal del usuario de forma prudente y útil.

Datos actuales:
Peso: ${weight || "no indicado"} kg
Cintura: ${waist || "no indicada"} cm
Pecho: ${chest || "no indicado"} cm
Cadera: ${hips || "no indicada"} cm
Notas del usuario: ${notes || "sin notas"}

Check-ins anteriores:
${JSON.stringify(previousCheckins || [])}

Devuelve SOLO JSON válido. No uses markdown.

Estructura exacta:
{
  "body_fat_range": "rango aproximado, por ejemplo 18-22%",
  "confidence": 0,
  "visual_changes": "cambios visuales observables de forma prudente",
  "recommendation": "recomendación concreta para la próxima semana"
}

Reglas:
- No des diagnóstico médico.
- No afirmes precisión exacta.
- confidence debe ser número del 1 al 100.
- visual_changes debe tener máximo 220 caracteres.
- recommendation debe tener máximo 280 caracteres.
- Sé directo, claro y resumido.
- No uses listas largas.
- No uses markdown.
`,
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

function normalizeCheckinAnalysis(data = {}) {
  return {
    body_fat_range: data.body_fat_range || "No estimable",
    confidence: clamp(Number(data.confidence) || 60, 1, 100),
    visual_changes:
      data.visual_changes ||
      "No se pudieron detectar cambios visuales con suficiente claridad.",
    recommendation:
      data.recommendation ||
      "Mantén una rutina constante, prioriza proteína suficiente y repite el check-in semanal con la misma luz y postura.",
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

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
