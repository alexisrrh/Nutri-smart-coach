import { describe, expect, it } from "vitest";
import {
  createFallbackAiUsageState,
  formatAiUsageDetail,
  formatAiUsageCounter,
  normalizeAiUsageState,
} from "./aiUsageService";

describe("aiUsageService fallback", () => {
  it("builds a safe free fallback state when usage sync fails", () => {
    const fallback = createFallbackAiUsageState("food_analysis");

    expect(fallback).toMatchObject({
      type: "food_analysis",
      usedToday: 0,
      limit: 3,
      plan: "free",
      upgradeAvailable: true,
      isFallback: true,
      isLimitReached: false,
    });
  });

  it("renders a fallback detail instead of syncing forever", () => {
    const fallback = createFallbackAiUsageState("diet_generation");

    expect(formatAiUsageDetail("diet_generation", fallback, null)).toContain(
      "No se pudo sincronizar tu cupo semanal"
    );
  });

  it("normalizes stale free food usage limits to 3 per day", () => {
    const normalized = normalizeAiUsageState("food_analysis", {
      type: "food_analysis",
      plan: "free",
      usedToday: 0,
      remaining: 4,
      limit: 4,
      period: "day",
    });

    expect(normalized).toMatchObject({
      limit: 3,
      period: "day",
      remaining: 3,
      usedToday: 0,
    });
    expect(formatAiUsageCounter("food_analysis", normalized, null)).toBe("0/3");
  });

  it("builds a safe premium fallback state with limit 20 for food analysis", () => {
    const fallback = createFallbackAiUsageState("food_analysis", 0, "premium");

    expect(fallback).toMatchObject({
      type: "food_analysis",
      limit: 20,
      plan: "premium",
      period: "day",
      remaining: 20,
      upgradeAvailable: false,
    });
    expect(formatAiUsageCounter("food_analysis", fallback, null)).toBe("0/20");
  });

  it("normalizes stale premium food usage limits to 20 per day", () => {
    const normalized = normalizeAiUsageState("food_analysis", {
      type: "food_analysis",
      plan: "premium",
      usedToday: 0,
      remaining: 100,
      limit: 100,
      period: "day",
    });

    expect(normalized).toMatchObject({
      limit: 20,
      period: "day",
      remaining: 20,
      usedToday: 0,
    });
    expect(formatAiUsageCounter("food_analysis", normalized, null)).toBe("0/20");
  });
});
