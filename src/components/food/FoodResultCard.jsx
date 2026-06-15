import { Beef, Droplets, Flame, Sparkles, Wheat } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FoodResultCard({ result, preview }) {
  const { t } = useTranslation();
  if (!result) return null;

  const score = Number(result.score || 0);
  const advice = getShortAdvice(result, t);

  return (
    <section
      className="relative overflow-hidden rounded-[24px] border p-2 shadow-[0_24px_80px_var(--app-glow)]"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top right, var(--app-primary-soft), transparent 42%)",
        }}
      />

      <div className="relative z-10 space-y-2">
        <div className="relative h-[132px] overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {preview || result.image_url ? (
            <img
              src={preview || result.image_url}
              alt={result.food || t("foodResult.analyzedFoodAlt")}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-[var(--app-muted)]">
              {t("foodResult.noImage")}
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--app-surface) 92%, transparent) 0%, color-mix(in srgb, var(--app-surface) 45%, transparent) 58%, transparent 100%)",
            }}
          />

          <div
            className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-xl"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "color-mix(in srgb, var(--app-surface) 55%, transparent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_12px_var(--app-glow)]"
              style={{ backgroundColor: "var(--app-primary)" }}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              {t("foodResult.aiScan")}
            </span>
          </div>

          <div
            className="theme-icon-tile absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-[16px] border backdrop-blur-xl"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-primary-soft)",
            }}
          >
            <div className="text-center">
              <p className="text-[22px] font-black leading-none text-[var(--app-primary)]">
                {score}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
                {t("foodResult.score")}
              </p>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2">
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
              {t("foodResult.detectedFood")}
            </p>

            <h2 className="line-clamp-1 text-[15px] font-black leading-tight text-[var(--app-text)] drop-shadow">
              {result.food || t("foodResult.detectedFood")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_92px] gap-2">
          <div
            className="rounded-[20px] border p-2"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-primary-soft)",
            }}
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[var(--app-primary)]">
              <Flame size={13} />
              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                {t("foodResult.energy")}
              </p>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-[28px] font-black leading-none text-[var(--app-text)]">
                {Math.round(result.calories || 0)}
              </span>
              <span className="pb-0.5 text-[10px] font-black uppercase text-[var(--app-muted)]">
                kcal
              </span>
            </div>
          </div>

          <div
            className="rounded-[20px] border p-2 text-right"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-surface)",
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
              {t("foodResult.proteinLabel")}
            </p>

            <p className="mt-1 text-[23px] font-black leading-none text-[var(--app-primary)]">
              {Math.round(result.protein || 0)}
              <span className="text-[10px]">g</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MacroMini icon={<Beef size={12} />} label={t("foodResult.macros.protein")} value={result.protein} unit="g" />
          <MacroMini icon={<Wheat size={12} />} label={t("foodResult.macros.carbs")} value={result.carbs} unit="g" />
          <MacroMini icon={<Droplets size={12} />} label={t("foodResult.macros.fat")} value={result.fat} unit="g" />
        </div>

        <div className="rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
          <div className="flex items-start gap-2.5">
            <div className="theme-icon-tile grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-[var(--app-surface)]">
              <Sparkles size={15} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {t("foodResult.verdict")}
              </p>

              <p className="mt-0.5 text-xs leading-4 text-[var(--app-text)]/85">
                {advice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroMini({ icon, label, value, unit }) {
  return (
    <div
      className="rounded-xl border p-2"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
      }}
    >
      <div className="mb-1 flex items-center gap-1 text-[var(--app-primary)]">
        {icon}

        <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
          {label}
        </p>
      </div>

      <p className="text-base font-black text-[var(--app-text)]">
        {Math.round(value || 0)}
        <span className="ml-1 text-[10px] text-[var(--app-muted)]">{unit}</span>
      </p>
    </div>
  );
}

function getShortAdvice(result, t) {
  const goal = normalizeFoodGoal(result.goal);
  const score = Number(result.score || 0);
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);

  if (goal === "ganar_musculo") {
    if (protein >= 30 && score >= 8) {
      return t("foodResult.advice.bulk.goodBase");
    }

    if (protein < 20) {
      return t("foodResult.advice.bulk.lowProtein");
    }

    if (calories < 350) {
      return t("foodResult.advice.bulk.lowCalories");
    }

    return t("foodResult.advice.bulk.goodOption");
  }

  if (goal === "perder_grasa") {
    if (calories > 850) return t("foodResult.advice.fatLoss.highCalories");
    if (protein < 20) return t("foodResult.advice.fatLoss.lowProtein");
    return t("foodResult.advice.fatLoss.goodOption");
  }

  if (goal === "mantener_peso") {
    if (score >= 8) return t("foodResult.advice.maintain.goodOption");
    return t("foodResult.advice.maintain.correct");
  }

  if (goal === "recomposicion") {
    if (protein >= 25 && score >= 8) {
      return t("foodResult.advice.recomp.goodOption");
    }

    if (protein < 20) {
      return t("foodResult.advice.recomp.lowProtein");
    }

    return t("foodResult.advice.recomp.medium");
  }

  if (score >= 8) return t("foodResult.advice.generic.goodOption");
  if (protein < 20) return t("foodResult.advice.generic.lowProtein");
  if (calories > 850) return t("foodResult.advice.generic.highCalories");

  return t("foodResult.advice.generic.acceptable");
}

function normalizeFoodGoal(goal) {
  const normalized = String(goal || "").trim().toLowerCase();

  if (
    normalized === "ganar_musculo" ||
    normalized === "ganar músculo" ||
    normalized === "subir"
  ) {
    return "ganar_musculo";
  }

  if (
    normalized === "perder_grasa" ||
    normalized === "perder grasa" ||
    normalized === "bajar"
  ) {
    return "perder_grasa";
  }

  if (normalized === "mantener_peso" || normalized === "mantener") {
    return "mantener_peso";
  }

  if (
    normalized === "recomposicion" ||
    normalized === "recomposición" ||
    normalized === "recomp"
  ) {
    return "recomposicion";
  }

  return "general";
}
