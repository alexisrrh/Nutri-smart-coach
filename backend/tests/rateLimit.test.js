import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../middleware/rateLimit.js";

function createTestApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    createRateLimiter({
      name: "test_limit",
      windowMs: 60 * 1000,
      max: 2,
      message: "Límite de prueba alcanzado.",
    })
  );
  app.get("/limited", (req, res) => {
    res.json({ ok: true });
  });

  return app;
}

describe("rate limiter middleware", () => {
  it("allows requests below the limit", async () => {
    const app = createTestApp();

    const firstResponse = await request(app).get("/limited");
    const secondResponse = await request(app).get("/limited");

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.headers["ratelimit-limit"]).toBe("2");
    expect(secondResponse.headers["ratelimit-remaining"]).toBe("0");
  });

  it("returns a consistent JSON response after exceeding the limit", async () => {
    const app = createTestApp();

    await request(app).get("/limited");
    await request(app).get("/limited");
    const limitedResponse = await request(app).get("/limited");

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers["retry-after"]).toBeDefined();
    expect(limitedResponse.body).toMatchObject({
      error: "Límite de prueba alcanzado.",
      code: "RATE_LIMITED",
      limit: {
        name: "test_limit",
        max: 2,
        windowMs: 60 * 1000,
      },
    });
    expect(limitedResponse.body.retryAfter).toEqual(expect.any(Number));
  });
});
