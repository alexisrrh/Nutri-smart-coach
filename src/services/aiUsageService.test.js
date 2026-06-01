import { describe, expect, it } from "vitest";
import {
  createFallbackAiUsageState,
  formatAiUsageDetail,
} from "./aiUsageService";

describe("aiUsageService fallback", () => {
  it("builds a safe free fallback state when usage sync fails", () => {
    const fallback = createFallbackAiUsageState("food_analysis");

    expect(fallback).toMatchObject({
      type: "food_analysis",
      usedToday: 0,
      limit: 4,
      plan: "free",
      upgradeAvailable: true,
      isFallback: true,
      isLimitReached: false,
    });
  });

  it("renders a fallback detail instead of syncing forever", () => {
    const fallback = createFallbackAiUsageState("diet_generation");

    expect(formatAiUsageDetail("diet_generation", fallback, null)).toContain(
      "No se pudo sincronizar el cupo diario"
    );
  });
});
