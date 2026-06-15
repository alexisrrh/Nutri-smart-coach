function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  if (normalized === "en" || normalized === "en-us" || normalized === "en-gb") {
    return "en";
  }

  if (normalized === "es" || normalized === "es-es" || normalized === "es-mx") {
    return "es";
  }

  return "es";
}

function getDayNames(language, days) {
  const localizedDays =
    language === "en"
      ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return localizedDays.slice(0, days);
}

function getLowCarbInstructions(language) {
  if (language === "en") {
    return `
If the diet is low-carb or keto:
- DO NOT include bread.
- DO NOT include rice.
- DO NOT include pasta.
- DO NOT include oats.
- DO NOT include cereals.
- DO NOT include sugar.
- DO NOT include pastries.
- DO NOT include wheat tortillas.
- DO NOT include potato, sweet potato, or cassava unless the user allows it.
- Prioritize eggs, chicken, fish, lean meat, plain Greek yogurt, fresh cheese, avocado, low-carb vegetables, and salads.
`;
  }

  return `
Si la dieta es sin carbohidratos, low carb o keto:
- NO incluir pan.
- NO incluir arroz.
- NO incluir pasta.
- NO incluir avena.
- NO incluir cereales.
- NO incluir azúcar.
- NO incluir bollería.
- NO incluir tortillas de trigo.
- NO incluir patata, boniato o yuca salvo que el usuario lo permita.
- Priorizar huevos, pollo, pescado, carne magra, yogur griego natural, queso fresco, aguacate, verduras bajas en carbohidratos y ensaladas.
`;
}

function getLanguageInstructions(language) {
  if (language === "en") {
    return `
Language rules:
- If language is "en", return every user-facing text in English only.
- If language is "es", return every user-facing text in Spanish only.
- Do not mix languages inside the same response.
- Do not translate numbers or units.
- Keep the JSON schema exactly as requested.
`;
  }

  return `
Reglas de idioma:
- Si language es "en", devuelve todo el texto visible para el usuario en inglés.
- Si language es "es", devuelve todo el texto visible para el usuario en español.
- No mezcles idiomas dentro de la misma respuesta.
- No traduzcas números ni unidades.
- Mantén el esquema JSON exactamente como se pide.
`;
}

export function buildDietPrompt(profile, preferences = {}, dietConfig, language = "es") {
  const normalizedLanguage = normalizeLanguage(language);
  const dayNames = getDayNames(normalizedLanguage, dietConfig.days);
  const lowCarbInstructions = dietConfig.isLowCarb
    ? getLowCarbInstructions(normalizedLanguage)
    : "";

  return `
Devuelve SOLO JSON válido, sin markdown ni texto extra.
${getLanguageInstructions(normalizedLanguage)}
Crea una dieta para NutriSmartCoach con perfil=${JSON.stringify(profile)} y preferencias=${JSON.stringify(preferences || {})}.
Obligatorio: exactamente ${dietConfig.days} días (${dayNames.join(", ")}), exactamente ${dietConfig.mealsPerDay} comidas/día, macros realistas, cantidades claras en details, comida común y práctica, sin repetir la misma comida todos los días.
Horarios: 2 comidas = ayuno 13:00/20:00; 3 = desayuno/comida/cena; 4 = desayuno/comida/merienda/cena; 5-6 = añade snacks.
Alimentos en casa: ${dietConfig.homeFoods || (normalizedLanguage === "en" ? "Not specified" : "No especificado")}. Úsalos principalmente si existen.
${lowCarbInstructions}
JSON exacto:
{
  "week": [
    {
      "day": "${dayNames[0] || (normalizedLanguage === "en" ? "Monday" : "Lunes")}",
      "meals": [
        {
          "time": "13:00",
          "name": "${normalizedLanguage === "en" ? "Meal 1" : "Comida 1"}",
          "food": "${normalizedLanguage === "en" ? "Chicken with salad and avocado" : "Pollo con ensalada y aguacate"}",
          "details": "${normalizedLanguage === "en" ? "180g chicken, 1 bowl of salad, 80g avocado" : "180g pollo, 1 plato ensalada, 80g aguacate"}",
          "calories": 520,
          "protein": 48,
          "carbs": 12,
          "fat": 28
        }
      ]
    }
  ]
}
`;
}
