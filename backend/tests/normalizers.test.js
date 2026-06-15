import { describe, expect, it } from "vitest";
import { normalizeCheckinAnalysis } from "../normalizers/checkin.normalizer.js";
import { normalizeFoodAnalysis } from "../normalizers/foodAnalysis.normalizer.js";
import { buildCheckinPrompt } from "../prompts/checkin.prompt.js";
import { buildFoodAnalysisPrompt } from "../prompts/foodAnalysis.prompt.js";

describe("foodAnalysis normalizer", () => {
  it("normalizes valid data", () => {
    const result = normalizeFoodAnalysis({
      food: "Arroz con pollo",
      description: "Buen plato",
      portion_estimate: "1 plato",
      ingredients_detected: ["arroz", "pollo"],
      calories: 520,
      protein: 35,
      carbs: 48,
      fat: 12,
      fiber: 5,
      sugar: 3,
      sodium: 400,
      confidence: 88,
      score: 9,
      goal_fit: "Encaja",
      recommendation: "OK",
      improvements: ["Más verdura"],
      warning: "Sin aviso",
    });

    expect(result).toEqual({
      language: "es",
      food: "Arroz con pollo",
      description: "Buen plato",
      portion_estimate: "1 plato",
      ingredients_detected: ["arroz", "pollo"],
      calories: 520,
      protein: 35,
      carbs: 48,
      fat: 12,
      fiber: 5,
      sugar: 3,
      sodium: 400,
      confidence: 88,
      score: 9,
      goal_fit: "Encaja",
      recommendation: "OK",
      improvements: ["Más verdura"],
      warning: "Sin aviso",
    });
  });

  it("fills defaults when fields are missing", () => {
    const result = normalizeFoodAnalysis({});

    expect(result.food).toBe("Comida detectada");
    expect(result.description).toBe("Análisis visual generado por IA.");
    expect(result.portion_estimate).toBe(
      "Porción aproximada no especificada."
    );
    expect(result.ingredients_detected).toEqual([]);
    expect(result.calories).toBe(0);
    expect(result.confidence).toBe(70);
    expect(result.score).toBe(5);
    expect(result.warning).toBe("");
  });

  it("uses english defaults when language is en", () => {
    const result = normalizeFoodAnalysis({}, "en");

    expect(result.language).toBe("en");
    expect(result.food).toBe("Detected meal");
    expect(result.description).toBe("AI-generated visual analysis.");
    expect(result.portion_estimate).toBe("Approximate portion not specified.");
    expect(result.goal_fit).toContain("The meal may fit");
    expect(result.recommendation).toContain("Approximate estimate");
  });
});

describe("checkinAnalysis normalizer", () => {
  it("normalizes valid data", () => {
    const result = normalizeCheckinAnalysis({
      body_fat_range: "16-18%",
      confidence: 91,
      visual_changes: "Mejor postura",
      recommendation: "Sigue así",
    });

    expect(result).toEqual({
      language: "es",
      body_fat_range: "16-18%",
      confidence: 91,
      visual_changes: "Mejor postura",
      recommendation: "Sigue así",
    });
  });

  it("fills defaults when fields are missing", () => {
    const result = normalizeCheckinAnalysis({});

    expect(result.body_fat_range).toBe("No estimable");
    expect(result.confidence).toBe(60);
    expect(result.visual_changes).toBe(
      "No se pudieron detectar cambios visuales con suficiente claridad."
    );
    expect(result.recommendation).toContain("check-in semanal");
  });

  it("uses english defaults when language is en", () => {
    const result = normalizeCheckinAnalysis({}, "en");

    expect(result.language).toBe("en");
    expect(result.body_fat_range).toBe("Not estimable");
    expect(result.visual_changes).toContain("No clear visual changes");
    expect(result.recommendation).toContain("weekly check-in");
  });
});

describe("foodAnalysis prompt", () => {
  it("injects english language instructions when language is en", () => {
    const prompt = buildFoodAnalysisPrompt({
      goal: "ganar_musculo",
      description: "Grilled chicken and rice",
      hasImage: true,
      language: "en",
      profileContext: {
        caloriesGoal: 2200,
        proteinGoal: 160,
      },
    });

    expect(prompt).toContain("If language is 'en', return all user-facing text in English.");
    expect(prompt).toContain("Actual goal: muscle gain");
    expect(prompt).toContain("User description: Grilled chicken and rice");
  });

  it("injects spanish language instructions when language is es", () => {
    const prompt = buildFoodAnalysisPrompt({
      goal: "ganar_musculo",
      description: "Pollo con arroz",
      hasImage: true,
      language: "es",
      profileContext: {
        caloriesGoal: 2200,
        proteinGoal: 160,
      },
    });

    expect(prompt).toContain("Si language es 'en', devuelve todo el texto visible para el usuario en inglés.");
    expect(prompt).toContain("Objetivo real: ganar músculo.");
    expect(prompt).toContain("Descripción del usuario: Pollo con arroz");
  });
});

describe("checkin prompt", () => {
  it("injects english language instructions when language is en", () => {
    const prompt = buildCheckinPrompt({
      weight: 72,
      waist: 80,
      chest: 95,
      hips: 90,
      notes: "Felt stronger",
      previousCheckins: [],
      language: "en",
    });

    expect(prompt).toContain("You are an expert fitness coach for NutriSmart Coach.");
    expect(prompt).toContain("Analyze the user's body photo in a cautious and useful way.");
    expect(prompt).toContain("Return ONLY valid JSON. Do not use markdown.");
    expect(prompt).toContain('"recommendation": "concrete recommendation for next week"');
  });

  it("injects spanish language instructions when language is es", () => {
    const prompt = buildCheckinPrompt({
      weight: 72,
      waist: 80,
      chest: 95,
      hips: 90,
      notes: "Me siento mejor",
      previousCheckins: [],
      language: "es",
    });

    expect(prompt).toContain("Eres un coach fitness experto para NutriSmart Coach.");
    expect(prompt).toContain("Analiza la foto corporal del usuario de forma prudente y útil.");
    expect(prompt).toContain("Devuelve SOLO JSON válido. No uses markdown.");
    expect(prompt).toContain('"recommendation": "recomendación concreta para la próxima semana"');
  });
});
