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
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {plan.map((dayData, index) => (
          <button
            key={`${dayData.day}-${index}`}
            type="button"
            onClick={() => setActiveDay(index)}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all sm:px-5 sm:py-3 sm:text-xs ${
              safeActiveDay === index
                ? "border-[#10b981] bg-[#10b981] text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.22)]"
                : "border-white/5 bg-[#0d2218] text-slate-400 hover:bg-[#123022] hover:text-white"
            }`}
          >
            {shortDay(dayData.day)}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-[#07120d] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">
              Plan diario
            </span>

            <h3 className="mt-1 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
              {activeDayData?.day || "Día"}
            </h3>

            <p className="mt-1 text-xs normal-case text-slate-500">
              {completed}/{total} comidas completadas
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-[#10b981]">{percentage}%</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              progreso
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <DayMacro icon={<Flame size={14} />} value={dayTotals.calories} label="kcal" />
          <DayMacro icon={<Beef size={14} />} value={`${dayTotals.protein}g`} label="prot" />
          <DayMacro icon={<Wheat size={14} />} value={`${dayTotals.carbs}g`} label="carb" />
          <DayMacro icon={<Droplets size={14} />} value={`${dayTotals.fat}g`} label="grasas" />
        </div>
      </div>

      <div className="space-y-3">
        {mealsArray.map((meal, index) => {
          const mealId = getMealId(activeDayData?.day, meal, index);
          const isCompleted = Boolean(progress?.[mealId]);
          const ingredients = getIngredients(meal);
          const mealName = meal.name || defaultMealName(index);
          const foodName = meal.food || meal.title || meal.name || "Comida";

          return (
            <article
              key={mealId}
              className={`overflow-hidden rounded-xl border transition-all ${
                isCompleted
                  ? "border-[#10b981]/30 bg-[#10b981]/5 opacity-80"
                  : "border-white/5 bg-[#07120d]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/5 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="inline-flex items-center gap-1 text-[#10b981]">
                      <Utensils size={12} />
                      {mealName}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {meal.time || defaultMealTime(index)}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Flame size={11} />
                      {Math.round(Number(meal.calories || meal.kcal || 0))} kcal
                    </span>
                  </div>

                  <h4
                    className={`mt-2 text-base font-black uppercase italic leading-tight tracking-tight sm:text-lg ${
                      isCompleted ? "text-white/45 line-through" : "text-white"
                    }`}
                  >
                    {foodName}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMeal(mealId)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all sm:px-4 ${
                    isCompleted
                      ? "border-[#10b981] bg-[#10b981] text-slate-950"
                      : "border-white/10 bg-[#0d2218] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Hecho
                    </span>
                  ) : (
                    "Marcar"
                  )}
                </button>
              </div>

              <div className="grid gap-3 p-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Porciones e ingredientes
                  </p>

                  {ingredients.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {ingredients.map((item, idx) => (
                        <IngredientPill key={`${mealId}-ing-${idx}`} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-white/5 bg-[#0d2218]/60 p-3 text-xs normal-case text-slate-400">
                      Sin ingredientes detallados. Puedes mejorar el prompt para
                      pedir cantidades exactas.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
                  <MiniMacro label="Kcal" value={Math.round(Number(meal.calories || meal.kcal || 0))} />
                  <MiniMacro label="Prot" value={`${Math.round(Number(meal.protein || 0))}g`} />
                  <MiniMacro label="Carb" value={`${Math.round(Number(meal.carbs || 0))}g`} />
                  <MiniMacro label="Grasa" value={`${Math.round(Number(meal.fat || 0))}g`} />
                </div>
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-[#0d2218]/60 px-3 py-2">
      <span className="truncate text-xs font-bold normal-case text-slate-300">
        {name}
      </span>

      <span className="shrink-0 text-[11px] font-black normal-case text-[#10b981]">
        {amount}
      </span>
    </div>
  );
}

function DayMacro({ icon, value, label }) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#0d2218]/60 p-2 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[#10b981]">
        {icon}
      </div>

      <p className="text-sm font-black text-white">{value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

function MiniMacro({ label, value }) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#0d2218]/60 p-2">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
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
    /^(\d+[\d.,]*\s?(g|kg|ml|l|unidad(?:es)?|huevo(?:s)?|pieza(?:s)?|rebanada(?:s)?|plátano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones))/i
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
  const normalized = day.toLowerCase();

  if (normalized.startsWith("lunes")) return "Lun";
  if (normalized.startsWith("martes")) return "Mar";
  if (normalized.startsWith("miércoles") || normalized.startsWith("miercoles"))
    return "Mié";
  if (normalized.startsWith("jueves")) return "Jue";
  if (normalized.startsWith("viernes")) return "Vie";
  if (normalized.startsWith("sábado") || normalized.startsWith("sabado"))
    return "Sáb";
  if (normalized.startsWith("domingo")) return "Dom";

  return day.slice(0, 3) || "Día";
}

function defaultMealTime(index) {
  const times = ["08:00", "13:30", "18:00", "21:00", "23:00"];
  return times[index] || "08:00";
}

function defaultMealName(index) {
  const names = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Extra"];
  return names[index] || "Comida";
}