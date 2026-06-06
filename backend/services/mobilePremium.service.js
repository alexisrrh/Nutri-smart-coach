import { supabase } from "../config/supabase.js";
import {
  buildCommissionSubscriptionRef,
  createAcquisitionRepository,
  createAffiliateCommissionForPaidInvoice,
  markReferralPremiumActive,
  normalizeSubscriptionAcquisitionRecord,
  registerSubscriptionAcquisition,
  updateSubscriptionAcquisitionStatus,
} from "./acquisition.service.js";

const MOBILE_PLATFORMS = new Set(["apple", "google"]);
const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export async function verifyMobilePremiumReceipt(payload, options = {}) {
  const normalized = normalizeMobileReceiptPayload(payload);
  const verifier = options.verifier || defaultMobileVerifier;

  const verification = await verifier(normalized, options);
  if (!verification?.verified) {
    throw createPublicError("No se pudo verificar la compra móvil.", 400);
  }

  return verification;
}

export async function syncMobilePremiumVerification(
  { userId, payload },
  options = {}
) {
  const verifyFn = options.verifyMobilePremiumReceiptFn || verifyMobilePremiumReceipt;
  const getProfileByUserIdFn = options.getProfileByUserIdFn;
  const upsertProfileSubscriptionFn = options.upsertProfileSubscriptionFn;
  const repo =
    options.repo || createAcquisitionRepository(options.supabaseClient || supabase);

  if (!getProfileByUserIdFn || !upsertProfileSubscriptionFn) {
    throw new Error("Mobile premium sync requires profile helpers.");
  }

  const verification = await verifyFn(payload, options);
  const paidAt = verification.startedAt || new Date().toISOString();
  const currentProfile = await getProfileByUserIdFn(userId);
  const attribution = await resolveMobileAttribution({
    repo,
    userId,
  });

  const activation = verification.isPaid
    ? await markReferralPremiumActive(
        {
          userId,
          premiumSource: verification.premiumSource,
          platformSubscriptionId:
            verification.platformSubscriptionId || verification.transactionId,
          paidAt,
          status: verification.status,
        },
        options
      )
    : null;

  if (
    verification.isPaid &&
    ["influencer", "creator"].includes(String(activation?.referral?.type || ""))
  ) {
    await createAffiliateCommissionForPaidInvoice(
      {
        influencerUserId: activation.referral.referrer_user_id,
        referredUserId: userId,
        referralId: activation.referral.id,
        subscriptionId: buildCommissionSubscriptionRef({
          platformSubscriptionId:
            verification.platformSubscriptionId || verification.transactionId,
          invoiceId: verification.transactionId,
        }),
        amount: verification.amount || 0,
        currency: verification.currency || "eur",
        commissionPercent:
          Number(activation.acquisition?.commission_percent || 30) || 30,
        commissionMonthsLimit:
          Number(activation.acquisition?.commission_months_limit || 12) || 12,
        paidAt,
        trialEndsAt: activation.referral.trial_ends_at || null,
        premiumSource: verification.premiumSource,
      },
      options
    );
  }

  if (!verification.isPaid) {
    await registerSubscriptionAcquisition(
      {
        userId,
        premiumSource: verification.premiumSource,
        acquisitionSource: attribution.acquisitionSource,
        referralCodeId: attribution.referralCodeId,
        referrerUserId: attribution.referrerUserId,
        influencerUserId: attribution.influencerUserId,
        trialSource:
          verification.isTrial && attribution.trialSource === "creator_trial"
            ? "creator_trial"
            : verification.isTrial && attribution.trialSource === "influencer_trial"
            ? "influencer_trial"
            : verification.isTrial && attribution.trialSource === "standard_trial"
            ? "standard_trial"
            : "none",
        trialStartedAt: verification.isTrial ? verification.startedAt || null : null,
        trialEndsAt: verification.expiresAt || null,
        commissionPercent: attribution.commissionPercent,
        commissionMonthsLimit: attribution.commissionMonthsLimit,
        platformSubscriptionId:
          verification.platformSubscriptionId || verification.transactionId,
        status: verification.status,
      },
      { ...options, repo }
    );
  }

  await updateSubscriptionAcquisitionStatus(
    {
      userId,
      platformSubscriptionId:
        verification.platformSubscriptionId || verification.transactionId,
      status: verification.status,
      trialStartedAt: verification.isTrial ? verification.startedAt || null : null,
      trialEndsAt: verification.expiresAt || null,
    },
    { ...options, repo }
  );

  await upsertProfileSubscriptionFn(
    buildMobilePremiumProfileUpdate(verification, userId, currentProfile)
  );

  const profile = await getProfileByUserIdFn(userId);
  return {
    premium: serializeMobilePremiumProfile(profile, verification),
    verification,
  };
}

export function buildMobilePremiumProfileUpdate(
  verification,
  userId,
  existingProfile = null
) {
  const isPremium = PREMIUM_STATUSES.has(verification.status);
  const premiumStartedAt = existingProfile?.premium_started_at
    ? existingProfile.premium_started_at
    : isPremium
    ? verification.startedAt || new Date().toISOString()
    : null;

  return {
    id: userId,
    plan: isPremium ? "premium" : "free",
    is_premium: isPremium,
    subscription_status: verification.status || "inactive",
    premium_source: verification.premiumSource,
    premium_product_id: verification.productId || null,
    premium_platform_transaction_id:
      verification.transactionId || verification.platformSubscriptionId || null,
    premium_last_verified_at: new Date().toISOString(),
    premium_started_at: premiumStartedAt,
    premium_expires_at: verification.expiresAt || null,
    updated_at: new Date().toISOString(),
  };
}

export function serializeMobilePremiumProfile(profile, verification = null) {
  return {
    plan: profile?.plan || (PREMIUM_STATUSES.has(verification?.status) ? "premium" : "free"),
    is_premium: Boolean(profile?.is_premium),
    subscription_status: profile?.subscription_status || verification?.status || "inactive",
    premium_source: profile?.premium_source || verification?.premiumSource || null,
    premium_product_id: profile?.premium_product_id || verification?.productId || null,
    premium_platform_transaction_id:
      profile?.premium_platform_transaction_id ||
      verification?.transactionId ||
      verification?.platformSubscriptionId ||
      null,
    premium_expires_at: profile?.premium_expires_at || verification?.expiresAt || null,
    premium_last_verified_at: profile?.premium_last_verified_at || new Date().toISOString(),
    premium_started_at: profile?.premium_started_at || verification?.startedAt || null,
  };
}

export async function defaultMobileVerifier(payload) {
  if (!MOBILE_PLATFORMS.has(payload.platform)) {
    throw createPublicError("Plataforma móvil no soportada.", 400);
  }

  if (payload.platform === "apple") {
    ensureAppleConfig();
  } else {
    ensureGoogleConfig();
  }

  const error = createPublicError(
    "La verificación móvil aún no está disponible en este entorno.",
    501
  );
  throw error;
}

export function normalizeMobileReceiptPayload(payload = {}) {
  const platform = String(payload.platform || "").trim().toLowerCase();
  const normalized = {
    platform,
    productId: String(payload.productId || "").trim(),
    transactionId: String(payload.transactionId || "").trim(),
    receiptData: payload.receiptData || "",
    purchaseToken: payload.purchaseToken || "",
  };

  if (!MOBILE_PLATFORMS.has(platform)) {
    throw createPublicError("Plataforma móvil no soportada.", 400);
  }

  if (!normalized.productId || !normalized.transactionId) {
    throw createPublicError("Faltan datos de la compra móvil.", 400);
  }

  if (platform === "apple" && !normalized.receiptData) {
    throw createPublicError("Falta el recibo de Apple.", 400);
  }

  if (platform === "google" && !normalized.purchaseToken) {
    throw createPublicError("Falta el token de Google Play.", 400);
  }

  return normalized;
}

async function resolveMobileAttribution({ repo, userId }) {
  const latestAcquisition = normalizeSubscriptionAcquisitionRecord(
    await repo.getLatestAcquisitionByUserId(userId)
  );
  if (latestAcquisition) {
    return {
      acquisitionSource: latestAcquisition.acquisition_source || "normal",
      referralCodeId: latestAcquisition.referral_code_id || null,
      referrerUserId: latestAcquisition.referrer_user_id || null,
      influencerUserId: latestAcquisition.influencer_user_id || null,
      trialSource: latestAcquisition.trial_source || "none",
      commissionPercent: Number(latestAcquisition.commission_percent || 0),
      commissionMonthsLimit: Number(latestAcquisition.commission_months_limit || 0),
    };
  }

  const referral = await repo.getReferralByReferredUserId(userId);
  if (referral) {
    return {
      acquisitionSource:
        referral.type === "creator"
          ? "creator"
          : referral.type === "influencer"
            ? "influencer"
            : "referral",
      referralCodeId: referral.referral_code_id || null,
      referrerUserId: referral.referrer_user_id || null,
      influencerUserId:
        referral.type === "creator" || referral.type === "influencer"
          ? referral.referrer_user_id
          : null,
      trialSource:
        referral.type === "creator"
          ? "creator_trial"
          : referral.type === "influencer"
            ? "influencer_trial"
            : "standard_trial",
      commissionPercent: referral.type === "creator" || referral.type === "influencer" ? 30 : 0,
      commissionMonthsLimit:
        referral.type === "creator" || referral.type === "influencer" ? 12 : 0,
    };
  }

  return {
    acquisitionSource: "normal",
    referralCodeId: null,
    referrerUserId: null,
    influencerUserId: null,
    trialSource: "none",
    commissionPercent: 0,
    commissionMonthsLimit: 0,
  };
}

function ensureAppleConfig() {
  const missing = [];
  if (!process.env.APPLE_BUNDLE_ID?.trim()) missing.push("APPLE_BUNDLE_ID");
  if (!process.env.APPLE_SHARED_SECRET?.trim()) missing.push("APPLE_SHARED_SECRET");

  if (missing.length > 0) {
    throw createConfigError(missing);
  }
}

function ensureGoogleConfig() {
  const missing = [];
  if (!process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim()) {
    missing.push("GOOGLE_PLAY_PACKAGE_NAME");
  }
  if (!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim()) {
    missing.push("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
  }

  if (missing.length > 0) {
    throw createConfigError(missing);
  }
}

function createConfigError(missing) {
  const error = new Error(
    `Missing mobile premium configuration: ${missing.join(", ")}`
  );
  error.statusCode = 503;
  error.expose = true;
  return error;
}

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = true;
  return error;
}
