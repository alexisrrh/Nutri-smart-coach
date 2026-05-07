import React, { useMemo } from "react";
import { Activity, Beef, Droplets, Flame, Target, Wheat } from "lucide-react";

export function DietSummary({ plan, getWeekTotals }) {
  const totals = useMemo(() => {
    if (!Array.isArray(plan) || plan.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return getWeekTotals(plan);
  }, [plan, getWeekTotals]);

  const daysCount = Array.isArray(plan) ? plan.length : 0;

  const mealsCount = useMemo(() => {
    if (!Array.isArray(plan)) return 0;

    return plan.reduce((acc, day) => {
      const meals = Array.isArray(day?.meals)
        ? day.meals
        : Object.values(day?.meals || {});

      return acc + meals.length;
    }, 0);
  }, [plan]);

  const dailyAverage = {
    calories: daysCount ? Math.round(totals.calories / daysCount) : 0,
    protein: daysCount ? Math.round(totals.protein / daysCount) : 0,
    carbs: daysCount ? Math.round(totals.carbs / daysCount) : 0,
    fat: daysCount ? Math.round(totals.fat / daysCount) : 0,
  };

  const macroCalories = {
    protein: totals.protein * 4,
    carbs: totals.carbs * 4,
    fat: totals.fat * 9,
  };

  const estimatedMacroCalories =
    macroCalories.protein + macroCalories.carbs + macroCalories.fat;

  const percentages = {
    protein: estimatedMacroCalories
      ? Math.round((macroCalories.protein / estimatedMacroCalories) * 100)
      : 0,
    carbs: estimatedMacroCalories
      ? Math.round((macroCalories.carbs / estimatedMacroCalories) * 100)
      : 0,
    fat: estimatedMacroCalories
      ? Math.round((macroCalories.fat / estimatedMacroCalories) * 100)
      : 0,
  };

  if (!Array.isArray(plan) || plan.length === 0) {
    return (
      <div className=" border border-dashed border-white/10 bg-[#07120d] p-5 text-center">
        <Target className="mx-auto mb-2 text-[#10b981]" size={24} />

        <p className="text-xs font-black uppercase tracking-wide text-white">
          Sin resumen nutricional
        </p>

        <p className="mt-1 text-xs normal-case text-slate-500">
          Genera una dieta para calcular calorías y macros.
        </p>
      </div>
    );
  }

  return (
    <section className=" border border-white/5 bg-[#07120d] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#10b981]">
            Resumen nutricional
          </p>

          <h3 className="mt-0.5 text-lg font-black uppercase italic text-white">
            Semana completa
          </h3>
        </div>

        <div className=" border border-white/5 bg-[#0d2218] px-3 py-2 text-right">
          <p className="text-sm font-black text-white">{mealsCount}</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
            comidas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Flame size={15} />}
          title="Calorías"
          value={Math.round(totals.calories)}
          unit="kcal"
          detail={`${dailyAverage.calories}/día`}
        />

        <SummaryCard
          icon={<Beef size={15} />}
          title="Proteína"
          value={Math.round(totals.protein)}
          unit="g"
          detail={`${dailyAverage.protein}g/día`}
        />

        <SummaryCard
          icon={<Wheat size={15} />}
          title="Carbos"
          value={Math.round(totals.carbs)}
          unit="g"
          detail={`${dailyAverage.carbs}g/día`}
        />

        <SummaryCard
          icon={<Droplets size={15} />}
          title="Grasas"
          value={Math.round(totals.fat)}
          unit="g"
          detail={`${dailyAverage.fat}g/día`}
        />
      </div>

      <div className="mt-3 border border-white/5 bg-[#0d2218]/60 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
            <Activity size={12} className="text-[#10b981]" />
            Macros
          </div>

          <div className="flex gap-2 text-[9px] font-black uppercase text-slate-500">
            <span>P {percentages.protein}%</span>
            <span>C {percentages.carbs}%</span>
            <span>G {percentages.fat}%</span>
          </div>
        </div>

        <div className="flex h-2 overflow-hidden bg-white/5">
          <div
            className="bg-[#10b981]"
            style={{ width: `${percentages.protein}%` }}
          />
          <div
            className="bg-white/45"
            style={{ width: `${percentages.carbs}%` }}
          />
          <div
            className="bg-white/20"
            style={{ width: `${percentages.fat}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ icon, title, value, unit, detail }) {
  return (
    <div className=" border border-white/5 bg-[#0d2218]/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#10b981]/10 text-[#10b981]">
          {icon}
        </div>

        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
          {unit}
        </span>
      </div>

      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold normal-case text-slate-500">
        {detail}
      </p>
    </div>
  );
}