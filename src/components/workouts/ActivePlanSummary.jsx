export function ActivePlanSummary({
  daysPerWeek,
  planMeta,
  planStats,
  selectedFocus,
  selectedLevel,
  onAdjust,
}) {
  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 shadow-[0_8px_20px_var(--app-glow)]">
      <div className="flex min-w-0 flex-col items-start gap-2">
        <div className="w-full min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Plan semanal
          </p>
          <p className="mt-1 max-w-full break-words text-[13px] font-black leading-tight text-[var(--app-text)] line-clamp-2">
            {planMeta?.planName || `${selectedLevel} · ${selectedFocus} · ${daysPerWeek} días`}
          </p>
          <p className="mt-1 min-w-0 break-words text-[9px] font-bold text-[var(--app-muted)]">
            {selectedLevel} · {daysPerWeek} días · {selectedFocus}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 text-[9px] font-bold text-[var(--app-muted)]">
              Progreso semanal
            </span>
            <div className="h-1 w-16 max-w-full shrink-0 overflow-hidden rounded-full bg-[var(--app-surface)]">
              <div
                className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                style={{ width: `${planStats.weeklyProgress}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-[var(--app-primary)]">
              {planStats.weeklyProgress}%
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdjust}
          className="shrink-0 whitespace-nowrap rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-4 py-1.5 text-[12px] font-black uppercase tracking-[0.08em] text-[var(--app-primary)] transition active:scale-[0.98]"
        >
          Ajustar plan
        </button>
      </div>
    </section>
  );
}
