import { Dumbbell, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import AIScoreRing from "./AIScoreRing";
import AIOrb from "./AIOrb";

export default function AIHeroCard({
  firstName,
  nutritionScore,
  totals,
  goals,
  navigate,
  smartTip,
  todayMeals,
  dailyMealGoal = 4,
}) {
  const { t } = useTranslation();
  return (
    <section
      className="relative overflow-hidden rounded-[1.1rem] border p-[0.7rem] shadow-[0_18px_60px_var(--app-glow)]"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle_at_top_right, var(--app-primary-soft), transparent 38%)",
        }}
      />
      <div
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              {t("dashboard.header.title")}
            </p>

            <h1 className="mt-0.5 text-[26px] font-black leading-none tracking-tight text-[var(--app-text)]">
              {t("dashboard.header.greeting")}{" "}
              <span className="text-[var(--app-primary)]">
                {firstName || t("dashboard.header.fallbackName")}
              </span>
            </h1>

            <p className="mt-1 max-w-[220px] py-2 text-[12px] leading-[1.28] text-[var(--app-muted)]">
              {smartTip}
            </p>
          </div>

          <div className="scale-[0.47] -translate-y-1">
            <AIOrb />
          </div>
        </div>

        <div
          className="-mt-5 mb-3 rounded-[0.9rem] border px-3 py-0"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-surface)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="mb-0.5 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                <Sparkles size={9} className="text-[var(--app-primary)]" />
                {t("dashboard.hero.aiScore")}
              </p>

              <p className="max-w-[170px] text-[12px] leading-[1.25] text-[var(--app-muted)]">
                {t("dashboard.hero.aiScoreHint")}
              </p>
            </div>

            <div className="scale-[0.85]">
              <AIScoreRing score={nutritionScore} />
            </div>
          </div>
        </div>

        <div className="mb-1.5 grid grid-cols-3 gap-1 pb-2">
          <QuickInlineStat
            icon={<Flame size={12} />}
            label={t("dashboard.hero.kcal")}
            current={totals.calories}
            goal={goals.calories}
            unit=""
            accent="text-[var(--app-primary)]"
          />

          <QuickInlineStat
            icon={<Dumbbell size={12} />}
            label={t("dashboard.hero.protein")}
            current={totals.protein}
            goal={goals.protein}
            unit="g"
            accent="text-cyan-300"
          />

          <QuickInlineStat
            icon={<TrendingUp size={12} />}
            label={t("dashboard.hero.meals")}
            current={todayMeals.length}
            goal={dailyMealGoal}
            unit=""
            accent="text-[var(--app-text)]"
          />
        </div>
        <div className="flex justify-center ">
          <HeroActionButton
            primary
            title={t("dashboard.hero.scanCalories")}
            subtitle={t("dashboard.hero.analyzeFood")}
            icon="/icons/scan-icon.png"
            onClick={() => navigate("/foto-comida")}
          />
        </div>
      </div>
    </section>
  );
}
function QuickInlineStat({
  icon,
  label,
  current,
  goal,
  unit = "",
  accent = "text-[var(--app-text)]",
}) {
  const { t } = useTranslation();
  const safeGoal = Number(goal || 0);
  const safeCurrent = Number(current || 0);

  const progress =
    safeGoal > 0
      ? Math.min(100, (safeCurrent / safeGoal) * 100)
      : 0;

  const left = Math.max(0, safeGoal - safeCurrent);

  return (
    <div
      className="rounded-[0.9rem] border px-2 py-1.5"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
      }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <div className="shrink-0 text-[var(--app-primary)]">
            {icon}
          </div>

          <p className="truncate text-[8px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
            {label}
          </p>
        </div>

        <p className="shrink-0 text-[8px] font-bold text-[var(--app-muted)]">
          {left > 0
            ? t("dashboard.hero.left", { count: Math.round(left), unit })
            : t("dashboard.hero.completed")}
        </p>
      </div>

      <div className="mb-1">
        <p className={`text-[13px] font-black leading-none ${accent}`}>
          {Math.round(safeCurrent)}
          {unit}

          <span className="ml-1 text-[11px] text-[var(--app-muted)]">
            / {safeGoal}
            {unit}
          </span>
        </p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--app-surface)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(to right, var(--app-primary), color-mix(in srgb, var(--app-primary) 72%, white))",
          }}
        />
      </div>
    </div>
  );
}

function HeroActionButton({ title, subtitle, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`group relative mx-auto min-h-[50px] w-full max-w-[330px] overflow-hidden rounded-[1.15rem] border px-2.5 py-3.5 transition duration-300 active:scale-[0.98] ${
        primary
          ? "border-[var(--app-border)] text-[var(--app-text)] shadow-[0_16px_36px_var(--app-glow)] hover:border-[var(--app-border)] hover:shadow-[0_18px_42px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-primary-soft)]"
      }`}
      style={
        primary
          ? {
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--app-primary) 35%, var(--app-surface)) 0%, var(--app-primary-soft) 55%, color-mix(in srgb, var(--app-primary) 48%, var(--app-card)) 100%)",
            }
          : undefined
      }
    >
      <div
        className="absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      <div className="relative z-10 flex h-full items-center justify-center gap-6">
        <div
          className="relative grid h-15 w-18 shrink-0 place-items-center overflow-hidden rounded-[0.95rem]"
          style={{ backgroundColor: primary ? "var(--app-surface)" : "var(--app-primary-soft)" }}
        >
          <span
            className="absolute -inset-4 animate-[spin_2.5s_linear_infinite] rounded-full"
            style={{
              opacity: primary ? 0.6 : 1,
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 60%, var(--app-primary) 72%, transparent 90%, transparent 100%)",
            }}
          />

         <span
  className="absolute inset-[2px] rounded-[0.9rem] dashboard-hero-icon"
  style={{
    backgroundColor: primary
      ? "var(--app-card)"
      : "var(--app-surface)",
  }}
/>

          <img
            src={icon}
            alt={title}
            className="relative z-14 h-15 w-20 object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center text-center">
          <p
            className={`text-[12px] font-black uppercase leading-tight tracking-[0.12em] ${
              "text-[var(--app-text)]"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-0.5 text-[10px] font-bold leading-tight ${
              "text-[var(--app-muted)]"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}
