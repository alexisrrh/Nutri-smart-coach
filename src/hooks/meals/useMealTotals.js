import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useMealTotals({
  meals,
  filteredMeals,
  filter,
  search,
}) {
  const { t } = useTranslation();

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
        t,
      }),
    [
      filteredMeals.length,
      meals.length,
      totals,
      filter,
      search,
      scoredMealsCount,
      recommendedMealsCount,
      t,
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
  t,
}) {
  if (search && filteredCount === 0) {
    return t("meals.motivation.searchEmpty");
  }

  if (totalCount === 0) {
    return t("meals.motivation.empty");
  }

  if (filteredCount === 0) {
    return t("meals.motivation.filteredEmpty");
  }

  if (recommendedMealsCount > 0) {
    return t("meals.motivation.recommendation");
  }

  if (scoredMealsCount >= 3) {
    return t("meals.motivation.patterns");
  }

  if (filter === "today") {
    return t("meals.motivation.today");
  }

  if (filter === "week") {
    return t("meals.motivation.week");
  }

  if (Number(totals?.protein || 0) > 0 || Number(totals?.calories || 0) > 0) {
    return t("meals.motivation.progress");
  }

  return t("meals.motivation.default");
}
