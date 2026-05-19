import { Clock3, Sparkles } from "lucide-react";

export default function MealHistorySlider({ meals = [] }) {
  if (!meals.length) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[7px] font-black uppercase tracking-[0.22em] text-[var(--app-primary)]">
            Historial IA
          </p>

          <h2 className="mt-0.5 text-base font-black uppercase italic text-[var(--app-text)]">
            Últimos escaneos
          </h2>
        </div>

        <div className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1">
          <span className="text-[7px] font-black uppercase tracking-widest text-[var(--app-primary)]">
            {meals.length} comidas
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {meals.map((meal, index) => (
          <MealCard key={meal.id || index} meal={meal} />
        ))}
      </div>
    </section>
  );
}

function MealCard({ meal }) {
  const score = Number(meal.score || 0);
  const image = meal.image || meal.image_url;

  return (
    <div className="w-[170px] shrink-0 overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="relative h-[105px] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={meal.food || "Comida"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[var(--app-surface)]">
            <Sparkles size={22} className="text-[var(--app-primary)]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)] via-transparent to-transparent" />

        <div className="absolute right-2 top-2 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-0.5 backdrop-blur-xl">
          <span className="text-[8px] font-black text-[var(--app-primary)]">
            {score}/10
          </span>
        </div>
      </div>

      <div className="p-2.5">
        <p className="truncate text-xs font-black uppercase italic text-[var(--app-text)]">
          {meal.food || "Comida"}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-[7px] font-black uppercase tracking-widest text-[var(--app-muted)]">
              kcal
            </p>

            <p className="text-base font-black text-[var(--app-primary)]">
              {Math.round(meal.calories || 0)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[7px] font-black uppercase tracking-widest text-[var(--app-muted)]">
              prot
            </p>

            <p className="text-base font-black text-[var(--app-text)]">
              {Math.round(meal.protein || 0)}g
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[8px] text-[var(--app-muted)]">
          <Clock3 size={10} />

          <span>{formatMealDate(meal)}</span>
        </div>
      </div>
    </div>
  );
}

function formatMealDate(meal) {
  const date = meal.created_at || meal.createdAt;

  if (!date) return "Reciente";

  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}
