export function getPremiumReferralBannerCopy(premiumStatus = null) {
  if (!premiumStatus || premiumStatus.is_premium) return null;

  const referralCodeId = String(premiumStatus.referral_code_id || "").trim();
  if (!referralCodeId) return null;

  const acquisitionSource = String(premiumStatus.acquisition_source || "normal")
    .trim()
    .toLowerCase();
  const trialSource = String(premiumStatus.trial_source || "none")
    .trim()
    .toLowerCase();
  const isInfluencer = acquisitionSource === "influencer" || trialSource === "influencer_trial";
  const trialDays = resolveTrialDays(premiumStatus, isInfluencer);
  const title = isInfluencer
    ? "Código influencer aplicado"
    : "Código aplicado";

  return {
    visible: true,
    title,
    trialDays,
    headline: `${title}: obtendrás ${trialDays} días Premium gratis.`,
    description: "Se requiere método de pago y puedes cancelar antes del primer cobro.",
  };
}

function resolveTrialDays(premiumStatus, isInfluencer) {
  const rawTrialDays = Number(premiumStatus?.trial_days || 0);
  if (rawTrialDays > 0) return rawTrialDays;
  return isInfluencer ? 15 : 7;
}
