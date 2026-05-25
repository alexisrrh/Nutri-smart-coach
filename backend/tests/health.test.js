import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let app;

beforeAll(async () => {
  process.env.SUPABASE_URL = "http://127.0.0.1";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
  process.env.GEMINI_API_KEY = "dummy";

  ({ default: app } = await import("../app.js"));
});

describe("GET /health", () => {
  it("responds with the service health payload", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      service: "nutrismartcoach-api",
    });
  });
});
