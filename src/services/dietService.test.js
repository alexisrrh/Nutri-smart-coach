import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./apiClient", () => ({
  request: vi.fn(),
}));

vi.mock("./cacheService", () => ({
  getCache: vi.fn(() => [
    {
      id: "cached-plan",
      week: [
        {
          day: "Lunes",
          meals: [
            {
              time: "08:00",
              name: "Desayuno",
              food: "Avena",
              calories: 250,
              protein: 10,
              carbs: 32,
              fat: 8,
            },
          ],
        },
      ],
    },
  ]),
  removeCache: vi.fn(),
  setCache: vi.fn(),
}));

vi.mock("./normalizers", () => ({
  normalizeDietPlan: vi.fn((plan) => plan),
}));

describe("dietService fallback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to cached plans when the remote diet list fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { request } = await import("./apiClient");
    const { listDietPlans } = await import("./dietService");

    request.mockRejectedValue(
      Object.assign(new Error("failed to fetch"), {
        status: 503,
        code: "REQUEST_FAILED",
      })
    );

    const plans = await listDietPlans("user-123");

    expect(plans).toHaveLength(1);
    expect(plans[0].id).toBe("cached-plan");
    expect(warnSpy).toHaveBeenCalledWith(
      "Diet service request failed:",
      expect.objectContaining({
        endpoint: "/diet-plans/user-123",
        operation: "cargar dietas guardadas",
        fallbackUsed: true,
        status: 503,
        code: "REQUEST_FAILED",
      })
    );
  });
});
