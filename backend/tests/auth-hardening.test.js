import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const mockState = vi.hoisted(() => ({
  authUser: { id: "user-1", email: "user@test.com" },
  profile: {
    id: "user-1",
    plan: "free",
    is_premium: false,
    subscription_status: "inactive",
  },
  profileError: null,
}));

vi.mock("../config/supabase.js", () => ({
  supabase: {
    auth: {
      async getUser() {
        if (!mockState.authUser) {
          return { data: null, error: new Error("Invalid token") };
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

describe("protected route auth hardening", () => {
  beforeEach(() => {
    mockState.authUser = { id: "user-1", email: "user@test.com" };
    mockState.profile = {
      id: "user-1",
      plan: "free",
      is_premium: false,
      subscription_status: "inactive",
    };
    mockState.profileError = null;
  });

  it("returns 401 when the Authorization token is invalid", async () => {
    mockState.authUser = null;

    const response = await request(app)
      .get("/premium/status")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("returns 403 when the requested user does not match the authenticated user", async () => {
    const response = await request(app)
      .get("/diet-plans/user-2")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "No autorizado para este usuario" });
  });

  it("keeps real internal errors as 500", async () => {
    mockState.profileError = new Error("database unavailable");

    const response = await request(app)
      .get("/premium/status")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      error: "Error interno del servidor.",
      requestId: expect.any(String),
    });
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
    maybeSingle() {
      if (table === "profiles") {
        if (mockState.profileError) {
          return Promise.resolve({
            data: null,
            error: mockState.profileError,
          });
        }

        return Promise.resolve({
          data: mockState.profile,
          error: null,
        });
      }

      return Promise.resolve({ data: null, error: null });
    },
  };
}
