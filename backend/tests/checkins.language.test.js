import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
  promptCalls: [],
  aiText: "",
  insertedRows: [],
  uploadUrl: "https://cdn.example/checkin.png",
}));

vi.mock("../prompts/checkin.prompt.js", () => ({
  buildCheckinPrompt: vi.fn((payload) => {
    mockState.promptCalls.push(payload);
    return `CHECKIN-${payload.language}`;
  }),
}));

vi.mock("../config/gemini.js", () => ({
  ai: {
    models: {
      async generateContent({ contents }) {
        const prompt = contents?.[0]?.parts?.[0]?.text || "";
        mockState.promptCalls.push({ prompt });
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

vi.mock("../middleware/auth.js", () => ({
  verifySupabaseUser(req, res, next) {
    const authHeader = req.get("Authorization") || "";

    if (!authHeader) {
      return res.status(401).json({ error: "No autorizado" });
    }

    req.authUser = mockState.authUser;
    return next();
  },
  requireAuthenticatedUser(req) {
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
  uploadImageToSupabase: vi.fn(async () => mockState.uploadUrl),
}));

vi.mock("../utils/aiUsage.js", () => ({
  AI_USAGE_RULES: {
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

const { default: checkinsRouter } = await import("../routes/checkins.routes.js");

describe("POST /checkins language handling", () => {
  beforeEach(() => {
    mockState.authUser = { id: "user-1", email: "user@test.com" };
    mockState.promptCalls = [];
    mockState.aiText = JSON.stringify({
      body_fat_range: "18-20%",
      confidence: 88,
      visual_changes: "Body composition looks more defined.",
      recommendation: "Keep the same routine and repeat the check-in next week.",
    });
    mockState.insertedRows = [];
  });

  it("passes english to the prompt and returns english text", async () => {
    const response = await invokeCheckinRequest({
      language: "en",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.language).toBe("en");
    expect(response.body.checkin.language).toBe("en");
    expect(mockState.promptCalls[0]).toMatchObject({
      language: "en",
    });
    expect(response.body.checkin.visual_changes).toBe(
      "Body composition looks more defined."
    );
    expect(response.body.checkin.recommendation).toBe(
      "Keep the same routine and repeat the check-in next week."
    );
    expect(mockState.insertedRows[0]?.language).toBe("en");
  });

  it("falls back to spanish for invalid language", async () => {
    const response = await invokeCheckinRequest({
      language: "fr",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.language).toBe("es");
    expect(response.body.checkin.language).toBe("es");
    expect(mockState.promptCalls[0]).toMatchObject({
      language: "es",
    });
    expect(mockState.insertedRows[0]?.language).toBe("es");
  });
});

async function invokeCheckinRequest(body) {
  const req = {
    body: {
      user_id: "user-1",
      weight: "72",
      waist: "80",
      chest: "95",
      hips: "90",
      notes: "test",
      ...body,
    },
    mockFile: {
      buffer: Buffer.from("fake-image"),
      mimetype: "image/jpeg",
      originalname: "checkin.jpg",
    },
    file: null,
    authUser: null,
    headers: {
      authorization: "Bearer token",
    },
    get(name) {
      return this.headers[String(name).toLowerCase()] || "";
    },
  };

  const response = createResponse();
  const layer = checkinsRouter.stack.find(
    (item) => item.route?.path === "/checkins" && item.route.methods.post
  );

  expect(layer).toBeTruthy();

  for (const middleware of layer.route.stack) {
    await new Promise((resolve, reject) => {
      let settled = false;
      const next = (err) => {
        if (settled) return;
        settled = true;
        if (err) reject(err);
        else resolve();
      };

      try {
        const result = middleware.handle(req, response, next);
        if (result && typeof result.then === "function") {
          result.then(() => next()).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });

    if (response.finished) break;
  }

  return response;
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    finished: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.finished = true;
      return this;
    },
  };
}

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
      return this;
    },
    order() {
      return this;
    },
    limit() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: null, error: null });
    },
    insert(payload) {
      this.op = "insert";
      this.payload = payload;
      mockState.insertedRows.push(payload);
      return this;
    },
    delete() {
      this.op = "delete";
      return this;
    },
    single() {
      return Promise.resolve({
        data: {
          id: `${table}-1`,
          ...this.payload,
        },
        error: null,
      });
    },
    then(resolve, reject) {
      try {
        if (this.op === "select") {
          resolve({ data: [], error: null });
          return;
        }

        resolve({ data: null, error: null });
      } catch (error) {
        reject(error);
      }
    },
  };

  return query;
}
