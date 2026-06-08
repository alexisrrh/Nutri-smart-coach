import { createSign } from "node:crypto";
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
const APPLE_SERVER_API_AUDIENCE = "appstoreconnect-v1";
const APPLE_SERVER_API_BASE_PRODUCTION =
  "https://api.storekit.itunes.apple.com/inApps/v1";
const APPLE_SERVER_API_BASE_SANDBOX =
  "https://api.storekit-sandbox.itunes.apple.com/inApps/v1";
const GOOGLE_PLAY_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PLAY_API_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3";
const GOOGLE_PLAY_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const MOBILE_PREMIUM_CATALOG = {
  premium_monthly: { amount: 7.99, currency: "eur" },
  premium_yearly: { amount: 59.99, currency: "eur" },
};

export async function verifyMobilePremiumReceipt(payload, options = {}) {
  const normalized = normalizeMobileReceiptPayload(payload);
  const verifier = options.verifier || defaultMobileVerifier;

  try {
    const verification = await verifier(normalized, options);
    if (!verification?.verified) {
      throw createPublicError("No se pudo verificar la compra móvil.", 400);
    }

    return verification;
  } catch (error) {
    logMobileVerificationFailure(normalized, error, options.logger || console);
    throw error;
  }
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
        paymentReference: verification.transactionId || verification.platformSubscriptionId || null,
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
    return verifyApplePurchase(payload);
  }

  if (payload.platform === "google") {
    ensureGoogleConfig();
    return verifyGooglePlayPurchase(payload);
  }

  const error = createPublicError(
    "La verificación móvil aún no está disponible en este entorno.",
    501
  );
  throw error;
}

export async function verifyGooglePlayPurchase(payload) {
  ensureGoogleConfig();

  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  const serviceAccount = parseGoogleServiceAccount();
  const accessToken = await getGooglePlayAccessToken(serviceAccount);
  const subscription = await fetchGooglePlaySubscription({
    accessToken,
    packageName,
    subscriptionId: payload.productId,
    purchaseToken: payload.purchaseToken,
  });

  return normalizeGooglePlayVerification(subscription, payload);
}

export async function verifyApplePurchase(payload) {
  ensureAppleConfig();

  const bundleId = process.env.APPLE_BUNDLE_ID?.trim();
  const issuerId = process.env.APPLE_ISSUER_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const privateKey = parseApplePrivateKey();
  const jwt = buildAppleAuthToken({
    bundleId,
    issuerId,
    keyId,
    privateKey,
  });
  const environmentCandidates = resolveAppleEnvironmentCandidates(
    payload.environment || process.env.APPLE_ENVIRONMENT
  );

  const { transaction, environment } = await fetchAppleTransactionWithFallback({
    transactionId: payload.transactionId,
    jwt,
    environmentCandidates,
  });

  const normalized = normalizeAppleTransaction(transaction, payload, environment);
  const catalogEntry = getMobilePremiumCatalogEntry(normalized.productId);

  return {
    verified: true,
    provider: "apple",
    premiumSource: "apple",
    productId: normalized.productId,
    transactionId: normalized.transactionId,
    platformSubscriptionId: normalized.platformSubscriptionId,
    paymentReference: normalized.transactionId,
    status: normalized.status,
    startedAt: normalized.purchasedAt,
    purchasedAt: normalized.purchasedAt,
    expiresAt: normalized.expiresAt,
    amount: catalogEntry.amount,
    currency: catalogEntry.currency,
    isPaid: normalized.isPaid,
    isTrial: normalized.isTrial,
    isActive: normalized.isActive,
    environment: normalized.environment,
    raw: normalized.raw,
  };
}

export function getMobilePremiumConfigStatus(env = process.env) {
  const missing = [];
  const googleConfigured = Boolean(env.GOOGLE_PLAY_PACKAGE_NAME?.trim()) &&
    Boolean(env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim());
  const appleConfigured = Boolean(env.APPLE_BUNDLE_ID?.trim()) &&
    Boolean(env.APPLE_ISSUER_ID?.trim()) &&
    Boolean(env.APPLE_KEY_ID?.trim()) &&
    Boolean(env.APPLE_PRIVATE_KEY?.trim());

  if (!googleConfigured) {
    if (!env.GOOGLE_PLAY_PACKAGE_NAME?.trim()) missing.push("GOOGLE_PLAY_PACKAGE_NAME");
    if (!env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim()) {
      missing.push("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
    }
  }

  if (!appleConfigured) {
    if (!env.APPLE_BUNDLE_ID?.trim()) missing.push("APPLE_BUNDLE_ID");
    if (!env.APPLE_ISSUER_ID?.trim()) missing.push("APPLE_ISSUER_ID");
    if (!env.APPLE_KEY_ID?.trim()) missing.push("APPLE_KEY_ID");
    if (!env.APPLE_PRIVATE_KEY?.trim()) missing.push("APPLE_PRIVATE_KEY");
  }

  return {
    googleConfigured,
    appleConfigured,
    missing,
  };
}

export function normalizeMobileReceiptPayload(payload = {}) {
  const platform = String(payload.platform || "").trim().toLowerCase();
  const normalized = {
    platform,
    productId: String(payload.productId || "").trim(),
    transactionId: String(payload.transactionId || "").trim(),
    originalTransactionId: String(payload.originalTransactionId || "").trim(),
    environment: String(payload.environment || "").trim().toLowerCase(),
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
  if (!process.env.APPLE_ISSUER_ID?.trim()) missing.push("APPLE_ISSUER_ID");
  if (!process.env.APPLE_KEY_ID?.trim()) missing.push("APPLE_KEY_ID");
  if (!process.env.APPLE_PRIVATE_KEY?.trim()) missing.push("APPLE_PRIVATE_KEY");

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

function parseGoogleServiceAccount() {
  try {
    const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim();
    if (!raw) {
      throw createConfigError(["GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"]);
    }

    const serviceAccount = JSON.parse(raw);
    if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
      throw createConfigError(["GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"]);
    }

    return serviceAccount;
  } catch (error) {
    if (error?.statusCode) throw error;
    throw createConfigError(["GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"]);
  }
}

async function getGooglePlayAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const jwtPayload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: GOOGLE_PLAY_SCOPE,
      aud: GOOGLE_PLAY_OAUTH_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = createSign("RSA-SHA256")
    .update(`${jwtHeader}.${jwtPayload}`)
    .sign(serviceAccount.private_key, "base64url");
  const assertion = `${jwtHeader}.${jwtPayload}.${signature}`;

  const response = await fetch(GOOGLE_PLAY_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access_token) {
    throw createPublicError("No se pudo verificar la compra móvil.", 400);
  }

  return data.access_token;
}

async function fetchGooglePlaySubscription({
  accessToken,
  packageName,
  subscriptionId,
  purchaseToken,
}) {
  const safePackageName = String(packageName || "").trim();
  const safeSubscriptionId = String(subscriptionId || "").trim();
  const safePurchaseToken = String(purchaseToken || "").trim();

  if (!safePackageName || !safeSubscriptionId || !safePurchaseToken) {
    throw createPublicError("Faltan datos de la compra móvil.", 400);
  }

  const url = `${GOOGLE_PLAY_API_BASE}/applications/${encodeURIComponent(
    safePackageName
  )}/purchases/subscriptions/${encodeURIComponent(safeSubscriptionId)}/tokens/${encodeURIComponent(safePurchaseToken)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw createPublicError("No se pudo verificar la compra móvil.", 400);
  }

  return data || null;
}

function normalizeGooglePlayVerification(subscription, payload) {
  const expiryTimeMillis = Number(subscription?.expiryTimeMillis || 0);
  const startTimeMillis = Number(subscription?.startTimeMillis || 0);
  const now = Date.now();
  const paymentState = Number(subscription?.paymentState || 0);
  const isTrial = paymentState === 2;
  const isPaid = paymentState === 1 && expiryTimeMillis > now;
  const status = isTrial
    ? "trialing"
    : isPaid
      ? "active"
      : expiryTimeMillis > now
        ? "active"
        : "inactive";

  return {
    verified: true,
    isPaid,
    isTrial,
    premiumSource: "google",
    productId: payload.productId,
    transactionId: String(subscription?.orderId || payload.transactionId || "").trim(),
    platformSubscriptionId: String(payload.purchaseToken || "").trim(),
    status,
    startedAt: startTimeMillis ? new Date(startTimeMillis).toISOString() : null,
    expiresAt: expiryTimeMillis ? new Date(expiryTimeMillis).toISOString() : null,
    amount: normalizeGooglePlayAmount(subscription),
    currency: String(subscription?.priceCurrencyCode || "eur").toLowerCase(),
    purchaseToken: String(payload.purchaseToken || "").trim(),
    raw: subscription,
  };
}

function normalizeGooglePlayAmount(subscription) {
  const amountMicros = Number(subscription?.priceAmountMicros || 0);
  if (!Number.isFinite(amountMicros) || amountMicros <= 0) return 0;

  return Number((amountMicros / 1_000_000).toFixed(2));
}

function normalizeAppleTransaction(transaction, payload, environment) {
  const productId = String(transaction?.productId || payload.productId || "").trim();
  const requestedProductId = String(payload.productId || "").trim();
  const transactionId = String(
    transaction?.transactionId || payload.transactionId || ""
  ).trim();
  const originalTransactionId = String(
    transaction?.originalTransactionId || payload.originalTransactionId || transactionId
  ).trim();
  const purchasedAt = parseAppleTimestamp(transaction?.purchaseDate);
  const expiresAt = parseAppleTimestamp(transaction?.expiresDate);
  const revoked = transaction?.revocationDate != null;
  const now = Date.now();
  const isTrial = [
    transaction?.isTrialPeriod,
    transaction?.isInIntroOfferPeriod,
  ].some((value) => parseAppleBoolean(value));
  const isActive = !revoked && Boolean(expiresAt && new Date(expiresAt).getTime() > now);
  const isPaid = isActive && !isTrial;
  const status = revoked || !isActive ? "inactive" : isTrial ? "trialing" : "active";

  if (!productId || !transactionId) {
    throw createPublicError("No se pudo verificar la compra móvil.", 400);
  }

  if (requestedProductId && requestedProductId !== productId) {
    throw createPublicError("Producto Premium no válido.", 400);
  }

  if (!getMobilePremiumCatalogEntry(productId)) {
    throw createPublicError("Producto Premium no válido.", 400);
  }

  return {
    provider: "apple",
    environment: String(transaction?.environment || environment || "").trim().toLowerCase(),
    productId,
    transactionId,
    platformSubscriptionId: originalTransactionId || transactionId,
    paymentReference: transactionId,
    purchasedAt,
    expiresAt,
    isActive,
    isPaid,
    isTrial,
    status,
    raw: transaction,
  };
}

function buildAppleAuthToken({ bundleId, issuerId, keyId, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: issuerId,
      iat: now,
      exp: now + 600,
      aud: APPLE_SERVER_API_AUDIENCE,
      bid: bundleId,
    })
  );
  const signature = createSign("SHA256")
    .update(`${header}.${payload}`)
    .sign(privateKey, "base64url");

  return `${header}.${payload}.${signature}`;
}

function parseApplePrivateKey() {
  const raw = process.env.APPLE_PRIVATE_KEY?.trim();
  if (!raw) {
    throw createConfigError(["APPLE_PRIVATE_KEY"]);
  }

  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function resolveAppleEnvironmentCandidates(environment) {
  const normalized = String(environment || "").trim().toLowerCase();
  if (normalized === "sandbox") {
    return ["sandbox", "production"];
  }

  if (normalized === "production") {
    return ["production", "sandbox"];
  }

  return ["production", "sandbox"];
}

async function fetchAppleTransactionWithFallback({
  transactionId,
  jwt,
  environmentCandidates,
}) {
  const safeTransactionId = String(transactionId || "").trim();
  if (!safeTransactionId) {
    throw createPublicError("Faltan datos de la compra móvil.", 400);
  }

  let lastError = null;

  for (let index = 0; index < environmentCandidates.length; index += 1) {
    const environment = environmentCandidates[index];
    const result = await fetchAppleTransaction({
      transactionId: safeTransactionId,
      jwt,
      environment,
    });

    if (result.response.ok) {
      const transaction = extractAppleTransactionInfo(result.data);
      if (!transaction) {
        throw createPublicError("No se pudo verificar la compra móvil.", 400);
      }

      return { transaction, environment };
    }

    if (result.response.status === 404 && index < environmentCandidates.length - 1) {
      lastError = createPublicError("No se pudo verificar la compra móvil.", 400);
      continue;
    }

    lastError = createPublicError("No se pudo verificar la compra móvil.", 400);
    break;
  }

  throw lastError || createPublicError("No se pudo verificar la compra móvil.", 400);
}

async function fetchAppleTransaction({ transactionId, jwt, environment }) {
  const baseUrl =
    environment === "sandbox"
      ? APPLE_SERVER_API_BASE_SANDBOX
      : APPLE_SERVER_API_BASE_PRODUCTION;
  const url = `${baseUrl}/transactions/${encodeURIComponent(transactionId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}

function extractAppleTransactionInfo(data) {
  const signedTransactionInfo =
    data?.signedTransactionInfo ||
    data?.data?.signedTransactionInfo ||
    data?.data?.[0]?.signedTransactionInfo ||
    data?.signedTransactions?.[0] ||
    null;

  if (!signedTransactionInfo || typeof signedTransactionInfo !== "string") {
    return null;
  }

  const parts = signedTransactionInfo.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function parseAppleTimestamp(value) {
  if (value == null || value === "") return null;

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Date(numeric).toISOString();
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
}

function parseAppleBoolean(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return false;
}

function getMobilePremiumCatalogEntry(productId) {
  const safeProductId = String(productId || "").trim();
  const entry = MOBILE_PREMIUM_CATALOG[safeProductId];

  if (!entry) {
    throw createPublicError("Producto Premium no válido.", 400);
  }

  return entry;
}

function logMobileVerificationFailure(payload, error, logger = console) {
  const entry = {
    event: "mobile_premium_verification_failed",
    provider: payload?.platform || null,
    productId: payload?.productId || null,
    transactionId: redactIdentifier(payload?.transactionId),
    purchaseToken: redactIdentifier(payload?.purchaseToken),
    error: sanitizeErrorForLog(error),
  };

  logger?.warn?.(JSON.stringify(entry));
}

function redactIdentifier(value) {
  const safe = String(value || "").trim();
  if (!safe) return null;
  if (safe.length <= 8) return `${safe.slice(0, 4)}…`;
  return `${safe.slice(0, 4)}…${safe.slice(-4)}`;
}

function sanitizeErrorForLog(error) {
  return {
    name: error?.name || "Error",
    message: error?.message || "Unknown error",
    statusCode: error?.statusCode || null,
  };
}

function base64UrlEncode(value) {
  return Buffer.from(String(value || ""), "utf8").toString("base64url");
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
