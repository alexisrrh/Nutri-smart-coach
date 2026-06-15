import { describe, expect, it } from "vitest";
import { normalizeCheckin } from "./normalizers";

describe("normalizeCheckin", () => {
  it("preserves english language when present", () => {
    const result = normalizeCheckin({
      id: "checkin-1",
      user_id: "user-1",
      language: "en",
      visual_changes: "Body composition looks more defined.",
      recommendation: "Keep the same routine and repeat the check-in next week.",
    });

    expect(result.language).toBe("en");
    expect(result.visual_changes).toBe("Body composition looks more defined.");
    expect(result.recommendation).toBe(
      "Keep the same routine and repeat the check-in next week."
    );
  });

  it("falls back to spanish when language is missing", () => {
    const result = normalizeCheckin({
      id: "checkin-2",
      user_id: "user-1",
      visual_changes: "No se pudieron detectar cambios visuales con suficiente claridad.",
    });

    expect(result.language).toBe("es");
  });
});
