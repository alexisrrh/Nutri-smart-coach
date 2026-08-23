import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
  mealAnalyses: [],
  aiText: "",
  insertedRows: [],
  generateCalls: 0,
  uploadedImageUrl: "https://cdn.example/uploaded.png",
  imageHash: "image-hash-1",
  lastLookupFilters: null,
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
    storage: {
      from() {
        return {
          async remove() {
            return { error: null };
          },
        };
      },
    },
  },
}));

vi.mock("../config/gemini.js", () => ({
  ai: {
    models: {
      async generateContent() {
        mockState.generateCalls += 1;
        return { text: mockState.aiText };
      },
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
  uploadSingleImage: () => (req, _res, next) => {
    req.file = req.mockFile || null;
    return next();
  },
}));

vi.mock("../services/storage.service.js", () => ({
  getSupabaseStoragePath: vi.fn(),
  uploadImageToSupabase: vi.fn(async () => mockState.uploadedImageUrl),
}));

vi.mock("../utils/aiUsage.js", () => ({
  AI_USAGE_RULES: {
    food_analysis: { freeLimit: 3 },
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

vi.mock("../utils/files.js", () => ({
  createImageHash: vi.fn(() => mockState.imageHash),
}));

const { default: mealsRouter } = await import("../routes/meals.routes.js");

describe("POST /analyze-food language-aware image reuse", () => {
  beforeEach(() => {
    mockState.authUser = { id: "user-1", email: "user@test.com" };
    mockState.mealAnalyses = [];
    mockState.aiText = JSON.stringify({
      food: "Grilled chicken bowl",
      description: "High protein meal in English",
      portion_estimate: "1 bowl",
      ingredients_detected: ["chicken", "rice", "greens"],
      calories: 520,
      protein: 41,
      carbs: 45,
      fat: 16,
      confidence: 82,
      score: 8,
      goal_fit: "Fits the goal in English.",
      recommendation: "Keep it balanced in English.",
      improvements: ["Add more greens."],
      warning: "",
    });
    mockState.insertedRows = [];
    mockState.generateCalls = 0;
    mockState.lastLookupFilters = null;
  });

  it("reuses only an english record when the request language is en", async () => {
    mockState.mealAnalyses = [
      createMealAnalysis({
        language: "en",
        goal_fit: "Fits the goal in English.",
        recommendation: "Keep it balanced in English.",
        improvements: ["Add more greens."],
      }),
      createMealAnalysis({
        language: "es",
        goal_fit: "Encaja con el objetivo en español.",
        recommendation: "Mantén el equilibrio en español.",
        improvements: ["Añade más verduras."],
      }),
    ];

    const response = await invokeRouter("POST", "/analyze-food", {
      body: {
        language: "en",
        goal: "fitness_general",
      },
      file: createMockFile(),
    });

    expect(response.statusCode).toBe(200);
    expect(mockState.generateCalls).toBe(0);
    expect(response.body.language).toBe("en");
    expect(response.body.goal_fit).toBe("Fits the goal in English.");
    expect(response.body.recommendation).toBe("Keep it balanced in English.");
    expect(response.body.improvements).toEqual(["Add more greens."]);
    expect(mockState.lastLookupFilters).toMatchObject({
      user_id: "user-1",
      image_hash: "image-hash-1",
      language: "en",
    });
    expect(mockState.insertedRows).toHaveLength(1);
    expect(mockState.insertedRows[0]).toMatchObject({
      language: "en",
      goal_fit: "Fits the goal in English.",
      recommendation: "Keep it balanced in English.",
      improvements: ["Add more greens."],
    });
  });

  it("does not reuse a spanish record when the request language is en", async () => {
    mockState.mealAnalyses = [
      createMealAnalysis({
        language: "es",
        goal_fit: "Encaja con el objetivo en español.",
        recommendation: "Mantén el equilibrio en español.",
        improvements: ["Añade más verduras."],
      }),
    ];

    const response = await invokeRouter("POST", "/analyze-food", {
      body: {
        language: "en",
        goal: "fitness_general",
      },
      file: createMockFile(),
    });

    expect(response.statusCode).toBe(200);
    expect(mockState.generateCalls).toBe(1);
    expect(response.body.language).toBe("en");
    expect(response.body.goal_fit).toBe("Fits the goal in English.");
    expect(response.body.recommendation).toBe("Keep it balanced in English.");
    expect(mockState.lastLookupFilters).toMatchObject({
      user_id: "user-1",
      image_hash: "image-hash-1",
      language: "en",
    });
    expect(mockState.insertedRows).toHaveLength(1);
    expect(mockState.insertedRows[0]).toMatchObject({
      language: "en",
      goal_fit: "Fits the goal in English.",
      recommendation: "Keep it balanced in English.",
    });
  });

  it("falls back to spanish when no language is provided", async () => {
    const response = await invokeRouter("POST", "/analyze-food", {
      body: {
        goal: "fitness_general",
      },
      file: createMockFile(),
    });

    expect(response.statusCode).toBe(200);
    expect(mockState.generateCalls).toBe(1);
    expect(response.body.language).toBe("es");
    expect(mockState.lastLookupFilters).toMatchObject({
      user_id: "user-1",
      image_hash: "image-hash-1",
      language: "es",
    });
    expect(mockState.insertedRows).toHaveLength(1);
    expect(mockState.insertedRows[0]).toMatchObject({
      language: "es",
    });
  });
});

function createQuery(table) {
  const query = {
    op: "select",
    filters: {},
    payload: null,
    select() {
      return this;
    },
    eq(column, value) {
      this.filters[column] = value;
      if (table === "meal_analyses") {
        mockState.lastLookupFilters = { ...this.filters };
      }
      return this;
    },
    order() {
      return this;
    },
    limit() {
      return this;
    },
    insert(payload) {
      this.op = "insert";
      this.payload = payload;
      return this;
    },
    single() {
      return this;
    },
    async maybeSingle() {
      if (table !== "meal_analyses") {
        return { data: null, error: null };
      }

      const match = mockState.mealAnalyses.find((row) =>
        Object.entries(this.filters).every(([key, value]) => row[key] === value)
      );

      return { data: match || null, error: null };
    },
    then(resolve, reject) {
      if (this.op === "insert" && table === "meal_analyses") {
        const inserted = { ...this.payload };
        mockState.insertedRows.push(inserted);
        mockState.mealAnalyses.unshift(inserted);
        return Promise.resolve({ data: inserted, error: null }).then(resolve, reject);
      }

      if (table === "meal_analyses") {
        const matches = mockState.mealAnalyses.filter((row) =>
          Object.entries(this.filters).every(([key, value]) => row[key] === value)
        );

        return Promise.resolve({ data: matches, error: null }).then(resolve, reject);
      }

      return Promise.resolve({ data: null, error: null }).then(resolve, reject);
    },
  };

  return query;
}

function invokeRouter(method, path, { body = {}, file = null, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url: path,
      originalUrl: path,
      headers: Object.fromEntries(
        Object.entries({
          Authorization: "Bearer test-token",
          ...headers,
        }).map(([key, value]) => [key.toLowerCase(), value])
      ),
      body,
      authUser: null,
      mockFile: file,
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

    mealsRouter.handle(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(res);
    });
  });
}

function createMockFile() {
  return {
    buffer: Buffer.from("fake-image"),
    mimetype: "image/png",
    originalname: "meal.png",
  };
}

function createMealAnalysis({
  language,
  goal_fit,
  recommendation,
  improvements,
}) {
  return {
    id: `${language}-meal`,
    user_id: "user-1",
    image_hash: "image-hash-1",
    language,
    food: language === "en" ? "English meal" : "Comida en español",
    description: language === "en" ? "English description" : "Descripción en español",
    portion_estimate: language === "en" ? "1 bowl" : "1 plato",
    ingredients_detected: language === "en" ? ["chicken"] : ["pollo"],
    calories: 520,
    protein: 41,
    carbs: 45,
    fat: 16,
    fiber: 5,
    sugar: 4,
    sodium: 430,
    confidence: 82,
    score: 8,
    goal_fit,
    recommendation,
    improvements,
    warning: "",
  };
}
