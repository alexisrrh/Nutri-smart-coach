import { generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const { privateKey: googlePlayPrivateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const { privateKey: applePrivateKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});

const {
  defaultMobileVerifier,
  getMobilePremiumConfigStatus,
  normalizeMobileReceiptPayload,
  syncMobilePremiumVerification,
} = await import("../services/mobilePremium.service.js");

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.APPLE_BUNDLE_ID;
  delete process.env.APPLE_ISSUER_ID;
  delete process.env.APPLE_KEY_ID;
  delete process.env.APPLE_PRIVATE_KEY;
  delete process.env.APPLE_ENVIRONMENT;
  delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
  delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
});

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

  it("verifies Apple purchases through the App Store Server API", async () => {
    process.env.APPLE_BUNDLE_ID = "com.nutrismartcoach.app";
    process.env.APPLE_ISSUER_ID = "issuer-id";
    process.env.APPLE_KEY_ID = "key-id";
    process.env.APPLE_PRIVATE_KEY = applePrivateKey.export({
      type: "pkcs8",
      format: "pem",
    });
    process.env.APPLE_ENVIRONMENT = "production";

    const fetchMock = vi.fn(async (input) => {
      expect(String(input)).toBe(
        "https://api.storekit.itunes.apple.com/inApps/v1/transactions/1000000123456789"
      );

      return new Response(
        JSON.stringify({
          signedTransactionInfo: buildAppleSignedTransactionInfo({
            transactionId: "1000000123456789",
            originalTransactionId: "2000000987654321",
            productId: "premium_monthly",
            purchaseDate: String(Date.parse("2026-06-03T10:00:00.000Z")),
            expiresDate: String(Date.parse("2026-07-03T10:00:00.000Z")),
            environment: "Production",
            isTrialPeriod: false,
            isInIntroOfferPeriod: false,
          }),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const verification = await defaultMobileVerifier({
      platform: "apple",
      productId: "premium_monthly",
      transactionId: "1000000123456789",
      originalTransactionId: "2000000987654321",
      receiptData: "base64-receipt",
    });

    expect(verification).toMatchObject({
      verified: true,
      provider: "apple",
      premiumSource: "apple",
      productId: "premium_monthly",
      transactionId: "1000000123456789",
      platformSubscriptionId: "2000000987654321",
      paymentReference: "1000000123456789",
      status: "active",
      isPaid: true,
      isTrial: false,
      isActive: true,
      amount: 7.99,
      currency: "eur",
      startedAt: "2026-06-03T10:00:00.000Z",
      purchasedAt: "2026-06-03T10:00:00.000Z",
      expiresAt: "2026-07-03T10:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("supports Apple sandbox verification through the fallback environment", async () => {
    process.env.APPLE_BUNDLE_ID = "com.nutrismartcoach.app";
    process.env.APPLE_ISSUER_ID = "issuer-id";
    process.env.APPLE_KEY_ID = "key-id";
    process.env.APPLE_PRIVATE_KEY = applePrivateKey.export({
      type: "pkcs8",
      format: "pem",
    });
    process.env.APPLE_ENVIRONMENT = "sandbox";

    const fetchMock = vi.fn(async (input) => {
      expect(String(input)).toBe(
        "https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/1000000123456789"
      );

      return new Response(
        JSON.stringify({
          signedTransactionInfo: buildAppleSignedTransactionInfo({
            transactionId: "1000000123456789",
            originalTransactionId: "2000000987654321",
            productId: "premium_monthly",
            purchaseDate: String(Date.parse("2026-06-03T10:00:00.000Z")),
            expiresDate: String(Date.parse("2026-07-03T10:00:00.000Z")),
            environment: "Sandbox",
          }),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const verification = await defaultMobileVerifier({
      platform: "apple",
      productId: "premium_monthly",
      transactionId: "1000000123456789",
      originalTransactionId: "2000000987654321",
      receiptData: "base64-receipt",
      environment: "sandbox",
    });

    expect(verification.environment).toBe("sandbox");
    expect(verification.isPaid).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects Apple transactions for unsupported products", async () => {
    process.env.APPLE_BUNDLE_ID = "com.nutrismartcoach.app";
    process.env.APPLE_ISSUER_ID = "issuer-id";
    process.env.APPLE_KEY_ID = "key-id";
    process.env.APPLE_PRIVATE_KEY = applePrivateKey.export({
      type: "pkcs8",
      format: "pem",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            signedTransactionInfo: buildAppleSignedTransactionInfo({
              transactionId: "1000000123456789",
              originalTransactionId: "2000000987654321",
              productId: "invalid_product",
              purchaseDate: String(Date.parse("2026-06-03T10:00:00.000Z")),
              expiresDate: String(Date.parse("2026-07-03T10:00:00.000Z")),
              environment: "Production",
            }),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        ))
    );

    await expect(
      defaultMobileVerifier({
        platform: "apple",
        productId: "premium_monthly",
        transactionId: "1000000123456789",
        originalTransactionId: "2000000987654321",
        receiptData: "base64-receipt",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Producto Premium no válido.",
    });
  });

  it("returns inactive for revoked Apple subscriptions", async () => {
    process.env.APPLE_BUNDLE_ID = "com.nutrismartcoach.app";
    process.env.APPLE_ISSUER_ID = "issuer-id";
    process.env.APPLE_KEY_ID = "key-id";
    process.env.APPLE_PRIVATE_KEY = applePrivateKey.export({
      type: "pkcs8",
      format: "pem",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            signedTransactionInfo: buildAppleSignedTransactionInfo({
              transactionId: "1000000123456789",
              originalTransactionId: "2000000987654321",
              productId: "premium_monthly",
              purchaseDate: String(Date.parse("2026-06-03T10:00:00.000Z")),
              expiresDate: String(Date.parse("2026-07-03T10:00:00.000Z")),
              revocationDate: String(Date.parse("2026-06-10T10:00:00.000Z")),
              environment: "Production",
            }),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        ))
    );

    const verification = await defaultMobileVerifier({
      platform: "apple",
      productId: "premium_monthly",
      transactionId: "1000000123456789",
      originalTransactionId: "2000000987654321",
      receiptData: "base64-receipt",
    });

    expect(verification.status).toBe("inactive");
    expect(verification.isActive).toBe(false);
    expect(verification.isPaid).toBe(false);
  });

  it("returns a controlled error when Apple credentials are missing", async () => {
    delete process.env.APPLE_BUNDLE_ID;
    delete process.env.APPLE_ISSUER_ID;
    delete process.env.APPLE_KEY_ID;
    delete process.env.APPLE_PRIVATE_KEY;

    await expect(
      defaultMobileVerifier({
        platform: "apple",
        productId: "premium_monthly",
        transactionId: "1000000123456789",
        receiptData: "base64-receipt",
      })
    ).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining("APPLE_BUNDLE_ID"),
    });
  });

  it("reports missing mobile payment configuration without secrets", () => {
    delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    delete process.env.APPLE_BUNDLE_ID;
    delete process.env.APPLE_ISSUER_ID;
    delete process.env.APPLE_KEY_ID;
    delete process.env.APPLE_PRIVATE_KEY;

    const status = getMobilePremiumConfigStatus({});

    expect(status.googleConfigured).toBe(false);
    expect(status.appleConfigured).toBe(false);
    expect(status.missing).toEqual(
      expect.arrayContaining([
        "GOOGLE_PLAY_PACKAGE_NAME",
        "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
        "APPLE_BUNDLE_ID",
        "APPLE_ISSUER_ID",
        "APPLE_KEY_ID",
        "APPLE_PRIVATE_KEY",
      ])
    );
    expect(JSON.stringify(status)).not.toContain("-----BEGIN");
    expect(JSON.stringify(status)).not.toContain("private-key");
    expect(JSON.stringify(status)).not.toContain("service-account");
  });

  it("reports configured mobile payment providers when variables exist", () => {
    const status = getMobilePremiumConfigStatus({
      GOOGLE_PLAY_PACKAGE_NAME: "com.nutrismartcoach.app",
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:
        '{"client_email":"play@test","private_key":"key"}',
      APPLE_BUNDLE_ID: "com.nutrismartcoach.app",
      APPLE_ISSUER_ID: "issuer-id",
      APPLE_KEY_ID: "key-id",
      APPLE_PRIVATE_KEY: "private-key",
    });

    expect(status).toEqual({
      googleConfigured: true,
      appleConfigured: true,
      missing: [],
    });
  });

  it("verifies Google Play subscriptions through the Android Publisher API", async () => {
    process.env.GOOGLE_PLAY_PACKAGE_NAME = "com.nutrismartcoach.app";
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = JSON.stringify({
      type: "service_account",
      client_email: "play@nutri.iam.gserviceaccount.com",
      private_key: googlePlayPrivateKey.export({ type: "pkcs8", format: "pem" }),
    });

    const fetchMock = vi.fn(async (input, init = {}) => {
      const url = String(input);

      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(
          JSON.stringify({
            access_token: "google-access-token",
            token_type: "Bearer",
            expires_in: 3600,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (
        url ===
        "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.nutrismartcoach.app/purchases/subscriptions/premium_monthly/tokens/purchase-token"
      ) {
        expect(init.headers.Authorization).toBe("Bearer google-access-token");

        return new Response(
          JSON.stringify({
            paymentState: 1,
            orderId: "GPA.1234-5678-9012-34567",
            startTimeMillis: String(Date.parse("2026-06-03T10:00:00.000Z")),
            expiryTimeMillis: String(Date.parse("2026-07-03T10:00:00.000Z")),
            priceAmountMicros: "7990000",
            priceCurrencyCode: "EUR",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const verification = await defaultMobileVerifier({
      platform: "google",
      productId: "premium_monthly",
      transactionId: "GPA.1234-5678-9012-34567",
      purchaseToken: "purchase-token",
    });

    expect(verification).toMatchObject({
      verified: true,
      isPaid: true,
      isTrial: false,
      premiumSource: "google",
      productId: "premium_monthly",
      transactionId: "GPA.1234-5678-9012-34567",
      platformSubscriptionId: "purchase-token",
      status: "active",
      amount: 7.99,
      currency: "eur",
      startedAt: "2026-06-03T10:00:00.000Z",
      expiresAt: "2026-07-03T10:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
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

  it("does not duplicate Google commissions or acquisitions when the same purchase is processed twice", async () => {
    const profileState = {
      id: "user-creator",
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    const repo = createAcquisitionRepo({
      referrals: [
        {
          id: "ref-creator-1",
          referral_code_id: "code-creator-1",
          referrer_user_id: "creator-1",
          referred_user_id: "user-creator",
          type: "creator",
          status: "trialing",
          trial_ends_at: "2026-06-18T10:00:00.000Z",
        },
      ],
      referralCodes: [
        {
          id: "code-creator-1",
          code: "NUTRICOACHER",
        },
      ],
    });

    const verification = {
      verified: true,
      isPaid: true,
      isTrial: false,
      premiumSource: "google",
      productId: "premium_monthly",
      transactionId: "GPA.1234-5678-9012-34567",
      platformSubscriptionId: "purchase-token",
      status: "active",
      startedAt: "2026-06-20T10:00:00.000Z",
      expiresAt: "2026-07-20T10:00:00.000Z",
      amount: 7.99,
      currency: "eur",
    };

    await syncMobilePremiumVerification(
      {
        userId: "user-creator",
        payload: {
          platform: "google",
          productId: "premium_monthly",
          transactionId: "GPA.1234-5678-9012-34567",
          purchaseToken: "purchase-token",
        },
      },
      {
        verifyMobilePremiumReceiptFn: async () => verification,
        getProfileByUserIdFn: async () => profileState,
        upsertProfileSubscriptionFn: async (payload) => {
          Object.assign(profileState, payload);
          return profileState;
        },
        repo,
      }
    );

    await syncMobilePremiumVerification(
      {
        userId: "user-creator",
        payload: {
          platform: "google",
          productId: "premium_monthly",
          transactionId: "GPA.1234-5678-9012-34567",
          purchaseToken: "purchase-token",
        },
      },
      {
        verifyMobilePremiumReceiptFn: async () => verification,
        getProfileByUserIdFn: async () => profileState,
        upsertProfileSubscriptionFn: async (payload) => {
          Object.assign(profileState, payload);
          return profileState;
        },
        repo,
      }
    );

    expect(repo.acquisitions).toHaveLength(1);
    expect(repo.commissions).toHaveLength(1);
    expect(repo.commissions[0]).toMatchObject({
      subscription_id: "GPA.1234-5678-9012-34567",
      payment_reference: "GPA.1234-5678-9012-34567",
      commission_percent: 30,
      commission_month_number: 1,
      status: "payable",
    });
  });
});

function buildAppleSignedTransactionInfo(payload) {
  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", kid: "key-id", typ: "JWT" }),
    "utf8"
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${header}.${body}.signature`;
}

function createAcquisitionRepo(initial = {}) {
  const acquisitions = initial.acquisitions ? [...initial.acquisitions] : [];
  const referrals = initial.referrals ? [...initial.referrals] : [];
  const referralCodes = initial.referralCodes ? [...initial.referralCodes] : [];
  const commissions = initial.commissions ? [...initial.commissions] : [];

  return {
    acquisitions,
    commissions,
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
    async updateReferral(id, payload) {
      const row = referrals.find((item) => item.id === id);
      if (!row) return null;
      Object.assign(row, payload);
      return row;
    },
    async getReferralCodeById(codeId) {
      return referralCodes.find((item) => item.id === codeId) || null;
    },
    async countPremiumReferralsByReferrerUserId() {
      return 0;
    },
    async countRewardAvailableByReferrerUserId() {
      return 0;
    },
    async listAffiliateCommissions({ influencerUserId, referredUserId } = {}) {
      return commissions.filter((item) => {
        if (influencerUserId && item.influencer_user_id !== influencerUserId) {
          return false;
        }
        if (referredUserId && item.referred_user_id !== referredUserId) {
          return false;
        }
        return true;
      });
    },
    async getAffiliateCommissionBySubscriptionId(subscriptionId) {
      return (
        commissions.find((item) => item.subscription_id === subscriptionId) || null
      );
    },
    async updateAffiliateCommission(id, payload) {
      const row = commissions.find((item) => item.id === id);
      if (!row) return null;
      Object.assign(row, payload);
      return row;
    },
    async insertAffiliateCommission(payload) {
      const row = {
        id: `com-${commissions.length + 1}`,
        influencer_user_id: payload.influencerUserId,
        referred_user_id: payload.referredUserId,
        referral_id: payload.referralId,
        subscription_id: payload.subscriptionId,
        amount: payload.amount,
        currency: payload.currency,
        commission_percent: payload.commissionPercent,
        commission_month_number: payload.commissionMonthNumber,
        status: payload.status,
        source_code: payload.sourceCode || null,
        payment_reference: payload.paymentReference || null,
        created_at: payload.createdAt || new Date().toISOString(),
      };
      commissions.push(row);
      return row;
    },
  };
}
