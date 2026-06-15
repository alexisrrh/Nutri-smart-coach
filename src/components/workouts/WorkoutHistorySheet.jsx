import { Activity, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PremiumEmptyState } from "../ui";

export function WorkoutHistorySheet({ sessions, onClose, WorkoutHistoryCard }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 px-2 pb-[var(--bottom-nav-space)] backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-12px_38px_rgba(0,0,0,0.42)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  {t("workouts.history.sheet.badge")}
                </p>
                <h2 className="mt-0.5 text-[20px] font-black leading-none text-[var(--app-text)]">
                  {t("workouts.history.sheet.title")}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
                aria-label={t("workouts.history.sheet.close")}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-2.5 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sessions.length ? (
              <div className="grid gap-1.5">
                {sessions.map((session) => (
                  <WorkoutHistoryCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
                <PremiumEmptyState
                  icon={Activity}
                  title={t("workouts.history.sheet.emptyTitle")}
                  description={t("workouts.history.sheet.emptyDescription")}
                  className="py-5"
                />
              )}
          </div>
        </div>
      </section>
    </div>
  );
}
