import { useTranslation } from "react-i18next";
import { getPremiumReferralBannerCopy } from "./premiumReferralBannerCopy";

export function PremiumReferralBanner({ premiumStatus = null }) {
  const { t } = useTranslation();
  const copy = getPremiumReferralBannerCopy(premiumStatus);
  if (!copy) return null;

  return (
    <section className="rounded-[1.05rem] border border-[color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_88%,transparent)_0%,color-mix(in_srgb,var(--app-card)_97%,transparent)_100%)] p-3 shadow-[0_0_20px_var(--app-glow)]">
      <div className="flex items-start gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.95rem] border border-[color-mix(in_srgb,var(--app-primary)_26%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_82%,var(--app-primary-soft))] text-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]">
          <span className="text-[15px] leading-none">✦</span>
        </span>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[var(--app-surface)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {t("premium.referralBanner.badge")}
          </span>
          <h2 className="mt-1.5 text-[14px] font-black leading-tight text-[var(--app-text)]">
            {copy.headline}
          </h2>
          <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
            {copy.description}
          </p>
        </div>
      </div>
    </section>
  );
}
