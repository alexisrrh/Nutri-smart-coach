import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  profile: null,
  count: 0,
}));

vi.mock("../config/supabase.js", () => ({
  supabase: {
    from(table) {
      return createQuery(table);
    },
  },
}));

const { checkDailyAiLimit, getDailyAiUsage } = await import("../utils/aiUsage.js");

describe("AI usage premium limits", () => {
  beforeEach(() => {
    mockState.profile = null;
    mockState.count = 0;
  });

  it("applies free limits from Supabase subscription state", async () => {
    mockState.profile = {
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    mockState.count = 1;

    const usage = await getDailyAiUsage({
      userId: "user-free",
      type: "diet_generation",
    });

    expect(usage).toMatchObject({
      usedToday: 1,
      limit: 1,
      plan: "free",
      upgradeAvailable: true,
      isLimitReached: true,
    });
  });

  it("applies premium limits only for active Stripe subscriptions", async () => {
    mockState.profile = {
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
    };
    mockState.count = 9;

    const usage = await getDailyAiUsage({
      userId: "user-premium",
      type: "diet_generation",
    });

    expect(usage).toMatchObject({
      usedToday: 9,
      limit: 10,
      plan: "premium",
      upgradeAvailable: false,
      isLimitReached: false,
    });
  });

  it("does not trust stale premium flags without an active subscription", async () => {
    mockState.profile = {
      plan: "premium",
      is_premium: true,
      subscription_status: "canceled",
    };
    mockState.count = 1;

    const usage = await getDailyAiUsage({
      userId: "user-canceled",
      type: "diet_generation",
    });

    expect(usage).toMatchObject({
      limit: 1,
      plan: "free",
      upgradeAvailable: true,
      isLimitReached: true,
    });
  });

  it("accepts premium access when the backend still has a valid expiry", async () => {
    mockState.profile = {
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
      premium_source: "manual",
      premium_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    mockState.count = 2;

    const usage = await getDailyAiUsage({
      userId: "user-expiring",
      type: "diet_generation",
    });

    expect(usage).toMatchObject({
      limit: 10,
      plan: "premium",
      upgradeAvailable: false,
      isLimitReached: false,
    });
  });

  it("rejects expired premium access even with premium flags", async () => {
    mockState.profile = {
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
      premium_source: "apple",
      premium_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
    mockState.count = 1;

    const usage = await getDailyAiLimitWithExpiredProfile();

    expect(usage).toMatchObject({
      limit: 1,
      plan: "free",
      upgradeAvailable: true,
      isLimitReached: true,
    });
  });

  it("returns clear 429 limit state with plan metadata", async () => {
    mockState.profile = {
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    mockState.count = 4;

    const limitState = await checkDailyAiLimit({
      userId: "user-free",
      type: "food_analysis",
    });

    expect(limitState).toMatchObject({
      allowed: false,
      count: 4,
      limit: 4,
      plan: "free",
      upgradeAvailable: true,
      isLimitReached: true,
    });
  });
});

async function getDailyAiLimitWithExpiredProfile() {
  return getDailyAiUsage({
    userId: "user-expired",
    type: "diet_generation",
  });
}

function createQuery(table) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    gte() {
      return this;
    },
    async lt() {
      if (table === "meal_analyses") {
        return {
          data: Array.from({ length: mockState.count }, (_, index) => ({
            id: `meal-${index}`,
            image_hash: null,
            created_at: new Date().toISOString(),
          })),
          error: null,
        };
      }

      return { count: mockState.count, error: null };
    },
    async maybeSingle() {
      return { data: mockState.profile, error: null };
    },
  };
}
