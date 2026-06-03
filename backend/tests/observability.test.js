import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../middleware/errorHandler.js";
import { requestLogger } from "../middleware/requestLogger.js";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";

const { default: app } = await import("../app.js");

describe("backend observability", () => {
  let infoSpy;
  let errorSpy;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds X-Request-Id to normal responses", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
    expect(response.headers["x-request-id"].length).toBeGreaterThan(0);
  });

  it("logs requests without breaking normal responses", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(infoSpy).toHaveBeenCalledTimes(1);

    const logEntry = JSON.parse(infoSpy.mock.calls[0][0]);
    expect(logEntry).toMatchObject({
      requestId: response.headers["x-request-id"],
      method: "GET",
      route: "/health",
      statusCode: 200,
      userId: null,
    });
    expect(logEntry.timestamp).toEqual(expect.any(String));
    expect(logEntry.durationMs).toEqual(expect.any(Number));
    expect(logEntry.client).toEqual(expect.any(String));
  });

  it("returns requestId in consistent JSON error responses", async () => {
    const errorApp = express();

    errorApp.use(requestLogger);
    errorApp.get("/boom", () => {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY secret should not leak");
    });
    errorApp.use(errorHandler);

    const response = await request(errorApp).get("/boom");

    expect(response.status).toBe(500);
    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
    expect(response.body).toEqual({
      error: "Error interno del servidor.",
      requestId: response.headers["x-request-id"],
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
