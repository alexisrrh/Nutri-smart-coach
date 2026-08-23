import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
  promptCalls: [],
  aiText: "",
  insertedRows: [],
}));

vi.mock("../prompts/diet.prompt.js", () => ({
  buildDietPrompt: vi.fn((profile, preferences, dietConfig, language) => {
    mockState.promptCalls.push({
      profile,
      preferences,
      dietConfig,
      language,
    });

    return `PROMPT-${language}`;
  }),
}));

vi.mock("../config/gemini.js", () => ({
  ai: {
    models: {
      async generateContent() {
        return { text: mockState.aiText };
      },
    },
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

vi.mock("../middleware/auth.js", () => ({
  verifySupabaseUser(req, res, next) {
    const authHeader = req.get("Authorization") || "";

    if (!authHeader) {
      return res.status(401).json({ error: "No autorizado" });
    }

    req.authUser = mockState.authUser;
    return next();
  },
  requireAuthenticatedUser(req, res) {
    void res;
    return req?.authUser?.id || null;
  },
  assertSameUser(authUserId, requestedUserId) {
    return Boolean(authUserId && requestedUserId && authUserId === requestedUserId);
  },
}));

vi.mock("../middleware/rateLimit.js", () => ({
  globalRateLimiter: (_req, _res, next) => next(),
  authRateLimiter: (_req, _res, next) => next(),
  analyzeFoodRateLimiter: (_req, _res, next) => next(),
  generateDietRateLimiter: (_req, _res, next) => next(),
  rewriteMealRateLimiter: (_req, _res, next) => next(),
  checkinsRateLimiter: (_req, _res, next) => next(),
  createRateLimiter: () => (_req, _res, next) => next(),
}));

vi.mock("../middleware/requestLogger.js", () => ({
  requestLogger: (_req, _res, next) => next(),
}));

vi.mock("../config/multer.js", () => ({
  uploadSingleImage: () => (_req, _res, next) => next(),
}));

vi.mock("../utils/aiUsage.js", () => ({
  AI_USAGE_RULES: {
    food_analysis: { freeLimit: 3 },
    diet_generation: { freeLimit: 3 },
    checkin_analysis: { freeLimit: 3 },
    rewrite_meal: { premiumLimit: 12 },
  },
  checkDailyAiLimit: vi.fn(async () => ({
    allowed: true,
    limit: 3,
    plan: "free",
    upgradeAvailable: false,
  })),
  enforceRateLimit: vi.fn(() => ({ allowed: true })),
  recordAiUsageEvent: vi.fn(),
  registerAiUsage: vi.fn(),
}));

vi.mock("../services/storage.service.js", () => ({
  getSupabaseStoragePath: vi.fn(),
  uploadImageToSupabase: vi.fn(),
}));

const { default: dietsRoutes } = await import("../routes/diets.routes.js");

describe("POST /generate-diet language-aware prompt", () => {
  beforeEach(() => {
    mockState.authUser = { id: "user-1", email: "user@test.com" };
    mockState.promptCalls = [];
    mockState.insertedRows = [];
    mockState.aiText = JSON.stringify({
      week: [
        {
          day: "Monday",
          meals: [
            {
              time: "08:00",
              name: "Breakfast",
              food: "Oatmeal with yogurt",
              details: "60g oats, 200g yogurt",
              calories: 420,
              protein: 26,
              carbs: 48,
              fat: 12,
            },
          ],
        },
      ],
    });
  });

  it("passes english to the prompt and stores english language", async () => {
    const response = await dispatchGenerateDiet({
      language: "en",
      profile: createProfile(),
      preferences: {
        planDays: 1,
        mealsPerDay: 1,
        goal: "maintain",
      },
      user_id: "user-1",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.language).toBe("en");
    expect(mockState.promptCalls).toHaveLength(1);
    expect(mockState.promptCalls[0].language).toBe("en");
    expect(mockState.promptCalls[0].preferences.language).toBe("en");
    expect(mockState.insertedRows[0]?.preferences?.language).toBe("en");
  });

  it("falls back to spanish for invalid language", async () => {
    const response = await dispatchGenerateDiet({
      language: "fr",
      profile: createProfile(),
      preferences: {
        planDays: 1,
        mealsPerDay: 1,
        goal: "maintain",
      },
      user_id: "user-1",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.language).toBe("es");
    expect(mockState.promptCalls).toHaveLength(1);
    expect(mockState.promptCalls[0].language).toBe("es");
    expect(mockState.promptCalls[0].preferences.language).toBe("es");
    expect(mockState.insertedRows[0]?.preferences?.language).toBe("es");
  });
});

function dispatchGenerateDiet(body) {
  const app = express();
  app.use((req, _res, next) => {
    req.get = (name) => {
      if (String(name).toLowerCase() === "authorization") {
        return "Bearer token";
      }

      return "";
    };
    next();
  });
  app.use(dietsRoutes);

  return invokeRequest(app, "/generate-diet", body);
}

function invokeRequest(app, path, body) {
  return new Promise((resolve, reject) => {
    const req = {
      method: "POST",
      url: path,
      originalUrl: path,
      body,
      headers: { authorization: "Bearer token" },
      get(name) {
        return String(name).toLowerCase() === "authorization" ? "Bearer token" : "";
      },
    };

    let settled = false;
    const res = createResponse((result) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    });

    app.handle(req, res, (error) => {
      if (settled) return;
      settled = true;

      if (error) {
        reject(error);
        return;
      }

      resolve({
        statusCode: res.statusCode,
        body: res.body,
      });
    });
  });
}

function createResponse(onFinish) {
  const response = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      onFinish(this);
      return this;
    },
    send(payload) {
      this.body = payload;
      onFinish(this);
      return this;
    },
    end(payload) {
      this.body = payload;
      onFinish(this);
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
  };

  return response;
}

function createQuery(table) {
  const query = {
    op: "select",
    payload: null,
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: null, error: null });
    },
    upsert(payload) {
      this.op = "upsert";
      this.payload = payload;
      return this;
    },
    insert(payload) {
      this.op = "insert";
      this.payload = payload;
      return this;
    },
    single() {
      if (table === "diet_plans" && this.payload) {
        mockState.insertedRows.push(this.payload);
        return Promise.resolve({ data: { id: "diet-plan-1", ...this.payload }, error: null });
      }

      if (table === "profiles" && this.payload) {
        return Promise.resolve({ data: { id: this.payload.id, ...this.payload }, error: null });
      }

      return Promise.resolve({ data: null, error: null });
    },
  };

  return query;
}

function createProfile() {
  return {
    id: "user-1",
    age: 31,
    weight: 78,
    height: 176,
    goal: "maintain",
    activity_level: "moderate",
    gender: "male",
  };
}
