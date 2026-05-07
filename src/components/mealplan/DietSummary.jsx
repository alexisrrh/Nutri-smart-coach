import React from "react";
import { Flame, Apple, Activity, Target } from "lucide-react";

function SummaryCard({ icon, title, value, unit, colorClass }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#07120d] p-4">
      <div className={`rounded-lg p-2.5 bg-white/5 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-xl font-black text-white mt-0.5">
          {value} <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
        </p>
      </div>
    </div>
  );
}

export function DietSummary({ plan, getWeekTotals }) {
  const totals = React.useMemo(() => {
    if (!plan || plan.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return getWeekTotals(plan);
  }, [plan, getWeekTotals]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full">
      <SummaryCard 
        icon={<Flame size={18} />} 
        title="Kcal Semanales" 
        value={Math.round(totals.calories)} 
        unit="kcal" 
        colorClass="text-emerald-400"
      />
      <SummaryCard 
        icon={<Apple size={18} />} 
        title="Proteínas" 
        value={Math.round(totals.protein)} 
        unit="g" 
        colorClass="text-emerald-400"
      />
      <SummaryCard 
        icon={<Activity size={18} />} 
        title="Carbohidratos" 
        value={Math.round(totals.carbs)} 
        unit="g" 
        colorClass="text-emerald-400"
      />
      <SummaryCard 
        icon={<Target size={18} />} 
        title="Grasas" 
        value={Math.round(totals.fat)} 
        unit="g" 
        colorClass="text-emerald-400"
      />
    </div>
  );
}
