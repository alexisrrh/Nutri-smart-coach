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
  trackCreatorLinkClick: vi.fn(async () => ({ tracked: true })),
  requestCreatorPayout: vi.fn(async () => ({
    status: "approved",
    payoutRequest: {
      id: "payout-1",
      amount: 25,
      status: "pending",
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

  it("returns 200 for POST /creators/track-click even when unauthenticated", async () => {
    const response = await invokeRouter("POST", "/track-click", {
      body: { code: "NUTRIALEXIS" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("returns deduped=true when the click is deduplicated", async () => {
    const trackCreatorLinkClick = (await import("../services/creator.service.js")).trackCreatorLinkClick;
    trackCreatorLinkClick.mockResolvedValueOnce({ tracked: true, deduped: true });

    const response = await invokeRouter("POST", "/track-click", {
      body: { code: "NUTRIALEXIS" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true, deduped: true });
  });

  it("returns a controlled error for invalid creator codes", async () => {
    const trackCreatorLinkClick = (await import("../services/creator.service.js")).trackCreatorLinkClick;
    trackCreatorLinkClick.mockRejectedValueOnce(Object.assign(new Error("Código de creador no válido."), { statusCode: 404 }));

    const response = await invokeRouter("POST", "/track-click", {
      body: { code: "INVALIDO" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: "Código de creador no válido." });
  });

  it("returns a controlled error for invalid tracking bodies", async () => {
    const trackCreatorLinkClick = (await import("../services/creator.service.js")).trackCreatorLinkClick;
    trackCreatorLinkClick.mockRejectedValueOnce(Object.assign(new Error("Carga de tracking inválida."), { statusCode: 400 }));

    const response = await invokeRouter("POST", "/track-click", {
      body: { code: { bad: true } },
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: "Carga de tracking inválida." });
  });

  it("returns 201 for POST /creators/payouts/request when authenticated", async () => {
    const response = await invokeRouter("POST", "/payouts/request", {
      headers: { authorization: "Bearer test-token" },
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.payoutRequest).toMatchObject({
      id: "payout-1",
      amount: 25,
      status: "pending",
    });
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
