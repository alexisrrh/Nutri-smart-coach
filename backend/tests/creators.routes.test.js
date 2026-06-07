import { describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
}));

vi.mock("../middleware/auth.js", () => ({
  verifySupabaseUser(req, res, next) {
    if (!mockState.authUser) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    req.authUser = mockState.authUser;
    return next();
  },
  requireAuthenticatedUser(req, res) {
    const userId = req?.authUser?.id || null;

    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return null;
    }

    return userId;
  },
}));

vi.mock("../services/creator.service.js", () => ({
  getCreatorStatus: vi.fn(async () => ({
    status: "approved",
    creatorCode: "NUTRIALEXIS",
    creatorCodeCustomized: false,
    stats: {
      registeredUsers: 0,
      premiumUsers: 0,
      totalCommissionAmount: 0,
      availableCommissionAmount: 0,
      pendingCommissionAmount: 0,
      linkClicks: 0,
    },
  })),
  submitCreatorApplication: vi.fn(),
  updateCreatorPanelCode: vi.fn(async (_userId, code) => ({
    status: "approved",
    creatorCode: String(code || "").toUpperCase(),
    creatorCodeCustomized: true,
    stats: {
      registeredUsers: 0,
      premiumUsers: 0,
      totalCommissionAmount: 0,
      availableCommissionAmount: 0,
      pendingCommissionAmount: 0,
      linkClicks: 0,
    },
  })),
}));

const { default: creatorsRouter } = await import("../routes/creators.routes.js");

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

    creatorsRouter.handle(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(res);
    });
  });
}

describe("creator routes", () => {
  it("exposes the creator routes diagnostics endpoint", async () => {
    const response = await invokeRouter("GET", "/routes");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
    });
    expect(response.body.routes).toContain("GET /creators/me");
    expect(response.body.routes).toContain("PATCH /creators/code");
  });

  it("returns 200 for PATCH /creators/code when authenticated", async () => {
    const response = await invokeRouter("PATCH", "/code", {
      headers: { authorization: "Bearer test-token" },
      body: { code: "alexisfit" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.creatorCode).toBe("ALEXISFIT");
    expect(response.body.creatorCodeCustomized).toBe(true);
  });

  it("returns 401 for PATCH /creators/code without auth", async () => {
    mockState.authUser = null;

    const response = await invokeRouter("PATCH", "/code", {
      body: { code: "alexisfit" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });
});
