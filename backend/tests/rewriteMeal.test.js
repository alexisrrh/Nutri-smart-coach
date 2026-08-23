import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
  dietPlan: null,
  profile: null,
  aiText: "",
  updatedPayload: null,
  aiUsageCount: 0,
  aiUsageEvents: [],
  geminiCalls: 0,
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

vi.mock("../config/gemini.js", () => ({
  ai: {
    models: {
      async generateContent() {
        mockState.geminiCalls += 1;
        return { text: mockState.aiText };
      },
    },
  },
}));

const { default: app } = await import("../app.js");

describe("POST /diet-plans/:dietPlanId/rewrite-meal", () => {
  beforeEach(() => {
    mockState.authUser = { id: "user-1", email: "user@test.com" };
    mockState.dietPlan = createDietPlan("user-1");
    mockState.profile = createProfile({ premium: true });
    mockState.aiText = JSON.stringify({
      meal: {
        time: "13:30",
        name: "Comida",
        food: "Pollo con quinoa y verduras",
        details: "170g pollo, 120g quinoa cocida, 200g verduras",
        calories: 520,
        protein: 44,
        carbs: 48,
        fat: 16,
      },
    });
    mockState.updatedPayload = null;
    mockState.aiUsageCount = 0;
    mockState.aiUsageEvents = [];
    mockState.geminiCalls = 0;
  });

  it("returns 401 without authentication", async () => {
    mockState.authUser = null;

    const response = await request(app)
      .post("/diet-plans/plan-1/rewrite-meal")
      .set("Authorization", "Bearer test-token")
      .send(buildPayload());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("returns 403 with upgradeAvailable for free users", async () => {
    mockState.profile = createProfile({ premium: false });

    const response = await request(app)
      .post("/diet-plans/plan-1/rewrite-meal")
      .set("Authorization", "Bearer test-token")
      .send(buildPayload());

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      error: "La edición inteligente de comidas requiere Premium.",
      upgradeAvailable: true,
      plan: "free",
    });
  });

  it("allows premium users to replace one meal and persist the updated week", async () => {
    const response = await request(app)
      .post("/diet-plans/plan-1/rewrite-meal")
      .set("Authorization", "Bearer test-token")
      .send(buildPayload());

    expect(response.status).toBe(200);
    expect(response.body.meal).toMatchObject({
      food: "Pollo con quinoa y verduras",
      calories: 520,
    });
    expect(response.body.week[0].meals[0].food).toBe("Pollo con quinoa y verduras");
    expect(response.body.week[0].meals[1].food).toBe("Yogur con fruta");
    expect(mockState.updatedPayload.week[0].meals[0].food).toBe("Pollo con quinoa y verduras");
    expect(mockState.aiUsageEvents).toHaveLength(1);
    expect(mockState.aiUsageEvents[0]).toMatchObject({
      user_id: "user-1",
      type: "rewrite_meal",
      metadata: {
        diet_plan_id: "plan-1",
        day_index: 0,
        meal_index: 0,
      },
    });
  });

  it("returns 403 when the diet plan does not belong to the user", async () => {
    mockState.dietPlan = null;

    const response = await request(app)
      .post("/diet-plans/plan-foreign/rewrite-meal")
      .set("Authorization", "Bearer test-token")
      .send(buildPayload());

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "No autorizado para modificar esta dieta.",
    });
  });

  it("returns a clear error when Gemini returns invalid JSON", async () => {
    mockState.aiText = "not-json";

    const response = await request(app)
      .post("/diet-plans/plan-1/rewrite-meal")
      .set("Authorization", "Bearer test-token")
      .send(buildPayload());

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: "La IA no devolvió una comida válida.",
    });
    expect(mockState.aiUsageEvents).toHaveLength(1);
  });

  it("returns 429 without calling Gemini when the daily rewrite limit is reached", async () => {
    mockState.aiUsageCount = 12;

    const response = await request(app)
      .post("/diet-plans/plan-1/rewrite-meal")
      .set("Authorization", "Bearer test-token")
      .send(buildPayload());

    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({
      error: "Has alcanzado tu límite diario de cambios inteligentes de comida.",
      usage: {
        rewrite_meal: {
          usedToday: 12,
          limit: 12,
          plan: "premium",
          isLimitReached: true,
        },
      },
    });
    expect(mockState.geminiCalls).toBe(0);
    expect(mockState.aiUsageEvents).toHaveLength(0);
  });
});

function createQuery(table) {
  const query = {
    updatePayload: null,
    select() {
      return this;
    },
    eq() {
      return this;
    },
    update(payload) {
      this.updatePayload = payload;
      return this;
    },
    insert(payload) {
      if (table === "ai_usage_events") {
        mockState.aiUsageEvents.push(payload);
        return Promise.resolve({ error: null });
      }

      return this;
    },
    gte() {
      return this;
    },
    async lt() {
      if (table === "ai_usage_events") {
        return { count: mockState.aiUsageCount, error: null };
      }

      return { count: 0, error: null };
    },
    async maybeSingle() {
      if (table === "diet_plans") {
        return { data: mockState.dietPlan, error: null };
      }

      if (table === "profiles") {
        return { data: mockState.profile, error: null };
      }

      return { data: null, error: null };
    },
    then(resolve) {
      if (this.updatePayload) {
        mockState.updatedPayload = this.updatePayload;
        return Promise.resolve({ error: null }).then(resolve);
      }

      return Promise.resolve({ data: null, error: null }).then(resolve);
    },
  };

  return query;
}

function createProfile({ premium }) {
  return premium
    ? { plan: "premium", is_premium: true, subscription_status: "active" }
    : { plan: "free", is_premium: false, subscription_status: "inactive" };
}

function createDietPlan(userId) {
  return {
    id: "plan-1",
    user_id: userId,
    profile: { goal: "gain_muscle" },
    preferences: { dietType: "balanced", mealsPerDay: 2 },
    week: [
      {
        day: "Lunes",
        meals: [
          {
            time: "13:30",
            name: "Comida",
            food: "Arroz con pollo",
            details: "150g arroz, 160g pollo",
            calories: 530,
            protein: 42,
            carbs: 55,
            fat: 14,
          },
          {
            time: "18:00",
            name: "Merienda",
            food: "Yogur con fruta",
            details: "200g yogur, 1 banana",
            calories: 250,
            protein: 18,
            carbs: 35,
            fat: 4,
          },
        ],
      },
    ],
  };
}

function buildPayload() {
  return {
    user_id: "user-1",
    day_index: 0,
    meal_id: "Lunes-Comida-0",
    reason: "sin arroz",
    meal: {
      time: "13:30",
      name: "Comida",
      food: "Arroz con pollo",
      details: "150g arroz, 160g pollo",
      calories: 530,
      protein: 42,
      carbs: 55,
      fat: 14,
    },
  };
}
