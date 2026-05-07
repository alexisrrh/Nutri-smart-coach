import React from "react";
import { Clock, Flame } from "lucide-react";

export function DayDietView({ plan, activeDay, setActiveDay, progress, toggleMeal }) {
  if (!plan || plan.length === 0) return null;

  const activeDayData = plan[activeDay];
  const mealsArray = activeDayData?.meals 
    ? Object.entries(activeDayData.meals).map(([type, data]) => ({ type, ...data }))
    : [];

  return (
    <div className="space-y-6">
      {/* Selector de días estilo pestañas oscuras */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plan.map((dayData, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveDay(index)}
            className={`flex-shrink-0 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider border transition-all ${
              activeDay === index
                ? "bg-[#10b981] text-slate-950 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-[#0d2218] text-slate-400 border-white/5 hover:bg-[#123022]"
            }`}
          >
            {dayData.day}
          </button>
        ))}
      </div>

      {/* Titulo del día e info de completado */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Plan Diario</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-0.5">{activeDayData?.day}</h3>
        </div>
      </div>

      {/* Listado de platos */}
      <div className="space-y-3">
        {mealsArray.map((meal, index) => {
          const mealId = `${activeDay}-${meal.type}`;
          const isCompleted = progress?.[mealId];

          return (
            <div
              key={index}
              className={`rounded-xl border bg-[#07120d] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isCompleted ? "border-emerald-500/20 bg-emerald-950/5" : "border-white/5"
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="text-[#10b981]">
                    {meal.type === "breakfast" ? "🍳 Desayuno" : 
                     meal.type === "lunch" ? "🍲 Almuerzo" : 
                     meal.type === "snack" ? "☕ Merienda" : "🥗 Cena"}
                  </span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {meal.time || "08:00"}</span>
                  <span className="flex items-center gap-1"><Flame size={11} /> {meal.calories || meal.kcal} kcal</span>
                </div>
                
                <h4 className="text-base font-black text-white uppercase tracking-wide">
                  {meal.name || meal.title}
                </h4>
                
                <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase">
                  {meal.ingredients?.join(", ")}
                </p>
              </div>

              {/* Botón de Marcar idéntico al de tu captura */}
              <button
                type="button"
                onClick={() => toggleMeal(mealId)}
                className={`rounded-lg border px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isCompleted
                    ? "bg-emerald-500 text-slate-950 border-emerald-500"
                    : "bg-[#0d2218] text-slate-300 border-white/10 hover:bg-white/5"
                  }`}
              >
                {isCompleted ? "Hecho ✓" : "Marcar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
