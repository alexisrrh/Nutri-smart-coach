import { describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

const mockState = vi.hoisted(() => ({
  referralType: "influencer",
  commissionCalls: [],
}));

vi.mock("../middleware/auth.js", () => ({
  verifySupabaseUser(_req, res, next) {
    void res;
    return next();
  },
  requireAuthenticatedUser(req, res) {
    void res;
    return req?.authUser?.id || null;
  },
}));

vi.mock("../services/stripe.service.js", () => ({
  assertStripeCheckoutConfig: vi.fn(),
  assertStripeWebhookConfig: vi.fn(),
  buildSubscriptionProfileUpdate: vi.fn(),
  constructStripeWebhookEvent: vi.fn((payload) => payload),
  createBillingPortalSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  createStripeCustomer: vi.fn(),
  getConfiguredPriceId: vi.fn(),
  retrieveSubscription: vi.fn(),
  serializePremiumProfile: vi.fn(),
}));

vi.mock("../services/acquisition.service.js", () => ({
  buildCommissionSubscriptionRef: vi.fn(
    ({ platformSubscriptionId, invoiceId }) =>
      `${platformSubscriptionId}:${invoiceId}`
  ),
  createAffiliateCommissionForPaidInvoice: vi.fn(async (payload) => {
    mockState.commissionCalls.push(payload);
    return {
      id: "commission-1",
      ...payload,
    };
  }),
  getTrialConfigForAcquisition: vi.fn(),
  getPremiumStatusAcquisitionSnapshot: vi.fn(),
  markAffiliateCommissionRefunded: vi.fn(),
  markReferralPremiumActive: vi.fn(async ({ userId, paidAt, status }) => ({
    referral: {
      id: "ref-1",
      referrer_user_id: "referrer-1",
      referred_user_id: userId,
      type: mockState.referralType,
      trial_ends_at: "2026-01-16T00:00:00.000Z",
    },
    acquisition: {
      commission_percent: 30,
      commission_months_limit: 12,
      status,
      paid_at: paidAt,
    },
    rewardUnlocked: false,
    rewardCount: 0,
  })),
  normalizeSubscriptionAcquisitionRecord: vi.fn(),
  registerSubscriptionAcquisition: vi.fn(),
  updateSubscriptionAcquisitionStatus: vi.fn(),
}));

vi.mock("../services/mobilePremium.service.js", () => ({
  syncMobilePremiumVerification: vi.fn(),
  getMobilePremiumConfigStatus: vi.fn(),
}));

const { default: paymentsRouter } = await import("../routes/payments.routes.js");

function invokeRouter(method, path, { body = {}, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url: path,
      originalUrl: path,
      headers: Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
      ),
      body,
      authUser: null,
      get(name) {
        return this.headers[String(name).toLowerCase()] || "";
      },
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve(this);
        return this;
      },
      send(payload) {
        this.body = payload;
        resolve(this);
        return this;
      },
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return this.headers[String(name).toLowerCase()];
      },
      end(payload) {
        if (payload !== undefined) {
          this.body = payload;
        }
        resolve(this);
      },
    };

    paymentsRouter.handle(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(res);
    });
  });
}

describe("payments routes", () => {
  it.each([
    ["influencer", 1],
    ["creator", 1],
    ["user", 0],
  ])(
    "creates affiliate commission for %s referrals on Stripe invoice payment",
    async (referralType, expectedCalls) => {
      mockState.referralType = referralType;
      mockState.commissionCalls = [];

      const response = await invokeRouter("POST", "/stripe/webhook", {
        body: {
          id: "evt_1",
          type: "invoice.payment_succeeded",
          data: {
            object: {
              id: "in_1",
              subscription: "sub_1",
              customer: "cus_1",
              amount_paid: 1200,
              paid: true,
              currency: "eur",
              subscription_details: {
                metadata: {
                  user_id: "user-1",
                },
              },
            },
          },
        },
        headers: {
          "stripe-signature": "t=123,v1=dummy",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(mockState.commissionCalls).toHaveLength(expectedCalls);

      if (expectedCalls === 1) {
        expect(mockState.commissionCalls[0]).toMatchObject({
          influencerUserId: "referrer-1",
          referredUserId: "user-1",
          referralId: "ref-1",
          subscriptionId: "sub_1:in_1",
          amount: 12,
          currency: "eur",
          commissionPercent: 30,
          commissionMonthsLimit: 12,
          premiumSource: "stripe",
        });
      }
    }
  );
});
