import i18n from "../../i18n";

const MAX_REFERRAL_REWARDS = 3;
const REFERRAL_NORMAL_TRIAL_DAYS = 7;

export function getReferralInviteCardViewModel({
  stats = null,
  loading = false,
  expanded = false,
} = {}) {
  const referralCode = (stats?.codes || [])
    .find((code) => String(code?.type || "").toLowerCase() === "user")?.code || "";
  const premiumReferrals = Number(
    (stats?.premiumReferralsCount ?? stats?.summary?.premiumActiveReferrals ?? 0)
  );
  const rewardsAvailable = Number(
    (stats?.rewardsAvailable ?? stats?.summary?.rewardAvailableCount ?? 0)
  );
  const rewardsClaimed = Number(
    (stats?.rewardsClaimed ?? stats?.summary?.rewardClaimedCount ?? 0)
  );
  const canClaimReward = Boolean(stats?.canClaimReward ?? rewardsAvailable > 0);
  const progressValue = Math.min(premiumReferrals, MAX_REFERRAL_REWARDS);
  const progressPercent = Math.min(
    100,
    Math.round((progressValue / MAX_REFERRAL_REWARDS) * 100)
  );
  const hasCode = Boolean(referralCode);

  return {
    loading,
    expanded: Boolean(expanded && hasCode),
    hasCode,
    referralCode,
    inviteeTrialDays: REFERRAL_NORMAL_TRIAL_DAYS,
    rewardAvailable: canClaimReward,
    canClaimReward,
    rewardsAvailable,
    rewardsClaimed,
    latestReward: stats?.latestReward || null,
    progressValue,
    progressPercent,
    title: i18n.t("referralReward.card.title"),
    badge: i18n.t("referralReward.card.badge"),
    subtitle: i18n.t("referralReward.card.subtitle"),
    noCodeRule: i18n.t("referralReward.card.noCodeRule"),
    confirmedPaymentsText: i18n.t("referralReward.card.confirmedPaymentsText"),
    maxReferralRewards: MAX_REFERRAL_REWARDS,
    nextMilestone: Number(stats?.nextMilestone ?? MAX_REFERRAL_REWARDS),
  };
}

export function buildReferralInviteShareText(referralCode) {
  const safeCode = String(referralCode || "").trim();
  const safeTrialDays = REFERRAL_NORMAL_TRIAL_DAYS;

  return i18n.t("referralReward.shareText", {
    code: safeCode,
    trialDays: safeTrialDays,
  });
}

// TODO: los códigos de creador, sus 15 días gratis, comisiones y métricas
// deben mostrarse en un panel separado de creadores de contenido, no en esta
// tarjeta de referidos normales.
