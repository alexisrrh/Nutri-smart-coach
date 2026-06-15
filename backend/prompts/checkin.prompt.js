function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("es")) return "es";

  return "es";
}

export function buildCheckinPrompt({
  weight,
  waist,
  chest,
  hips,
  notes,
  previousCheckins,
  language = "es",
}) {
  const normalizedLanguage = normalizeLanguage(language);
  const jsonExample =
    normalizedLanguage === "en"
      ? `{
  "body_fat_range": "approximate range, e.g. 18-22%",
  "confidence": 0,
  "visual_changes": "observable visual changes, cautiously described",
  "recommendation": "concrete recommendation for next week"
}`
      : `{
  "body_fat_range": "rango aproximado, por ejemplo 18-22%",
  "confidence": 0,
  "visual_changes": "cambios visuales observables de forma prudente",
  "recommendation": "recomendación concreta para la próxima semana"
}`;

  return `
${normalizedLanguage === "en" ? "You are an expert fitness coach for NutriSmart Coach." : "Eres un coach fitness experto para NutriSmart Coach."}

${normalizedLanguage === "en" ? "Analyze the user's body photo in a cautious and useful way." : "Analiza la foto corporal del usuario de forma prudente y útil."}

${normalizedLanguage === "en" ? "Current data:" : "Datos actuales:"}
${normalizedLanguage === "en" ? "Weight" : "Peso"}: ${weight || (normalizedLanguage === "en" ? "not provided" : "no indicado")} kg
${normalizedLanguage === "en" ? "Waist" : "Cintura"}: ${waist || (normalizedLanguage === "en" ? "not provided" : "no indicada")} cm
${normalizedLanguage === "en" ? "Chest" : "Pecho"}: ${chest || (normalizedLanguage === "en" ? "not provided" : "no indicado")} cm
${normalizedLanguage === "en" ? "Hips" : "Cadera"}: ${hips || (normalizedLanguage === "en" ? "not provided" : "no indicada")} cm
${normalizedLanguage === "en" ? "User notes" : "Notas del usuario"}: ${notes || (normalizedLanguage === "en" ? "no notes" : "sin notas")}

${normalizedLanguage === "en" ? "Previous check-ins:" : "Check-ins anteriores:"}
${JSON.stringify(previousCheckins || [])}

${normalizedLanguage === "en" ? "Return ONLY valid JSON. Do not use markdown." : "Devuelve SOLO JSON válido. No uses markdown."}

${normalizedLanguage === "en" ? "Exact structure:" : "Estructura exacta:"}
${jsonExample}

${normalizedLanguage === "en" ? "Rules:" : "Reglas:"}
- ${normalizedLanguage === "en" ? "Do not give medical diagnoses." : "No des diagnóstico médico."}
- ${normalizedLanguage === "en" ? "Do not claim exact precision." : "No afirmes precisión exacta."}
- confidence ${normalizedLanguage === "en" ? "must be a number from 1 to 100." : "debe ser número del 1 al 100."}
- visual_changes ${normalizedLanguage === "en" ? "must be 220 characters max." : "debe tener máximo 220 caracteres."}
- recommendation ${normalizedLanguage === "en" ? "must be 280 characters max." : "debe tener máximo 280 caracteres."}
- ${normalizedLanguage === "en" ? "Be direct, clear, and concise." : "Sé directo, claro y resumido."}
- ${normalizedLanguage === "en" ? "Do not use long lists." : "No uses listas largas."}
- ${normalizedLanguage === "en" ? "Do not use markdown." : "No uses markdown."}
`;
}
