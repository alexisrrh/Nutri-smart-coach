import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
  profile: {
    plan: "free",
    is_premium: false,
    subscription_status: "inactive",
  },
  counts: {
    meal_analyses: 0,
    diet_plans: 0,
    checkins: 0,
  },
}));

vi.mock("../config/supabase.js", () => ({
  supabase: {
    auth: {
      async getUser() {
        if (!mockState.authUser) {
          return { data: null, error: new Error("No autorizado") };
        }

        return { data: { user: mockState.authUser }, error: null };
      },
    },
    from(table) {
      return createQuery(table);
    },
  },
}));

const { default: app } = await import("../app.js");

describe("GET /ai-usage/:userId", () => {
  beforeEach(() => {
    mockState.authUser = { id: "user-1", email: "user@test.com" };
    mockState.profile = {
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    mockState.counts = {
      meal_analyses: 0,
      diet_plans: 0,
      checkins: 0,
    };
  });

  it("returns 401 without auth", async () => {
    mockState.authUser = null;

    const response = await request(app).get("/ai-usage/user-1");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("returns 200 with usage and plan data", async () => {
    const response = await request(app)
      .get("/ai-usage/user-1")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      plan: "free",
    });
    expect(response.body.usage.food_analysis.limit).toBe(3);
    expect(response.body.usage.food_analysis.period).toBe("day");
    expect(response.body.usage.diet_generation.limit).toBe(1);
    expect(response.body.usage.diet_generation.period).toBe("week");
    expect(response.body.usage.checkin_analysis.limit).toBe(1);
    expect(response.body.usage.checkin_analysis.period).toBe("week");
  });

  it("returns premium food analysis limit 20 for premium users", async () => {
    mockState.profile = {
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
    };

    const response = await request(app)
      .get("/ai-usage/user-1")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(200);
    expect(response.body.plan).toBe("premium");
    expect(response.body.usage.food_analysis.limit).toBe(20);
    expect(response.body.usage.food_analysis.period).toBe("day");
    expect(response.body.limits.food_analysis.limit).toBe(20);
  });
});

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
      return {
        data: [],
        count: mockState.counts[table] || 0,
        error: null,
      };
    },
    async maybeSingle() {
      if (table === "profiles") {
        return { data: mockState.profile, error: null };
      }

      return { data: null, error: null };
    },
  };
}
