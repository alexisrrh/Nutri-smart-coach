import { ChevronRight, Clock, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MetaBadge } from "../ui";

export function MealCard({ meal, onDelete, deleting, onSelect }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "es";
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const dateValue = meal.createdAt || meal.created_at || new Date(0).toISOString();

  const date = new Date(dateValue).toLocaleDateString(dateLocale, {
    day: "2-digit",
    month: "short",
  });

  const time = new Date(dateValue).toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const score = Number(meal.score) || null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-[22px] bg-[var(--app-surface)] p-2.5 shadow-[inset_0_0_0_1px_var(--app-border)] transition hover:bg-[var(--app-primary-soft)] hover:shadow-[inset_0_0_0_1px_var(--app-glow)]"
    >
      <div className="absolute right-0 top-0 h-16 w-16 bg-[var(--app-primary-soft)] blur-2xl transition group-hover:bg-[var(--app-primary-soft)]" />

      <div className="relative">
        <div className="mb-2 flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <MetaBadge className="px-2 py-0.5 tracking-wide">
                {meal.mealType || t("meal.defaultNames.meal")}
              </MetaBadge>

            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-surface)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
              <Clock size={11} />
              {date} · {time}
            </span>

              {score && (
                <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--app-primary)]">
                  {t("meals.card.scoreLabel")} {score}
                </span>
              )}
            </div>

            <h3 className="line-clamp-1 text-[15px] font-black uppercase italic leading-tight tracking-tight text-[var(--app-text)]">
              {meal.food || t("meals.card.mealFallback")}
            </h3>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
            disabled={deleting}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            className="shrink-0 rounded-2xl bg-[var(--app-surface)] p-2 text-[var(--app-muted)] transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label={t("meals.card.deleteMealAria")}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr] gap-1.5">
          <Mini title="Kcal" value={meal.calories} strong />
          <Mini title="Prot" value={meal.protein} unit="g" strong />
          <Mini title="Carbs" value={meal.carbs} unit="g" />
          <Mini title="Grasa" value={meal.fat} unit="g" />
        </div>

        {meal.recommendation && (
          <div className="mt-2 rounded-2xl bg-[var(--app-primary-soft)] p-2.5 shadow-[inset_0_0_0_1px_var(--app-border)]">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-[var(--app-primary)]">
              {t("meals.card.aiAnalysis")} <ChevronRight size={11} />
            </p>
            <p className="line-clamp-2 text-xs leading-4 text-[var(--app-muted)]">
              {meal.recommendation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Mini({ title, value, unit = "", strong = false }) {
  return (
    <div className={`rounded-2xl p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)] ${
      strong ? "bg-[var(--app-primary-soft)]" : "bg-[var(--app-surface)]"
    }`}>
      <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {title}
      </p>
      <p className="mt-0.5 text-sm font-black text-[var(--app-text)]">
        {Math.round(Number(value) || 0)}
        <span className="ml-1 text-[10px] text-[var(--app-muted)]">{unit}</span>
      </p>
    </div>
  );
}
