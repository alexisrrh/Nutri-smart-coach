import { useMemo } from "react";
import { Activity, Beef, Droplets, Flame, Target, Wheat } from "lucide-react";

export function DietSummary({ plan = [], getWeekTotals }) {
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
      <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-4 text-center">
        <Target className="mx-auto mb-2 text-[#10b981]" size={26} />

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
    <section className="relative overflow-hidden rounded-[24px] border border-[#10b981]/15 bg-[#07170f] p-2.5 shadow-[0_24px_80px_rgba(16,185,129,0.08)]">
      <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#10b981]">
              Resumen nutricional
            </p>

            <h3 className="mt-0.5 text-base font-black uppercase italic leading-none text-white">
              Semana completa
            </h3>

            <p className="mt-1 text-[10px] normal-case text-slate-500">
              {daysCount} días · {mealsCount} comidas
            </p>
          </div>

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[#10b981]/20 bg-[#10b981]/10 text-center">
            <div>
              <p className="text-base font-black text-[#10b981]">{mealsCount}</p>
              <p className="text-[10px] font-black uppercase tracking-tight text-white/45">
                comidas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
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

        <div className="mt-2 rounded-[18px] border border-white/10 bg-black/20 p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
              <Activity size={12} className="text-[#10b981]" />
              Distribución macros
            </div>

            <div className="flex gap-2 text-[10px] font-black uppercase text-slate-500">
              <span>P {percentages.protein}%</span>
              <span>C {percentages.carbs}%</span>
              <span>G {percentages.fat}%</span>
            </div>
          </div>

          <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
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
      </div>
    </section>
  );
}

function SummaryCard({ icon, title, value, unit, detail }) {
  return (
    <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/20 p-2">
      <div className="mb-1 flex items-center justify-between gap-1">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
          {icon}
        </div>

        <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
          {unit}
        </span>
      </div>

      <p className="truncate text-[10px] font-black uppercase tracking-tight text-slate-500">
        {title}
      </p>

      <p className="mt-1 truncate text-sm font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-[10px] font-bold normal-case text-slate-500">
        {detail}
      </p>
    </div>
  );
}
