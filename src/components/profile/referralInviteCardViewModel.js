const MAX_REFERRAL_REWARDS = 3;

export function getReferralInviteCardViewModel({
  stats = null,
  loading = false,
  expanded = false,
} = {}) {
  const referralCode = stats?.codes?.[0]?.code || "";
  const premiumReferrals = Number(stats?.summary?.premiumActiveReferrals || 0);
  const rewardAvailable = Number(stats?.summary?.rewardAvailableCount || 0) > 0;
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
    rewardAvailable,
    progressValue,
    progressPercent,
    title: "Gana 1 mes Premium gratis",
    badge: "RECOMPENSA PREMIUM",
    subtitle: "Comparte tu código y suma amigos Premium.",
    noCodeRule: "3 pagos Premium confirmados = 1 mes gratis",
    confirmedPaymentsText: "Solo cuentan los pagos Premium confirmados.",
    maxReferralRewards: MAX_REFERRAL_REWARDS,
  };
}
