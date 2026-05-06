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
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
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
  });
});

app.post("/analyze-food", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta configurar GEMINI_API_KEY en el backend",
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
Eres un asistente nutricional para una app fitness llamada NutriSmartCoach.

Analiza la comida de la imagen y estima sus valores nutricionales.

Objetivo del usuario: ${goal}

Devuelve SOLO JSON válido. No uses markdown, no uses explicaciones fuera del JSON.

Estructura exacta:
{
  "food": "nombre claro de la comida",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "recommendation": "recomendación breve según el objetivo del usuario",
  "score": 0
}

Reglas:
- calories debe ser un número aproximado.
- protein, carbs y fat deben ser números en gramos.
- score debe ser un número del 1 al 10.
- Si no puedes identificar bien la comida, haz una estimación prudente.
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
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let data;

    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Respuesta no válida de Gemini:", rawText);

      return res.status(500).json({
        error: "Gemini no devolvió un JSON válido",
        raw: rawText,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error analyze-food:", error);

    res.status(500).json({
      error: "Error analizando imagen",
      detail: error.message,
    });
  }
});

app.post("/generate-diet", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Falta configurar GEMINI_API_KEY en el backend",
      });
    }

    const { profile, preferences } = req.body;

    if (!profile) {
      return res.status(400).json({
        error: "Falta el perfil del usuario",
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
Eres un nutricionista experto para una app fitness llamada NutriSmartCoach.

Crea una dieta semanal personalizada de lunes a domingo.

Perfil del usuario:
${JSON.stringify(profile, null, 2)}

Preferencias:
${JSON.stringify(preferences || {}, null, 2)}

Devuelve SOLO JSON válido. No uses markdown.

Estructura exacta:
{
  "week": [
    {
      "day": "Lunes",
      "meals": [
        {
          "time": "08:00",
          "name": "Desayuno",
          "food": "Avena con yogur y fruta",
          "details": "60g de avena, 200g de yogur natural, 1 banana",
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
- Incluye 4 comidas por día: Desayuno, Almuerzo, Merienda y Cena.
- Usa alimentos comunes, económicos y fáciles de preparar.
- Incluye gramajes en "details".
- Ajusta la dieta al objetivo del usuario.
- Mantén números realistas.
`,
            },
          ],
        },
      ],
    });

    const rawText = response.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let data;

    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Respuesta no válida de Gemini:", rawText);

      return res.status(500).json({
        error: "Gemini no devolvió un JSON válido",
        raw: rawText,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error generate-diet:", error);

    res.status(500).json({
      error: "Error generando dieta",
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});