export function buildDietPrompt(profile, preferences = {}, dietConfig) {
  const dayNames = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ].slice(0, dietConfig.days);

  const forbiddenLowCarb = `
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

  return `
Devuelve SOLO JSON válido, sin markdown ni texto extra.
Crea dieta para NutriSmartCoach con perfil=${JSON.stringify(profile)} y preferencias=${JSON.stringify(preferences || {})}.
Obligatorio: exactamente ${dietConfig.days} días (${dayNames.join(", ")}), exactamente ${dietConfig.mealsPerDay} comidas/día, macros realistas, cantidades claras en details, comida común y práctica, sin repetir la misma comida todos los días.
Horarios: 2 comidas = ayuno 13:00/20:00; 3 = desayuno/comida/cena; 4 = desayuno/comida/merienda/cena; 5-6 = añade snacks.
Alimentos en casa: ${dietConfig.homeFoods || "No especificado"}. Úsalos principalmente si existen.
${dietConfig.isLowCarb ? forbiddenLowCarb : ""}
JSON exacto:
{
  "week": [
    {
      "day": "Lunes",
      "meals": [
        {
          "time": "13:00",
          "name": "Comida 1",
          "food": "Pollo con ensalada y aguacate",
          "details": "180g pollo, 1 plato ensalada, 80g aguacate",
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
