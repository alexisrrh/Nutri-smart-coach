import { defaultDietMealTime } from "../normalizers/diet.normalizer.js";
import { clamp } from "../utils/numbers.js";

export function createFallbackDiet(profile = {}, preferences = {}, dietConfig = buildDietConfig(preferences)) {
  const language = normalizeLanguage(preferences?.language || "es");
  const rawGoal =
    profile?.goal || profile?.objetivo || preferences?.goal || "mantener_peso";

  const goal = mapGoal(rawGoal);

  const days = getLocalizedDays(language).slice(0, dietConfig.days);

  const baseMeals = {
    perder_grasa: [
      {
        time: "08:00",
        name: "Desayuno",
        food: "Tortilla de claras con fruta",
        details: "4 claras, 1 huevo entero, 1 plátano",
        calories: 350,
        protein: 32,
        carbs: 30,
        fat: 9,
      },
      {
        time: "13:30",
        name: "Almuerzo",
        food: "Pollo con verduras y arroz pequeño",
        details: "180g pollo, 70g arroz, 200g verduras",
        calories: 520,
        protein: 48,
        carbs: 45,
        fat: 14,
      },
      {
        time: "18:00",
        name: "Merienda",
        food: "Yogur griego con frutos rojos",
        details: "200g yogur griego, 80g frutos rojos",
        calories: 220,
        protein: 20,
        carbs: 20,
        fat: 5,
      },
      {
        time: "21:00",
        name: "Cena",
        food: "Pescado blanco con ensalada y patata",
        details: "180g pescado, 200g patata cocida, 1 plato ensalada",
        calories: 430,
        protein: 42,
        carbs: 35,
        fat: 10,
      },
    ],

    ganar_musculo: [
      {
        time: "08:00",
        name: "Desayuno",
        food: "Avena con leche, plátano y huevos",
        details: "80g avena, 250ml leche, 1 plátano, 2 huevos",
        calories: 620,
        protein: 35,
        carbs: 80,
        fat: 18,
      },
      {
        time: "13:30",
        name: "Almuerzo",
        food: "Pollo con arroz, aguacate y verduras",
        details: "220g pollo, 100g arroz, 80g aguacate, 200g verduras",
        calories: 780,
        protein: 55,
        carbs: 85,
        fat: 22,
      },
      {
        time: "18:00",
        name: "Merienda",
        food: "Yogur griego con frutos secos",
        details: "250g yogur griego, 30g frutos secos",
        calories: 420,
        protein: 28,
        carbs: 30,
        fat: 20,
      },
      {
        time: "21:00",
        name: "Cena",
        food: "Salmón con patata y ensalada",
        details: "200g salmón, 250g patata, 1 plato ensalada",
        calories: 650,
        protein: 50,
        carbs: 45,
        fat: 24,
      },
    ],

    mantener_peso: [
      {
        time: "08:00",
        name: "Desayuno",
        food: "Avena con yogur y fruta",
        details: "60g avena, 200g yogur natural, 1 pieza fruta",
        calories: 450,
        protein: 25,
        carbs: 60,
        fat: 12,
      },
      {
        time: "13:30",
        name: "Almuerzo",
        food: "Pavo con arroz y verduras",
        details: "180g pavo, 90g arroz, 200g verduras",
        calories: 620,
        protein: 45,
        carbs: 70,
        fat: 16,
      },
      {
        time: "18:00",
        name: "Merienda",
        food: "Tostada integral con queso fresco",
        details: "2 rebanadas pan integral, 80g queso fresco",
        calories: 300,
        protein: 18,
        carbs: 35,
        fat: 10,
      },
      {
        time: "21:00",
        name: "Cena",
        food: "Huevos con ensalada y pan integral",
        details: "3 huevos, 1 plato ensalada, 1 rebanada pan integral",
        calories: 480,
        protein: 38,
        carbs: 30,
        fat: 20,
      },
    ],
  };

  const selectedMeals = baseMeals[goal] || baseMeals.mantener_peso;

return days.map((day, dayIndex) => ({
  day,
  meals: selectedMeals
    .slice(0, dietConfig.mealsPerDay)
    .map((meal, mealIndex) => ({
      ...meal,
      time: defaultDietMealTime(mealIndex, dietConfig.mealsPerDay),
      name: localizeDefaultMealName(mealIndex, dietConfig.mealsPerDay, language),
      food: localizeFallbackText(varyMeal(meal.food, goal, dayIndex, mealIndex), language),
      details: localizeFallbackText(varyDetails(meal.details, goal, dayIndex, mealIndex), language),
    })),
}));
}

function buildDietConfig(preferences = {}) {
  const rawDays =
    preferences.days ||
    preferences.planDays ||
    preferences.trainingDays ||
    preferences.durationDays ||
    7;

const rawMeals =
  preferences.mealsPerDay ||
  preferences.meals_per_day ||
  preferences.meals ||
  preferences.comidas ||
  preferences.comidasDia ||
  4;
  const days = clamp(Number(rawDays) || 7, 1, 7);
  const mealsPerDay = clamp(Number(rawMeals) || 4, 2, 6);

  const dietType = preferences.dietType || preferences.diet_type || "balanced";

  const isLowCarb =
    dietType === "keto" ||
    dietType === "low_carb" ||
    dietType === "sin_carbohidratos" ||
    preferences.lowCarb === true;

  const intermittentFasting =
    mealsPerDay === 2 ||
    preferences.intermittentFasting === true ||
    preferences.ayuno === true;

  const homeFoods =
    preferences.homeFoods ||
    preferences.foodsAtHome ||
    preferences.availableFoods ||
    "";

  return {
    days,
    mealsPerDay,
    dietType,
    isLowCarb,
    intermittentFasting,
    homeFoods,
  };
}

function mapGoal(goal) {
  if (goal === "lose_fat") return "perder_grasa";
  if (goal === "gain_muscle") return "ganar_musculo";
  if (goal === "maintain") return "mantener_peso";

  if (goal === "perder_grasa") return "perder_grasa";
  if (goal === "ganar_musculo") return "ganar_musculo";
  if (goal === "mantener_peso") return "mantener_peso";

  return "mantener_peso";
}

function varyMeal(food, goal, dayIndex, mealIndex) {
  const variations = {
    perder_grasa: [
      "Tortilla de claras con fruta",
      "Yogur griego con avena y frutos rojos",
      "Pollo con arroz pequeño y verduras",
      "Pavo con ensalada y boniato",
      "Merluza con patata cocida y ensalada",
      "Atún con arroz integral y tomate",
      "Huevos con verduras salteadas",
    ],
    ganar_musculo: [
      "Avena con leche, plátano y huevos",
      "Pollo con arroz, aguacate y verduras",
      "Pasta integral con carne magra",
      "Salmón con patata y ensalada",
      "Yogur griego con frutos secos",
      "Tortilla con pan integral y fruta",
      "Pavo con quinoa y verduras",
    ],
    mantener_peso: [
      "Avena con yogur y fruta",
      "Pavo con arroz y verduras",
      "Huevos con ensalada y pan integral",
      "Pescado con patata cocida",
      "Tostada integral con queso fresco",
      "Pollo con verduras y arroz",
      "Yogur natural con fruta y frutos secos",
    ],
  };

  const list = variations[goal] || variations.mantener_peso;
  return list[(dayIndex + mealIndex) % list.length] || food;
}

function varyDetails(details, goal, dayIndex, mealIndex) {
  const variations = {
    perder_grasa: [
      "4 claras, 1 huevo entero, 1 pieza de fruta",
      "200g yogur griego, 40g avena, 80g frutos rojos",
      "180g pollo, 70g arroz, 200g verduras",
      "160g pavo, 200g ensalada, 150g boniato",
      "180g merluza, 200g patata cocida, ensalada",
      "1 lata de atún, 80g arroz integral, tomate",
      "2 huevos, 200g verduras salteadas",
    ],
    ganar_musculo: [
      "80g avena, 250ml leche, 1 plátano, 2 huevos",
      "220g pollo, 100g arroz, 80g aguacate, verduras",
      "100g pasta integral, 180g carne magra",
      "200g salmón, 250g patata, ensalada",
      "250g yogur griego, 30g frutos secos",
      "3 huevos, 2 rebanadas pan integral, 1 fruta",
      "180g pavo, 90g quinoa, 200g verduras",
    ],
    mantener_peso: [
      "60g avena, 200g yogur natural, 1 pieza fruta",
      "180g pavo, 90g arroz, 200g verduras",
      "3 huevos, ensalada, 1 rebanada pan integral",
      "180g pescado, 200g patata cocida",
      "2 tostadas integrales, 80g queso fresco",
      "180g pollo, 80g arroz, 200g verduras",
      "200g yogur natural, 1 fruta, 20g frutos secos",
    ],
  };

  const list = variations[goal] || variations.mantener_peso;
  return list[(dayIndex + mealIndex) % list.length] || details;
}

function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  if (normalized === "en" || normalized === "en-us" || normalized === "en-gb") {
    return "en";
  }

  return "es";
}

function getLocalizedDays(language) {
  return language === "en"
    ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
}

function localizeDefaultMealName(index, mealsPerDay, language = "es") {
  const meals = language === "en"
    ? ["Breakfast", "Lunch", "Snack", "Dinner", "Snack 2", "Extra"]
    : ["Desayuno", "Comida", "Merienda", "Cena", "Snack 2", "Extra"];

  if (mealsPerDay === 2) {
    return language === "en"
      ? ["Meal 1", "Meal 2"][index] || `Meal ${index + 1}`
      : ["Comida 1", "Comida 2"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 3) {
    return (language === "en"
      ? ["Breakfast", "Lunch", "Dinner"]
      : ["Desayuno", "Comida", "Cena"])[index] || (language === "en" ? `Meal ${index + 1}` : `Comida ${index + 1}`);
  }

  if (mealsPerDay === 4) {
    return meals.slice(0, 4)[index] || (language === "en" ? `Meal ${index + 1}` : `Comida ${index + 1}`);
  }

  if (mealsPerDay === 5) {
    return (language === "en"
      ? ["Breakfast", "Snack", "Lunch", "Snack", "Dinner"]
      : ["Desayuno", "Snack", "Comida", "Merienda", "Cena"])[index] || (language === "en" ? `Meal ${index + 1}` : `Comida ${index + 1}`);
  }

  return (language === "en"
    ? ["Breakfast", "Snack 1", "Lunch", "Snack 2", "Dinner", "Extra"]
    : ["Desayuno", "Snack 1", "Comida", "Snack 2", "Cena", "Extra"])[index] || (language === "en" ? `Meal ${index + 1}` : `Comida ${index + 1}`);
}

function localizeFallbackText(text, language) {
  if (language !== "en") return text;

  const translations = new Map([
    ["Tortilla de claras con fruta", "Egg white omelet with fruit"],
    ["Yogur griego con avena y frutos rojos", "Greek yogurt with oats and berries"],
    ["Pollo con arroz pequeño y verduras", "Chicken with a small serving of rice and vegetables"],
    ["Pavo con ensalada y boniato", "Turkey with salad and sweet potato"],
    ["Merluza con patata cocida y ensalada", "Hake with boiled potato and salad"],
    ["Atún con arroz integral y tomate", "Tuna with brown rice and tomato"],
    ["Huevos con verduras salteadas", "Eggs with sautéed vegetables"],
    ["Avena con leche, plátano y huevos", "Oatmeal with milk, banana, and eggs"],
    ["Pollo con arroz, aguacate y verduras", "Chicken with rice, avocado, and vegetables"],
    ["Pasta integral con carne magra", "Whole grain pasta with lean meat"],
    ["Salmón con patata y ensalada", "Salmon with potato and salad"],
    ["Yogur griego con frutos secos", "Greek yogurt with nuts"],
    ["Tortilla con pan integral y fruta", "Omelet with whole grain bread and fruit"],
    ["Pavo con quinoa y verduras", "Turkey with quinoa and vegetables"],
    ["Avena con yogur y fruta", "Oatmeal with yogurt and fruit"],
    ["Pavo con arroz y verduras", "Turkey with rice and vegetables"],
    ["Huevos con ensalada y pan integral", "Eggs with salad and whole grain bread"],
    ["Pescado con patata cocida", "Fish with boiled potato"],
    ["Tostada integral con queso fresco", "Whole grain toast with fresh cheese"],
    ["Pollo con verduras y arroz", "Chicken with vegetables and rice"],
    ["Yogur natural con fruta y frutos secos", "Plain yogurt with fruit and nuts"],
    ["4 claras, 1 huevo entero, 1 pieza de fruta", "4 egg whites, 1 whole egg, 1 piece of fruit"],
    ["200g yogur griego, 40g avena, 80g frutos rojos", "200g Greek yogurt, 40g oats, 80g berries"],
    ["180g pollo, 70g arroz, 200g verduras", "180g chicken, 70g rice, 200g vegetables"],
    ["160g pavo, 200g ensalada, 150g boniato", "160g turkey, 200g salad, 150g sweet potato"],
    ["180g merluza, 200g patata cocida, ensalada", "180g hake, 200g boiled potato, salad"],
    ["1 lata de atún, 80g arroz integral, tomate", "1 can of tuna, 80g brown rice, tomato"],
    ["2 huevos, 200g verduras salteadas", "2 eggs, 200g sautéed vegetables"],
    ["80g avena, 250ml leche, 1 plátano, 2 huevos", "80g oats, 250ml milk, 1 banana, 2 eggs"],
    ["220g pollo, 100g arroz, 80g aguacate, verduras", "220g chicken, 100g rice, 80g avocado, vegetables"],
    ["100g pasta integral, 180g carne magra", "100g whole grain pasta, 180g lean meat"],
    ["200g salmón, 250g patata, ensalada", "200g salmon, 250g potato, salad"],
    ["250g yogur griego, 30g frutos secos", "250g Greek yogurt, 30g nuts"],
    ["3 huevos, 2 rebanadas pan integral, 1 fruta", "3 eggs, 2 slices whole grain bread, 1 fruit"],
    ["180g pavo, 90g quinoa, 200g verduras", "180g turkey, 90g quinoa, 200g vegetables"],
    ["60g avena, 200g yogur natural, 1 pieza fruta", "60g oats, 200g plain yogurt, 1 piece of fruit"],
    ["180g pavo, 90g arroz, 200g verduras", "180g turkey, 90g rice, 200g vegetables"],
    ["3 huevos, ensalada, 1 rebanada pan integral", "3 eggs, salad, 1 slice whole grain bread"],
    ["180g pescado, 200g patata cocida", "180g fish, 200g boiled potato"],
    ["2 tostadas integrales, 80g queso fresco", "2 whole grain toasts, 80g fresh cheese"],
    ["200g yogur natural, 1 fruta, 20g frutos secos", "200g plain yogurt, 1 fruit, 20g nuts"],
    ["Comida personalizada", "Custom meal"],
    ["Cantidades no especificadas", "Quantities not specified"],
  ]);

  return translations.get(text) || text;
}
