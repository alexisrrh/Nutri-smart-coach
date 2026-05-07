import React, { useMemo, useState } from "react";
import {
  Beef,
  Clock,
  Droplets,
  Flame,
  Utensils,
  Wheat,
  X,
} from "lucide-react";

export function WeeklyCalendarView({ plan, activeDay, setActiveDay }) {
  const [selectedMeal, setSelectedMeal] = useState(null);

  const normalizedPlan = useMemo(() => normalizePlan(plan), [plan]);

  if (!normalizedPlan || normalizedPlan.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="xl:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {normalizedPlan.map((dayData, index) => (
            <button
              key={`${dayData.day}-${index}`}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`shrink-0  border px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                activeDay === index
                  ? "border-[#10b981] bg-[#10b981] text-slate-950"
                  : "border-white/5 bg-[#0d2218] text-slate-400"
              }`}
            >
              {shortDay(dayData.day)}
            </button>
          ))}
        </div>

        <MobileDayCard
          day={normalizedPlan[Math.min(activeDay, normalizedPlan.length - 1)]}
          onSelectMeal={setSelectedMeal}
        />
      </div>

      <div className="hidden grid-cols-7 gap-2 xl:grid">
        {normalizedPlan.map((dayData, dayIdx) => {
          const totals = getDayTotals(dayData.meals);

          return (
            <div
              key={`${dayData.day}-${dayIdx}`}
              className={` border p-3 transition-all ${
                activeDay === dayIdx
                  ? "border-[#10b981]/40 bg-[#0d2218]/80"
                  : "border-white/5 bg-[#07120d]"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveDay(dayIdx)}
                className="mb-3 w-full  bg-[#0d2218] px-2 py-2 text-center transition hover:bg-[#123022]"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">
                  {shortDay(dayData.day)}
                </p>

                <p className="mt-1 text-[9px] font-bold text-slate-500">
                  {Math.round(totals.calories)} kcal
                </p>
              </button>

              <div className="space-y-2">
                {dayData.meals.map((meal, index) => (
                  <MealMiniCard
                    key={`${dayData.day}-${meal.name}-${index}`}
                    meal={meal}
                    onClick={() =>
                      setSelectedMeal({
                        day: dayData.day,
                        ...meal,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedMeal && (
        <MealModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
  );
}

function MobileDayCard({ day, onSelectMeal }) {
  if (!day) return null;

  const totals = getDayTotals(day.meals);

  return (
    <div className="mt-4 border border-white/5 bg-[#07120d] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">
            Vista semanal
          </p>

          <h3 className="mt-1 text-2xl font-black uppercase italic text-white">
            {day.day}
          </h3>
        </div>

        <div className=" border border-white/5 bg-[#0d2218] px-3 py-2 text-right">
          <p className="text-sm font-black text-white">
            {Math.round(totals.calories)}
          </p>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
            kcal
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {day.meals.map((meal, index) => (
          <MealWideButton
            key={`${day.day}-${meal.name}-${index}`}
            meal={meal}
            onClick={() => onSelectMeal({ day: day.day, ...meal })}
          />
        ))}
      </div>
    </div>
  );
}

function MealMiniCard({ meal, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full border border-white/5 bg-[#0d2218]/40 p-2.5 text-left transition hover:border-[#10b981]/30 hover:bg-[#0d2218]"
    >
      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">
        {meal.time} · {meal.name}
      </span>

      <h4 className="mt-1 line-clamp-2 text-[11px] font-black uppercase leading-tight tracking-wide text-white group-hover:text-[#10b981]">
        {meal.food}
      </h4>

      <p className="mt-1 text-[9px] font-bold text-slate-500">
        {Math.round(meal.calories)} kcal
      </p>
    </button>
  );
}

function MealWideButton({ meal, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className=" border border-white/5 bg-[#0d2218]/50 p-3 text-left transition hover:border-[#10b981]/30"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
          <Utensils size={12} />
          {meal.name}
        </p>

        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <Clock size={11} />
          {meal.time}
        </span>
      </div>

      <h4 className="text-sm font-black uppercase italic leading-tight text-white">
        {meal.food}
      </h4>

      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
        <span>{Math.round(meal.calories)} kcal</span>
        <span>{Math.round(meal.protein)}g prot</span>
        <span>{Math.round(meal.carbs)}g carb</span>
        <span>{Math.round(meal.fat)}g grasas</span>
      </div>
    </button>
  );
}

function MealModal({ meal, onClose }) {
  const ingredients = getIngredients(meal);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto border border-white/5 bg-[#06110c] shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-white/5 bg-[#06110c]/95 p-5 backdrop-blur">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">
              {meal.day} · {meal.time} · {meal.name}
            </span>

            <h3 className="mt-1 text-xl font-black uppercase italic leading-tight text-white">
              {meal.food}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className=" bg-white/5 p-2 text-slate-400 transition hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-4 gap-2">
            <MacroBox icon={<Flame size={14} />} label="Kcal" value={meal.calories} />
            <MacroBox icon={<Beef size={14} />} label="Prot" value={`${meal.protein}g`} />
            <MacroBox icon={<Wheat size={14} />} label="Carb" value={`${meal.carbs}g`} />
            <MacroBox icon={<Droplets size={14} />} label="Grasa" value={`${meal.fat}g`} />
          </div>

          <div>
            <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
              Porciones e ingredientes
            </h4>

            {ingredients.length > 0 ? (
              <div className="grid gap-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={`${ingredient}-${index}`}
                    className=" border border-white/5 bg-[#0d2218]/60 p-3 text-xs font-bold normal-case text-slate-300"
                  >
                    {ingredient}
                  </div>
                ))}
              </div>
            ) : (
              <p className=" border border-white/5 bg-[#0d2218]/60 p-3 text-xs normal-case text-slate-400">
                Sin ingredientes detallados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroBox({ icon, label, value }) {
  return (
    <div className=" border border-white/5 bg-[#0d2218]/60 p-2 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[#10b981]">
        {icon}
      </div>

      <p className="text-sm font-black text-white">{Math.round(Number(value)) || value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

function normalizePlan(plan = []) {
  if (!Array.isArray(plan)) return [];

  return plan.map((day, dayIndex) => {
    const meals = Array.isArray(day?.meals)
      ? day.meals
      : Object.values(day?.meals || {});

    return {
      day: day?.day || `Día ${dayIndex + 1}`,
      meals: meals.map((meal, index) => ({
        time: meal?.time || defaultMealTime(index),
        name: meal?.name || defaultMealName(index),
        food: meal?.food || meal?.title || meal?.name || "Comida",
        details: meal?.details || "",
        ingredients: getIngredients(meal),
        calories: Number(meal?.calories || meal?.kcal || 0),
        protein: Number(meal?.protein || 0),
        carbs: Number(meal?.carbs || 0),
        fat: Number(meal?.fat || 0),
      })),
    };
  });
}

function getDayTotals(meals = []) {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories || 0);
      acc.protein += Number(meal.protein || 0);
      acc.carbs += Number(meal.carbs || 0);
      acc.fat += Number(meal.fat || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function getIngredients(meal) {
  if (Array.isArray(meal?.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients.filter(Boolean);
  }

  if (meal?.details) {
    return String(meal.details)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
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