import { describe, expect, it, vi } from "vitest";
process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const {
  applyReferralCode,
  canCreateInfluencerCode,
  createInfluencerCode,
  createUserReferralCode,
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
      { repo, registerSubscriptionAcquisitionFn }
    );

    expect(result.referral.type).toBe("user");
    expect(result.referral.status).toBe("pending");
    expect(result.acquisition.acquisitionSource).toBe("referral");
    expect(result.trial).toMatchObject({
      source: "standard_trial",
      trialDays: 7,
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
      { repo, registerSubscriptionAcquisitionFn }
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
        { repo, registerSubscriptionAcquisitionFn: vi.fn() }
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

  it("supports allowlisted influencer creators", () => {
    process.env.INFLUENCER_CODE_ALLOWLIST_EMAILS = "creator@example.com";

    expect(
      canCreateInfluencerCode({
        userId: "user-1",
        authUser: { role: "authenticated", email: "creator@example.com" },
      })
    ).toBe(true);
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
      return state.rewards.filter((reward) => reward.referrer_user_id === userId);
    },
  };
}
