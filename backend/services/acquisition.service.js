import { supabase } from "../config/supabase.js";

const COMMISSION_VALID_STATUSES = new Set(["pending", "payable", "paid"]);
const REFERRAL_PREMIUM_STATUSES = ["premium_active", "rewarded"];
const CANCELLED_SUBSCRIPTION_STATUSES = new Set(["canceled", "cancelled", "incomplete_expired"]);
const TRIALING_SUBSCRIPTION_STATUSES = new Set(["trialing"]);

export const STANDARD_TRIAL_DAYS = 7;
export const INFLUENCER_TRIAL_DAYS = 15;

export async function registerSubscriptionAcquisition(
  payload,
  options = {}
) {
  const repo = options.repo || createAcquisitionRepository(options.supabaseClient || supabase);
  const normalized = normalizeAcquisitionPayload(payload);

  const existingBySubscription = normalized.platformSubscriptionId
    ? await repo.getAcquisitionByPlatformSubscriptionId(normalized.platformSubscriptionId)
    : null;

  if (existingBySubscription) {
    return repo.updateAcquisition(
      existingBySubscription.id,
      mergeAcquisitionPayload(existingBySubscription, normalized)
    );
  }

  const latest = await repo.getLatestAcquisitionByUserId(normalized.userId);
  if (latest && !latest.platform_subscription_id) {
    return repo.updateAcquisition(latest.id, mergeAcquisitionPayload(latest, normalized));
  }

  return repo.insertAcquisition(normalized);
}

export async function updateSubscriptionAcquisitionStatus(
  { userId, platformSubscriptionId, status, trialStartedAt, trialEndsAt },
  options = {}
) {
  const repo = options.repo || createAcquisitionRepository(options.supabaseClient || supabase);

  if (!status) return null;

  const existing = platformSubscriptionId
    ? await repo.getAcquisitionByPlatformSubscriptionId(platformSubscriptionId)
    : await repo.getLatestAcquisitionByUserId(userId);

  if (!existing) return null;

  const updated = await repo.updateAcquisitionStatus(existing.id, {
    status,
    platformSubscriptionId,
    trialStartedAt,
    trialEndsAt,
  });

  const referral = userId ? await repo.getReferralByReferredUserId(userId) : null;
  if (referral) {
    const normalizedStatus = String(status).toLowerCase();

    if (
      TRIALING_SUBSCRIPTION_STATUSES.has(normalizedStatus) &&
      referral.status === "pending"
    ) {
      await repo.updateReferral(referral.id, {
        status: "trialing",
        trialStartedAt:
          referral.trial_started_at || trialStartedAt || new Date().toISOString(),
        trialEndsAt: referral.trial_ends_at || trialEndsAt || null,
      });
    }

    if (
      CANCELLED_SUBSCRIPTION_STATUSES.has(normalizedStatus) &&
      ["pending", "trialing"].includes(referral.status) &&
      !referral.premium_started_at
    ) {
      await repo.updateReferral(referral.id, {
        status: "cancelled",
      });
    }
  }

  return updated;
}

export async function markReferralPremiumActive(
  {
    userId,
    premiumSource = "stripe",
    platformSubscriptionId = null,
    paidAt = new Date().toISOString(),
    status = "active",
  },
  options = {}
) {
  const repo = options.repo || createAcquisitionRepository(options.supabaseClient || supabase);
  const referral = await repo.getReferralByReferredUserId(userId);

  if (!referral) {
    const acquisition = await registerSubscriptionAcquisition(
      {
        userId,
        premiumSource,
        acquisitionSource: premiumSource === "manual" ? "manual" : "normal",
        platformSubscriptionId,
        status,
      },
      { repo }
    );

    return {
      referral: null,
      acquisition,
      rewardUnlocked: false,
      rewardCount: 0,
    };
  }

  const nextReferral = await repo.updateReferral(referral.id, {
    status: "premium_active",
    premiumStartedAt: referral.premium_started_at || paidAt,
  });

  const acquisition = await registerSubscriptionAcquisition(
    {
      userId,
      premiumSource,
      acquisitionSource: referral.type === "influencer" ? "influencer" : "referral",
      referralCodeId: referral.referral_code_id,
      referrerUserId: referral.referrer_user_id,
      influencerUserId: referral.type === "influencer" ? referral.referrer_user_id : null,
      trialSource:
        referral.type === "influencer" ? "influencer_trial" : "standard_trial",
      trialStartedAt: referral.trial_started_at || null,
      trialEndsAt: referral.trial_ends_at,
      commissionPercent: referral.type === "influencer" ? 30 : 0,
      commissionMonthsLimit: referral.type === "influencer" ? 12 : 0,
      commissionStartedAt: referral.type === "influencer" ? paidAt : null,
      commissionEndsAt: referral.type === "influencer" ? addMonths(paidAt, 12) : null,
      platformSubscriptionId,
      status,
    },
    { repo }
  );

  if (referral.type !== "user") {
    return {
      referral: nextReferral,
      acquisition,
      rewardUnlocked: false,
      rewardCount: 0,
    };
  }

  const premiumActiveCount = await repo.countPremiumReferralsByReferrerUserId(
    referral.referrer_user_id,
    REFERRAL_PREMIUM_STATUSES
  );
  const rewardCount = await repo.countRewardAvailableByReferrerUserId(
    referral.referrer_user_id
  );
  const expectedRewards = Math.floor(premiumActiveCount / 3);
  const reward = await reserveReferralReward({
    repo,
    referrerUserId: referral.referrer_user_id,
    currentReferralId: nextReferral.id,
    expectedRewards,
    currentRewardCount: rewardCount,
  });

  return {
    referral: reward.referral || nextReferral,
    acquisition,
    rewardUnlocked: reward.unlocked,
    rewardCount: reward.count,
  };
}

export async function createAffiliateCommissionForPaidInvoice(
  {
    influencerUserId,
    referredUserId,
    referralId,
    subscriptionId,
    amount,
    currency = "eur",
    commissionPercent = 30,
    commissionMonthsLimit = 12,
    paidAt = new Date().toISOString(),
    trialEndsAt = null,
    premiumSource = "stripe",
  },
  options = {}
) {
  const repo = options.repo || createAcquisitionRepository(options.supabaseClient || supabase);
  const numericAmount = normalizeAmount(amount);

  if (!influencerUserId || !referredUserId || !referralId) return null;
  if (premiumSource === "manual" || numericAmount <= 0) return null;
  if (trialEndsAt && new Date(paidAt).getTime() <= new Date(trialEndsAt).getTime()) {
    return null;
  }

  const existingForPayment = subscriptionId
    ? await repo.getAffiliateCommissionBySubscriptionId(subscriptionId)
    : null;
  if (existingForPayment) return existingForPayment;

  const commissions = await repo.listAffiliateCommissions({
    influencerUserId,
    referredUserId,
  });
  const validCount = commissions.filter((commission) =>
    COMMISSION_VALID_STATUSES.has(commission.status)
  ).length;

  if (validCount >= commissionMonthsLimit) {
    return null;
  }

  const commissionMonthNumber = validCount + 1;
  const commissionAmount = Number(
    ((numericAmount * Number(commissionPercent)) / 100).toFixed(2)
  );

  return repo.insertAffiliateCommission({
    influencerUserId,
    referredUserId,
    referralId,
    subscriptionId,
    amount: commissionAmount,
    currency,
    commissionPercent,
    commissionMonthNumber,
    status: "payable",
    createdAt: paidAt,
  });
}

export async function markAffiliateCommissionRefunded(
  { subscriptionId, status = "refunded" },
  options = {}
) {
  const repo = options.repo || createAcquisitionRepository(options.supabaseClient || supabase);

  if (!subscriptionId) return null;

  const existing = await repo.getAffiliateCommissionBySubscriptionId(subscriptionId);
  if (!existing) return null;

  return repo.updateAffiliateCommission(existing.id, { status });
}

export function buildCommissionSubscriptionRef({ platformSubscriptionId, invoiceId }) {
  return invoiceId || platformSubscriptionId || null;
}

export function getTrialConfigForAcquisition(acquisition) {
  const normalizedAcquisition = normalizeSubscriptionAcquisitionRecord(acquisition);

  if (!normalizedAcquisition) {
    return {
      acquisitionSource: "normal",
      trialSource: "standard_trial",
      trialDays: STANDARD_TRIAL_DAYS,
    };
  }

  const acquisitionSource = normalizedAcquisition.acquisition_source || "normal";
  if (acquisitionSource === "influencer") {
    return {
      acquisitionSource,
      trialSource: "influencer_trial",
      trialDays: INFLUENCER_TRIAL_DAYS,
    };
  }

  return {
    acquisitionSource,
    trialSource: "standard_trial",
    trialDays: STANDARD_TRIAL_DAYS,
  };
}

export function getPremiumStatusAcquisitionSnapshot(acquisition) {
  const normalizedAcquisition = normalizeSubscriptionAcquisitionRecord(acquisition);

  if (!normalizedAcquisition) {
    return {
      acquisition_source: null,
      referral_code_id: null,
      referrer_user_id: null,
      influencer_user_id: null,
      trial_source: "none",
      trial_days: 0,
      trial_ends_at: null,
      trial_started_at: null,
      commission_percent: 0,
      commission_months_limit: 0,
      commission_started_at: null,
      commission_ends_at: null,
      has_trial_banner: false,
    };
  }

  const trialConfig = getTrialConfigForAcquisition(normalizedAcquisition);
  const referralCodeId = normalizedAcquisition.referral_code_id || null;
  const acquisitionSource = trialConfig.acquisitionSource || "normal";
  const hasTrialBanner = Boolean(
    referralCodeId &&
      !["manual", "none"].includes(acquisitionSource) &&
      trialConfig.trialDays > 0
  );

  return {
    acquisition_source: acquisitionSource,
    referral_code_id: referralCodeId,
    referrer_user_id: normalizedAcquisition.referrer_user_id || null,
    influencer_user_id: normalizedAcquisition.influencer_user_id || null,
    trial_source: trialConfig.trialSource || "none",
    trial_days: trialConfig.trialDays || 0,
    trial_ends_at: normalizedAcquisition.trial_ends_at || null,
    trial_started_at: normalizedAcquisition.trial_started_at || null,
    commission_percent: Number(normalizedAcquisition.commission_percent || 0),
    commission_months_limit: Number(normalizedAcquisition.commission_months_limit || 0),
    commission_started_at: normalizedAcquisition.commission_started_at || null,
    commission_ends_at: normalizedAcquisition.commission_ends_at || null,
    has_trial_banner: hasTrialBanner,
  };
}

export function createAcquisitionRepository(supabaseClient) {
  return {
    async getAcquisitionByPlatformSubscriptionId(platformSubscriptionId) {
      if (!platformSubscriptionId) return null;

      const { data, error } = await supabaseClient
        .from("subscription_acquisitions")
        .select("*")
        .eq("platform_subscription_id", platformSubscriptionId)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar la adquisición.", error);
      return normalizeSubscriptionAcquisitionRecord(data || null);
    },

    async getLatestAcquisitionByUserId(userId) {
      const { data, error } = await supabaseClient
        .from("subscription_acquisitions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw wrapDbError("No se pudo consultar la adquisición.", error);
      return normalizeSubscriptionAcquisitionRecord(data?.[0] || null);
    },

    async insertAcquisition(payload) {
      const { data, error } = await supabaseClient
        .from("subscription_acquisitions")
        .insert(toDbAcquisitionPayload(payload, { includeCreatedAt: true }))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo registrar la adquisición.", error);
      return normalizeSubscriptionAcquisitionRecord(data);
    },

    async updateAcquisition(id, payload) {
      const { data, error } = await supabaseClient
        .from("subscription_acquisitions")
        .update(toDbAcquisitionPayload(payload))
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar la adquisición.", error);
      return normalizeSubscriptionAcquisitionRecord(data);
    },

    async updateAcquisitionStatus(id, payload) {
      const { data, error } = await supabaseClient
        .from("subscription_acquisitions")
        .update({
          status: payload.status,
          platform_subscription_id: payload.platformSubscriptionId || undefined,
          trial_started_at: payload.trialStartedAt || undefined,
          trial_ends_at: payload.trialEndsAt || undefined,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar la adquisición.", error);
      return normalizeSubscriptionAcquisitionRecord(data);
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

    async updateReferral(id, payload) {
      const { data, error } = await supabaseClient
        .from("referrals")
        .update(toDbReferralPayload(payload))
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar el referido.", error);
      return data;
    },

    async countPremiumReferralsByReferrerUserId(referrerUserId, statuses) {
      const { count, error } = await supabaseClient
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_user_id", referrerUserId)
        .in("status", statuses);

      if (error) throw wrapDbError("No se pudo contar los referidos premium.", error);
      return count || 0;
    },

    async countRewardAvailableByReferrerUserId(referrerUserId) {
      const { count, error } = await supabaseClient
        .from("referral_rewards")
        .select("id", { count: "exact", head: true })
        .eq("referrer_user_id", referrerUserId)
        .eq("status", "available");

      if (error) throw wrapDbError("No se pudo contar las recompensas.", error);
      return count || 0;
    },

    async insertReferralReward(payload) {
      const { data, error } = await supabaseClient
        .from("referral_rewards")
        .insert({
          referrer_user_id: payload.referrerUserId,
          milestone_number: payload.milestoneNumber,
          source_referral_id: payload.sourceReferralId || null,
          status: payload.status || "available",
        })
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") return null;
        throw wrapDbError("No se pudo registrar la recompensa.", error);
      }
      return data;
    },

    async getAffiliateCommissionBySubscriptionId(subscriptionId) {
      const { data, error } = await supabaseClient
        .from("affiliate_commissions")
        .select("*")
        .eq("subscription_id", subscriptionId)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar la comisión.", error);
      return data || null;
    },

    async listAffiliateCommissions({ influencerUserId, referredUserId }) {
      const { data, error } = await supabaseClient
        .from("affiliate_commissions")
        .select("*")
        .eq("influencer_user_id", influencerUserId)
        .eq("referred_user_id", referredUserId)
        .order("commission_month_number", { ascending: true });

      if (error) throw wrapDbError("No se pudo listar las comisiones.", error);
      return data || [];
    },

    async insertAffiliateCommission(payload) {
      const { data, error } = await supabaseClient
        .from("affiliate_commissions")
        .insert(toDbCommissionPayload(payload))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo crear la comisión.", error);
      return data;
    },

    async updateAffiliateCommission(id, payload) {
      const { data, error } = await supabaseClient
        .from("affiliate_commissions")
        .update(toDbCommissionPayload(payload))
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar la comisión.", error);
      return data;
    },
  };
}

function normalizeAcquisitionPayload(payload = {}) {
  return {
    userId: payload.userId,
    premiumSource: payload.premiumSource || "stripe",
    acquisitionSource: payload.acquisitionSource || "normal",
    referralCodeId: payload.referralCodeId || null,
    referrerUserId: payload.referrerUserId || null,
    influencerUserId: payload.influencerUserId || null,
    trialSource: normalizeTrialSourceValue(payload.trialSource || "none"),
    trialStartedAt: payload.trialStartedAt || null,
    trialEndsAt: payload.trialEndsAt || null,
    commissionPercent: Number(payload.commissionPercent || 0),
    commissionMonthsLimit: Number(payload.commissionMonthsLimit || 0),
    commissionStartedAt: payload.commissionStartedAt || null,
    commissionEndsAt: payload.commissionEndsAt || null,
    platformSubscriptionId: payload.platformSubscriptionId || null,
    status: payload.status || null,
  };
}

function mergeAcquisitionPayload(existing, payload) {
  const normalized = normalizeAcquisitionPayload(payload);
  const existingSource = existing?.acquisition_source || "normal";
  const preserveAttributedSource =
    !existing?.platform_subscription_id &&
    (existingSource === "referral" || existingSource === "influencer");

  if (!preserveAttributedSource) {
    return normalized;
  }

  return {
    ...normalized,
    acquisitionSource: existingSource,
    referralCodeId: existing?.referral_code_id || normalized.referralCodeId,
    referrerUserId: existing?.referrer_user_id || normalized.referrerUserId,
    influencerUserId: existing?.influencer_user_id || normalized.influencerUserId,
    trialSource: existing?.trial_source || normalized.trialSource,
    trialStartedAt: normalized.trialStartedAt || existing?.trial_started_at || null,
    trialEndsAt: existing?.trial_ends_at || normalized.trialEndsAt,
    commissionPercent:
      Number(existing?.commission_percent ?? normalized.commissionPercent) || 0,
    commissionMonthsLimit:
      Number(existing?.commission_months_limit ?? normalized.commissionMonthsLimit) || 0,
    commissionStartedAt:
      normalized.commissionStartedAt || existing?.commission_started_at || null,
    commissionEndsAt: normalized.commissionEndsAt || existing?.commission_ends_at || null,
  };
}

function toDbAcquisitionPayload(payload = {}, options = {}) {
  const normalized = normalizeAcquisitionPayload(payload);
  const next = {
    user_id: normalized.userId,
    premium_source: normalized.premiumSource,
    acquisition_source: normalized.acquisitionSource,
    referral_code_id: normalized.referralCodeId,
    referrer_user_id: normalized.referrerUserId,
    influencer_user_id: normalized.influencerUserId,
    trial_source: normalized.trialSource,
    trial_started_at: normalized.trialStartedAt,
    trial_ends_at: normalized.trialEndsAt,
    commission_percent: normalized.commissionPercent,
    commission_months_limit: normalized.commissionMonthsLimit,
    commission_started_at: normalized.commissionStartedAt,
    commission_ends_at: normalized.commissionEndsAt,
    platform_subscription_id: normalized.platformSubscriptionId,
    status: normalized.status,
  };

  if (options.includeCreatedAt) {
    next.created_at = new Date().toISOString();
  }

  return next;
}

export function normalizeSubscriptionAcquisitionRecord(acquisition) {
  if (!acquisition) return null;

  const trialSource = normalizeTrialSourceValue(acquisition.trial_source || "none");

  return {
    ...acquisition,
    trial_source: trialSource,
  };
}

function toDbReferralPayload(payload = {}) {
  const next = {};
  if (payload.status) next.status = payload.status;
  if (payload.premiumStartedAt !== undefined) {
    next.premium_started_at = payload.premiumStartedAt;
  }
  if (payload.rewardAvailable !== undefined) {
    next.reward_available = payload.rewardAvailable;
  }
  if (payload.trialEndsAt !== undefined) {
    next.trial_ends_at = payload.trialEndsAt;
  }
  if (payload.trialStartedAt !== undefined) {
    next.trial_started_at = payload.trialStartedAt;
  }
  return next;
}

function toDbCommissionPayload(payload = {}) {
  const next = {};
  if (payload.influencerUserId !== undefined) next.influencer_user_id = payload.influencerUserId;
  if (payload.referredUserId !== undefined) next.referred_user_id = payload.referredUserId;
  if (payload.referralId !== undefined) next.referral_id = payload.referralId;
  if (payload.subscriptionId !== undefined) next.subscription_id = payload.subscriptionId;
  if (payload.amount !== undefined) next.amount = payload.amount;
  if (payload.currency !== undefined) next.currency = payload.currency;
  if (payload.commissionPercent !== undefined) next.commission_percent = payload.commissionPercent;
  if (payload.commissionMonthNumber !== undefined) {
    next.commission_month_number = payload.commissionMonthNumber;
  }
  if (payload.status !== undefined) next.status = payload.status;
  if (payload.createdAt !== undefined) next.created_at = payload.createdAt;
  return next;
}

function wrapDbError(message, error) {
  const wrapped = new Error(message);
  wrapped.statusCode = 500;
  wrapped.cause = error;
  return wrapped;
}

function normalizeTrialSourceValue(value) {
  if (value === "influencer_code") return "influencer_trial";
  if (value === "standard_trial") return "standard_trial";
  if (value === "influencer_trial") return "influencer_trial";
  return "none";
}

function normalizeAmount(amount) {
  return Number(Number(amount || 0).toFixed(2));
}

function addMonths(value, months) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

async function reserveReferralReward({
  repo,
  referrerUserId,
  currentReferralId,
  expectedRewards,
  currentRewardCount,
}) {
  if (expectedRewards <= currentRewardCount) {
    return {
      unlocked: false,
      count: currentRewardCount,
      referral: null,
    };
  }

  const milestoneNumber = currentRewardCount + 1;
  const reward = await repo.insertReferralReward({
    referrerUserId,
    milestoneNumber,
    sourceReferralId: currentReferralId,
    status: "available",
  });

  if (!reward) {
    return {
      unlocked: false,
      count: expectedRewards,
      referral: null,
    };
  }

  const referral = currentReferralId
    ? await repo.updateReferral(currentReferralId, { rewardAvailable: true })
    : null;

  return {
    unlocked: true,
    count: milestoneNumber,
    referral,
  };
}
