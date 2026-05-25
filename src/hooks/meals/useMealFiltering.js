import { useMemo, useState } from "react";

export function useMealFiltering(meals) {
  const [filter, setFilter] = useState("today");
  const [search, setSearch] = useState("");

  const filteredMeals = useMemo(() => {
    const now = new Date();

    return meals.filter((meal) => {
      const mealDate = new Date(
        meal.createdAt || meal.created_at || new Date(0).toISOString()
      );

      const matchesSearch = (meal.food || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const isToday = mealDate.toDateString() === now.toDateString();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const isWeek = mealDate >= sevenDaysAgo;

      if (filter === "today") return isToday && matchesSearch;
      if (filter === "week") return isWeek && matchesSearch;

      return matchesSearch;
    });
  }, [meals, filter, search]);

  return {
    filter,
    setFilter,
    search,
    setSearch,
    filteredMeals,
  };
}
