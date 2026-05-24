import { clamp } from "../utils/numbers.js";

export function normalizeCheckinAnalysis(data = {}) {
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
