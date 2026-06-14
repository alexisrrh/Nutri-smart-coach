import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Loader2,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

export function DayDietView({
  plan = [],
  activeDay = 0,
  setActiveDay,
  progress = {},
  isPremium = false,
  onRewriteMeal,
  rewriteMealState = {},
  toggleMeal,
}) {
  const [selectedMealDetail, setSelectedMealDetail] = useState(null);
  const hasPlan = Array.isArray(plan) && plan.length > 0;
  const safeActiveDay = hasPlan
    ? Math.max(0, Math.min(activeDay, plan.length - 1))
    : 0;
  const activeDayData = hasPlan ? plan[safeActiveDay] || plan[0] : null;

  const mealsArray = useMemo(() => {
    if (!activeDayData?.meals) return [];
    return Array.isArray(activeDayData.meals)
      ? activeDayData.meals
      : Object.values(activeDayData.meals || {});
  }, [activeDayData]);

  if (!hasPlan) return null;

  const completed = mealsArray.filter((meal, index) =>
    Boolean(progress?.[getMealId(activeDayData?.day, meal, index)])
  ).length;

  const total = mealsArray.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const closeMealDetail = () => setSelectedMealDetail(null);

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-7 gap-1">
        {plan.map((dayData, index) => {
          const active = safeActiveDay === index;
          const fullLabel = fullDayLabel(dayData.day, index);

          return (
            <button
              key={`${dayData.day}-${index}`}
              type="button"
              aria-label={fullLabel}
              title={fullLabel}
              onClick={() => setActiveDay(index)}
              className={`group relative grid h-10 min-w-0 place-items-center overflow-hidden rounded-[1rem] border text-[12px] font-black uppercase leading-none transition active:scale-95 ${
                active
                  ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_18px_var(--app-glow)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]/55 hover:border-[var(--app-primary)]/30 hover:text-[var(--app-text)]"
              }`}
            >
              {active && (
                <>
                  <span className="absolute -inset-2 z-0 animate-[spin_2.6s_linear_infinite] rounded-[1rem] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_55%,var(--app-primary)_70%,transparent_85%,transparent_100%)]" />
                  <span className="absolute inset-[2px] z-[1] rounded-[0.9rem] bg-[var(--app-primary)]" />
                </>
              )}
              <span className="relative z-10">
                {miniDay(dayData.day, index)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[20px] border border-[var(--app-primary)]/15 bg-[var(--app-card)] px-2.5 py-1.5">
        <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-[var(--app-primary)]/15 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                Plan diario
              </span>

              <h3 className="mt-0.5 truncate text-[17px] font-black uppercase italic leading-none text-[var(--app-text)]">
                {activeDayData?.day || "Día"}
              </h3>

              <p className="mt-0.5 text-[10px] normal-case text-slate-500">
                {completed}/{total} comidas · {percentage}% completado
              </p>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10">
              <span className="text-sm font-black text-[var(--app-primary)]">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--app-surface)]">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {mealsArray.map((meal, index) => {
          const mealId = getMealId(activeDayData?.day, meal, index);
          const isCompleted = Boolean(progress?.[mealId]);
          const ingredients = getIngredients(meal);
          const mealName = meal.name || defaultMealName(index, total);
          const foodName = meal.food || meal.title || "Comida";
          const mealTime = meal.time || defaultMealTime(index, total);
          const calories = Math.round(Number(meal.calories || meal.kcal || 0));
          const rewriteLoading = rewriteMealState.mealId === mealId;

          return (
            <article
              key={mealId}
              role="button"
              tabIndex={0}
              onClick={() =>
                setSelectedMealDetail({ meal, mealName, foodName, mealTime, ingredients })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedMealDetail({ meal, mealName, foodName, mealTime, ingredients });
                }
              }}
              className={`cursor-pointer overflow-hidden rounded-2xl border px-2.5 py-1.5 transition active:scale-[0.99] ${
                isCompleted
                  ? "border-[var(--app-primary)]/30 bg-[var(--app-primary)]/5 opacity-80"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-primary)]/25 hover:bg-[var(--app-surface)]/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1 text-[var(--app-primary)]">
                      <Utensils size={11} />
                      {mealName}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} />
                      {mealTime}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Flame size={10} />
                      {calories} kcal
                    </span>
                  </div>

                  <h4
                    className={`mt-0.5 line-clamp-2 text-[13px] font-bold normal-case leading-snug tracking-normal ${
                      isCompleted ? "text-[var(--app-muted)] line-through" : "text-[var(--app-text)]"
                    }`}
                  >
                    {foodName}
                  </h4>

                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Cambiar comida"
                    title={isPremium ? "Cambiar comida" : "Premium"}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRewriteMeal?.({
                        dayIndex: safeActiveDay,
                        mealId,
                        meal,
                      });
                    }}
                    disabled={rewriteLoading}
                    className="grid min-h-9 min-w-9 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] transition active:scale-95 disabled:opacity-60 hover:border-[var(--app-primary)]/30"
                  >
                    {rewriteLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} strokeWidth={2.4} />
                    )}
                  </button>

                  <ChevronRight
                    size={14}
                    strokeWidth={2.2}
                    className="text-[var(--app-muted)]"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    aria-label={isCompleted ? "Marcar comida como pendiente" : "Marcar comida como completada"}
                    title={isCompleted ? "Hecho" : "Marcar"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleMeal?.(mealId);
                    }}
                    className={`grid min-h-9 min-w-9 shrink-0 place-items-center rounded-xl border transition active:scale-95 ${
                      isCompleted
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_14px_var(--app-glow)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-slate-500 hover:border-[var(--app-primary)]/30 hover:text-[var(--app-primary)]"
                    }`}
                  >
                    <CheckCircle2 size={15} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedMealDetail && (
        <MealDetailSheet detail={selectedMealDetail} onClose={closeMealDetail} />
      )}
    </div>
  );
}

function MealDetailSheet({ detail, onClose }) {
  const { meal, mealName, foodName, mealTime, ingredients } = detail;
  const calories = Math.round(Number(meal.calories || meal.kcal || 0));
  const protein = Math.round(Number(meal.protein || 0));
  const carbs = Math.round(Number(meal.carbs || 0));
  const fat = Math.round(Number(meal.fat || 0));
  const nutritionSummary = getNutritionSummary({ calories, protein, carbs, fat });
  const rawFoodDetail = meal.food || meal.title || meal.description || meal.details;
  const foodDetail =
    rawFoodDetail && String(rawFoodDetail).trim().toLowerCase() !== String(foodName).trim().toLowerCase()
      ? rawFoodDetail
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-bg)]/70 px-3 py-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-sm overflow-y-auto rounded-[22px] border border-[var(--app-primary)]/20 bg-[var(--app-card)] p-3 shadow-[0_24px_80px_var(--app-glow)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="inline-flex rounded-full border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              {mealName}
            </p>
            <h3 className="mt-2 line-clamp-2 text-[17px] font-extrabold normal-case leading-tight text-[var(--app-text)]">
              {foodName}
            </h3>
            {mealTime && (
              <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium normal-case text-slate-500">
                <Clock size={11} />
                {mealTime}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            className="grid min-h-7 min-w-7 shrink-0 place-items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-slate-400 transition hover:border-[var(--app-primary)]/30 hover:text-[var(--app-text)]"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {calories > 0 && <CaloriesHero value={calories} />}

          <div className="grid grid-cols-3 gap-2">
            {protein > 0 && <MacroBlock label="proteína" value={`${protein}g`} />}
            {carbs > 0 && <MacroBlock label="carbs" value={`${carbs}g`} />}
            {fat > 0 && <MacroBlock label="grasa" value={`${fat}g`} />}
          </div>
        </div>

        {nutritionSummary.length > 0 && (
          <div className="mt-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/75 px-3 py-2">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
              Resumen nutricional
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {nutritionSummary.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--app-primary)]/15 bg-[var(--app-primary)]/8 px-2 py-0.5 text-[10px] font-semibold text-[var(--app-text)]/90"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {foodDetail && (
          <div className="mt-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
              Comida completa
            </p>
            <p className="mt-1 text-[11px] font-medium normal-case leading-snug text-[var(--app-text)]">
              {foodDetail}
            </p>
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[9px] font-black uppercase tracking-wide text-slate-500">
              Ingredientes / porciones
            </p>
            <div className="space-y-1.25 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/60 p-2.5">
              {ingredients.map((item, idx) => (
                <IngredientRow key={`detail-ing-${idx}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CaloriesHero({ value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
        kcal
      </p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-[28px] font-black leading-none tracking-tight text-[var(--app-text)]">
          {value}
        </span>
        <span className="pb-0.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
          calorías
        </span>
      </div>
    </div>
  );
}

function MacroBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/80 px-3 py-2.5">
      <div className="flex min-h-[2.75rem] flex-col justify-center">
        <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
        <span className="mt-1 block text-[13px] font-extrabold leading-none text-[var(--app-text)]">
          {value}
        </span>
      </div>
    </div>
  );
}

function IngredientRow({ item }) {
  const { amount, name } = splitIngredient(item);

  return (
    <div className="flex items-start gap-2 text-[11px] leading-snug text-[var(--app-text)]">
      <span className="mt-[0.2rem] shrink-0 text-[var(--app-primary)]">•</span>
      <p className="min-w-0">
        <span className="font-semibold normal-case">{name}</span>
        {amount ? <span className="text-slate-300/90"> ({amount})</span> : null}
      </p>
    </div>
  );
}

function getNutritionSummary({ calories, protein, carbs, fat }) {
  const summary = [];

  if (protein >= 25) summary.push("Proteína adecuada");
  if (carbs >= 35) summary.push("Alta en carbohidratos");
  if (fat <= 10 && fat > 0) summary.push("Ligera en grasa");
  if (calories >= 500) summary.push("Buena para recuperación");

  return summary.slice(0, 3);
}

function getMealId(day, meal, index) {
  return `${day || "day"}-${meal.id || meal.type || meal.name || "meal"}-${index}`;
}

function getIngredients(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients.filter(Boolean);
  }

  if (meal.details) {
    return String(meal.details)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function splitIngredient(item = "") {
  if (typeof item === "object" && item !== null) {
    return {
      name: item.name || item.food || "Ingrediente",
      amount: item.amount || item.quantity || "al gusto",
    };
  }

  const text = String(item).trim();

  const match = text.match(
    /^(\d+[\d.,]*\s?(g|kg|ml|l|unidad(?:es)?|huevo(?:s)?|pieza(?:s)?|rebanada(?:s)?|plátano(?:s)?|platano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones))/i
  );

  if (!match) {
    return { name: text, amount: "al gusto" };
  }

  const amount = match[0];
  const name = text.replace(amount, "").replace(/^de\s+/i, "").trim();

  return { name: name || text, amount };
}

function miniDay(day = "", index = 0) {
  const normalized = String(day).toLowerCase();

  if (normalized.startsWith("lunes")) return "L";
  if (normalized.startsWith("martes")) return "M";
  if (normalized.startsWith("miércoles") || normalized.startsWith("miercoles")) return "X";
  if (normalized.startsWith("jueves")) return "J";
  if (normalized.startsWith("viernes")) return "V";
  if (normalized.startsWith("sábado") || normalized.startsWith("sabado")) return "S";
  if (normalized.startsWith("domingo")) return "D";

  return ["L", "M", "X", "J", "V", "S", "D"][index] || "D";
}

function fullDayLabel(day = "", index = 0) {
  const normalized = String(day).toLowerCase();

  if (normalized.startsWith("lunes")) return "Lunes";
  if (normalized.startsWith("martes")) return "Martes";
  if (normalized.startsWith("miércoles") || normalized.startsWith("miercoles")) return "Miércoles";
  if (normalized.startsWith("jueves")) return "Jueves";
  if (normalized.startsWith("viernes")) return "Viernes";
  if (normalized.startsWith("sábado") || normalized.startsWith("sabado")) return "Sábado";
  if (normalized.startsWith("domingo")) return "Domingo";

  return String(day) || ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index] || "Día";
}

function defaultMealTime(index, total = 4) {
  if (total === 2) return ["13:00", "20:00"][index] || "13:00";
  if (total === 3) return ["08:30", "14:00", "20:30"][index] || "08:30";
  if (total === 5) return ["08:00", "11:30", "14:30", "18:00", "21:00"][index] || "08:00";
  if (total >= 6) return ["08:00", "10:30", "13:30", "16:30", "19:30", "22:00"][index] || "08:00";
  return ["08:00", "13:30", "17:30", "21:00"][index] || "08:00";
}

function defaultMealName(index, total = 4) {
  if (total === 2) return ["Comida 1", "Comida 2"][index] || `Comida ${index + 1}`;
  if (total === 3) return ["Desayuno", "Comida", "Cena"][index] || `Comida ${index + 1}`;
  if (total === 5) return ["Desayuno", "Snack", "Comida", "Merienda", "Cena"][index] || `Comida ${index + 1}`;
  if (total >= 6) return ["Desayuno", "Snack 1", "Comida", "Snack 2", "Cena", "Extra"][index] || `Comida ${index + 1}`;
  return ["Desayuno", "Comida", "Merienda", "Cena"][index] || `Comida ${index + 1}`;
}
