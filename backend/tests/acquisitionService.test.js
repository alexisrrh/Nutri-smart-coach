import { describe, expect, it } from "vitest";
process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const {
  buildCommissionSubscriptionRef,
  createAffiliateCommissionForPaidInvoice,
  getPremiumStatusAcquisitionSnapshot,
  markReferralPremiumActive,
  registerSubscriptionAcquisition,
  normalizeSubscriptionAcquisitionRecord,
  updateSubscriptionAcquisitionStatus,
} = await import("../services/acquisition.service.js");

describe("acquisition service", () => {
  it("marks normal payments as acquisition_source normal", async () => {
    const state = createAcquisitionState();
    const repo = createAcquisitionRepo(state);

    const result = await markReferralPremiumActive(
      {
        userId: "user-normal",
        premiumSource: "stripe",
        platformSubscriptionId: "sub-normal",
      },
      { repo }
    );

    expect(result.referral).toBeNull();
    expect(result.acquisition.acquisition_source).toBe("normal");
  });

  it("returns a 7 day premium status snapshot for referral acquisitions", () => {
    const snapshot = getPremiumStatusAcquisitionSnapshot({
      acquisition_source: "referral",
      referral_code_id: "code-1",
      trial_source: "standard_trial",
      trial_ends_at: "2026-01-08T00:00:00.000Z",
      commission_percent: 0,
      commission_months_limit: 0,
    });

    expect(snapshot.trial_days).toBe(7);
    expect(snapshot.has_trial_banner).toBe(true);
    expect(snapshot.referral_code_id).toBe("code-1");
  });

  it("returns a 15 day premium status snapshot for influencer acquisitions", () => {
    const snapshot = getPremiumStatusAcquisitionSnapshot({
      acquisition_source: "influencer",
      referral_code_id: "code-2",
      trial_source: "influencer_trial",
      trial_days: 15,
    });

    expect(snapshot.trial_days).toBe(15);
    expect(snapshot.has_trial_banner).toBe(true);
    expect(snapshot.trial_source).toBe("influencer_trial");
  });

  it("creates affiliate commission 30 percent on first paid invoice", async () => {
    const state = createAcquisitionState({
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-1",
          referrer_user_id: "influencer-1",
          referred_user_id: "user-1",
          type: "influencer",
          status: "trialing",
          trial_started_at: "2026-01-01T00:00:00.000Z",
          trial_ends_at: "2026-01-16T00:00:00.000Z",
          premium_started_at: null,
          reward_available: false,
        },
      ],
    });
    const repo = createAcquisitionRepo(state);
    const activation = await markReferralPremiumActive(
      {
        userId: "user-1",
        premiumSource: "stripe",
        platformSubscriptionId: "sub-1",
        paidAt: "2026-02-01T00:00:00.000Z",
      },
      { repo }
    );

    const commission = await createAffiliateCommissionForPaidInvoice(
      {
        influencerUserId: "influencer-1",
        referredUserId: "user-1",
        referralId: "ref-1",
        subscriptionId: buildCommissionSubscriptionRef({
          platformSubscriptionId: "sub-1",
          invoiceId: "in-1",
        }),
        amount: 10,
        currency: "eur",
        commissionPercent: 30,
        commissionMonthsLimit: 12,
        paidAt: "2026-02-01T00:00:00.000Z",
        trialEndsAt: activation.referral.trial_ends_at,
      },
      { repo }
    );

    expect(commission.amount).toBe(3);
    expect(commission.commission_month_number).toBe(1);
    expect(commission.status).toBe("payable");
  });

  it("does not create influencer commission during trial", async () => {
    const state = createAcquisitionState();
    const repo = createAcquisitionRepo(state);

    const commission = await createAffiliateCommissionForPaidInvoice(
      {
        influencerUserId: "influencer-1",
        referredUserId: "user-1",
        referralId: "ref-1",
        subscriptionId: "in-trial",
        amount: 10,
        commissionPercent: 30,
        commissionMonthsLimit: 12,
        paidAt: "2026-01-10T00:00:00.000Z",
        trialEndsAt: "2026-01-16T00:00:00.000Z",
      },
      { repo }
    );

    expect(commission).toBeNull();
  });

  it("marks referral as cancelled when the Stripe trial is cancelled before payment", async () => {
    const state = createAcquisitionState({
      acquisitions: [
        {
          id: "acq-1",
          user_id: "user-1",
          premium_source: "stripe",
          acquisition_source: "influencer",
          referral_code_id: "code-1",
          referrer_user_id: "influencer-1",
          influencer_user_id: "influencer-1",
          trial_source: "influencer_trial",
          trial_started_at: "2026-01-01T00:00:00.000Z",
          trial_ends_at: "2026-01-16T00:00:00.000Z",
          platform_subscription_id: "sub-1",
          status: "trialing",
        },
      ],
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-1",
          referrer_user_id: "influencer-1",
          referred_user_id: "user-1",
          type: "influencer",
          status: "trialing",
          trial_started_at: "2026-01-01T00:00:00.000Z",
          trial_ends_at: "2026-01-16T00:00:00.000Z",
          premium_started_at: null,
          reward_available: false,
        },
      ],
    });
    const repo = createAcquisitionRepo(state);

    await updateSubscriptionAcquisitionStatus(
      {
        userId: "user-1",
        platformSubscriptionId: "sub-1",
        status: "canceled",
      },
      { repo }
    );

    expect(state.referrals[0].status).toBe("cancelled");
    expect(state.commissions).toHaveLength(0);
  });

  it("does not create more than 12 influencer commissions per referred user", async () => {
    const state = createAcquisitionState({
      commissions: Array.from({ length: 12 }, (_, index) => ({
        id: `com-${index + 1}`,
        influencer_user_id: "influencer-1",
        referred_user_id: "user-1",
        referral_id: "ref-1",
        subscription_id: `in-${index + 1}`,
        amount: 3,
        currency: "eur",
        commission_percent: 30,
        commission_month_number: index + 1,
        status: "paid",
      })),
    });
    const repo = createAcquisitionRepo(state);

    const commission = await createAffiliateCommissionForPaidInvoice(
      {
        influencerUserId: "influencer-1",
        referredUserId: "user-1",
        referralId: "ref-1",
        subscriptionId: "in-13",
        amount: 10,
        commissionPercent: 30,
        commissionMonthsLimit: 12,
        paidAt: "2026-03-01T00:00:00.000Z",
      },
      { repo }
    );

    expect(commission).toBeNull();
  });

  it("marks reward_available after 3 premium referrals", async () => {
    const state = createAcquisitionState({
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-1",
          type: "user",
          status: "premium_active",
          reward_available: false,
        },
        {
          id: "ref-2",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-2",
          type: "user",
          status: "premium_active",
          reward_available: false,
        },
        {
          id: "ref-3",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-3",
          type: "user",
          status: "pending",
          reward_available: false,
        },
      ],
      rewards: [],
    });
    const repo = createAcquisitionRepo(state);

    const result = await markReferralPremiumActive(
      {
        userId: "friend-3",
        premiumSource: "stripe",
        platformSubscriptionId: "sub-3",
      },
      { repo }
    );

    expect(result.rewardUnlocked).toBe(true);
    expect(result.referral.reward_available).toBe(true);
    expect(state.rewards).toHaveLength(1);
    expect(state.rewards[0].milestone_number).toBe(1);
  });

  it("can register a pending referral acquisition before payment", async () => {
    const state = createAcquisitionState();
    const repo = createAcquisitionRepo(state);

    const acquisition = await registerSubscriptionAcquisition(
      {
        userId: "user-77",
        premiumSource: "manual",
        acquisitionSource: "referral",
        referralCodeId: "code-1",
        referrerUserId: "owner-1",
        trialSource: "none",
        status: "pending",
      },
      { repo }
    );

    expect(acquisition.acquisition_source).toBe("referral");
    expect(acquisition.status).toBe("pending");
  });

  it("stores standard_trial and influencer_trial as valid acquisition trial sources", async () => {
    const state = createAcquisitionState();
    const repo = createAcquisitionRepo(state);

    const standard = await registerSubscriptionAcquisition(
      {
        userId: "user-std",
        premiumSource: "stripe",
        acquisitionSource: "normal",
        trialSource: "standard_trial",
        status: "pending",
      },
      { repo }
    );
    const influencer = await registerSubscriptionAcquisition(
      {
        userId: "user-inf",
        premiumSource: "stripe",
        acquisitionSource: "influencer",
        trialSource: "influencer_trial",
        status: "pending",
      },
      { repo }
    );

    expect(standard.trial_source).toBe("standard_trial");
    expect(influencer.trial_source).toBe("influencer_trial");
  });

  it("normalizes legacy influencer_code writes to influencer_trial", async () => {
    const state = createAcquisitionState();
    const repo = createAcquisitionRepo(state);

    const acquisition = await registerSubscriptionAcquisition(
      {
        userId: "user-legacy",
        premiumSource: "stripe",
        acquisitionSource: "influencer",
        trialSource: "influencer_code",
      },
      { repo }
    );

    expect(acquisition.trial_source).toBe("influencer_trial");
    expect(state.acquisitions[0].trial_source).toBe("influencer_trial");
  });

  it("normalizes legacy influencer_code reads to influencer_trial", async () => {
    const acquisition = normalizeSubscriptionAcquisitionRecord({
      id: "acq-legacy",
      trial_source: "influencer_code",
    });

    expect(acquisition.trial_source).toBe("influencer_trial");
  });

  it("preserves influencer attribution when Stripe later attaches the subscription id", async () => {
    const state = createAcquisitionState({
      acquisitions: [
        {
          id: "acq-1",
          user_id: "user-15",
          premium_source: "manual",
          acquisition_source: "influencer",
          referral_code_id: "code-1",
          referrer_user_id: "influencer-1",
          influencer_user_id: "influencer-1",
          trial_source: "influencer_trial",
          trial_ends_at: "2026-06-18T00:00:00.000Z",
          commission_percent: 30,
          commission_months_limit: 12,
          commission_started_at: null,
          commission_ends_at: null,
          platform_subscription_id: null,
          status: "trialing",
        },
      ],
    });
    const repo = createAcquisitionRepo(state);

    const acquisition = await registerSubscriptionAcquisition(
      {
        userId: "user-15",
        premiumSource: "stripe",
        acquisitionSource: "normal",
        platformSubscriptionId: "sub-15",
        status: "trialing",
      },
      { repo }
    );

    expect(acquisition.acquisition_source).toBe("influencer");
    expect(acquisition.referral_code_id).toBe("code-1");
    expect(acquisition.influencer_user_id).toBe("influencer-1");
    expect(acquisition.platform_subscription_id).toBe("sub-15");
    expect(acquisition.premium_source).toBe("stripe");
  });

  it("keeps reward creation idempotent when the milestone was already reserved", async () => {
    const state = createAcquisitionState({
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-1",
          type: "user",
          status: "premium_active",
          reward_available: true,
        },
        {
          id: "ref-2",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-2",
          type: "user",
          status: "premium_active",
          reward_available: false,
        },
        {
          id: "ref-3",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-3",
          type: "user",
          status: "pending",
          reward_available: false,
        },
      ],
      rewards: [
        {
          id: "reward-1",
          referrer_user_id: "owner-1",
          milestone_number: 1,
          status: "available",
        },
      ],
    });
    const repo = createAcquisitionRepo(state);

    const result = await markReferralPremiumActive(
      {
        userId: "friend-3",
        premiumSource: "stripe",
        platformSubscriptionId: "sub-3",
      },
      { repo }
    );

    expect(result.rewardUnlocked).toBe(false);
    expect(result.rewardCount).toBe(1);
    expect(state.rewards).toHaveLength(1);
  });
});

function createAcquisitionState(initial = {}) {
  return {
    acquisitions: initial.acquisitions ? [...initial.acquisitions] : [],
    referrals: initial.referrals ? [...initial.referrals] : [],
    commissions: initial.commissions ? [...initial.commissions] : [],
    rewards: initial.rewards ? [...initial.rewards] : [],
  };
}

function createAcquisitionRepo(state) {
  return {
    async getAcquisitionByPlatformSubscriptionId(platformSubscriptionId) {
      return (
        state.acquisitions.find(
          (item) => item.platform_subscription_id === platformSubscriptionId
        ) || null
      );
    },
    async getLatestAcquisitionByUserId(userId) {
      return (
        [...state.acquisitions]
          .reverse()
          .find((item) => item.user_id === userId) || null
      );
    },
    async insertAcquisition(payload) {
      const row = {
        id: `acq-${state.acquisitions.length + 1}`,
        user_id: payload.userId,
        premium_source: payload.premiumSource,
        acquisition_source: payload.acquisitionSource,
        referral_code_id: payload.referralCodeId || null,
        referrer_user_id: payload.referrerUserId || null,
        influencer_user_id: payload.influencerUserId || null,
        trial_source: payload.trialSource || "none",
        trial_started_at: payload.trialStartedAt || null,
        trial_ends_at: payload.trialEndsAt || null,
        commission_percent: payload.commissionPercent || 0,
        commission_months_limit: payload.commissionMonthsLimit || 0,
        commission_started_at: payload.commissionStartedAt || null,
        commission_ends_at: payload.commissionEndsAt || null,
        platform_subscription_id: payload.platformSubscriptionId || null,
        status: payload.status || null,
      };
      state.acquisitions.push(row);
      return row;
    },
    async updateAcquisition(id, payload) {
      const row = state.acquisitions.find((item) => item.id === id);
      Object.assign(row, {
        user_id: payload.userId,
        premium_source: payload.premiumSource,
        acquisition_source: payload.acquisitionSource,
        referral_code_id: payload.referralCodeId || null,
        referrer_user_id: payload.referrerUserId || null,
        influencer_user_id: payload.influencerUserId || null,
        trial_source: payload.trialSource || "none",
        trial_started_at: payload.trialStartedAt || null,
        trial_ends_at: payload.trialEndsAt || null,
        commission_percent: payload.commissionPercent || 0,
        commission_months_limit: payload.commissionMonthsLimit || 0,
        commission_started_at: payload.commissionStartedAt || null,
        commission_ends_at: payload.commissionEndsAt || null,
        platform_subscription_id: payload.platformSubscriptionId || null,
        status: payload.status || null,
      });
      return row;
    },
    async updateAcquisitionStatus(id, payload) {
      const row = state.acquisitions.find((item) => item.id === id);
      Object.assign(row, {
        status: payload.status,
        trial_started_at: payload.trialStartedAt || row.trial_started_at,
        platform_subscription_id:
          payload.platformSubscriptionId || row.platform_subscription_id,
        trial_ends_at: payload.trialEndsAt || row.trial_ends_at,
      });
      return row;
    },
    async getReferralByReferredUserId(referredUserId) {
      return (
        state.referrals.find(
          (item) => item.referred_user_id === referredUserId
        ) || null
      );
    },
    async updateReferral(id, payload) {
      const row = state.referrals.find((item) => item.id === id);
      if (payload.status !== undefined) row.status = payload.status;
      if (payload.premiumStartedAt !== undefined) {
        row.premium_started_at = payload.premiumStartedAt;
      }
      if (payload.rewardAvailable !== undefined) {
        row.reward_available = payload.rewardAvailable;
      }
      if (payload.trialEndsAt !== undefined) {
        row.trial_ends_at = payload.trialEndsAt;
      }
      if (payload.trialStartedAt !== undefined) {
        row.trial_started_at = payload.trialStartedAt;
      }
      return row;
    },
    async countPremiumReferralsByReferrerUserId(referrerUserId, statuses) {
      return state.referrals.filter(
        (item) =>
          item.referrer_user_id === referrerUserId &&
          statuses.includes(item.status)
      ).length;
    },
    async countRewardAvailableByReferrerUserId(referrerUserId) {
      return state.rewards.filter(
        (item) =>
          item.referrer_user_id === referrerUserId &&
          item.status === "available"
      ).length;
    },
    async insertReferralReward(payload) {
      const duplicate = state.rewards.find(
        (item) =>
          item.referrer_user_id === payload.referrerUserId &&
          item.milestone_number === payload.milestoneNumber
      );
      if (duplicate) return null;

      const row = {
        id: `reward-${state.rewards.length + 1}`,
        referrer_user_id: payload.referrerUserId,
        milestone_number: payload.milestoneNumber,
        source_referral_id: payload.sourceReferralId || null,
        status: payload.status || "available",
      };
      state.rewards.push(row);
      return row;
    },
    async getAffiliateCommissionBySubscriptionId(subscriptionId) {
      return (
        state.commissions.find(
          (item) => item.subscription_id === subscriptionId
        ) || null
      );
    },
    async listAffiliateCommissions({ influencerUserId, referredUserId }) {
      return state.commissions.filter(
        (item) =>
          item.influencer_user_id === influencerUserId &&
          item.referred_user_id === referredUserId
      );
    },
    async insertAffiliateCommission(payload) {
      const row = {
        id: `com-${state.commissions.length + 1}`,
        influencer_user_id: payload.influencerUserId,
        referred_user_id: payload.referredUserId,
        referral_id: payload.referralId,
        subscription_id: payload.subscriptionId,
        amount: payload.amount,
        currency: payload.currency,
        commission_percent: payload.commissionPercent,
        commission_month_number: payload.commissionMonthNumber,
        status: payload.status,
        created_at: payload.createdAt,
      };
      state.commissions.push(row);
      return row;
    },
    async updateAffiliateCommission(id, payload) {
      const row = state.commissions.find((item) => item.id === id);
      Object.assign(row, payload);
      return row;
    },
  };
}
