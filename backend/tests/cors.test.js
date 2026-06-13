import request from "supertest";
import { describe, expect, it } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const { default: app } = await import("../app.js");

describe("CORS production config", () => {
  it("allows the production frontend origin on normal requests", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "https://www.nutrismartcoach.com");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://www.nutrismartcoach.com"
    );
  });

  it.each([
    "https://localhost",
    "capacitor://localhost",
  ])("allows Capacitor origin %s on normal requests", async (origin) => {
    const response = await request(app).get("/health").set("Origin", origin);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
  });

  it("responds to preflight with 204 and CORS headers", async () => {
    const response = await request(app)
      .options("/health")
      .set("Origin", "https://www.nutrismartcoach.com")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://www.nutrismartcoach.com"
    );
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Authorization"
    );
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Content-Type"
    );
  });

  it.each([
    "https://localhost",
    "capacitor://localhost",
  ])("responds to Capacitor preflight from %s", async (origin) => {
    const response = await request(app)
      .options("/health")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Authorization"
    );
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Content-Type"
    );
  });
});
