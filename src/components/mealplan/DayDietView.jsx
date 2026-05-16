import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Flame,
  Utensils,
} from "lucide-react";

export function DayDietView({
  plan = [],
  activeDay = 0,
  setActiveDay,
  progress = {},
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
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {plan.map((dayData, index) => (
          <button
            key={`${dayData.day}-${index}`}
            type="button"
            onClick={() => setActiveDay(index)}
            className={`shrink-0 rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${
              safeActiveDay === index
                ? "border-[#10b981] bg-[#10b981] text-[#06110c] shadow-[0_0_18px_rgba(16,185,129,0.28)]"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-[#10b981]/30 hover:text-white"
            }`}
          >
            {shortDay(dayData.day)}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-[20px] border border-[#10b981]/15 bg-[#07170f] px-2.5 py-1.5">
        <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-[#10b981]/15 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#10b981]">
                Plan diario
              </span>

              <h3 className="mt-0.5 truncate text-[17px] font-black uppercase italic leading-none text-white">
                {activeDayData?.day || "Día"}
              </h3>

              <p className="mt-0.5 text-[10px] normal-case text-slate-500">
                {completed}/{total} comidas · {percentage}% completado
              </p>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] border border-[#10b981]/20 bg-[#10b981]/10">
              <span className="text-sm font-black text-[#10b981]">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-[#10b981] transition-all duration-500"
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
                  ? "border-[#10b981]/30 bg-[#10b981]/5 opacity-80"
                  : "border-white/10 bg-black/20 hover:border-[#10b981]/25 hover:bg-[#0d2218]/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1 text-[#10b981]">
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
                      isCompleted ? "text-white/45 line-through" : "text-white"
                    }`}
                  >
                    {foodName}
                  </h4>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedMealDetail({ meal, mealName, foodName, mealTime, ingredients });
                    }}
                    className="mt-0.5 text-[9px] font-semibold normal-case text-[#10b981]/80 transition hover:text-emerald-200"
                  >
                    Ver detalle
                  </button>
                </div>

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
                      ? "border-[#10b981] bg-[#10b981] text-[#06110c] shadow-[0_0_14px_rgba(16,185,129,0.22)]"
                      : "border-white/12 bg-white/[0.03] text-slate-500 hover:border-[#10b981]/30 hover:text-[#10b981]"
                  }`}
                >
                  <CheckCircle2 size={15} strokeWidth={2.4} />
                </button>
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
  const foodDetail = meal.food || meal.title || meal.description || meal.details;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3 pt-8 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="max-h-[82vh] w-full max-w-md overflow-y-auto rounded-[24px] border border-[#10b981]/20 bg-[#07170f] p-4 shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#10b981]">
              {mealName}
            </p>
            <h3 className="mt-1 text-lg font-black uppercase italic leading-tight text-white">
              {foodName}
            </h3>
            {mealTime && (
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold normal-case text-slate-500">
                <Clock size={12} />
                {mealTime}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-300 transition hover:border-[#10b981]/30 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {calories > 0 && <DetailMetric label="kcal" value={calories} />}
          {protein > 0 && <DetailMetric label="proteína" value={`${protein}g`} />}
          {carbs > 0 && <DetailMetric label="carbs" value={`${carbs}g`} />}
          {fat > 0 && <DetailMetric label="grasa" value={`${fat}g`} />}
        </div>

        {foodDetail && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
              Comida completa
            </p>
            <p className="mt-1 text-sm font-bold normal-case leading-snug text-white">
              {foodDetail}
            </p>
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
              Ingredientes / porciones
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map((item, idx) => (
                <IngredientPill key={`detail-ing-${idx}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d2218]/70 p-2">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function IngredientPill({ item }) {
  const { amount, name } = splitIngredient(item);

  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d2218]/70 px-2 py-1">
      <span className="max-w-[116px] truncate text-[10px] font-bold normal-case text-slate-300">
        {name}
      </span>

      <span className="shrink-0 text-[9px] font-black normal-case text-[#10b981]">
        {amount}
      </span>
    </div>
  );
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

function shortDay(day = "") {
  const normalized = String(day).toLowerCase();

  if (normalized.startsWith("lunes")) return "Lun";
  if (normalized.startsWith("martes")) return "Mar";
  if (normalized.startsWith("miércoles") || normalized.startsWith("miercoles")) return "Mié";
  if (normalized.startsWith("jueves")) return "Jue";
  if (normalized.startsWith("viernes")) return "Vie";
  if (normalized.startsWith("sábado") || normalized.startsWith("sabado")) return "Sáb";
  if (normalized.startsWith("domingo")) return "Dom";

  return String(day).slice(0, 3) || "Día";
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
