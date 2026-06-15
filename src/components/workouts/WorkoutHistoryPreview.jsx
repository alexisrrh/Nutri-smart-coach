import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PremiumEmptyState } from "../ui";

export function WorkoutHistoryPreview({ sessions, onOpen, WorkoutHistoryCard }) {
  const { t } = useTranslation();
  const recentSessions = getRecentWorkoutSessionsFromList(sessions, 1);
  const latestSession = recentSessions[0];

  if (!latestSession) {
    return (
      <PremiumEmptyState
        icon={Activity}
        title={t("workouts.history.preview.emptyTitle")}
        description={t("workouts.history.preview.emptyDescription")}
        actionLabel={t("workouts.history.preview.action")}
        onAction={onOpen}
        className="py-4"
      />
    );
  }

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] p-1.5 shadow-[0_6px_16px_var(--app-glow)]">
      <div className="mb-1 flex min-w-0 items-center justify-between gap-2 px-0.5">
        <h2 className="min-w-0 text-[13px] font-black text-[var(--app-text)]">
          {t("workouts.history.preview.title")}
        </h2>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] transition active:scale-[0.98]"
        >
          {t("workouts.history.preview.button")}
        </button>
      </div>

      <WorkoutHistoryCard session={latestSession} compact />
    </section>
  );
}

function getRecentWorkoutSessionsFromList(sessions, limit) {
  return [...sessions]
    .sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date))
    .slice(0, limit);
}
