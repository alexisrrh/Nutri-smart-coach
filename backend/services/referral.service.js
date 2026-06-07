import { randomBytes } from "node:crypto";
import { supabase } from "../config/supabase.js";
import {
  INFLUENCER_TRIAL_DAYS,
  STANDARD_TRIAL_DAYS,
  registerSubscriptionAcquisition,
} from "./acquisition.service.js";

const DEFAULT_INFLUENCER_COMMISSION_PERCENT = 30;
const DEFAULT_INFLUENCER_COMMISSION_MONTHS_LIMIT = 12;
const DEFAULT_CREATOR_TRIAL_DAYS = 15;
const DEFAULT_CREATOR_COMMISSION_PERCENT = 30;
const DEFAULT_CREATOR_COMMISSION_MONTHS_LIMIT = 12;
const CREATOR_CODE_PREFIX = "NUTRI";
const CREATOR_CODE_MAX_LENGTH = 20;

export async function createUserReferralCode(userId, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const existing = await repo.getActiveCodeByUserAndType(userId, "user");
  if (existing) return existing;

  let code = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = buildUserReferralCode();
    const inUse = await repo.getCodeByCode(candidate);
    if (!inUse) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    const error = createPublicError("No se pudo generar un código único.", 500);
    throw error;
  }

  return repo.insertCode({
    userId,
    code,
    type: "user",
    trialDays: 0,
    commissionPercent: 0,
    commissionMonthsLimit: 0,
    isActive: true,
  });
}

export async function createCreatorCode(userId, code = "", options = {}) {
  assertUserId(userId);

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const logger = options.logger || console;
  const existing = await repo.getActiveCodeByUserAndType(userId, "creator");
  if (existing) return existing;

  const normalizedCode = normalizeReferralCode(code);
  let resolvedCode = normalizedCode;
  const creatorApplication = options.creatorApplication || null;
  const creatorSocialHandleRaw = creatorApplication?.socialHandle || options.socialHandle || "";
  let profile = options.profile || null;

  if (
    !profile?.nombre &&
    !profile?.name &&
    !profile?.full_name &&
    !profile?.display_name
  ) {
    auditLog(logger, {
      event: "profile_lookup_start",
      userId,
    });

    try {
      profile = await repo.getProfileByUserId(userId);
      auditLog(logger, {
        event: "profile_lookup_result",
        userId,
        profileFound: Boolean(profile),
        profileId: profile?.id || null,
        profileFieldsAvailable: getAvailableProfileFields(profile),
        profileNombre: profile?.nombre || null,
        profileUsername: profile?.username || null,
        profileName: profile?.name || null,
        profileFullName: profile?.full_name || null,
        profileDisplayName: profile?.display_name || null,
        profileEmail: profile?.email || null,
      });
    } catch (error) {
      auditLog(logger, {
        event: "profile_lookup_failed",
        userId,
        error: error?.message || String(error),
      });
    }
  }

  const creatorCodeSource = resolveCreatorCodeSource({
    profile,
    creatorApplication,
    socialHandle: creatorSocialHandleRaw,
  });

  auditLog(logger, {
    event: "creator_code.name_source",
    userId,
    selectedSource: creatorCodeSource.selectedSource || null,
    selectedValue: creatorCodeSource.selectedValue || null,
    profileFieldsAvailable: creatorCodeSource.profileFieldsAvailable,
    socialHandle: creatorCodeSource.socialHandle || null,
  });

  auditLog(logger, {
    event: "creator_code.create_attempt",
    userId,
    providedCode: normalizedCode || null,
    existingActiveCode: Boolean(existing),
  });

  if (resolvedCode) {
    const existingByCode = await repo.getCodeByCode(resolvedCode);
    if (existingByCode && String(existingByCode.user_id) !== String(userId)) {
      throw createPublicError("Ese código ya está en uso.", 409);
    }

    if (existingByCode && String(existingByCode.user_id) === String(userId)) {
      if (existingByCode.type === "creator") {
        return existingByCode;
      }

      throw createPublicError("Ese código ya está en uso.", 409);
    }
  } else {
    const generatedCode = await generateUniqueCreatorCode(repo, creatorCodeSource);
    if (!generatedCode) {
      throw createPublicError(
        "Completa tu perfil para activar tu código de creador.",
        422
      );
    }
    resolvedCode = generatedCode;
  }

  const existingByUser = await repo.getCodeByUserAndType(userId, "creator");
  const payload = {
    userId,
    code: resolvedCode,
    type: "creator",
    trialDays: DEFAULT_CREATOR_TRIAL_DAYS,
    commissionPercent: DEFAULT_CREATOR_COMMISSION_PERCENT,
    commissionMonthsLimit: DEFAULT_CREATOR_COMMISSION_MONTHS_LIMIT,
    isActive: true,
  };

  if (existingByUser) {
    const updated = await repo.updateCode(existingByUser.id, payload);
    auditLog(logger, {
      event: "creator_code.update_result",
      userId,
      code: updated?.code || null,
      type: updated?.type || null,
      id: updated?.id || null,
    });
    return updated;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const attemptCode =
      attempt === 0
        ? resolvedCode
        : await generateUniqueCreatorCode(repo, creatorCodeSource);

    try {
      const inserted = await repo.insertCode({
        ...payload,
        code: attemptCode,
      });
      auditLog(logger, {
        event: "creator_code.insert_result",
        userId,
        code: inserted?.code || null,
        type: inserted?.type || null,
        id: inserted?.id || null,
        trialDays: Number(inserted?.trial_days || payload.trialDays || 0),
        commissionPercent: Number(inserted?.commission_percent || payload.commissionPercent || 0),
        commissionMonthsLimit: Number(
          inserted?.commission_months_limit || payload.commissionMonthsLimit || 0
        ),
      });
      return inserted;
    } catch (error) {
      if (!isDuplicateCodeError(error)) {
        throw error;
      }

      const existingForUser = await repo.getCodeByUserAndType(userId, "creator");
      if (existingForUser) {
        auditLog(logger, {
          event: "creator_code.insert_result",
          userId,
          code: existingForUser?.code || null,
          type: existingForUser?.type || null,
          id: existingForUser?.id || null,
          recovered: true,
        });
        return existingForUser;
      }
    }
  }

  const error = createPublicError("No se pudo generar un código de creador único.", 500);
  throw error;
}

export async function createInfluencerCode(userId, code, options = {}) {
  assertUserId(userId);
  assertInfluencerCodeAccess({ userId, authUser: options.authUser });

  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) {
    throw createPublicError("El código influencer es obligatorio.", 400);
  }

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const existingByCode = await repo.getCodeByCode(normalizedCode);
  if (existingByCode && existingByCode.user_id !== userId) {
    throw createPublicError("Ese código ya está en uso.", 409);
  }

  const existingByUser = await repo.getCodeByUserAndType(userId, "influencer");
  const payload = {
    userId,
    code: normalizedCode,
    type: "influencer",
    trialDays: INFLUENCER_TRIAL_DAYS,
    commissionPercent: DEFAULT_INFLUENCER_COMMISSION_PERCENT,
    commissionMonthsLimit: DEFAULT_INFLUENCER_COMMISSION_MONTHS_LIMIT,
    isActive: true,
  };

  if (existingByUser) {
    return repo.updateCode(existingByUser.id, payload);
  }

  return repo.insertCode(payload);
}

export async function applyReferralCode(
  { userId, code },
  options = {}
) {
  assertUserId(userId);

  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) {
    throw createPublicError("Debes indicar un código válido.", 400);
  }

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const registerSubscriptionAcquisitionFn =
    options.registerSubscriptionAcquisitionFn || registerSubscriptionAcquisition;

  const referralCode = await repo.getCodeByCode(normalizedCode);
  if (!referralCode || referralCode.is_active === false) {
    throw createPublicError("Código de referido no válido.", 404);
  }

  if (String(referralCode.user_id) === String(userId)) {
    throw createPublicError("No puedes usar tu propio código.", 400);
  }

  const existingReferral = await repo.getReferralByReferredUserId(userId);
  if (existingReferral) {
    throw createPublicError("Ya tienes un código aplicado.", 409);
  }

  const hasAnyAcquisition = await repo.hasAnyAcquisitionByUserId(userId);
  if (hasAnyAcquisition) {
    throw createPublicError(
      "El código solo puede aplicarse durante el registro inicial.",
      409
    );
  }

  const profile = await repo.getProfileByUserId(userId);
  if (hasExistingPremiumHistory(profile)) {
    throw createPublicError(
      "El código solo puede aplicarse durante el registro inicial.",
      409
    );
  }

  if (
    !isWithinOnboardingWindow({
      authUserCreatedAt: options.currentUserCreatedAt || null,
      profileCreatedAt: profile?.created_at || null,
      now: options.now || new Date(),
    })
  ) {
    throw createPublicError(
      "El código solo puede aplicarse durante los primeros 30 minutos del registro.",
      409
    );
  }

  const type = referralCode.type;
  const trialDays = Number(
    referralCode.trial_days ||
      (type === "creator"
        ? DEFAULT_CREATOR_TRIAL_DAYS
        : type === "influencer"
          ? INFLUENCER_TRIAL_DAYS
          : STANDARD_TRIAL_DAYS)
  );
  const status = "pending";
  const isCreatorCode = type === "creator";
  const acquisitionSource = isCreatorCode ? "creator" : type === "influencer" ? "influencer" : "referral";
  const trialSource = isCreatorCode
    ? "creator_trial"
    : type === "influencer"
      ? "influencer_trial"
      : "standard_trial";

  const referral = await repo.insertReferral({
    referralCodeId: referralCode.id,
    referrerUserId: referralCode.user_id,
    referredUserId: userId,
    type,
    status,
    trialStartedAt: null,
    trialEndsAt: null,
    premiumStartedAt: null,
    rewardAvailable: false,
  });

  const acquisition = await registerSubscriptionAcquisitionFn(
    {
      userId,
      premiumSource: "manual",
      acquisitionSource,
      referralCodeId: referralCode.id,
      referrerUserId: referralCode.user_id,
      influencerUserId: type === "influencer" || isCreatorCode ? referralCode.user_id : null,
      trialSource,
      trialStartedAt: null,
      trialEndsAt: null,
      commissionPercent:
        type === "influencer"
          ? Number(referralCode.commission_percent || DEFAULT_INFLUENCER_COMMISSION_PERCENT)
          : isCreatorCode
            ? Number(referralCode.commission_percent || DEFAULT_CREATOR_COMMISSION_PERCENT)
          : 0,
      commissionMonthsLimit:
        type === "influencer"
          ? Number(
              referralCode.commission_months_limit ||
                DEFAULT_INFLUENCER_COMMISSION_MONTHS_LIMIT
            )
          : isCreatorCode
            ? Number(
                referralCode.commission_months_limit ||
                  DEFAULT_CREATOR_COMMISSION_MONTHS_LIMIT
              )
          : 0,
      status,
    },
    options
  );

  return {
    referral,
    acquisition,
    trial: isCreatorCode
      ? {
          source: "creator_trial",
          startsAt: null,
          endsAt: null,
          trialDays,
        }
      : type === "influencer"
      ? {
          source: "influencer_trial",
          startsAt: null,
          endsAt: null,
          trialDays,
        }
      : {
          source: "standard_trial",
          startsAt: null,
          endsAt: null,
          trialDays,
        },
    todo:
      type === "influencer"
        ? "TODO: usar trial nativo oficial del checkout antes de activar Premium."
        : null,
  };
}

export async function validateReferralCode(code, options = {}) {
  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) {
    return {
      valid: false,
      type: null,
      trialDays: 0,
    };
  }

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const referralCode = await repo.getCodeByCode(normalizedCode);

  if (!referralCode || referralCode.is_active === false) {
    return {
      valid: false,
      type: null,
      trialDays: 0,
    };
  }

  return {
    valid: true,
    type: referralCode.type,
    trialDays: Number(
      referralCode.trial_days ||
        (referralCode.type === "creator"
          ? DEFAULT_CREATOR_TRIAL_DAYS
          : referralCode.type === "influencer"
          ? INFLUENCER_TRIAL_DAYS
          : STANDARD_TRIAL_DAYS)
    ),
  };
}

export async function getMyReferralStats(userId, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const codeType = normalizeUserCodeType(options.codeType);
  const referralType = normalizeReferralTypeValue(options.referralType);
  const codes = await repo.listCodesByUserId(userId);
  const referrals = await repo.listReferralsByReferrerUserId(userId);
  const commissions = await repo.listAffiliateCommissionsByInfluencerUserId(userId);
  const rewards = await repo.listReferralRewardsByReferrerUserId(userId);
  const filteredCodes = codeType ? codes.filter((code) => normalizeUserCodeType(code.type) === codeType) : codes;
  const filteredReferrals = referralType
    ? referrals.filter((referral) => normalizeReferralTypeValue(referral.type) === referralType)
    : referrals;

  const premiumActiveReferrals = filteredReferrals.filter((referral) =>
    ["premium_active", "rewarded"].includes(referral.status)
  ).length;
  const normalizedRewards = rewards.map(normalizeReferralRewardRecord).filter(Boolean);
  const rewardAvailableCount = normalizedRewards.filter(
    (reward) => reward.status === "available"
  ).length;
  const rewardClaimedCount = normalizedRewards.filter(
    (reward) => reward.status === "claimed"
  ).length;
  const payableCommissionTotal = commissions
    .filter((commission) => commission.status === "payable")
    .reduce((total, commission) => total + Number(commission.amount || 0), 0);
  const latestReward = normalizedRewards[normalizedRewards.length - 1] || null;
  const canClaimReward = rewardAvailableCount > 0;

  return {
    codes: filteredCodes,
    premiumReferralsCount: premiumActiveReferrals,
    nextMilestone: 3,
    rewardsAvailable: rewardAvailableCount,
    rewardsClaimed: rewardClaimedCount,
    canClaimReward,
    latestReward,
    summary: {
      totalReferrals: filteredReferrals.length,
      premiumActiveReferrals,
      rewardAvailableCount,
      rewardClaimedCount,
      canClaimReward,
      premiumReferralsCount: premiumActiveReferrals,
      nextMilestone: 3,
      pendingReferrals: filteredReferrals.filter((referral) => referral.status === "pending").length,
      trialingReferrals: filteredReferrals.filter((referral) => referral.status === "trialing").length,
      influencerCommissionsCount: commissions.length,
      payableCommissionTotal: Number(payableCommissionTotal.toFixed(2)),
    },
    referrals: filteredReferrals,
    commissions,
    rewards: normalizedRewards,
  };
}

export async function claimReferralReward({ userId }, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createReferralRepository(options.supabaseClient || supabase);
  const getProfileByUserIdFn =
    options.getProfileByUserIdFn || ((value) => getProfileByUserId(value, options.supabaseClient || supabase));
  const upsertProfileSubscriptionFn =
    options.upsertProfileSubscriptionFn || ((payload) =>
      upsertProfileSubscription(payload, options.supabaseClient || supabase)
    );
  const registerSubscriptionAcquisitionFn =
    options.registerSubscriptionAcquisitionFn || registerSubscriptionAcquisition;
  const now = options.now ? new Date(options.now) : new Date();
  const claimedAt = now.toISOString();

  const reward = await repo.getAvailableReferralRewardByReferrerUserId(userId);
  if (!reward) {
    throw createPublicError("No tienes una recompensa disponible para reclamar.", 404);
  }

  const claimedReward = await repo.updateReferralReward(reward.id, {
    status: "claimed",
    claimedAt,
  });

  const profile = await getProfileByUserIdFn(userId);
  const premiumExpiresAt = computeRewardExpiration(profile?.premium_expires_at, now);
  const premiumUpdate = buildRewardPremiumProfileUpdate(profile, {
    userId,
    claimedAt,
    premiumExpiresAt,
  });

  await upsertProfileSubscriptionFn(premiumUpdate);

  const acquisition = await registerSubscriptionAcquisitionFn(
    {
      userId,
      premiumSource: "manual",
      acquisitionSource: "referral",
      trialSource: "none",
      status: "reward_claimed",
    },
    options
  );

  return {
    reward: claimedReward,
    premium: premiumUpdate,
    acquisition,
    premiumExpiresAt,
  };
}

export function createReferralRepository(supabaseClient) {
  return {
    async getCodeByUserAndType(userId, type) {
      const { data, error } = await supabaseClient
        .from("referral_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("type", type)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar el código.", error);
      return data || null;
    },

    async getActiveCodeByUserAndType(userId, type) {
      const { data, error } = await supabaseClient
        .from("referral_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("type", type)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar el código.", error);
      return data || null;
    },

    async getCodeByCode(code) {
      const { data, error } = await supabaseClient
        .from("referral_codes")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar el código.", error);
      return data || null;
    },

    async insertCode(payload) {
      const { data, error } = await supabaseClient
        .from("referral_codes")
        .insert(toDbCodePayload(payload))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo crear el código.", error);
      return data;
    },

    async updateCode(id, payload) {
      const { data, error } = await supabaseClient
        .from("referral_codes")
        .update(toDbCodePayload(payload))
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar el código.", error);
      return data;
    },

    async getReferralByReferredUserId(referredUserId) {
      const { data, error } = await supabaseClient
        .from("referrals")
        .select("*")
        .eq("referred_user_id", referredUserId)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar el referido.", error);
      return data || null;
    },

    async hasAnyAcquisitionByUserId(userId) {
      const { count, error } = await supabaseClient
        .from("subscription_acquisitions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (error) throw wrapDbError("No se pudo consultar la adquisición.", error);
      return (count || 0) > 0;
    },

    async getProfileByUserId(userId) {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select(
          [
            "id",
            "name",
            "username",
            "email",
            "plan",
            "is_premium",
            "subscription_status",
            "premium_source",
            "premium_product_id",
            "premium_platform_transaction_id",
            "premium_started_at",
            "premium_expires_at",
            "created_at",
            "stripe_customer_id",
            "stripe_subscription_id",
          ].join(", ")
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar el perfil.", error);
      return data || null;
    },

    async insertReferral(payload) {
      const { data, error } = await supabaseClient
        .from("referrals")
        .insert(toDbReferralPayload(payload))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo crear el referido.", error);
      return data;
    },

    async listCodesByUserId(userId) {
      const { data, error } = await supabaseClient
        .from("referral_codes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw wrapDbError("No se pudieron listar los códigos.", error);
      return data || [];
    },

    async listReferralsByReferrerUserId(userId) {
      const { data, error } = await supabaseClient
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw wrapDbError("No se pudieron listar los referidos.", error);
      return data || [];
    },

    async listAffiliateCommissionsByInfluencerUserId(userId) {
      const { data, error } = await supabaseClient
        .from("affiliate_commissions")
        .select("*")
        .eq("influencer_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw wrapDbError("No se pudieron listar las comisiones.", error);
      return data || [];
    },

    async listReferralRewardsByReferrerUserId(userId) {
      const { data, error } = await supabaseClient
        .from("referral_rewards")
        .select("*")
        .eq("referrer_user_id", userId)
        .order("milestone_number", { ascending: true });

      if (error) throw wrapDbError("No se pudieron listar las recompensas.", error);
      return data || [];
    },

    async getAvailableReferralRewardByReferrerUserId(userId) {
      const { data, error } = await supabaseClient
        .from("referral_rewards")
        .select("*")
        .eq("referrer_user_id", userId)
        .eq("status", "available")
        .order("milestone_number", { ascending: true });

      if (error) throw wrapDbError("No se pudo consultar la recompensa.", error);
      return (data || [])[0] || null;
    },

    async updateReferralReward(id, payload) {
      const { data, error } = await supabaseClient
        .from("referral_rewards")
        .update(toDbReferralRewardPayload(payload))
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar la recompensa.", error);
      return data;
    },
  };
}

export function canCreateInfluencerCode({ userId, authUser } = {}) {
  const roles = [
    authUser?.role,
    authUser?.app_metadata?.role,
    authUser?.user_metadata?.role,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  if (roles.includes("service_role") || roles.includes("admin")) {
    return true;
  }

  const email = String(authUser?.email || "")
    .trim()
    .toLowerCase();
  const allowlistedUserIds = parseAllowlist(process.env.INFLUENCER_CODE_ALLOWLIST_USER_IDS);
  const allowlistedEmails = parseAllowlist(process.env.INFLUENCER_CODE_ALLOWLIST_EMAILS);

  return allowlistedUserIds.has(String(userId || "").trim()) || allowlistedEmails.has(email);
}

function toDbCodePayload(payload = {}) {
  return {
    user_id: payload.userId,
    code: normalizeReferralCode(payload.code),
    type: payload.type,
    trial_days: Number(payload.trialDays || 0),
    commission_percent: Number(payload.commissionPercent || 0),
    commission_months_limit: Number(payload.commissionMonthsLimit || 0),
    is_active: payload.isActive !== false,
  };
}

function toDbReferralPayload(payload = {}) {
  return {
    referral_code_id: payload.referralCodeId,
    referrer_user_id: payload.referrerUserId,
    referred_user_id: payload.referredUserId,
    type: payload.type,
    status: payload.status,
    trial_started_at: payload.trialStartedAt,
    trial_ends_at: payload.trialEndsAt,
    premium_started_at: payload.premiumStartedAt,
    reward_available: Boolean(payload.rewardAvailable),
  };
}

function toDbReferralRewardPayload(payload = {}) {
  const next = {};
  if (payload.status !== undefined) next.status = payload.status;
  if (payload.claimedAt !== undefined) next.claimed_at = payload.claimedAt;
  return next;
}

function normalizeReferralCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

function normalizeCreatorCodeSeed(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function normalizeUserCodeType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "user") return "user";
  if (normalized === "creator") return "creator";
  if (normalized === "influencer") return "influencer";
  return null;
}

function normalizeReferralTypeValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "user") return "user";
  if (normalized === "creator") return "creator";
  if (normalized === "influencer") return "influencer";
  return null;
}

function normalizeReferralRewardRecord(reward) {
  if (!reward) return null;

  return {
    ...reward,
    status: normalizeReferralRewardStatus(reward.status),
  };
}

function normalizeReferralRewardStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "granted") return "claimed";
  if (normalized === "claimed") return "claimed";
  if (normalized === "expired") return "expired";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  return "available";
}

function auditLog(logger, payload) {
  const entry = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  logger?.info?.(JSON.stringify(entry));
}

function computeRewardExpiration(existingExpiresAt, now) {
  const parsed = parseIsoDate(existingExpiresAt);
  const start = parsed && parsed.getTime() > now.getTime() ? parsed : now;
  return addMonths(start.toISOString(), 1);
}

function buildRewardPremiumProfileUpdate(profile, { userId, claimedAt, premiumExpiresAt }) {
  return {
    id: userId,
    plan: "premium",
    is_premium: true,
    subscription_status: "active",
    premium_source: "manual",
    premium_product_id: profile?.premium_product_id || null,
    premium_platform_transaction_id: profile?.premium_platform_transaction_id || null,
    premium_last_verified_at: claimedAt,
    premium_started_at: profile?.premium_started_at || claimedAt,
    premium_expires_at: premiumExpiresAt,
    updated_at: claimedAt,
  };
}

function assertInfluencerCodeAccess({ userId, authUser }) {
  if (canCreateInfluencerCode({ userId, authUser })) return;

  throw createPublicError("No tienes permisos para crear códigos influencer.", 403);
}

function hasExistingPremiumHistory(profile) {
  if (!profile) return false;

  const status = String(profile.subscription_status || "")
    .trim()
    .toLowerCase();

  return Boolean(
    profile.is_premium === true ||
      profile.plan === "premium" ||
      profile.premium_source ||
      profile.premium_product_id ||
      profile.premium_platform_transaction_id ||
      profile.premium_started_at ||
      profile.premium_expires_at ||
      profile.stripe_customer_id ||
      profile.stripe_subscription_id ||
      (status && status !== "inactive")
  );
}

function isWithinOnboardingWindow({
  authUserCreatedAt,
  profileCreatedAt,
  now = new Date(),
}) {
  const onboardingStartedAt =
    parseIsoDate(authUserCreatedAt) || parseIsoDate(profileCreatedAt);

  if (!onboardingStartedAt) return false;

  const currentTime = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(currentTime.getTime())) return false;

  const elapsedMs = currentTime.getTime() - onboardingStartedAt.getTime();
  return elapsedMs >= 0 && elapsedMs <= 30 * 60 * 1000;
}

function parseIsoDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addMonths(value, months) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function parseAllowlist(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

function buildUserReferralCode() {
  return `NSC${randomBytes(4).toString("hex").toUpperCase()}`;
}

function isDuplicateCodeError(error) {
  const message = String(error?.message || error?.cause?.message || "")
    .toLowerCase();

  return (
    message.includes("duplicate") ||
    message.includes("unique") ||
    message.includes("ya está en uso") ||
    message.includes("already exists") ||
    message.includes("conflict")
  );
}

function wrapDbError(message, error) {
  const wrapped = new Error(message);
  wrapped.statusCode = 500;
  wrapped.cause = error;
  return wrapped;
}

function assertUserId(userId) {
  if (!userId) {
    throw createPublicError("Usuario no válido.", 400);
  }
}

async function getProfileByUserId(userId, supabaseClient) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw wrapDbError("No se pudo consultar el estado premium.", error);
  }

  return data || null;
}

async function generateUniqueCreatorCode(
  repo,
  { seed = null } = {}
) {
  const baseSeed = normalizeCreatorCodeSeed(seed);
  if (!baseSeed) {
    return null;
  }
  const base = buildCreatorCodeCandidate(baseSeed);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : buildCreatorCodeCandidate(baseSeed, attempt + 1);
    const inUse = await repo.getCodeByCode(candidate);
    if (!inUse) return candidate;
  }

  const error = createPublicError("No se pudo generar un código de creador único.", 500);
  throw error;
}

function resolveCreatorCodeSource({
  profile = null,
  creatorApplication = null,
  socialHandle = null,
} = {}) {
  const profileFieldsAvailable = getAvailableProfileFields(profile);
  const profileNameSources = [
    ["profiles.nombre", profile?.nombre],
    ["profiles.name", profile?.name],
    ["profiles.full_name", profile?.full_name],
    ["profiles.display_name", profile?.display_name],
  ];

  for (const [source, value] of profileNameSources) {
    const seed = extractProfileNameSeed(value);
    if (seed) {
      return {
        seed: normalizeCreatorCodeSeed(seed),
        selectedSource: source,
        selectedValue: String(value || "").trim(),
        profileFieldsAvailable,
        socialHandle: extractCreatorHandleSeed(
          socialHandle || creatorApplication?.socialHandle
        ),
      };
    }
  }

  const handleSeed = extractCreatorHandleSeed(socialHandle || creatorApplication?.socialHandle);
  if (handleSeed) {
    return {
      seed: normalizeCreatorCodeSeed(handleSeed),
      selectedSource: "social_handle",
      selectedValue: String(socialHandle || creatorApplication?.socialHandle || "").trim(),
      profileFieldsAvailable,
      socialHandle: handleSeed,
    };
  }

  return {
    seed: null,
    selectedSource: null,
    selectedValue: null,
    profileFieldsAvailable,
    socialHandle: null,
  };
}

function buildCreatorCodeCandidate(seed, suffix = "") {
  const normalizedSeed = normalizeCreatorCodeSeed(seed) || "USER";
  const suffixValue = String(suffix || "").replace(/[^0-9]/g, "");
  const availableLength = Math.max(
    1,
    CREATOR_CODE_MAX_LENGTH - CREATOR_CODE_PREFIX.length - suffixValue.length
  );
  const compactSeed = normalizedSeed.slice(0, availableLength) || "USER";
  return `${CREATOR_CODE_PREFIX}${compactSeed}${suffixValue}`;
}

function extractProfileNameSeed(name) {
  const firstToken = String(name || "")
    .trim()
    .split(/\s+/)[0];

  return firstToken || "";
}

function getAvailableProfileFields(profile) {
  if (!profile || typeof profile !== "object") return [];

  return ["nombre", "name", "full_name", "display_name", "username"].filter(
    (field) => profile[field] != null && String(profile[field]).trim() !== ""
  );
}

function extractCreatorHandleSeed(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (looksLikeEmail(raw)) return "";

  const cleaned = raw.replace(/^@+/, "");
  if (!cleaned) return "";

  if (cleaned.includes("://") || cleaned.startsWith("www.")) {
    try {
      const url = cleaned.includes("://") ? new URL(cleaned) : new URL(`https://${cleaned}`);
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1] || "";
      return lastSegment.replace(/^@+/, "");
    } catch {
      return "";
    }
  }

  if (cleaned.includes("/")) {
    const segments = cleaned.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "";
    return lastSegment.replace(/^@+/, "");
  }

  if (cleaned.includes(".") && !cleaned.includes("_")) {
    return "";
  }

  return cleaned;
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function upsertProfileSubscription(payload, supabaseClient) {
  const { error } = await supabaseClient
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw wrapDbError("No se pudo actualizar la suscripción.", error);
  }
}

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = true;
  return error;
}
