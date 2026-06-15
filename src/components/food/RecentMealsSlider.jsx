import { Clock3, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RecentMealsSlider({ meals = [] }) {
  const { t } = useTranslation();
  if (!meals.length) return null;

  return (
    <section className="mt-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[7px] font-black uppercase tracking-[0.22em] text-[var(--app-primary)]">
          {t("food.recentMeals.title")}
        </p>

        <span className="text-[7px] font-black uppercase tracking-widest text-[var(--app-muted)]">
          {t("food.recentMeals.badge")}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {meals.map((meal, index) => (
          <MealCard key={meal.id || index} meal={meal} t={t} />
        ))}
      </div>
    </section>
  );
}

function MealCard({ meal, t }) {
  const image = meal.image || meal.image_url;

  return (
    <div className="relative h-[135px] min-w-[125px] overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-card)]">
      {image ? (
          <img
            src={image}
            alt={meal.food || t("food.recentMeals.mealFallback")}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[var(--app-surface)] text-[9px] font-black uppercase tracking-widest text-[var(--app-muted)]">
            {t("food.recentMeals.noPhoto")}
          </div>
        )}

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)] via-[var(--app-surface)]/35 to-transparent" />

      <div className="absolute left-2 top-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 backdrop-blur-xl">
        <p className="text-[6px] font-black uppercase tracking-widest text-[var(--app-primary)]">
          {meal.score || 0}/10
        </p>
      </div>

      <div className="absolute bottom-2 left-2 right-2">
        <p className="line-clamp-2 text-[9px] font-black uppercase italic leading-3.5 text-[var(--app-text)]">
          {meal.food || t("food.recentMeals.mealFallback")}
        </p>

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[var(--app-primary)]">
            <Flame size={10} />

            <span className="text-[7px] font-black">
              {Math.round(meal.calories || 0)} {t("food.recentMeals.kcal")}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[var(--app-muted)]">
            <Clock3 size={9} />

            <span className="text-[6px] font-black uppercase">
              {t("food.recentMeals.recent")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
