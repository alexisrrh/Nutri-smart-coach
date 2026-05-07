import React, { useMemo } from "react";
import { Activity, Beef, Droplets, Flame, Target, Wheat } from "lucide-react";

function SummaryCard({ icon, title, value, unit, detail, percentage = 0 }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#07120d] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#10b981]/10 text-[#10b981]">
          {icon}
        </div>

        <span className="text-[10px] font-black text-[#10b981]">
          {percentage}%
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-black leading-none text-white sm:text-2xl">
          {value}
          <span className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            {unit}
          </span>
        </p>

        <p className="mt-1 text-[10px] font-bold normal-case text-slate-500">
          {detail}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981] transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

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
    calories: 100,
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
      <div className="rounded-xl border border-dashed border-white/10 bg-[#07120d] p-5 text-center">
        <Target className="mx-auto mb-2 text-[#10b981]" size={24} />

        <p className="text-xs font-black uppercase tracking-wide text-white">
          Sin resumen nutricional
        </p>

        <p className="mt-1 text-xs normal-case text-slate-500">
          Genera una dieta para calcular calorías y macros semanales.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#10b981]">
            Resumen nutricional
          </p>

          <h3 className="mt-1 text-xl font-black uppercase italic text-white">
            Semana completa
          </h3>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#0d2218] px-3 py-2 text-right">
          <p className="text-sm font-black text-white">{mealsCount}</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
            comidas
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Flame size={18} />}
          title="Calorías"
          value={Math.round(totals.calories)}
          unit="kcal"
          detail={`${dailyAverage.calories} kcal/día`}
          percentage={percentages.calories}
        />

        <SummaryCard
          icon={<Beef size={18} />}
          title="Proteína"
          value={Math.round(totals.protein)}
          unit="g"
          detail={`${dailyAverage.protein}g/día`}
          percentage={percentages.protein}
        />

        <SummaryCard
          icon={<Wheat size={18} />}
          title="Carbos"
          value={Math.round(totals.carbs)}
          unit="g"
          detail={`${dailyAverage.carbs}g/día`}
          percentage={percentages.carbs}
        />

        <SummaryCard
          icon={<Droplets size={18} />}
          title="Grasas"
          value={Math.round(totals.fat)}
          unit="g"
          detail={`${dailyAverage.fat}g/día`}
          percentage={percentages.fat}
        />
      </div>

      <div className="rounded-xl border border-white/5 bg-[#07120d] p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Activity size={13} className="text-[#10b981]" />
          Distribución estimada de macros
        </div>

        <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="bg-[#10b981]"
            style={{ width: `${percentages.protein}%` }}
          />
          <div
            className="bg-white/50"
            style={{ width: `${percentages.carbs}%` }}
          />
          <div
            className="bg-white/20"
            style={{ width: `${percentages.fat}%` }}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-bold normal-case text-slate-500">
          <span>Proteína {percentages.protein}%</span>
          <span>Carbos {percentages.carbs}%</span>
          <span>Grasas {percentages.fat}%</span>
        </div>
      </div>
    </section>
  );
}