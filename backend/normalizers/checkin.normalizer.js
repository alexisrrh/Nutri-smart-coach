import { clamp } from "../utils/numbers.js";

export function normalizeCheckinAnalysis(data = {}, language = "es") {
  const normalizedLanguage = normalizeLanguage(language);
  const copy = getCopy(normalizedLanguage);

  return {
    language: normalizedLanguage,
    body_fat_range: data.body_fat_range || copy.body_fat_range,
    confidence: clamp(Number(data.confidence) || 60, 1, 100),
    visual_changes:
      data.visual_changes || copy.visual_changes,
    recommendation:
      data.recommendation || copy.recommendation,
  };
}

function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("es")) return "es";

  return "es";
}

function getCopy(language) {
  if (language === "en") {
    return {
      body_fat_range: "Not estimable",
      visual_changes: "No clear visual changes could be detected.",
      recommendation:
        "Keep a consistent routine, prioritize enough protein, and repeat the weekly check-in with the same light and pose.",
    };
  }

  return {
    body_fat_range: "No estimable",
    visual_changes:
      "No se pudieron detectar cambios visuales con suficiente claridad.",
    recommendation:
      "Mantén una rutina constante, prioriza proteína suficiente y repite el check-in semanal con la misma luz y postura.",
  };
}
