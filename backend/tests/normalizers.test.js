import { describe, expect, it } from "vitest";
import { normalizeCheckinAnalysis } from "../normalizers/checkin.normalizer.js";
import { normalizeFoodAnalysis } from "../normalizers/foodAnalysis.normalizer.js";

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
});
