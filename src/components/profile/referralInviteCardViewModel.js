const MAX_REFERRAL_REWARDS = 3;
const REFERRAL_NORMAL_TRIAL_DAYS = 7;

export function getReferralInviteCardViewModel({
  stats = null,
  loading = false,
  expanded = false,
} = {}) {
  const referralCode = stats?.codes?.[0]?.code || "";
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
    title: "Gana 1 mes Premium gratis",
    badge: "RECOMPENSA PREMIUM",
    subtitle: "Comparte tu código y suma amigos Premium.",
    noCodeRule: "3 pagos Premium confirmados = 1 mes gratis",
    confirmedPaymentsText: "Solo cuentan los pagos Premium confirmados.",
    maxReferralRewards: MAX_REFERRAL_REWARDS,
    nextMilestone: Number(stats?.nextMilestone ?? MAX_REFERRAL_REWARDS),
  };
}

export function buildReferralInviteShareText(referralCode) {
  const safeCode = String(referralCode || "").trim();
  const safeTrialDays = REFERRAL_NORMAL_TRIAL_DAYS;

  return `Únete a Nutri Smart Coach con mi código ${safeCode} y consigue ${safeTrialDays} días Premium gratis.`;
}

// TODO: los códigos de creador, sus 15 días gratis, comisiones y métricas
// deben mostrarse en un panel separado de creadores de contenido, no en esta
// tarjeta de referidos normales.
