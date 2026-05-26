const GOAL_LABELS = {
  ganar_musculo: "ganar músculo",
  perder_grasa: "perder grasa",
  mantener_peso: "mantener peso",
  recomposicion: "recomposición corporal",
  fitness_general: "fitness general",
};

function getGoalInstructions(goal) {
  switch (goal) {
    case "ganar_musculo":
      return [
        "Prioriza proteína, recuperación y rendimiento.",
        "Si faltan carbohidratos o energía para entrenar, sugiere añadirlos con naturalidad.",
        "No critiques las calorías altas si están justificadas para volumen o recuperación.",
      ].join(" ");
    case "perder_grasa":
      return [
        "Prioriza saciedad, control de calorías y control de grasas excesivas.",
        "Si la comida es densa en energía, sugiere ajustes concretos sin ser alarmista.",
        "Valora más los acompañamientos y la porción que la comida aislada.",
      ].join(" ");
    case "mantener_peso":
      return [
        "Mantén un enfoque equilibrado entre energía, proteína y saciedad.",
        "Evita recomendaciones extremas hacia déficit o superávit.",
      ].join(" ");
    case "recomposicion":
      return [
        "Busca equilibrio: proteína alta, calorías razonables y buena recuperación.",
        "No hables de déficit agresivo ni de volumen alto; prioriza calidad y control.",
      ].join(" ");
    default:
      return [
        "Usa un análisis fitness general si faltan datos del perfil.",
        "Sé conservador con porciones y macros.",
      ].join(" ");
  }
}

function formatContextLine(label, value) {
  if (value === null || value === undefined || value === "") return "";

  return `${label}: ${value}`;
}

export function buildFoodAnalysisPrompt({
  goal,
  description,
  hasImage,
  profileContext = null,
}) {
  const mode = hasImage
    ? "Analiza la comida visible de la foto"
    : "Analiza la comida descrita por el usuario";
  const normalizedGoal = String(goal || "fitness_general").trim().toLowerCase();
  const goalLabel = GOAL_LABELS[normalizedGoal] || GOAL_LABELS.fitness_general;
  const contextLines = [
    formatContextLine("Objetivo real", goalLabel),
    formatContextLine("Calorías objetivo", profileContext?.caloriesGoal ? `${profileContext.caloriesGoal} kcal` : ""),
    formatContextLine("Proteína objetivo", profileContext?.proteinGoal ? `${profileContext.proteinGoal} g` : ""),
    formatContextLine("Peso", profileContext?.weight ? `${profileContext.weight} kg` : ""),
    formatContextLine("Altura", profileContext?.height ? `${profileContext.height} cm` : ""),
    formatContextLine("Nivel", profileContext?.level || ""),
    formatContextLine("Fase actual", profileContext?.phase || ""),
  ].filter(Boolean);

  return `
${mode} para NutriSmart Coach.
Objetivo real del usuario: ${goalLabel}.
${contextLines.length ? `Contexto del usuario:\n- ${contextLines.join("\n- ")}` : ""}
${description ? `Descripción del usuario: ${description}` : ""}
Instrucciones:
- Ajusta el análisis al objetivo real del usuario y evita contradicciones.
- ${getGoalInstructions(normalizedGoal)}
- Si faltan datos del perfil, aplica un análisis fitness general y dilo de forma neutral.
- Devuelve SOLO JSON válido, sin markdown ni texto extra.
- No inventes ingredientes no visibles. Si hay imagen, estima porciones visibles de forma conservadora. Si solo hay descripción, estima calorías y macros con base en el texto y sé conservador. Si hay duda, baja confidence y explícalo en warning o recommendation. Evita valores extremos salvo evidencia clara.

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
  "goal_fit": "explica si esta comida encaja o no con el objetivo del usuario y menciona el objetivo real en el análisis",
  "recommendation": "recomendación clara y accionable alineada al objetivo real",
  "improvements": ["mejora concreta 1", "mejora concreta 2", "mejora concreta 3"],
  "warning": "advertencia breve si aplica; si no aplica, usa string vacío"
}

Números: sodium en mg, confidence 1-100, score 1-10. Si imagen clara confidence 70-90; si incierta 40-65. Mantén criterios estables.
`.trim();
}
