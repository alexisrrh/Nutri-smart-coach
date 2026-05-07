import React, { useState } from "react";
import { Clock, Flame } from "lucide-react";

export function WeeklyCalendarView({ plan, activeDay, setActiveDay }) {
  const [selectedMeal, setSelectedMeal] = useState(null);

  const mealTypes = [
    { key: "breakfast", label: "🍳 Desayuno" },
    { key: "lunch", label: "🍲 Almuerzo" },
    { key: "snack", label: "☕ Merienda" },
    { key: "dinner", label: "🥗 Cena" }
  ];

  if (!plan || plan.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* VISTA DESKTOP: Cuadrícula limpia de 7 columnas */}
      <div className="hidden grid-cols-7 gap-2 xl:grid">
        {plan.map((dayData, dayIdx) => (
          <div 
            key={dayIdx} 
            className={`rounded-xl border bg-[#07120d] p-3 transition-all ${
              activeDay === dayIdx ? "border-[#10b981]/40 bg-[#0d2218]/30" : "border-white/5"
            }`}
          >
            <button 
              onClick={() => setActiveDay(dayIdx)}
              className="mb-3 w-full text-center text-xs font-black uppercase tracking-widest text-[#10b981]"
            >
              {dayData.day?.substring(0, 3)}
            </button>

            <div className="space-y-2">
              {mealTypes.map((type) => {
                const meal = dayData.meals?.[type.key];
                if (!meal) return null;

                return (
                  <div
                    key={type.key}
                    onClick={() => setSelectedMeal({ day: dayData.day, type: type.label, ...meal })}
                    className="group cursor-pointer rounded-lg border border-white/5 bg-[#0d2218]/40 p-2.5 hover:border-[#10b981]/30 transition"
                  >
                    <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">{type.label}</span>
                    <h4 className="mt-0.5 line-clamp-1 text-[11px] font-bold uppercase tracking-wide text-white group-hover:text-[#10b981]">
                      {meal.name || meal.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETALLADO CON TUS COLORES MATE */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/5 bg-[#06110c] p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">{selectedMeal.day} · {selectedMeal.type}</span>
                <h3 className="text-xl font-black text-white uppercase mt-0.5">{selectedMeal.name || selectedMeal.title}</h3>
              </div>
              <button onClick={() => setSelectedMeal(null)} className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs uppercase tracking-wide text-slate-300">
              <div className="flex gap-4 rounded-lg bg-[#07120d] p-3 font-bold border border-white/5">
                <div>🔥 <span className="text-white">{selectedMeal.calories || selectedMeal.kcal}</span> Kcal</div>
                <div>🥩 <span className="text-white">{selectedMeal.protein || "0"}g</span> Prot</div>
                <div>🥑 <span className="text-white">{selectedMeal.fat || "0"}g</span> Grasas</div>
              </div>
              <div>
                <h4 className="font-black text-[#10b981] mb-1">Ingredientes:</h4>
                <p className="text-slate-400 leading-relaxed font-medium">{selectedMeal.ingredients?.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
