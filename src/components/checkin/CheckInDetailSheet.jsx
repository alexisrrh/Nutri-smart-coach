import { useEffect } from "react";
import { Camera, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate, shortText } from "./checkinUtils";

export function CheckInDetailSheet({ checkin, mode = "detail", onClose }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "es";

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!checkin) return null;

  const image = checkin.image_url || null;
  const title = mode === "analysis" ? t("checkin.detail.analysisTitle") : t("checkin.detail.detailTitle");
  const subtitle =
    mode === "analysis"
      ? t("checkin.detail.analysisSubtitle")
      : t("checkin.detail.detailSubtitle");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--app-bg)]/60 px-2 pb-2 pt-10 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <style>{`
        @keyframes checkinSheetIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[86dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[30px] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-18px_60px_rgba(0,0,0,0.45)]"
        style={{ animation: "checkinSheetIn 220ms ease-out" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center py-2">
          <div className="h-1.5 w-12 rounded-full bg-[var(--app-surface)]" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[92px] pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {image ? (
            <div className="relative mb-3 h-40 overflow-hidden rounded-[24px] bg-[var(--app-surface)]">
              <img
                src={image}
                alt={checkin.food || t("checkin.detail.imageAlt")}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/25 to-transparent" />
              <div className="absolute left-3 top-3 rounded-full bg-[var(--app-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--app-primary)] backdrop-blur-xl">
                {mode === "analysis"
                  ? t("checkin.detail.analysisBadge")
                  : t("checkin.detail.detailBadge")}
              </div>
            </div>
          ) : (
            <div className="mb-3 grid h-40 place-items-center rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] text-center">
              <div>
                <Camera className="mx-auto mb-2 text-[var(--app-primary)]" size={26} />
                <p className="text-[10px] font-black uppercase text-[var(--app-text)]">
                  {t("checkin.detail.noPhoto")}
                </p>
              </div>
            </div>
          )}

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                {title}
              </p>

              <h3 className="mt-1 text-2xl font-black uppercase italic leading-[0.95] text-[var(--app-text)]">
                {formatDate(checkin.created_at, locale)}
              </h3>

              <p className="mt-1 text-[11px] leading-4 text-[var(--app-muted)]">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t("checkin.detail.close")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-slate-400 transition hover:border-[var(--app-border)] hover:text-[var(--app-text)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label={t("checkin.detail.metrics.weight")} value={checkin.weight ? `${checkin.weight} kg` : "-"} />
            <Metric label={t("checkin.detail.metrics.waist")} value={checkin.waist ? `${checkin.waist} cm` : "-"} />
            <Metric label={t("checkin.detail.metrics.chest")} value={checkin.chest ? `${checkin.chest} cm` : "-"} />
            <Metric label={t("checkin.detail.metrics.hips")} value={checkin.hips ? `${checkin.hips} cm` : "-"} />
          </div>

          <div className="mt-3 grid gap-2">
            <Metric label={t("checkin.detail.metrics.fat")} value={checkin.body_fat_range || t("checkin.detail.noEstimable")} />
            <Metric label={t("checkin.detail.metrics.confidence")} value={checkin.confidence ? `${checkin.confidence}%` : "-"} />
          </div>

          <div className="mt-3 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t("checkin.detail.changesTitle")}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[var(--app-text)]">
              {checkin.visual_changes ||
                t("checkin.detail.changesFallback")}
            </p>
          </div>

          <div className="mt-3 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t("checkin.detail.recommendationTitle")}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[var(--app-text)]">
              {checkin.recommendation ||
                t("checkin.detail.recommendationFallback")}
            </p>
          </div>

          {checkin.notes ? (
            <div className="mt-3 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {t("checkin.detail.noteTitle")}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-300">
                {shortText(checkin.notes, 260)}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-2xl bg-[var(--app-primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-surface)] shadow-[0_20px_60px_var(--app-glow)] transition hover:bg-[var(--app-primary-soft)]"
          >
            {t("checkin.detail.close")}
          </button>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}
