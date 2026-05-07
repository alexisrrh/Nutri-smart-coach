import React, { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Utensils,
  Wheat,
  Beef,
} from "lucide-react";

export function DayDietView({
  plan,
  activeDay,
  setActiveDay,
  progress,
  toggleMeal,
}) {
  if (!Array.isArray(plan) || plan.length === 0) return null;

  const safeActiveDay = Math.min(activeDay, plan.length - 1);
  const activeDayData = plan[safeActiveDay];

  const mealsArray = useMemo(() => {
    if (!activeDayData?.meals) return [];

    if (Array.isArray(activeDayData.meals)) {
      return activeDayData.meals;
    }

    return Object.entries(activeDayData.meals).map(([type, data], index) => ({
      id: `${activeDayData.day}-${type}-${index}`,
      type,
      ...data,
    }));
  }, [activeDayData]);

  const dayTotals = useMemo(() => getDayTotals(mealsArray), [mealsArray]);

  const completed = mealsArray.filter((meal, index) => {
    const mealId = getMealId(activeDayData?.day, meal, index);
    return progress?.[mealId];
  }).length;

  const total = mealsArray.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {plan.map((dayData, index) => (
          <button
            key={`${dayData.day}-${index}`}
            type="button"
            onClick={() => setActiveDay(index)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
              safeActiveDay === index
                ? "border-[#10b981] bg-[#10b981] text-[#06110c] shadow-[0_0_16px_rgba(16,185,129,0.18)]"
                : "border-white/5 bg-[#0d2218] text-slate-400 hover:bg-[#123022] hover:text-white"
            }`}
          >
            {shortDay(dayData.day)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#07120d] p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#10b981]">
              Plan diario
            </span>

            <h3 className="mt-0.5 truncate text-xl font-black uppercase italic tracking-tight text-white">
              {activeDayData?.day || "Día"}
            </h3>

            <p className="mt-0.5 text-[11px] normal-case text-slate-500">
              {completed}/{total} comidas · {percentage}% completado
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10">
            <span className="text-lg font-black text-[#10b981]">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <DayMacro
            icon={<Flame size={13} />}
            value={Math.round(dayTotals.calories)}
            label="kcal"
          />
          <DayMacro
            icon={<Beef size={13} />}
            value={`${Math.round(dayTotals.protein)}g`}
            label="prot"
          />
          <DayMacro
            icon={<Wheat size={13} />}
            value={`${Math.round(dayTotals.carbs)}g`}
            label="carb"
          />
          <DayMacro
            icon={<Droplets size={13} />}
            value={`${Math.round(dayTotals.fat)}g`}
            label="grasa"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {mealsArray.map((meal, index) => {
          const mealId = getMealId(activeDayData?.day, meal, index);
          const isCompleted = Boolean(progress?.[mealId]);
          const ingredients = getIngredients(meal);
          const mealName = meal.name || defaultMealName(index);
          const foodName = meal.food || meal.title || meal.name || "Comida";

          return (
            <article
              key={mealId}
              className={`overflow-hidden rounded-2xl border transition-all ${
                isCompleted
                  ? "border-[#10b981]/30 bg-[#10b981]/5 opacity-80"
                  : "border-white/5 bg-[#07120d]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span className="inline-flex items-center gap-1 text-[#10b981]">
                      <Utensils size={11} />
                      {mealName}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} />
                      {meal.time || defaultMealTime(index)}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Flame size={10} />
                      {Math.round(Number(meal.calories || meal.kcal || 0))} kcal
                    </span>
                  </div>

                  <h4
                    className={`mt-1.5 text-sm font-black uppercase italic leading-tight tracking-tight sm:text-base ${
                      isCompleted ? "text-white/45 line-through" : "text-white"
                    }`}
                  >
                    {foodName}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMeal(mealId)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-wider transition-all ${
                    isCompleted
                      ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
                      : "border-white/10 bg-[#0d2218] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Hecho
                    </span>
                  ) : (
                    "Marcar"
                  )}
                </button>
              </div>

              <div className="border-t border-white/5 px-3 pb-3 pt-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Porciones
                  </p>

                  <div className="flex gap-1.5">
                    <MiniMacro
                      label="P"
                      value={`${Math.round(Number(meal.protein || 0))}g`}
                    />
                    <MiniMacro
                      label="C"
                      value={`${Math.round(Number(meal.carbs || 0))}g`}
                    />
                    <MiniMacro
                      label="G"
                      value={`${Math.round(Number(meal.fat || 0))}g`}
                    />
                  </div>
                </div>

                {ingredients.length > 0 ? (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {ingredients.map((item, idx) => (
                      <IngredientPill
                        key={`${mealId}-ing-${idx}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-white/5 bg-[#0d2218]/60 p-2 text-[11px] normal-case text-slate-400">
                    Sin ingredientes detallados.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function IngredientPill({ item }) {
  const { amount, name } = splitIngredient(item);

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/5 bg-[#0d2218]/70 px-3 py-1.5">
      <span className="max-w-[120px] truncate text-[11px] font-bold normal-case text-slate-300">
        {name}
      </span>

      <span className="shrink-0 text-[10px] font-black normal-case text-[#10b981]">
        {amount}
      </span>
    </div>
  );
}

function DayMacro({ icon, value, label }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0d2218]/60 p-2 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[#10b981]">
        {icon}
      </div>

      <p className="text-xs font-black text-white">{value}</p>
      <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

function MiniMacro({ label, value }) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#0d2218]/70 px-2 py-1">
      <span className="text-[8px] font-black uppercase text-slate-500">
        {label}
      </span>
      <span className="ml-1 text-[10px] font-black text-white">{value}</span>
    </div>
  );
}

function getDayTotals(meals = []) {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories || meal.kcal || 0);
      acc.protein += Number(meal.protein || 0);
      acc.carbs += Number(meal.carbs || 0);
      acc.fat += Number(meal.fat || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
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
    return {
      name: text,
      amount: "al gusto",
    };
  }

  const amount = match[0];
  const name = text.replace(amount, "").replace(/^de\s+/i, "").trim();

  return {
    name: name || text,
    amount,
  };
}

function shortDay(day = "") {
  const normalized = String(day).toLowerCase();

  if (normalized.startsWith("lunes")) return "Lun";
  if (normalized.startsWith("martes")) return "Mar";
  if (normalized.startsWith("miércoles") || normalized.startsWith("miercoles"))
    return "Mié";
  if (normalized.startsWith("jueves")) return "Jue";
  if (normalized.startsWith("viernes")) return "Vie";
  if (normalized.startsWith("sábado") || normalized.startsWith("sabado"))
    return "Sáb";
  if (normalized.startsWith("domingo")) return "Dom";

  return String(day).slice(0, 3) || "Día";
}

function defaultMealTime(index) {
  const times = ["08:00", "13:30", "18:00", "21:00", "23:00"];
  return times[index] || "08:00";
}

function defaultMealName(index) {
  const names = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Extra"];
  return names[index] || "Comida";
}