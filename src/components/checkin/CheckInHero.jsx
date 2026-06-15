import { Sparkles, ScanFace } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CheckInHero({ profile }) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3 shadow-2xl shadow-black/20">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[var(--app-primary)]">
          <Sparkles size={12} />
          {t("checkin.hero.badge")}
        </div>

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-[28px] bg-[var(--app-primary-soft)] blur-2xl" />
            <div className="theme-icon-tile relative grid h-14 w-14 place-items-center rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)]/95 text-[var(--app-primary)]">
              <ScanFace size={26} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-black uppercase italic leading-[0.9] tracking-tight text-[var(--app-text)] sm:text-4xl">
              {t("checkin.hero.title")}
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-[var(--app-muted)]">
              {t("checkin.hero.subtitle")}
            </p>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
              {t("checkin.hero.objectiveLabel")}
              <span className="text-[var(--app-primary)]">
                {profile?.goal || t("checkin.hero.objectiveFallback")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
