import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Beef, Droplets, Flame, Target, Wheat } from "lucide-react";

export function DietSummary({ plan = [], getWeekTotals }) {
  const { t } = useTranslation();
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
      <div className="rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-center">
        <Target className="mx-auto mb-2 text-[var(--app-primary)]" size={26} />

        <p className="text-xs font-black uppercase tracking-wide text-[var(--app-text)]">
          {t("mealPlan.summary.emptyTitle")}
        </p>

        <p className="mt-1 text-xs normal-case text-slate-500">
          {t("mealPlan.summary.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[var(--app-primary)]/15 bg-[var(--app-card)] p-2.5 shadow-[0_24px_80px_var(--app-glow)]">
      <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-[var(--app-primary)]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
              {t("mealPlan.summary.title")}
            </p>

            <h3 className="mt-0.5 text-base font-black uppercase italic leading-none text-[var(--app-text)]">
              {t("mealPlan.summary.fullWeek")}
            </h3>

            <p className="mt-1 text-[10px] normal-case text-slate-500">
              {t("mealPlan.summary.weekStats", { daysCount, mealsCount })}
            </p>
          </div>

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10 text-center">
            <div>
              <p className="text-base font-black text-[var(--app-primary)]">{mealsCount}</p>
              <p className="text-[10px] font-black uppercase tracking-tight text-[var(--app-muted)]">
                {t("mealPlan.summary.meals")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
            <SummaryCard
              icon={<Flame size={15} />}
              title={t("mealPlan.summary.calories")}
              value={Math.round(totals.calories)}
              unit="kcal"
              detail={t("mealPlan.summary.daily", { value: dailyAverage.calories })}
            />

            <SummaryCard
              icon={<Beef size={15} />}
              title={t("mealPlan.summary.protein")}
              value={Math.round(totals.protein)}
              unit="g"
              detail={t("mealPlan.summary.dailyWithUnit", { value: dailyAverage.protein, unit: "g" })}
            />

            <SummaryCard
              icon={<Wheat size={15} />}
              title={t("mealPlan.summary.carbs")}
              value={Math.round(totals.carbs)}
              unit="g"
              detail={t("mealPlan.summary.dailyWithUnit", { value: dailyAverage.carbs, unit: "g" })}
            />

            <SummaryCard
              icon={<Droplets size={15} />}
              title={t("mealPlan.summary.fat")}
              value={Math.round(totals.fat)}
              unit="g"
              detail={t("mealPlan.summary.dailyWithUnit", { value: dailyAverage.fat, unit: "g" })}
            />
          </div>

        <div className="mt-2 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
              <Activity size={12} className="text-[var(--app-primary)]" />
              {t("mealPlan.summary.macroDistribution")}
            </div>

            <div className="flex gap-2 text-[10px] font-black uppercase text-slate-500">
              <span>{t("mealPlan.summary.proteinShort")} {percentages.protein}%</span>
              <span>{t("mealPlan.summary.carbsShort")} {percentages.carbs}%</span>
              <span>{t("mealPlan.summary.fatShort")} {percentages.fat}%</span>
            </div>
          </div>

          <div className="flex h-2 overflow-hidden rounded-full bg-[var(--app-surface)]">
            <div
              className="bg-[var(--app-primary)]"
              style={{ width: `${percentages.protein}%` }}
            />
            <div
              className="bg-[var(--app-primary)]"
              style={{ width: `${percentages.carbs}%` }}
            />
            <div
              className="bg-[var(--app-surface)]"
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
    <div className="min-w-0 rounded-[16px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
      <div className="mb-1 flex items-center justify-between gap-1">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
          {icon}
        </div>

        <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
          {unit}
        </span>
      </div>

      <p className="truncate text-[10px] font-black uppercase tracking-tight text-slate-500">
        {title}
      </p>

      <p className="mt-1 truncate text-sm font-black leading-none text-[var(--app-text)]">
        {value}
      </p>

      <p className="mt-1 truncate text-[10px] font-bold normal-case text-slate-500">
        {detail}
      </p>
    </div>
  );
}
