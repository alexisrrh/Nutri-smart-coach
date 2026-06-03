import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
process.env.STRIPE_PRICE_ID_YEARLY = "price_yearly";
process.env.FRONTEND_URL = "https://www.nutrismartcoach.com";

const {
  createCheckoutSession,
} = await import("../services/stripe.service.js");
const {
  getTrialConfigForAcquisition,
  INFLUENCER_TRIAL_DAYS,
  STANDARD_TRIAL_DAYS,
} = await import("../services/acquisition.service.js");

describe("stripe checkout trials", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (_url, options) => ({
      ok: true,
      json: async () => ({
        id: "cs_test",
        url: "https://checkout.stripe.test/session",
        options,
      }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 7 days for normal checkout", () => {
    expect(getTrialConfigForAcquisition(null)).toMatchObject({
      acquisitionSource: "normal",
      trialSource: "standard_trial",
      trialDays: STANDARD_TRIAL_DAYS,
    });
  });

  it("returns 7 days for referral checkout", () => {
    expect(
      getTrialConfigForAcquisition({
        acquisition_source: "referral",
      })
    ).toMatchObject({
      acquisitionSource: "referral",
      trialSource: "standard_trial",
      trialDays: STANDARD_TRIAL_DAYS,
    });
  });

  it("returns 15 days for influencer checkout", () => {
    expect(
      getTrialConfigForAcquisition({
        acquisition_source: "influencer",
      })
    ).toMatchObject({
      acquisitionSource: "influencer",
      trialSource: "influencer_trial",
      trialDays: INFLUENCER_TRIAL_DAYS,
    });
  });

  it("sends payment_method_collection always and the requested trial to Stripe", async () => {
    await createCheckoutSession({
      customerId: "cus_123",
      email: "user@example.com",
      priceId: "price_monthly",
      userId: "user-1",
      plan: "monthly",
      trialDays: INFLUENCER_TRIAL_DAYS,
    });

    const call = global.fetch.mock.calls[0];
    const body = call[1].body;

    expect(body.get("payment_method_collection")).toBe("always");
    expect(body.get("subscription_data[trial_period_days]")).toBe(
      String(INFLUENCER_TRIAL_DAYS)
    );
  });
});
