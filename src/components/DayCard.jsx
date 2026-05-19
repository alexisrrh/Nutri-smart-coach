import MealItem from "./MealItem";

export default function DayCard({ day, progress, toggleMeal }) {
  const completed = day.meals.filter((_, i) => progress[`${day.day}-${i}`]).length;
  const total = day.meals.length;
  const percent = Math.round((completed / total) * 100);

  const totals = day.meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-card)] backdrop-blur shadow-2xl">
      {/* HEADER */}
      <div className="border-b border-[var(--app-border)] bg-[var(--app-surface)] p-6">
        <h3 className="text-3xl font-black text-[var(--app-text)]">{day.day}</h3>

        {/* PROGRESO */}
        <div className="mt-4">
          <p className="text-sm text-[var(--app-muted)]">
            Progreso: {completed} / {total} comidas ({percent}%)
          </p>

          <div className="mt-2 h-2 w-full rounded-full bg-[var(--app-primary-soft)]">
            <div
              className="h-2 rounded-full bg-[var(--app-primary)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* MACROS */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
          <Badge>🔥 {totals.calories} kcal</Badge>
          <Badge>🥩 {totals.protein}g</Badge>
          <Badge>🍞 {totals.carbs}g</Badge>
          <Badge>🥑 {totals.fat}g</Badge>
        </div>
      </div>

      {/* COMIDAS */}
      <div className="grid gap-4 p-5">
        {day.meals.map((meal, index) => (
          <MealItem
            key={index}
            meal={meal}
            day={day.day}
            index={index}
            progress={progress}
            toggleMeal={toggleMeal}
          />
        ))}
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-xl bg-[var(--app-primary-soft)] px-3 py-2 text-[var(--app-primary)]">
      {children}
    </span>
  );
}
