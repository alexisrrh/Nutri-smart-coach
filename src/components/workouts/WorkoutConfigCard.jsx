import { Dumbbell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DAYS_PER_WEEK_OPTIONS } from "../../data/workoutSplits";
import { WORKOUT_LEVELS } from "../../data/exerciseLibrary";
import { WORKOUT_FOCUS_OPTIONS } from "../../hooks/workouts/useWorkoutConfig";
import {
  getWorkoutLanguage,
} from "../../utils/workoutI18n";

export function WorkoutConfigCard({
  daysPerWeek,
  onGenerate,
  profile,
  selectedFocus,
  selectedLevel,
  setDaysPerWeek,
  setSelectedFocus,
  setSelectedLevel,
  SelectFilter,
  getRecommendedDaysForProfile,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2 shadow-[0_8px_24px_var(--app-glow)]">
      <div className="mb-1.5 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("workouts.config.badge")}
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-[var(--app-muted)]">
            {t("workouts.config.subtitle")}
          </p>
        </div>
        <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
          {t("workouts.config.setup")}
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-1.5 min-[360px]:grid-cols-2">
        <SelectFilter
          label={t("workouts.config.level")}
          value={selectedLevel}
          options={WORKOUT_LEVELS}
          onChange={setSelectedLevel}
          language={language}
        />
        <SelectFilter
          label={t("workouts.config.focus")}
          value={selectedFocus}
          options={WORKOUT_FOCUS_OPTIONS}
          onChange={setSelectedFocus}
          language={language}
        />
      </div>

      <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {t("workouts.config.daysQuestion")}
      </p>
      <div className="mt-1.5 grid min-w-0 grid-cols-5 gap-1">
        {DAYS_PER_WEEK_OPTIONS.map((days) => (
          <button
            type="button"
            key={days}
            onClick={() => setDaysPerWeek(days)}
            className={[
              "h-9 rounded-[0.9rem] border text-[12px] font-black transition active:scale-[0.98]",
              daysPerWeek === days
                ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_18px_var(--app-glow)]"
                : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]",
            ].join(" ")}
          >
            {days}
          </button>
        ))}
      </div>

      <p className="mt-1.5 rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-[10px] font-black text-[var(--app-primary)]">
        {t("workouts.config.recommended", { days: getRecommendedDaysForProfile(profile) })}
      </p>

      <button
        type="button"
        onClick={onGenerate}
        className="mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-[var(--app-primary)] bg-[var(--app-primary)] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-surface)] shadow-[0_10px_26px_var(--app-glow)] transition active:scale-[0.98]"
      >
        <Dumbbell size={16} />
        {t("workouts.config.generate")}
      </button>
    </section>
  );
}
