import { Flame, Dumbbell, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DailyGoalCard({ totals, goals }) {
  const { t } = useTranslation();
  const caloriesPercent = Math.min(
    100,
    Math.round((totals.calories / goals.calories) * 100)
  );

  const proteinPercent = Math.min(
    100,
    Math.round((totals.protein / goals.protein) * 100)
  );

  return (
    <section
      className="rounded-[22px] border p-2.5"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[var(--app-primary)]" />

          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            {t("food.goal.title")}
          </p>
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
          {t("food.goal.badge")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <GoalItem
          icon={<Flame size={13} />}
          label={t("food.goal.calories")}
          value={totals.calories}
          goal={goals.calories}
          percent={caloriesPercent}
          unit="kcal"
        />

        <GoalItem
          icon={<Dumbbell size={13} />}
          label={t("food.goal.protein")}
          value={totals.protein}
          goal={goals.protein}
          percent={proteinPercent}
          unit="g"
        />
      </div>

      <p className="mt-2 text-xs leading-4 text-[var(--app-muted)]">
        {t("food.goal.subtitle")}
      </p>
    </section>
  );
}

function GoalItem({
  icon,
  label,
  value,
  goal,
  percent,
  unit,
}) {
  return (
    <div
      className="rounded-[16px] border p-2"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--app-primary)]">
          {icon}

          <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
            {label}
          </p>
        </div>

        <p className="text-[10px] font-black text-[var(--app-primary)]">
          {percent}%
        </p>
      </div>

      <p className="text-lg font-black text-[var(--app-text)]">
        {Math.round(value)}
        <span className="ml-1 text-[10px] text-[var(--app-muted)]">
          / {goal}
          {unit}
        </span>
      </p>

        <div className="theme-icon-tile-muted mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--app-surface)" }}>
        <div
          className="h-full rounded-full bg-[var(--app-primary)]"
          style={{ width: `${percent}%`, backgroundColor: "var(--app-primary)" }}
        />
      </div>
    </div>
  );
}
