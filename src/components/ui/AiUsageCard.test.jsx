import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AiUsageCard from "./AiUsageCard";

vi.mock("../../services/analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("AiUsageCard", () => {
  it("renders 0/3 instead of stale 0/4 for free food analysis", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AiUsageCard
          type="food_analysis"
          profile={null}
          usage={{
            type: "food_analysis",
            plan: "free",
            usedToday: 0,
            remaining: 4,
            limit: 4,
            period: "day",
            upgradeAvailable: true,
            isLimitReached: false,
          }}
        />
      </MemoryRouter>
    );

    expect(html).toContain("0/3");
    expect(html).not.toContain("0/4");
    expect(html).toContain("Te quedan 3 análisis IA hoy");
  });

  it("renders 0/20 instead of stale 0/100 for premium food analysis", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AiUsageCard
          type="food_analysis"
          profile={null}
          usage={{
            type: "food_analysis",
            plan: "premium",
            usedToday: 0,
            remaining: 100,
            limit: 100,
            period: "day",
            upgradeAvailable: false,
            isLimitReached: false,
          }}
        />
      </MemoryRouter>
    );

    expect(html).toContain("0/20");
    expect(html).not.toContain("0/100");
    expect(html).toContain("Premium activo · hasta 20 análisis IA al día");
  });
});
