import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let app;

beforeAll(async () => {
  process.env.SUPABASE_URL = "http://127.0.0.1";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
  process.env.GEMINI_API_KEY = "dummy";

  ({ default: app } = await import("../app.js"));
});

describe("Protected routes without JWT", () => {
  it("POST /generate-diet returns 401", async () => {
    const response = await request(app).post("/generate-diet");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("POST /analyze-food returns 401", async () => {
    const response = await request(app).post("/analyze-food");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("POST /checkins returns 401", async () => {
    const response = await request(app).post("/checkins");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("GET /meal-analyses/test-user returns 401", async () => {
    const response = await request(app).get("/meal-analyses/test-user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("GET /checkins/test-user returns 401", async () => {
    const response = await request(app).get("/checkins/test-user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("GET /diet-plans/test-user returns 401", async () => {
    const response = await request(app).get("/diet-plans/test-user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });
});
