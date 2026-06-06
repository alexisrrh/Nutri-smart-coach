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
  const isCreator = isCreatorReferral(acquisitionSource, trialSource);
  const trialDays = resolveTrialDays(premiumStatus, isCreator);
  const title = isCreator ? "Código de creador aplicado" : "Código aplicado";

  return {
    visible: true,
    title,
    trialDays,
    headline: `${title}: obtendrás ${trialDays} días Premium gratis.`,
    description: "Se requiere método de pago y puedes cancelar antes del primer cobro.",
  };
}

function resolveTrialDays(premiumStatus, isCreator) {
  const rawTrialDays = Number(premiumStatus?.trial_days || 0);
  if (rawTrialDays > 0) return rawTrialDays;
  return isCreator ? 15 : 7;
}

function isCreatorReferral(acquisitionSource, trialSource) {
  return (
    acquisitionSource === "creator" ||
    acquisitionSource === "influencer" ||
    trialSource === "creator_trial" ||
    trialSource === "influencer_trial"
  );
}
