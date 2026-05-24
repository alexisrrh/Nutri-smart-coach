import {
  defaultDietMealName,
  defaultDietMealTime,
} from "../normalizers/diet.normalizer.js";
import { clamp } from "../utils/numbers.js";

export function createFallbackDiet(profile = {}, preferences = {}, dietConfig = buildDietConfig(preferences)) {
  const rawGoal =
    profile?.goal || profile?.objetivo || preferences?.goal || "mantener_peso";

  const goal = mapGoal(rawGoal);

 const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
].slice(0, dietConfig.days);

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
      name: defaultDietMealName(mealIndex, dietConfig.mealsPerDay),
      food: varyMeal(meal.food, goal, dayIndex, mealIndex),
      details: varyDetails(meal.details, goal, dayIndex, mealIndex),
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
