import { describe, expect, it } from "vitest";
import { cleanGeminiJson } from "../utils/json.js";
import { clamp, toNumberOrNull } from "../utils/numbers.js";

describe("backend utils", () => {
  describe("toNumberOrNull", () => {
    it("returns null for empty values", () => {
      expect(toNumberOrNull(undefined)).toBeNull();
      expect(toNumberOrNull(null)).toBeNull();
      expect(toNumberOrNull("")).toBeNull();
    });

    it("parses numeric input", () => {
      expect(toNumberOrNull("12.5")).toBe(12.5);
      expect(toNumberOrNull(8)).toBe(8);
    });
  });

  describe("clamp", () => {
    it("clamps values inside the range", () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(-2, 1, 10)).toBe(1);
      expect(clamp(20, 1, 10)).toBe(10);
    });
  });

  describe("cleanGeminiJson", () => {
    it("removes markdown fences and extracts JSON", () => {
      expect(cleanGeminiJson("```json\n{\"ok\":true}\n```")).toBe(
        "{\"ok\":true}"
      );
    });

    it("returns raw text when there is no JSON block", () => {
      expect(cleanGeminiJson("texto limpio")).toBe("texto limpio");
    });
  });
});
