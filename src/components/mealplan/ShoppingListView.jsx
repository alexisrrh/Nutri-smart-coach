import React, { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

export function ShoppingListView({ plan }) {
  const [checkedItems, setCheckedItems] = useState({});

  const shoppingList = useMemo(() => {
    if (!plan || plan.length === 0) return [];
    const itemsMap = {};
    plan.forEach((day) => {
      if (!day.meals) return;
      Object.values(day.meals).forEach((meal) => {
        if (!meal.ingredients) return;
        meal.ingredients.forEach((ing) => {
          const cleanIng = ing.trim();
          if (cleanIng) itemsMap[cleanIng] = true;
        });
      });
    });
    return Object.keys(itemsMap);
  }, [plan]);

  if (shoppingList.length === 0) return null;

  return (
    <div className="space-y-4 rounded-xl border border-white/5 bg-[#07120d] p-5">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
        <ShoppingBag size={14} /> Lista de la Compra Semanal
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {shoppingList.map((item, idx) => {
          const isChecked = checkedItems[item];
          return (
            <div
              key={idx}
              onClick={() => setCheckedItems(p => ({ ...p, [item]: !p[item] }))}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all select-none ${
                isChecked ? "border-emerald-500/10 bg-emerald-950/5 opacity-40" : "border-white/5 bg-[#0d2218]/40 hover:bg-[#0d2218]"
              }`}
            >
              <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                isChecked ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-white/20"
              }`}>
                {isChecked && <Check size={10} strokeWidth={3} />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wide ${isChecked ? "text-slate-500 line-through" : "text-slate-300"}`}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
