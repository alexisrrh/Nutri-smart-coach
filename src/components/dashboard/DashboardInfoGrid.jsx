import { Camera, CalendarCheck, History, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardInfoGrid({
  lastMeal,
  lastCheckin,
  navigate,
  shortText,
}) {
  const { t, i18n } = useTranslation();
  const hasMeal = Boolean(lastMeal);
  const hasCheckin = Boolean(lastCheckin);

  return (
    <section className="space-y-3">
      <div className="px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-primary)]/60">
          {t("dashboard.summary.quick")}
        </p>

        <h3 className="mt-1 text-lg font-black text-[var(--app-text)]">
          {t("dashboard.summary.latest")}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <InfoRow
          icon={<Camera size={18} />}
          title={t("dashboard.summary.lastMeal")}
          value={hasMeal ? shortText(lastMeal?.food || t("dashboard.summary.lastMeal"), 34) : t("dashboard.summary.noMeal")}
          detail={
            hasMeal
              ? `${Math.round(lastMeal.calories || 0)} kcal · ${Math.round(
                  lastMeal.protein || 0
                )}g ${t("dashboard.hero.protein").toLowerCase()}`
              : t("dashboard.summary.mealHelp")
          }
          badge={hasMeal ? t("dashboard.summary.mealRecorded") : t("dashboard.summary.mealPending")}
          active={hasMeal}
          onClick={() => navigate(hasMeal ? "/comidas" : "/foto-comida")}
        />

        <InfoRow
          icon={<Trophy size={18} />}
          title={t("dashboard.summary.lastCheckin")}
          value={hasCheckin ? `${lastCheckin.weight || "-"} kg` : t("dashboard.summary.noCheckin")}
          detail={
            hasCheckin
              ? `${formatDate(lastCheckin.created_at, i18n.resolvedLanguage || i18n.language)} · ${
                  lastCheckin.body_fat_range || t("dashboard.summary.noFatEstimate")
                }`
              : t("dashboard.summary.checkinHelp")
          }
          badge={hasCheckin ? t("dashboard.summary.checkinUpdated") : t("dashboard.summary.checkinPending")}
          active={hasCheckin}
          onClick={() => navigate("/checkin")}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/comidas")}
          className="rounded-2xl border p-4 text-left transition hover:bg-[var(--app-primary-soft)]"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
        >
            <History size={18} className="text-[var(--app-primary)]" />
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[var(--app-text)]">
              {t("dashboard.summary.history")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--app-muted)]">
              {t("dashboard.summary.historyDesc")}
            </p>
          </button>

          <button
            onClick={() => navigate("/progreso")}
          className="rounded-2xl border p-4 text-left transition hover:bg-[var(--app-primary-soft)]"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
        >
            <CalendarCheck size={18} className="text-[var(--app-primary)]" />
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[var(--app-text)]">
              {t("dashboard.summary.progress")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--app-muted)]">
              {t("dashboard.summary.progressDesc")}
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, title, value, detail, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[1.7rem] border p-4 text-left transition hover:bg-[var(--app-primary-soft)]"
      style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
    >
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: "var(--app-primary-soft)" }} />

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={`theme-icon-tile grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            active
              ? "bg-[var(--app-primary)] text-[var(--app-surface)]"
              : "border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--app-muted)]">
              {title}
            </p>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-widest ${
                active
                  ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "bg-yellow-400/10 text-yellow-300"
              }`}
            >
              {badge}
            </span>
          </div>

          <p className="truncate text-base font-black text-[var(--app-text)]">
            {value}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-muted)]">
            {detail}
          </p>
        </div>
      </div>
    </button>
  );
}

function formatDate(value, locale = "es-ES") {
  if (!value) return "Sin fecha";

  const effectiveLocale = locale === "en" ? "en-US" : "es-ES";

  return new Date(value).toLocaleDateString(effectiveLocale, {
    day: "2-digit",
    month: "short",
  });
}
