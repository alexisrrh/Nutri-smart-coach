import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Crown, Sparkles, Timer } from "lucide-react";
import {
  formatAiUsageCounter,
  normalizeAiUsageState,
  isPremiumUsage,
} from "../../services/aiUsageService";
import { trackEvent } from "../../services/analytics";
import SurfaceCard from "./SurfaceCard";

const ICON_BY_TYPE = {
  food_analysis: Sparkles,
  diet_generation: Timer,
  checkin_analysis: Timer,
};

export default function AiUsageCard({
  className = "",
  profile,
  type,
  usage,
}) {
  const { t } = useTranslation();
  const premium = isPremiumUsage(usage, profile);
  const normalizedUsage = normalizeAiUsageState(type, usage, profile);
  const Icon = premium ? Crown : ICON_BY_TYPE[type] || Sparkles;
  const title = getUsageTitle({ type, premium, usage: normalizedUsage, profile, t });
  const detail = getUsageDetail({ type, premium, usage: normalizedUsage, profile, t });
  const counter = formatAiUsageCounter(type, usage, profile);
  const periodLabel = getUsagePeriodLabel(normalizedUsage, premium, t);

  return (
    <SurfaceCard
      className={`relative overflow-hidden p-2.5 ${className}`}
      radius="md"
      variant="soft"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: premium
            ? "radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 36%), radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--app-primary) 10%, transparent), transparent 34%)"
            : "radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 36%), radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 34%)",
        }}
      />

      <div className="relative z-10 flex items-start gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border shadow-[0_0_22px_var(--app-glow)] ${
            premium
              ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
              : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)]"
          }`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              {t("food.usage.badge", { periodLabel })}
            </span>
            <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
              {counter}
            </span>
          </div>

          <p className="text-[12px] font-black leading-5 text-[var(--app-text)]">
            {title}
          </p>
          <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
            {detail}
          </p>

          {!premium && (usage?.upgradeAvailable === true || usage?.isLimitReached) ? (
            <Link
              to="/premium"
              onClick={() =>
                trackEvent("premium_limit_cta_clicked", {
                  type,
                })
              }
              className="mt-3 flex items-center justify-between gap-3 rounded-[1.05rem] border border-[color-mix(in_srgb,var(--app-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_86%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-3 py-2.5 text-left shadow-[0_12px_24px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-200 active:scale-[0.985] touch-manipulation hover:-translate-y-[1px]"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold leading-4 text-[var(--app-text)]">
                  {t("food.usage.ctaTitle")}
                </span>
                <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--app-muted)]">
                  {t("food.usage.ctaBadge")}
                </span>
              </span>

              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                <Sparkles size={13} />
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}

function getUsagePeriodLabel(usage, premium, t) {
  const period = usage?.period === "week" ? "week" : "day";
  if (premium) return t("food.usage.period.premium");
  return period === "week" ? t("food.usage.period.week") : t("food.usage.period.day");
}

function getUsageTitle({ type, premium, usage, t }) {
  const remaining = Number(usage?.remaining || 0);
  const period = usage?.period === "week" ? "week" : "day";
  const periodText = period === "week" ? t("food.usage.periodText.week") : t("food.usage.periodText.day");
  const reset = usage?.resetAt ? t("food.usage.resetAt", { time: usage.resetAt }) : t("food.usage.resetFallback");

  if (premium) return t("food.usage.premium.title");
  if (!usage) return t("food.usage.syncing.title");
  if (usage.isLimitReached) return t("food.usage.limitReached.title", { periodText, reset });

  if (type === "food_analysis") {
    return remaining === 1
      ? t("food.usage.remaining.food.one", { periodText })
      : t("food.usage.remaining.food.many", { remaining, periodText });
  }

  if (type === "diet_generation") {
    return remaining === 1
      ? t("food.usage.remaining.diet.one", { periodText })
      : t("food.usage.remaining.diet.many", { remaining, periodText });
  }

  return t("food.usage.remaining.checkin", { remaining, periodText });
}

function getUsageDetail({ premium, usage, t }) {
  if (premium) return t("food.usage.premium.detail");
  if (!usage) return t("food.usage.syncing.detail");
  if (usage.isFallback) return t("food.usage.fallback.detail");
  if (usage.isLimitReached) return t("food.usage.limitReached.detail", { reset: usage.resetAt ? t("food.usage.resetAt", { time: usage.resetAt }) : t("food.usage.resetFallback") });

  const resetText = usage?.period === "week" ? t("food.usage.reset.week") : t("food.usage.reset.day");
  return t("food.usage.available.detail", { resetText, resetTime: usage?.resetAt ? t("food.usage.resetAt", { time: usage.resetAt }) : t("food.usage.resetFallback") });
}
