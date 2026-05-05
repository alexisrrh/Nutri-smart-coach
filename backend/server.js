import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://nutri-coach-ia.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let lastRequestTime = 0;
const REQUEST_DELAY = 8000;

app.get("/", (req, res) => {
  res.json({ message: "Backend NutriCoach funcionando" });
});

app.post("/analyze-food", upload.single("image"), async (req, res) => {
  try {
    const now = Date.now();

    if (now - lastRequestTime < REQUEST_DELAY) {
      return res.status(429).json({
        error: "Espera unos segundos antes de analizar otra imagen.",
      });
    }

    lastRequestTime = now;

    const goal = req.body.goal || "perder_grasa";

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta GEMINI_API_KEY en el .env del backend.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No se recibió ninguna imagen.",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "El archivo debe ser una imagen.",
      });
    }

    console.log("Imagen recibida:", req.file.mimetype, req.file.size);
    console.log("Objetivo usuario:", goal);

    const base64Image = req.file.buffer.toString("base64");

    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
            {
              text: `
Eres un nutricionista profesional dentro de una app llamada NutriCoach iA.

Crea una dieta semanal completa de lunes a domingo.

Datos del usuario:
Edad: ${profile.age}
Peso: ${profile.weight} kg
Altura: ${profile.height} cm
Sexo: ${profile.gender}
Actividad: ${profile.activity}
Objetivo: ${profile.goal}
Calorías objetivo: ${profile.goals?.calories}
Proteínas objetivo: ${profile.goals?.protein} g
Carbohidratos objetivo: ${profile.goals?.carbs} g
Grasas objetivo: ${profile.goals?.fat} g

Preferencias:
Comidas al día: ${preferences?.mealsPerDay}
Tipo de dieta: ${preferences?.dietStyle}
Presupuesto: ${preferences?.budget}
Nivel de cocina: ${preferences?.cookingLevel}
Alimentos que no le gustan: ${preferences?.dislikedFoods || "ninguno"}
Alergias/restricciones: ${preferences?.allergies || "ninguna"}

Responde SOLO con JSON válido.
No uses markdown.
No uses texto fuera del JSON.

Formato exacto:
{
  "week": [
    {
      "day": "Lunes",
      "meals": [
        {
          "time": "08:00",
          "name": "Desayuno",
          "food": "Avena con yogur griego y plátano",
          "ingredients": [
            {
              "name": "avena",
              "quantity": "60 g"
            },
            {
              "name": "yogur griego",
              "quantity": "200 g"
            },
            {
              "name": "plátano",
              "quantity": "1 unidad"
            }
          ],
          "calories": 520,
          "protein": 35,
          "carbs": 65,
          "fat": 12
        }
      ]
    }
  ]
}

Reglas:
- Incluye lunes, martes, miércoles, jueves, viernes, sábado y domingo.
- Incluye exactamente el número de comidas al día indicado por el usuario.
- Cada comida debe incluir ingredients con name y quantity.
- Las cantidades deben ser claras: gramos, ml, unidades, cucharadas o latas.
- Usa comidas realistas, económicas y fáciles de preparar.
- Usa alimentos fáciles de conseguir en España.
- Adapta la dieta al objetivo del usuario.
- No incluyas suplementos como obligatorio.
- Evita alimentos indicados como no gustados o restringidos.
- calories, protein, carbs y fat deben ser números.
`
            },
          ],
        });

        break;
      } catch (error) {
        console.log(`Intento ${attempt} falló:`, error?.message || error);

        if (attempt === 3) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    const rawText = response?.text || "";
    console.log("Respuesta Gemini:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        error: "La IA no devolvió un JSON válido.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const allowedScores = ["excellent", "good", "bad"];

    const result = {
      food: parsed.food || parsed.food_name || "Comida no identificada",
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      carbs: Number(parsed.carbs) || 0,
      fat: Number(parsed.fat) || 0,
      recommendation:
        parsed.recommendation ||
        "Estimación aproximada. Para mayor precisión, pesa los alimentos.",
      score: allowedScores.includes(parsed.score) ? parsed.score : "good",
    };

    return res.json(result);
  } catch (error) {
    console.error("ERROR GEMINI:", error);

    const message = error?.message || "";

    if (message.includes("quota") || message.includes("429")) {
      return res.status(429).json({
        error: "Límite de Gemini alcanzado. Espera un poco e intenta otra vez.",
      });
    }

    if (message.includes("503") || message.includes("UNAVAILABLE")) {
      return res.status(503).json({
        error:
          "Gemini está saturado temporalmente. Intenta de nuevo en unos minutos.",
      });
    }

    return res.status(500).json({
      error: "Error analizando imagen con Gemini.",
    });
  }
});

app.post("/generate-diet", async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({
        error: "Falta el perfil del usuario.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta GEMINI_API_KEY en el .env del backend.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `
Eres un nutricionista profesional dentro de una app llamada NutriCoach iA.

Crea una dieta semanal completa de lunes a domingo.

Datos del usuario:
Edad: ${profile.age}
Peso: ${profile.weight} kg
Altura: ${profile.height} cm
Sexo: ${profile.gender}
Actividad: ${profile.activity}
Objetivo: ${profile.goal}
Calorías objetivo: ${profile.goals?.calories}
Proteínas objetivo: ${profile.goals?.protein} g
Carbohidratos objetivo: ${profile.goals?.carbs} g
Grasas objetivo: ${profile.goals?.fat} g

Responde SOLO con JSON válido.
No uses markdown.
No uses texto fuera del JSON.

Formato exacto:
{
  "week": [
    {
      "day": "Lunes",
      "meals": [
        {
          "time": "08:00",
          "name": "Desayuno",
          "food": "Tortilla de 2 huevos con avena y fruta",
          "calories": 450,
          "protein": 30,
          "carbs": 45,
          "fat": 15
        }
      ]
    }
  ]
}

Reglas:
- Incluye lunes, martes, miércoles, jueves, viernes, sábado y domingo.
- Usa comidas realistas, económicas y fáciles de preparar.
- Incluye 4 comidas por día.
- Adapta la dieta al objetivo del usuario.
- calories, protein, carbs y fat deben ser números.
- Las comidas deben ser fáciles de conseguir en España.
- No incluyas suplementos como obligatorio.
          `,
        },
      ],
    });

    const rawText = response?.text || "";
    console.log("Respuesta dieta Gemini:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        error: "La IA no devolvió un JSON válido.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return res.json(parsed);
  } catch (error) {
    console.error("ERROR GENERANDO DIETA:", error);

    const message = error?.message || "";

    if (message.includes("quota") || message.includes("429")) {
      return res.status(429).json({
        error: "Límite de Gemini alcanzado. Espera un poco e intenta otra vez.",
      });
    }

    if (message.includes("503") || message.includes("UNAVAILABLE")) {
      return res.status(503).json({
        error:
          "Gemini está saturado temporalmente. Intenta de nuevo en unos minutos.",
      });
    }

    return res.status(500).json({
      error: "Error generando dieta con IA.",
    });
  }
});
app.post("/analyze-body", upload.single("image"), async (req, res) => {
  try {
    const { weight, height, gender, goal } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta GEMINI_API_KEY en el backend.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No se recibió ninguna imagen.",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "El archivo debe ser una imagen.",
      });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64Image,
          },
        },
        {
          text: `
Eres un asistente de progreso físico dentro de NutriCoach iA.

Analiza visualmente la foto de cuerpo completo y devuelve una ESTIMACIÓN APROXIMADA, no médica.

Datos del usuario:
Peso: ${weight || "no indicado"} kg
Altura: ${height || "no indicada"} cm
Sexo: ${gender || "no indicado"}
Objetivo: ${goal || "no indicado"}

Responde SOLO con JSON válido. No uses markdown.

Formato exacto:
{
  "body_fat_range": "18-22%",
  "confidence": "media",
  "visual_changes": "descripción breve de cambios físicos visibles o estado actual",
  "recommendation": "recomendación breve para la próxima semana"
}

Reglas:
- body_fat_range debe ser un rango aproximado, nunca un número exacto.
- confidence debe ser: "baja", "media" o "alta".
- No hagas diagnóstico médico.
- No menciones partes íntimas ni detalles sensibles.
- Si la foto no permite estimar, usa body_fat_range: "No estimable" y confidence: "baja".
- Sé prudente y claro.
          `,
        },
      ],
    });

    const rawText = response?.text || "";
    console.log("Respuesta body scan Gemini:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        error: "La IA no devolvió un JSON válido.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return res.json({
      body_fat_range: parsed.body_fat_range || "No estimable",
      confidence: parsed.confidence || "baja",
      visual_changes:
        parsed.visual_changes ||
        "No se pudieron detectar cambios visuales con suficiente claridad.",
      recommendation:
        parsed.recommendation ||
        "Mantén constancia con dieta, entrenamiento y check-ins semanales.",
    });
  } catch (error) {
    console.error("ERROR ANALIZANDO CUERPO:", error);

    return res.status(500).json({
      error: "Error analizando progreso físico.",
    });
  }
});

app.use((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "La imagen es demasiado pesada. Máximo permitido: 4MB.",
    });
  }

  return res.status(500).json({
    error: "Error inesperado en el servidor.",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});