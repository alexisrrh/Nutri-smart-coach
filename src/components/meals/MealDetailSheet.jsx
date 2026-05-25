import { useEffect } from "react";

export function MealDetailSheet({ meal, onClose, onDelete }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const dateValue = meal?.createdAt || meal?.created_at || new Date(0).toISOString();
  const date = new Date(dateValue).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const time = new Date(dateValue).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const image = meal?.image || meal?.image_url || meal?.imageUrl || null;
  const score = Number(meal?.score) || null;

  return (
    <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--app-bg)]/60 px-2 pb-2 pt-10 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <style>{`
        @keyframes mealSheetIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de comida"
        className="flex max-h-[75vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[30px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_-18px_60px_rgba(0,0,0,0.45)]"
        style={{ animation: "mealSheetIn 220ms ease-out" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center py-1.5">
          <div className="h-1.5 w-12 rounded-full bg-[var(--app-primary-soft)]" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {image && (
            <div className="relative mb-2.5 h-[150px] overflow-hidden rounded-[22px] bg-[var(--app-surface)]">
              <img src={image} alt={meal.food || "Comida analizada"} className="h-full w-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/85 via-[var(--app-surface)]/14 to-transparent" />
              <div className="absolute left-2 top-2 rounded-full bg-[var(--app-surface)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] backdrop-blur-xl">
                Análisis IA
              </div>
            </div>
          )}

          <div className="mb-2.5 flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                {meal.mealType || "Comida"}
              </p>

              <h3 className="mt-1 line-clamp-2 text-[18px] font-extrabold leading-[1.02] text-[var(--app-text)]">
                {meal.food || "Comida analizada"}
              </h3>

              <p className="mt-1 text-[11px] leading-4 text-[var(--app-muted)]">
                {date} · {time}
              </p>
            </div>

            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
              <div className="text-center">
                <p className="text-[20px] font-black leading-none">{score ?? "—"}</p>
                <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                  score
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <MetricBox label="Kcal" value={meal.calories} unit="kcal" />
            <MetricBox label="Proteína" value={meal.protein} unit="g" accent />
            <MetricBox label="Carbs" value={meal.carbs} unit="g" />
            <MetricBox label="Grasas" value={meal.fat} unit="g" />
          </div>

          {meal.recommendation && (
            <div className="mt-2.5 rounded-[20px] bg-[var(--app-primary-soft)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--app-border)]">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                Recomendación IA
              </p>
              <p className="line-clamp-3 text-[11px] leading-4 text-[var(--app-muted)]">
                {meal.recommendation}
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl bg-red-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-red-200 transition active:scale-[0.98] hover:bg-red-400/15"
            >
              Borrar análisis
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-[var(--app-primary-soft)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] transition active:scale-[0.98] hover:bg-[var(--app-primary-soft)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricBox({ label, value, unit, accent = false }) {
  return (
    <div className={`rounded-2xl px-2 py-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)] ${
      accent ? "bg-[var(--app-primary-soft)]" : "bg-[var(--app-surface)]"
    }`}>
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className={`mt-0.5 text-[13px] font-black leading-none text-[var(--app-text)]`}>
        {Math.round(Number(value) || 0)}
        <span className="ml-1 text-[9px] text-[var(--app-muted)]">{unit}</span>
      </p>
    </div>
  );
}
