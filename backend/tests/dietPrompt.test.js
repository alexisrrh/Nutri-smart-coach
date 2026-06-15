import { describe, expect, it } from "vitest";
import { buildDietPrompt } from "../prompts/diet.prompt.js";

const profile = {
  goal: "maintain",
  weight: 78,
  height: 176,
};

const preferences = {
  planDays: 3,
  mealsPerDay: 4,
  language: "es",
};

const dietConfig = {
  days: 3,
  mealsPerDay: 4,
  homeFoods: "eggs, rice",
  isLowCarb: false,
};

describe("buildDietPrompt language handling", () => {
  it("injects strong english instructions when language is en", () => {
    const prompt = buildDietPrompt(profile, preferences, dietConfig, "en");

    expect(prompt).toContain("If language is \"en\", return every user-facing text in English only.");
    expect(prompt).toContain("If language is \"es\", return every user-facing text in Spanish only.");
    expect(prompt).toContain("Monday, Tuesday, Wednesday");
    expect(prompt).toContain("Meal 1");
    expect(prompt).toContain("Chicken with salad and avocado");
  });

  it("injects strong spanish instructions when language is es", () => {
    const prompt = buildDietPrompt(profile, preferences, dietConfig, "es");

    expect(prompt).toContain("Si language es \"en\", devuelve todo el texto visible para el usuario en inglés.");
    expect(prompt).toContain("Si language es \"es\", devuelve todo el texto visible para el usuario en español.");
    expect(prompt).toContain("Lunes, Martes, Miércoles");
    expect(prompt).toContain("Comida 1");
    expect(prompt).toContain("Pollo con ensalada y aguacate");
  });

  it("falls back to spanish when language is invalid", () => {
    const prompt = buildDietPrompt(profile, preferences, dietConfig, "fr");

    expect(prompt).toContain("Si language es \"en\", devuelve todo el texto visible para el usuario en inglés.");
    expect(prompt).toContain("Lunes, Martes, Miércoles");
  });
});
