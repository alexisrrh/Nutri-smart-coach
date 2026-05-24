export function normalizeGeneratedDiet(week = [], dietConfig) {
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ].slice(0, dietConfig.days);

  return days.map((dayName, dayIndex) => {
    const sourceDay = week[dayIndex] || {};
    const rawMeals = Array.isArray(sourceDay.meals) ? sourceDay.meals : [];

    let meals = rawMeals
      .slice(0, dietConfig.mealsPerDay)
      .map((meal, index) =>
        sanitizeDietMeal(meal, index, dietConfig)
      );

    while (meals.length < dietConfig.mealsPerDay) {
      meals.push(
        createDefaultMeal(meals.length, dietConfig)
      );
    }

    return {
      day: dayName,
      meals,
    };
  });
}

export function sanitizeDietMeal(meal = {}, index, dietConfig) {
  let food = meal.food || "Comida personalizada";
  let details = meal.details || "Cantidades no especificadas";

  if (dietConfig.isLowCarb) {
    const cleaned = removeForbiddenLowCarbFoods(food, details);
    food = cleaned.food;
    details = cleaned.details;
  }

  return {
    time: meal.time || defaultDietMealTime(index, dietConfig.mealsPerDay),
    name: meal.name || defaultDietMealName(index, dietConfig.mealsPerDay),
    food,
    details,
    calories: Number(meal.calories) || 0,
    protein: Number(meal.protein) || 0,
    carbs: dietConfig.isLowCarb
      ? Math.min(Number(meal.carbs) || 8, 18)
      : Number(meal.carbs) || 0,
    fat: Number(meal.fat) || 0,
  };
}

export function removeForbiddenLowCarbFoods(food = "", details = "") {
  const forbidden = [
    "pan",
    "arroz",
    "pasta",
    "avena",
    "cereal",
    "cereales",
    "azúcar",
    "tortilla",
    "tortillas",
    "patata",
    "boniato",
    "yuca",
    "harina",
    "galleta",
    "galletas",
    "maíz",
  ];

  let newFood = String(food);
  let newDetails = String(details);

  const text = `${newFood} ${newDetails}`.toLowerCase();

  const hasForbidden = forbidden.some((item) =>
    text.includes(item)
  );

  if (!hasForbidden) {
    return { food: newFood, details: newDetails };
  }

  return {
    food: "Proteína con verduras bajas en carbohidratos",
    details:
      "180g pollo, pescado o huevos; ensalada verde; aguacate; aceite de oliva",
  };
}

export function createDefaultMeal(index, dietConfig) {
  if (dietConfig.isLowCarb) {
    return {
      time: defaultDietMealTime(index, dietConfig.mealsPerDay),
      name: defaultDietMealName(index, dietConfig.mealsPerDay),
      food: "Huevos con aguacate y ensalada",
      details: "2-3 huevos, 80g aguacate, ensalada verde",
      calories: 420,
      protein: 28,
      carbs: 8,
      fat: 30,
    };
  }

  return {
    time: defaultDietMealTime(index, dietConfig.mealsPerDay),
    name: defaultDietMealName(index, dietConfig.mealsPerDay),
    food: "Pollo con verduras",
    details: "180g pollo, 200g verduras, aceite de oliva",
    calories: 430,
    protein: 45,
    carbs: 20,
    fat: 16,
  };
}

export function defaultDietMealTime(index, mealsPerDay) {
  if (mealsPerDay === 2) {
    return ["13:00", "20:00"][index] || "13:00";
  }

  if (mealsPerDay === 3) {
    return ["08:30", "14:00", "20:30"][index] || "08:30";
  }

  if (mealsPerDay === 4) {
    return ["08:00", "13:30", "17:30", "21:00"][index] || "08:00";
  }

  if (mealsPerDay === 5) {
    return ["08:00", "11:30", "14:30", "18:00", "21:00"][index] || "08:00";
  }

  return ["08:00", "10:30", "13:30", "16:30", "19:30", "22:00"][index] || "08:00";
}

export function defaultDietMealName(index, mealsPerDay) {
  if (mealsPerDay === 2) {
    return ["Comida 1", "Comida 2"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 3) {
    return ["Desayuno", "Comida", "Cena"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 4) {
    return ["Desayuno", "Comida", "Merienda", "Cena"][index] || `Comida ${index + 1}`;
  }

  if (mealsPerDay === 5) {
    return ["Desayuno", "Snack", "Comida", "Merienda", "Cena"][index] || `Comida ${index + 1}`;
  }

  return ["Desayuno", "Snack 1", "Comida", "Snack 2", "Cena", "Extra"][index] || `Comida ${index + 1}`;
}
