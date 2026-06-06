import { describe, expect, it, vi } from "vitest";
process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const {
  applyReferralCode,
  claimReferralReward,
  canCreateInfluencerCode,
  createCreatorCode,
  createInfluencerCode,
  createUserReferralCode,
  getMyReferralStats,
  validateReferralCode,
} = await import("../services/referral.service.js");

describe("referral service", () => {
  it("creates a user referral code", async () => {
    const state = createReferralState();
    const repo = createReferralRepo(state);

    const code = await createUserReferralCode("user-1", { repo });

    expect(code.user_id).toBe("user-1");
    expect(code.type).toBe("user");
    expect(code.code).toMatch(/^NSC/);
  });

  it("applies a user referral code", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
    });
    const repo = createReferralRepo(state);
    const registerSubscriptionAcquisitionFn = vi.fn(async (payload) => payload);

    const result = await applyReferralCode(
      { userId: "user-2", code: "friend1" },
      {
        repo,
        registerSubscriptionAcquisitionFn,
        currentUserCreatedAt: "2026-06-04T10:05:00.000Z",
        now: new Date("2026-06-04T10:10:00.000Z"),
      }
    );

    expect(result.referral.type).toBe("user");
    expect(result.referral.status).toBe("pending");
    expect(result.acquisition.acquisitionSource).toBe("referral");
    expect(result.trial).toMatchObject({
      source: "standard_trial",
      trialDays: 7,
    });
  });

  it("validates a user referral code without applying it", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
    });
    const repo = createReferralRepo(state);

    const result = await validateReferralCode("friend1", { repo });

    expect(result).toEqual({
      valid: true,
      type: "user",
      trialDays: 7,
    });
  });

  it("rejects invalid referral codes in validation", async () => {
    const state = createReferralState();
    const repo = createReferralRepo(state);

    const result = await validateReferralCode("5555", { repo });

    expect(result).toEqual({
      valid: false,
      type: null,
      trialDays: 0,
    });
  });

  it("allows a freshly created user to apply a referral code during onboarding", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
      profile: {
        id: "user-2",
        created_at: new Date("2026-06-04T10:00:00.000Z").toISOString(),
      },
    });
    const repo = createReferralRepo(state);
    const registerSubscriptionAcquisitionFn = vi.fn(async (payload) => payload);

    const result = await applyReferralCode(
      { userId: "user-2", code: "FRIEND1" },
      {
        repo,
        registerSubscriptionAcquisitionFn,
        currentUserCreatedAt: "2026-06-04T10:05:00.000Z",
        now: new Date("2026-06-04T10:20:00.000Z"),
      }
    );

    expect(result.referral.type).toBe("user");
    expect(result.acquisition.acquisitionSource).toBe("referral");
  });

  it("blocks referral code application after the 30 minute onboarding window", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
      profile: {
        id: "user-2",
        created_at: "2026-06-04T10:00:00.000Z",
      },
    });
    const repo = createReferralRepo(state);

    await expect(
      applyReferralCode(
        { userId: "user-2", code: "FRIEND1" },
        {
          repo,
          registerSubscriptionAcquisitionFn: vi.fn(),
          currentUserCreatedAt: "2026-06-04T10:00:00.000Z",
          now: new Date("2026-06-04T10:31:00.000Z"),
        }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "El código solo puede aplicarse durante los primeros 30 minutos del registro.",
    });
  });

  it("blocks self referral", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "user-1",
          code: "MINE1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
    });
    const repo = createReferralRepo(state);

    await expect(
      applyReferralCode(
        { userId: "user-1", code: "MINE1" },
        { repo, registerSubscriptionAcquisitionFn: vi.fn() }
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "No puedes usar tu propio código.",
    });
  });

  it("applies an influencer code with 15 day checkout trial attribution", async () => {
    const state = createReferralState();
    const repo = createReferralRepo(state);
    const registerSubscriptionAcquisitionFn = vi.fn(async (payload) => payload);

    await createInfluencerCode("influencer-1", "creator30", {
      repo,
      authUser: { role: "admin", email: "admin@example.com" },
    });

    const result = await applyReferralCode(
      { userId: "user-9", code: "creator30" },
      {
        repo,
        registerSubscriptionAcquisitionFn,
        currentUserCreatedAt: "2026-06-04T10:05:00.000Z",
        now: new Date("2026-06-04T10:10:00.000Z"),
      }
    );

    expect(result.referral.type).toBe("influencer");
    expect(result.referral.status).toBe("pending");
    expect(result.trial.source).toBe("influencer_trial");
    expect(result.referral.trial_ends_at).toBeNull();
    expect(result.acquisition.commissionPercent).toBe(30);
    expect(result.acquisition.commissionMonthsLimit).toBe(12);
    expect(result.acquisition.trialSource).toBe("influencer_trial");
    expect(result.trial.trialDays).toBe(15);
  });

  it("creates a creator code with 15 days and 30% commission", async () => {
    const state = createReferralState();
    const repo = createReferralRepo(state);

    const code = await createCreatorCode("creator-1", "", {
      repo,
    });

    expect(code.type).toBe("creator");
    expect(code.trial_days).toBe(15);
    expect(code.commission_percent).toBe(30);
    expect(code.commission_months_limit).toBe(12);
  });

  it("applies a creator code with creator trial attribution", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "creator-1",
          code: "CREATOR30",
          type: "creator",
          trial_days: 15,
          commission_percent: 30,
          commission_months_limit: 12,
          is_active: true,
        },
      ],
    });
    const repo = createReferralRepo(state);
    const registerSubscriptionAcquisitionFn = vi.fn(async (payload) => payload);

    const result = await applyReferralCode(
      { userId: "user-9", code: "creator30" },
      {
        repo,
        registerSubscriptionAcquisitionFn,
        currentUserCreatedAt: "2026-06-04T10:05:00.000Z",
        now: new Date("2026-06-04T10:10:00.000Z"),
      }
    );

    expect(result.referral.type).toBe("creator");
    expect(result.referral.status).toBe("pending");
    expect(result.trial.source).toBe("creator_trial");
    expect(result.referral.trial_ends_at).toBeNull();
    expect(result.acquisition.commissionPercent).toBe(30);
    expect(result.acquisition.commissionMonthsLimit).toBe(12);
    expect(result.acquisition.trialSource).toBe("creator_trial");
    expect(result.trial.trialDays).toBe(15);
  });

  it("blocks influencer code creation for normal users", async () => {
    const state = createReferralState();
    const repo = createReferralRepo(state);

    await expect(
      createInfluencerCode("user-1", "creator30", {
        repo,
        authUser: { role: "authenticated", email: "user-1@example.com" },
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "No tienes permisos para crear códigos influencer.",
    });
  });

  it("allows influencer code creation for admins", async () => {
    const state = createReferralState();
    const repo = createReferralRepo(state);

    const code = await createInfluencerCode("admin-1", "creator30", {
      repo,
      authUser: { role: "admin", email: "admin@example.com" },
    });

    expect(code.type).toBe("influencer");
    expect(code.code).toBe("CREATOR30");
  });

  it("blocks referral code application for premium users", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
      profile: {
        id: "user-2",
        plan: "premium",
        is_premium: true,
        subscription_status: "active",
      },
    });
    const repo = createReferralRepo(state);

    await expect(
      applyReferralCode(
        { userId: "user-2", code: "FRIEND1" },
        {
          repo,
          registerSubscriptionAcquisitionFn: vi.fn(),
          currentUserCreatedAt: "2026-06-04T10:05:00.000Z",
          now: new Date("2026-06-04T10:10:00.000Z"),
        }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "El código solo puede aplicarse durante el registro inicial.",
    });
  });

  it("blocks referral code application when the user already has acquisition history", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
      acquisitions: [
        {
          id: "acq-1",
          user_id: "user-2",
          acquisition_source: "normal",
        },
      ],
    });
    const repo = createReferralRepo(state);

    await expect(
      applyReferralCode(
        { userId: "user-2", code: "FRIEND1" },
        { repo, registerSubscriptionAcquisitionFn: vi.fn() }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "El código solo puede aplicarse durante el registro inicial.",
    });
  });

  it("blocks referral code application when the user already has a referral", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-1",
          user_id: "owner-1",
          code: "FRIEND1",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
      ],
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-9",
          referrer_user_id: "owner-9",
          referred_user_id: "user-2",
          type: "user",
          status: "pending",
        },
      ],
    });
    const repo = createReferralRepo(state);

    await expect(
      applyReferralCode(
        { userId: "user-2", code: "FRIEND1" },
        {
          repo,
          registerSubscriptionAcquisitionFn: vi.fn(),
          currentUserCreatedAt: "2026-06-04T10:05:00.000Z",
          now: new Date("2026-06-04T10:10:00.000Z"),
        }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Ya tienes un código aplicado.",
    });
  });

  it("supports allowlisted influencer creators", () => {
    process.env.INFLUENCER_CODE_ALLOWLIST_EMAILS = "creator@example.com";

    expect(
      canCreateInfluencerCode({
        userId: "user-1",
        authUser: { role: "authenticated", email: "creator@example.com" },
      })
    ).toBe(true);
  });

  it("returns claimable reward stats when a reward is available", async () => {
    const state = createReferralState({
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-1",
          type: "user",
          status: "premium_active",
        },
        {
          id: "ref-2",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-2",
          type: "user",
          status: "premium_active",
        },
        {
          id: "ref-3",
          referral_code_id: "code-1",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-3",
          type: "user",
          status: "premium_active",
        },
      ],
      rewards: [
        {
          id: "reward-1",
          referrer_user_id: "owner-1",
          milestone_number: 1,
          status: "available",
          created_at: "2026-06-04T11:00:00.000Z",
        },
      ],
    });
    const repo = createReferralRepo(state);

    const stats = await getMyReferralStats("owner-1", { repo });

    expect(stats.premiumReferralsCount).toBe(3);
    expect(stats.nextMilestone).toBe(3);
    expect(stats.rewardsAvailable).toBe(1);
    expect(stats.rewardsClaimed).toBe(0);
    expect(stats.canClaimReward).toBe(true);
    expect(stats.latestReward).toMatchObject({
      id: "reward-1",
      status: "available",
    });
  });

  it("claims a referral reward and extends premium for one month", async () => {
    const state = createReferralState({
      profile: {
        id: "owner-1",
        plan: "premium",
        is_premium: true,
        subscription_status: "active",
        premium_expires_at: "2026-06-20T10:00:00.000Z",
        premium_started_at: "2026-05-20T10:00:00.000Z",
      },
      rewards: [
        {
          id: "reward-1",
          referrer_user_id: "owner-1",
          milestone_number: 1,
          source_referral_id: "ref-3",
          status: "available",
        },
      ],
    });
    const repo = createReferralRepo(state);
    const profileState = {
      id: "owner-1",
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
      premium_expires_at: "2026-06-20T10:00:00.000Z",
      premium_started_at: "2026-05-20T10:00:00.000Z",
    };
    const upsertProfileSubscriptionFn = vi.fn(async (payload) => {
      Object.assign(profileState, payload);
      return profileState;
    });

    const result = await claimReferralReward(
      { userId: "owner-1" },
      {
        repo,
        getProfileByUserIdFn: async () => profileState,
        upsertProfileSubscriptionFn,
        registerSubscriptionAcquisitionFn: vi.fn(async (payload) => payload),
        now: new Date("2026-06-04T10:00:00.000Z"),
      }
    );

    expect(result.reward.status).toBe("claimed");
    expect(result.reward.claimed_at).toBe("2026-06-04T10:00:00.000Z");
    expect(profileState.premium_expires_at).toBe("2026-07-20T10:00:00.000Z");
    expect(profileState.plan).toBe("premium");
    expect(profileState.is_premium).toBe(true);
    expect(profileState.subscription_status).toBe("active");
    expect(result.acquisition.acquisitionSource).toBe("referral");
    expect(result.acquisition.premiumSource).toBe("manual");
  });

  it("filters user referral stats to user codes when requested", async () => {
    const state = createReferralState({
      codes: [
        {
          id: "code-user",
          user_id: "owner-1",
          code: "USER123",
          type: "user",
          trial_days: 0,
          commission_percent: 0,
          commission_months_limit: 0,
          is_active: true,
        },
        {
          id: "code-creator",
          user_id: "owner-1",
          code: "CREATOR30",
          type: "creator",
          trial_days: 15,
          commission_percent: 30,
          commission_months_limit: 12,
          is_active: true,
        },
      ],
      referrals: [
        {
          id: "ref-user",
          referral_code_id: "code-user",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-user",
          type: "user",
          status: "premium_active",
        },
        {
          id: "ref-creator",
          referral_code_id: "code-creator",
          referrer_user_id: "owner-1",
          referred_user_id: "friend-creator",
          type: "creator",
          status: "premium_active",
        },
      ],
    });
    const repo = createReferralRepo(state);

    const stats = await getMyReferralStats("owner-1", {
      repo,
      codeType: "user",
      referralType: "user",
    });

    expect(stats.codes).toHaveLength(1);
    expect(stats.codes[0].type).toBe("user");
    expect(stats.summary.totalReferrals).toBe(1);
    expect(stats.summary.premiumActiveReferrals).toBe(1);
  });

  it("does not double claim a reward twice", async () => {
    const state = createReferralState({
      rewards: [
        {
          id: "reward-1",
          referrer_user_id: "owner-1",
          milestone_number: 1,
          status: "claimed",
          claimed_at: "2026-06-04T10:00:00.000Z",
        },
      ],
    });
    const repo = createReferralRepo(state);

    await expect(
      claimReferralReward(
        { userId: "owner-1" },
        {
          repo,
          getProfileByUserIdFn: async () => ({
            id: "owner-1",
            plan: "premium",
            is_premium: true,
            subscription_status: "active",
            premium_expires_at: "2026-06-20T10:00:00.000Z",
          }),
          upsertProfileSubscriptionFn: vi.fn(),
          registerSubscriptionAcquisitionFn: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "No tienes una recompensa disponible para reclamar.",
    });
  });
});

function createReferralState(initial = {}) {
  return {
    codes: initial.codes ? [...initial.codes] : [],
    referrals: initial.referrals ? [...initial.referrals] : [],
    commissions: initial.commissions ? [...initial.commissions] : [],
    acquisitions: initial.acquisitions ? [...initial.acquisitions] : [],
    rewards: initial.rewards ? [...initial.rewards] : [],
    profile: initial.profile || null,
  };
}

function createReferralRepo(state) {
  return {
    async getCodeByUserAndType(userId, type) {
      return (
        state.codes.find(
          (code) => code.user_id === userId && code.type === type
        ) || null
      );
    },
    async getActiveCodeByUserAndType(userId, type) {
      return (
        state.codes.find(
          (code) =>
            code.user_id === userId &&
            code.type === type &&
            code.is_active === true
        ) || null
      );
    },
    async getCodeByCode(code) {
      return state.codes.find((item) => item.code === code) || null;
    },
    async insertCode(payload) {
      const row = {
        id: `code-${state.codes.length + 1}`,
        user_id: payload.userId,
        code: payload.code,
        type: payload.type,
        trial_days: payload.trialDays,
        commission_percent: payload.commissionPercent,
        commission_months_limit: payload.commissionMonthsLimit,
        is_active: payload.isActive,
      };
      state.codes.push(row);
      return row;
    },
    async updateCode(id, payload) {
      const row = state.codes.find((code) => code.id === id);
      Object.assign(row, {
        user_id: payload.userId,
        code: payload.code,
        type: payload.type,
        trial_days: payload.trialDays,
        commission_percent: payload.commissionPercent,
        commission_months_limit: payload.commissionMonthsLimit,
        is_active: payload.isActive,
      });
      return row;
    },
    async getReferralByReferredUserId(referredUserId) {
      return (
        state.referrals.find(
          (referral) => referral.referred_user_id === referredUserId
        ) || null
      );
    },
    async hasAnyAcquisitionByUserId(userId) {
      return state.acquisitions.some((acquisition) => acquisition.user_id === userId);
    },
    async getProfileByUserId() {
      return state.profile;
    },
    async insertReferral(payload) {
      const row = {
        id: `ref-${state.referrals.length + 1}`,
        referral_code_id: payload.referralCodeId,
        referrer_user_id: payload.referrerUserId,
        referred_user_id: payload.referredUserId,
        type: payload.type,
        status: payload.status,
        trial_started_at: payload.trialStartedAt,
        trial_ends_at: payload.trialEndsAt,
        premium_started_at: payload.premiumStartedAt,
        reward_available: payload.rewardAvailable,
      };
      state.referrals.push(row);
      return row;
    },
    async listCodesByUserId(userId) {
      return state.codes.filter((code) => code.user_id === userId);
    },
    async listReferralsByReferrerUserId(userId) {
      return state.referrals.filter((referral) => referral.referrer_user_id === userId);
    },
    async listAffiliateCommissionsByInfluencerUserId(userId) {
      return state.commissions.filter(
        (commission) => commission.influencer_user_id === userId
      );
    },
    async listReferralRewardsByReferrerUserId(userId) {
      return state.rewards
        .filter((reward) => reward.referrer_user_id === userId)
        .sort((a, b) => Number(a.milestone_number) - Number(b.milestone_number));
    },
    async getAvailableReferralRewardByReferrerUserId(userId) {
      return (
        state.rewards.find(
          (reward) =>
            reward.referrer_user_id === userId && reward.status === "available"
        ) || null
      );
    },
    async updateReferralReward(id, payload) {
      const row = state.rewards.find((reward) => reward.id === id);
      if (!row) return null;
      if (payload.status !== undefined) row.status = payload.status;
      if (payload.claimedAt !== undefined) row.claimed_at = payload.claimedAt;
      return row;
    },
  };
}
