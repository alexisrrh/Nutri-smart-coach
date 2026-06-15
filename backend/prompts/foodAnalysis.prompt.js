const LANGUAGE_COPY = {
  es: {
    modeImage: "Analiza la comida visible de la foto",
    modeText: "Analiza la comida descrita por el usuario",
    goalLabels: {
      ganar_musculo: "ganar músculo",
      perder_grasa: "perder grasa",
      mantener_peso: "mantener peso",
      recomposicion: "recomposición corporal",
      fitness_general: "fitness general",
    },
    contextLabels: {
      goal: "Objetivo real",
      caloriesGoal: "Calorías objetivo",
      proteinGoal: "Proteína objetivo",
      weight: "Peso",
      height: "Altura",
      level: "Nivel",
      phase: "Fase actual",
    },
    instructions: [
      "Ajusta el análisis al objetivo real del usuario y evita contradicciones.",
      "Prioriza proteína, recuperación y rendimiento si el objetivo es ganar músculo.",
      "Prioriza saciedad, control de calorías y grasas si el objetivo es perder grasa.",
      "Mantén equilibrio si el objetivo es mantener peso.",
      "Busca proteína alta y calorías razonables si el objetivo es recomposición corporal.",
      "Si faltan datos del perfil, aplica un análisis fitness general y dilo de forma neutral.",
      "Devuelve SOLO JSON válido, sin markdown ni texto extra.",
      "No inventes ingredientes no visibles. Si hay imagen, estima porciones visibles de forma conservadora. Si solo hay descripción, estima calorías y macros con base en el texto y sé conservador. Si hay duda, baja confidence y explícalo en warning o recommendation. Evita valores extremos salvo evidencia clara.",
      "Si language es 'en', devuelve todo el texto visible para el usuario en inglés. Si language es 'es', devuelve todo el texto visible para el usuario en español.",
    ],
    json: {
      food: "nombre claro de la comida",
      description: "breve descripción clara de la comida o resumen de la descripción",
      portion_estimate: "porción visible o estimada",
      ingredients_detected: ["ingrediente 1", "ingrediente 2"],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      confidence: 0,
      score: 0,
      goal_fit:
        "explica si esta comida encaja o no con el objetivo del usuario y menciona el objetivo real en el análisis",
      recommendation: "recomendación clara y accionable alineada al objetivo real",
      improvements: ["mejora concreta 1", "mejora concreta 2", "mejora concreta 3"],
      warning: "advertencia breve si aplica; si no aplica, usa string vacío",
    },
  },
  en: {
    modeImage: "Analyze the meal visible in the photo",
    modeText: "Analyze the meal described by the user",
    goalLabels: {
      ganar_musculo: "muscle gain",
      perder_grasa: "fat loss",
      mantener_peso: "weight maintenance",
      recomposicion: "body recomposition",
      fitness_general: "general fitness",
    },
    contextLabels: {
      goal: "Actual goal",
      caloriesGoal: "Target calories",
      proteinGoal: "Target protein",
      weight: "Weight",
      height: "Height",
      level: "Level",
      phase: "Current phase",
    },
    instructions: [
      "Align the analysis with the user's actual goal and avoid contradictions.",
      "Prioritize protein, recovery, and performance if the goal is muscle gain.",
      "Prioritize satiety, calorie control, and lower excess fat if the goal is fat loss.",
      "Keep the analysis balanced if the goal is weight maintenance.",
      "Focus on high protein and reasonable calories if the goal is body recomposition.",
      "If profile data is missing, use a general fitness analysis and say so in a neutral way.",
      "Return ONLY valid JSON, with no markdown or extra text.",
      "Do not invent ingredients that are not visible. If there is an image, estimate visible portions conservatively. If there is only a description, estimate calories and macros from the text and stay conservative. If unsure, lower confidence and explain it in warning or recommendation. Avoid extreme values unless there is clear evidence.",
      "If language is 'en', return all user-facing text in English. If language is 'es', return all user-facing text in Spanish.",
    ],
    json: {
      food: "clear meal name",
      description: "short clear meal description or summary of the user description",
      portion_estimate: "visible or estimated portion",
      ingredients_detected: ["ingredient 1", "ingredient 2"],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      confidence: 0,
      score: 0,
      goal_fit:
        "explain whether this meal fits the user's goal and mention the actual goal in the analysis",
      recommendation: "clear and actionable recommendation aligned with the actual goal",
      improvements: ["concrete improvement 1", "concrete improvement 2", "concrete improvement 3"],
      warning: "short warning if needed; otherwise use an empty string",
    },
  },
};

function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  return normalized.startsWith("en") ? "en" : "es";
}

function getGoalInstructions(goal, language) {
  switch (goal) {
    case "ganar_musculo":
      return language === "en"
        ? [
            "Prioritize protein, recovery, and performance.",
            "If carbs or energy are too low for training, suggest adding them naturally.",
            "Do not criticize high calories when they are justified for bulking or recovery.",
          ].join(" ")
        : [
            "Prioriza proteína, recuperación y rendimiento.",
            "Si faltan carbohidratos o energía para entrenar, sugiere añadirlos con naturalidad.",
            "No critiques las calorías altas si están justificadas para volumen o recuperación.",
          ].join(" ");
    case "perder_grasa":
      return language === "en"
        ? [
            "Prioritize satiety, calorie control, and limiting excess fat.",
            "If the meal is energy-dense, suggest concrete adjustments without sounding alarmist.",
            "Value portion size and sides more than the meal in isolation.",
          ].join(" ")
        : [
            "Prioriza saciedad, control de calorías y control de grasas excesivas.",
            "Si la comida es densa en energía, sugiere ajustes concretos sin ser alarmista.",
            "Valora más los acompañamientos y la porción que la comida aislada.",
          ].join(" ");
    case "mantener_peso":
      return language === "en"
        ? [
            "Keep a balanced focus on energy, protein, and satiety.",
            "Avoid extreme recommendations toward deficit or surplus.",
          ].join(" ")
        : [
            "Mantén un enfoque equilibrado entre energía, proteína y saciedad.",
            "Evita recomendaciones extremas hacia déficit o superávit.",
          ].join(" ");
    case "recomposicion":
      return language === "en"
        ? [
            "Aim for balance: high protein, reasonable calories, and good recovery.",
            "Do not talk about aggressive deficit or high bulking; prioritize quality and control.",
          ].join(" ")
        : [
            "Busca equilibrio: proteína alta, calorías razonables y buena recuperación.",
            "No hables de déficit agresivo ni de volumen alto; prioriza calidad y control.",
          ].join(" ");
    default:
      return language === "en"
        ? [
            "Use a general fitness analysis when profile data is missing.",
            "Stay conservative with portions and macros.",
          ].join(" ")
        : [
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
  language = "es",
}) {
  const normalizedLanguage = normalizeLanguage(language);
  const copy = LANGUAGE_COPY[normalizedLanguage] || LANGUAGE_COPY.es;
  const mode = hasImage ? copy.modeImage : copy.modeText;
  const normalizedGoal = String(goal || "fitness_general").trim().toLowerCase();
  const goalLabel = copy.goalLabels[normalizedGoal] || copy.goalLabels.fitness_general;
  const contextLines = [
    formatContextLine(copy.contextLabels.goal, goalLabel),
    formatContextLine(
      copy.contextLabels.caloriesGoal,
      profileContext?.caloriesGoal ? `${profileContext.caloriesGoal} kcal` : ""
    ),
    formatContextLine(
      copy.contextLabels.proteinGoal,
      profileContext?.proteinGoal ? `${profileContext.proteinGoal} g` : ""
    ),
    formatContextLine(copy.contextLabels.weight, profileContext?.weight ? `${profileContext.weight} kg` : ""),
    formatContextLine(copy.contextLabels.height, profileContext?.height ? `${profileContext.height} cm` : ""),
    formatContextLine(copy.contextLabels.level, profileContext?.level || ""),
    formatContextLine(copy.contextLabels.phase, profileContext?.phase || ""),
  ].filter(Boolean);

  return `
${mode} for NutriSmart Coach.
${copy.contextLabels.goal}: ${goalLabel}.
${contextLines.length ? `${normalizedLanguage === "en" ? "User context" : "Contexto del usuario"}:\n- ${contextLines.join("\n- ")}` : ""}
${description ? `${normalizedLanguage === "en" ? "User description" : "Descripción del usuario"}: ${description}` : ""}
Instructions:
- ${normalizedLanguage === "en" ? "Adapt the analysis to the user's actual goal and avoid contradictions." : "Ajusta el análisis al objetivo real del usuario y evita contradicciones."}
- ${getGoalInstructions(normalizedGoal, normalizedLanguage)}
- ${normalizedLanguage === "en" ? "If profile data is missing, use a general fitness analysis and mention it in a neutral way." : "Si faltan datos del perfil, aplica un análisis fitness general y dilo de forma neutral."}
- ${normalizedLanguage === "en" ? "Return ONLY valid JSON, without markdown or extra text." : "Devuelve SOLO JSON válido, sin markdown ni texto extra."}
- ${normalizedLanguage === "en" ? "Do not invent ingredients that are not visible. If there is an image, estimate visible portions conservatively. If there is only a description, estimate calories and macros from the text and stay conservative. If unsure, lower confidence and explain it in warning or recommendation. Avoid extreme values unless there is clear evidence." : "No inventes ingredientes no visibles. Si hay imagen, estima porciones visibles de forma conservadora. Si solo hay descripción, estima calorías y macros con base en el texto y sé conservador. Si hay duda, baja confidence y explícalo en warning o recommendation. Evita valores extremos salvo evidencia clara."}
- ${normalizedLanguage === "en" ? "If language is 'en', return all user-facing text in English. If language is 'es', return all user-facing text in Spanish." : "Si language es 'en', devuelve todo el texto visible para el usuario en inglés. Si language es 'es', devuelve todo el texto visible para el usuario en español."}

JSON exact:
${JSON.stringify(copy.json, null, 2)}

Numbers: sodium in ${normalizedLanguage === "en" ? "mg" : "mg"}, confidence 1-100, score 1-10. If the image is clear confidence 70-90; if uncertain 40-65. Keep criteria stable.
`.trim();
}
