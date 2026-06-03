import { describe, expect, it } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const { buildSubscriptionProfileUpdate } = await import("../services/stripe.service.js");
const { buildMobilePremiumProfileUpdate } = await import(
  "../services/mobilePremium.service.js"
);

describe("premium profile timestamps", () => {
  it("treats a Stripe trial as premium", () => {
    const update = buildSubscriptionProfileUpdate(
      {
        id: "sub-trial",
        status: "trialing",
        customer: "cus-1",
        current_period_end: Math.floor(new Date("2026-07-01T00:00:00.000Z").getTime() / 1000),
        items: {
          data: [{ price: { id: "price_monthly" } }],
        },
      },
      "user-trial"
    );

    expect(update.plan).toBe("premium");
    expect(update.is_premium).toBe(true);
    expect(update.subscription_status).toBe("trialing");
  });

  it("preserves premium_started_at for Stripe subscription sync", () => {
    const update = buildSubscriptionProfileUpdate(
      {
        id: "sub-1",
        status: "active",
        customer: "cus-1",
        current_period_end: Math.floor(new Date("2026-07-01T00:00:00.000Z").getTime() / 1000),
        items: {
          data: [{ price: { id: "price_monthly" } }],
        },
      },
      "user-1",
      {
        premium_started_at: "2026-06-01T00:00:00.000Z",
      }
    );

    expect(update.premium_started_at).toBe("2026-06-01T00:00:00.000Z");
  });

  it("preserves premium_started_at for mobile verification sync", () => {
    const update = buildMobilePremiumProfileUpdate(
      {
        status: "active",
        premiumSource: "google",
        productId: "premium_monthly",
        transactionId: "GPA.1234",
        startedAt: "2026-06-10T00:00:00.000Z",
        expiresAt: "2026-07-10T00:00:00.000Z",
      },
      "user-2",
      {
        premium_started_at: "2026-06-01T00:00:00.000Z",
      }
    );

    expect(update.premium_started_at).toBe("2026-06-01T00:00:00.000Z");
  });
});
