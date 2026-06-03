import { describe, expect, it } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const {
  defaultMobileVerifier,
  normalizeMobileReceiptPayload,
  syncMobilePremiumVerification,
} = await import("../services/mobilePremium.service.js");

describe("mobile premium service", () => {
  it("normalizes Apple mobile receipt payloads", () => {
    const normalized = normalizeMobileReceiptPayload({
      platform: "apple",
      productId: "premium_monthly",
      transactionId: "1000001",
      receiptData: "base64-receipt",
    });

    expect(normalized).toMatchObject({
      platform: "apple",
      productId: "premium_monthly",
      transactionId: "1000001",
      receiptData: "base64-receipt",
    });
  });

  it("normalizes Google Play mobile receipt payloads", () => {
    const normalized = normalizeMobileReceiptPayload({
      platform: "google",
      productId: "premium_monthly",
      transactionId: "GPA.1234-5678",
      purchaseToken: "purchase-token",
    });

    expect(normalized).toMatchObject({
      platform: "google",
      productId: "premium_monthly",
      transactionId: "GPA.1234-5678",
      purchaseToken: "purchase-token",
    });
  });

  it("keeps mobile verification blocked until Apple verification is implemented", async () => {
    process.env.APPLE_BUNDLE_ID = "com.nutrismartcoach.app";
    process.env.APPLE_SHARED_SECRET = "secret";

    await expect(
      defaultMobileVerifier({
        platform: "apple",
        productId: "premium_monthly",
        transactionId: "1000001",
        receiptData: "base64-receipt",
      })
    ).rejects.toMatchObject({
      statusCode: 501,
      message: "La verificación móvil aún no está disponible en este entorno.",
    });
  });

  it("syncs a verified Google Play subscription through the backend source of truth", async () => {
    const profileState = {
      id: "user-google",
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
      premium_source: "google",
      premium_product_id: "premium_monthly",
      premium_platform_transaction_id: "GPA.1234-5678",
      premium_started_at: "2026-06-03T10:00:00.000Z",
      premium_expires_at: "2026-07-03T10:00:00.000Z",
      premium_last_verified_at: "2026-06-03T10:00:00.000Z",
    };

    const result = await syncMobilePremiumVerification(
      {
        userId: "user-google",
        payload: {
          platform: "google",
          productId: "premium_monthly",
          transactionId: "GPA.1234-5678",
          purchaseToken: "purchase-token",
        },
      },
      {
        verifyMobilePremiumReceiptFn: async () => ({
          verified: true,
          isPaid: true,
          isTrial: false,
          premiumSource: "google",
          productId: "premium_monthly",
          transactionId: "GPA.1234-5678",
          platformSubscriptionId: "sub-google-1",
          status: "active",
          startedAt: "2026-06-03T10:00:00.000Z",
          expiresAt: "2026-07-03T10:00:00.000Z",
          amount: 7.99,
          currency: "eur",
        }),
        getProfileByUserIdFn: async () => profileState,
        upsertProfileSubscriptionFn: async (payload) => {
          Object.assign(profileState, payload);
          return profileState;
        },
        repo: createAcquisitionRepo(),
      }
    );

    expect(result.premium).toMatchObject({
      is_premium: true,
      premium_source: "google",
      subscription_status: "active",
      premium_product_id: "premium_monthly",
    });
    expect(profileState.premium_started_at).toBe("2026-06-03T10:00:00.000Z");
  });

  it("ignores injected acquisition attribution from the mobile client", async () => {
    const profileState = {
      id: "user-google",
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    const repo = createAcquisitionRepo();

    await syncMobilePremiumVerification(
      {
        userId: "user-google",
        payload: {
          platform: "google",
          productId: "premium_monthly",
          transactionId: "GPA.9999-0000",
          purchaseToken: "purchase-token",
          acquisitionSource: "influencer",
          referralCodeId: "malicious-code",
          referrerUserId: "attacker-1",
          influencerUserId: "attacker-1",
        },
      },
      {
        verifyMobilePremiumReceiptFn: async () => ({
          verified: true,
          isPaid: false,
          isTrial: true,
          premiumSource: "google",
          productId: "premium_monthly",
          transactionId: "GPA.9999-0000",
          platformSubscriptionId: "sub-google-2",
          status: "trialing",
          startedAt: "2026-06-03T10:00:00.000Z",
          expiresAt: "2026-06-18T10:00:00.000Z",
        }),
        getProfileByUserIdFn: async () => profileState,
        upsertProfileSubscriptionFn: async (payload) => {
          Object.assign(profileState, payload);
          return profileState;
        },
        repo,
      }
    );

    expect(repo.acquisitions[0]).toMatchObject({
      acquisition_source: "normal",
      referral_code_id: null,
      referrer_user_id: null,
      influencer_user_id: null,
    });
  });

  it("derives influencer attribution from existing referral data instead of client payload", async () => {
    const profileState = {
      id: "user-creator",
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    const repo = createAcquisitionRepo({
      referrals: [
        {
          id: "ref-1",
          referral_code_id: "code-1",
          referrer_user_id: "influencer-1",
          referred_user_id: "user-creator",
          type: "influencer",
          status: "trialing",
        },
      ],
    });

    await syncMobilePremiumVerification(
      {
        userId: "user-creator",
        payload: {
          platform: "apple",
          productId: "premium_monthly",
          transactionId: "1000001",
          receiptData: "base64-receipt",
          acquisitionSource: "normal",
        },
      },
      {
        verifyMobilePremiumReceiptFn: async () => ({
          verified: true,
          isPaid: false,
          isTrial: true,
          premiumSource: "apple",
          productId: "premium_monthly",
          transactionId: "1000001",
          platformSubscriptionId: "sub-apple-1",
          status: "trialing",
          startedAt: "2026-06-03T10:00:00.000Z",
          expiresAt: "2026-06-18T10:00:00.000Z",
        }),
        getProfileByUserIdFn: async () => profileState,
        upsertProfileSubscriptionFn: async (payload) => {
          Object.assign(profileState, payload);
          return profileState;
        },
        repo,
      }
    );

    expect(repo.acquisitions[0]).toMatchObject({
      acquisition_source: "influencer",
      referral_code_id: "code-1",
      referrer_user_id: "influencer-1",
      influencer_user_id: "influencer-1",
      trial_source: "influencer_trial",
    });
  });
});

function createAcquisitionRepo(initial = {}) {
  const acquisitions = initial.acquisitions ? [...initial.acquisitions] : [];
  const referrals = initial.referrals ? [...initial.referrals] : [];

  return {
    acquisitions,
    async getAcquisitionByPlatformSubscriptionId(platformSubscriptionId) {
      return (
        acquisitions.find(
          (item) => item.platform_subscription_id === platformSubscriptionId
        ) || null
      );
    },
    async getLatestAcquisitionByUserId(userId) {
      return acquisitions.find((item) => item.user_id === userId) || null;
    },
    async insertAcquisition(payload) {
      const row = {
        id: `acq-${acquisitions.length + 1}`,
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
      acquisitions.push(row);
      return row;
    },
    async updateAcquisition(id, payload) {
      const row = acquisitions.find((item) => item.id === id);
      Object.assign(row, {
        user_id: payload.userId || row.user_id,
        status: payload.status || row.status,
        premium_source: payload.premiumSource || row.premium_source,
        acquisition_source: payload.acquisitionSource || row.acquisition_source,
        trial_source: payload.trialSource || row.trial_source,
        trial_started_at: payload.trialStartedAt || row.trial_started_at,
        trial_ends_at: payload.trialEndsAt || row.trial_ends_at,
        platform_subscription_id:
          payload.platformSubscriptionId || row.platform_subscription_id,
      });
      return row;
    },
    async updateAcquisitionStatus(id, payload) {
      const row = acquisitions.find((item) => item.id === id);
      Object.assign(row, {
        status: payload.status || row.status,
        trial_started_at: payload.trialStartedAt || row.trial_started_at,
        platform_subscription_id:
          payload.platformSubscriptionId || row.platform_subscription_id,
        trial_ends_at: payload.trialEndsAt || row.trial_ends_at,
      });
      return row;
    },
    async getReferralByReferredUserId(referredUserId) {
      return (
        referrals.find((item) => item.referred_user_id === referredUserId) || null
      );
    },
    async countPremiumReferralsByReferrerUserId() {
      return 0;
    },
    async countRewardAvailableByReferrerUserId() {
      return 0;
    },
    async insertAffiliateCommission() {
      throw new Error("Unexpected commission insert");
    },
    async listAffiliateCommissions() {
      return [];
    },
    async getAffiliateCommissionBySubscriptionId() {
      return null;
    },
    async updateAffiliateCommission() {
      return null;
    },
  };
}
