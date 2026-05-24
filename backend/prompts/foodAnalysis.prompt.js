export function buildFoodAnalysisPrompt({ goal, description, hasImage }) {
  const mode = hasImage
    ? "Analiza la comida visible de la foto"
    : "Analiza la comida descrita por el usuario";

  return `
${mode} para NutriSmart Coach. Objetivo: ${goal}.
${description ? `Descripción del usuario: ${description}` : ""}
Devuelve SOLO JSON válido, sin markdown ni texto extra.
No inventes ingredientes no visibles. Si hay imagen, estima porciones visibles de forma conservadora. Si solo hay descripción, estima calorías y macros con base en el texto y sé conservador. Si hay duda, baja confidence y explícalo en warning o recommendation. Evita valores extremos salvo evidencia clara.
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
  "goal_fit": "explica si esta comida encaja o no con el objetivo del usuario",
  "recommendation": "recomendación clara y accionable",
  "improvements": ["mejora concreta 1", "mejora concreta 2", "mejora concreta 3"],
  "warning": "advertencia breve si aplica; si no aplica, usa string vacío"
}
Números: sodium en mg, confidence 1-100, score 1-10. Si imagen clara confidence 70-90; si incierta 40-65. Mantén criterios estables.
`.trim();
}
