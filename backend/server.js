import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

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
      if (!origin || allowedOrigins.includes(origin)) {
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
  });
});

app.post("/analyze-food", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta configurar GEMINI_API_KEY en Render",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No se recibió ninguna imagen",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "El archivo debe ser una imagen",
      });
    }

    const goal = req.body.goal || "perder_grasa";
    const base64Image = req.file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Eres un nutricionista experto para una app fitness llamada NutriSmart Coach.

Analiza la comida de la imagen con el máximo detalle posible.

Objetivo del usuario: ${goal}

Devuelve SOLO JSON válido. No uses markdown. No escribas texto fuera del JSON.

Estructura exacta:
{
  "food": "nombre claro de la comida",
  "description": "descripción breve de lo que se ve en el plato",
  "portion_estimate": "estimación de porción visible, por ejemplo: 1 plato mediano, 150g arroz, 180g pollo",
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

Reglas:
- calories debe ser número aproximado.
- protein, carbs, fat, fiber, sugar y sodium deben ser números.
- sodium debe estar en mg.
- confidence debe ser número del 1 al 100.
- score debe ser número del 1 al 10.
- Sé prudente: si no se ve claro, baja confidence.
- No inventes ingredientes invisibles.
- Si hay dudas, dilo en recommendation o warning.
- La respuesta debe ayudar al usuario a tomar una decisión real.
- Ajusta recommendation, improvements y goal_fit según el objetivo.
`,
            },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

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

    return res.json(normalizeFoodAnalysis(data));
  } catch (error) {
    console.error("Error analyze-food completo:", error);

    return res.status(500).json({
      error: "Error analizando imagen",
      detail: error.message,
    });
  }
});

app.post("/generate-diet", async (req, res) => {
  const { profile, preferences } = req.body || {};

  try {
    if (!profile || Object.keys(profile).length === 0) {
      return res.status(400).json({
        error: "Falta completar el perfil del usuario",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        week: createFallbackDiet(profile, preferences),
        usedFallback: true,
        warning: "GEMINI_API_KEY no está configurada en Render",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Devuelve SOLO JSON válido. No uses markdown.

Crea una dieta semanal para NutriSmartCoach.

Perfil:
${JSON.stringify(profile)}

Preferencias:
${JSON.stringify(preferences || {})}

Formato exacto:
{
  "week": [
    {
      "day": "Lunes",
      "meals": [
        {
          "time": "08:00",
          "name": "Desayuno",
          "food": "Avena con yogur y fruta",
          "details": "60g avena, 200g yogur natural, 1 banana",
          "calories": 450,
          "protein": 25,
          "carbs": 60,
          "fat": 10
        }
      ]
    }
  ]
}

Reglas:
- Genera exactamente 7 días: Lunes a Domingo.
- Cada día debe tener comidas diferentes.
- No repitas el mismo desayuno más de 2 veces.
- No repitas el mismo almuerzo más de 2 veces.
- No repitas la misma cena más de 2 veces.
- Usa 4 comidas por día.
- Incluye details con cantidades exactas.
- Usa comida económica, común y fácil.
- Mantén valores nutricionales realistas.
`,
            },
          ],
        },
      ],
    });

    const rawText = response.text || "";
    const cleanText = cleanGeminiJson(rawText);

    let data;

    try {
      data = JSON.parse(cleanText);
    } catch {
      console.error("Gemini no devolvió JSON en generate-diet:", rawText);

      return res.json({
        week: createFallbackDiet(profile, preferences),
        usedFallback: true,
        warning: "Gemini no devolvió JSON válido",
      });
    }

    if (!data.week || !Array.isArray(data.week)) {
      return res.json({
        week: createFallbackDiet(profile, preferences),
        usedFallback: true,
        warning: "Gemini no devolvió week válido",
      });
    }

    return res.json({
      week: data.week,
      usedFallback: false,
    });
  } catch (error) {
    console.error("Error generate-diet completo:", error);

    return res.json({
      week: createFallbackDiet(profile, preferences),
      usedFallback: true,
      warning: error.message,
    });
  }
});

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

function createFallbackDiet(profile = {}, preferences = {}) {
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
  ];

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
    meals: selectedMeals.map((meal, mealIndex) => ({
      ...meal,
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});