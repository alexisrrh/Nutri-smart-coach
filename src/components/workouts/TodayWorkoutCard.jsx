import { CheckCircle2, Flame, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getWorkoutLanguage,
  translateWorkoutText,
} from "../../utils/workoutI18n";

export function TodayWorkoutCard({ day, onStart, todayCompletion }) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  return (
    <section className="relative w-full max-w-full min-w-0 overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2 shadow-[0_8px_22px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,var(--app-primary-soft),transparent_42%)]" />
      <div className="relative z-10">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="flex min-w-0 items-center gap-1 text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              <Flame size={11} />
              {t("workouts.today.badge")}
            </p>
            <h2 className="mt-0.5 break-words text-[16px] font-black leading-tight text-[var(--app-text)] line-clamp-2">
              {translateWorkoutText(day.name, language)}
            </h2>
            <p className="mt-0.5 text-[10px] font-bold text-[var(--app-muted)]">
              {day.duration}
            </p>
          </div>
          {todayCompletion ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
              <CheckCircle2 size={10} />
              {t("workouts.today.today")}
            </span>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--app-primary)] px-2.5 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-surface)] shadow-[0_8px_20px_var(--app-glow)] transition active:scale-[0.98]"
            >
              <Play size={12} />
              {t("workouts.today.start")}
            </button>
          )}
        </div>

        {todayCompletion ? (
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 text-[9px] font-black text-[var(--app-primary)]">
            <CheckCircle2 size={11} />
            {t("workouts.today.completed")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
