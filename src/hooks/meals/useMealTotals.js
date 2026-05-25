import { useMemo } from "react";

export function useMealTotals({
  meals,
  filteredMeals,
  filter,
  search,
}) {
  const totals = useMemo(() => {
    return filteredMeals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories) || 0;
        acc.protein += Number(meal.protein) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fat += Number(meal.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filteredMeals]);

  const scoredMealsCount = useMemo(
    () => filteredMeals.filter((meal) => Number(meal.score) > 0).length,
    [filteredMeals]
  );

  const recommendedMealsCount = useMemo(
    () => filteredMeals.filter((meal) => Boolean(meal.recommendation)).length,
    [filteredMeals]
  );

  const motivationMessage = useMemo(
    () =>
      getMealsMotivationMessage({
        filteredCount: filteredMeals.length,
        totalCount: meals.length,
        totals,
        filter,
        search,
        scoredMealsCount,
        recommendedMealsCount,
      }),
    [
      filteredMeals.length,
      meals.length,
      totals,
      filter,
      search,
      scoredMealsCount,
      recommendedMealsCount,
    ]
  );

  return {
    totals,
    scoredMealsCount,
    recommendedMealsCount,
    motivationMessage,
  };
}

function getMealsMotivationMessage({
  filteredCount,
  totalCount,
  totals,
  filter,
  search,
  scoredMealsCount,
  recommendedMealsCount,
}) {
  if (search && filteredCount === 0) {
    return "Prueba otro término para revisar tus registros.";
  }

  if (totalCount === 0) {
    return "Escanea una comida para empezar a construir tu historial.";
  }

  if (filteredCount === 0) {
    return "Tu historial tiene datos; cambia el filtro para ver más comidas.";
  }

  if (recommendedMealsCount > 0) {
    return "Revisar tus análisis te ayuda a decidir con más intención.";
  }

  if (scoredMealsCount >= 3) {
    return "Tu historial empieza a mostrar patrones útiles.";
  }

  if (filter === "today") {
    return "Cada comida registrada mejora tu control nutricional.";
  }

  if (filter === "week") {
    return "Buen trabajo: estás construyendo conciencia sobre lo que comes.";
  }

  if (Number(totals?.protein || 0) > 0 || Number(totals?.calories || 0) > 0) {
    return "Sigue escaneando: más datos te dan más claridad.";
  }

  return "Tu historial convierte cada registro en una señal útil.";
}
