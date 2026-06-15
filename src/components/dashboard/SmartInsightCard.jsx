import { Lightbulb, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SmartInsightCard({
  smartTip,
  nutritionScore,
  mealCount = 0,
  hasDiet = false,
}) {
  const { t } = useTranslation();
  const insight = getInsight({
    smartTip,
    nutritionScore,
    mealCount,
    hasDiet,
    t,
  });

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[0_20px_70px_var(--app-glow)]">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Lightbulb size={19} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-muted)]">
                {t("dashboard.ai.insight.badge")}
              </p>

              <h3 className="mt-1 text-lg font-black italic leading-tight text-[var(--app-text)]">
                {insight.title}
              </h3>
            </div>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${insight.badgeClass}`}
          >
            {insight.status}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--app-muted)]">
          {insight.text}
        </p>

        <div className="mt-4 rounded-[1.4rem] border border-[var(--app-border)] bg-[var(--app-card)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target size={15} className="text-[var(--app-primary)]" />

            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--app-muted)]">
              {t("dashboard.ai.insight.nextStep")}
            </p>
          </div>

          <p className="text-sm font-bold leading-relaxed text-[var(--app-text)]">
            {insight.action}
          </p>
        </div>
      </div>
    </section>
  );
}

function getInsight({ smartTip, nutritionScore, mealCount, hasDiet, t }) {
  if (!hasDiet) {
    return {
      status: t("dashboard.ai.insight.status.configure"),
      badgeClass: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
      title: t("dashboard.ai.insight.noDiet.title"),
      text: t("dashboard.ai.insight.noDiet.text"),
      action: t("dashboard.ai.insight.noDiet.action"),
    };
  }

  if (mealCount === 0) {
    return {
      status: t("dashboard.ai.insight.status.pending"),
      badgeClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      title: t("dashboard.ai.insight.noMeals.title"),
      text: t("dashboard.ai.insight.noMeals.text"),
      action: t("dashboard.ai.insight.noMeals.action"),
    };
  }

  if (nutritionScore >= 8) {
    return {
      status: t("dashboard.ai.insight.status.excellent"),
      badgeClass: "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
      title: t("dashboard.ai.insight.excellent.title"),
      text: t("dashboard.ai.insight.excellent.text"),
      action: t("dashboard.ai.insight.excellent.action"),
    };
  }

  if (nutritionScore >= 5) {
    return {
      status: t("dashboard.ai.insight.status.improvable"),
      badgeClass: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
      title: t("dashboard.ai.insight.improvable.title"),
      text: smartTip || t("dashboard.ai.insight.improvable.text"),
      action: t("dashboard.ai.insight.improvable.action"),
    };
  }

  return {
    status: t("dashboard.ai.insight.status.attention"),
    badgeClass: "border-red-400/20 bg-red-400/10 text-red-300",
    title: t("dashboard.ai.insight.attention.title"),
    text: smartTip || t("dashboard.ai.insight.attention.text"),
    action: t("dashboard.ai.insight.attention.action"),
  };
}
