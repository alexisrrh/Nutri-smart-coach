import { describe, expect, it } from "vitest";
import { createFallbackDiet } from "../services/dietFallback.service.js";

describe("createFallbackDiet", () => {
  it("returns a full weekly structure with meals", () => {
    const week = createFallbackDiet();

    expect(Array.isArray(week)).toBe(true);
    expect(week).toHaveLength(7);

    for (const day of week) {
      expect(day).toHaveProperty("day");
      expect(day).toHaveProperty("meals");
      expect(Array.isArray(day.meals)).toBe(true);
      expect(day.meals).toHaveLength(4);

      for (const meal of day.meals) {
        expect(meal).toHaveProperty("time");
        expect(meal).toHaveProperty("name");
        expect(meal).toHaveProperty("food");
        expect(meal).toHaveProperty("details");
        expect(meal).toHaveProperty("calories");
        expect(meal).toHaveProperty("protein");
        expect(meal).toHaveProperty("carbs");
        expect(meal).toHaveProperty("fat");
      }
    }
  });

  it("keeps the expected weekday order", () => {
    const week = createFallbackDiet();

    expect(week.map((day) => day.day)).toEqual([
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ]);
  });

  it("returns english fallback text when language is en", () => {
    const week = createFallbackDiet({}, { language: "en" });

    expect(week[0].day).toBe("Monday");
    expect(week[0].meals[0].name).toBe("Breakfast");
    expect(week[0].meals[0].food).toContain("Oatmeal");
    expect(week[0].meals[0].details).toContain("oats");
  });
});
