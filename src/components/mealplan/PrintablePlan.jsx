import React, { useMemo } from "react";

export function PrintablePlan({ plan }) {
  const normalizedPlan = useMemo(() => normalizePlan(plan), [plan]);
  const shoppingItems = useMemo(
    () => buildPrintableShoppingList(normalizedPlan),
    [normalizedPlan]
  );

  if (!normalizedPlan || normalizedPlan.length === 0) return null;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          html,
          body {
            background: white !important;
            color: #111827 !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }

          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .print-page {
            background: white !important;
            color: #111827 !important;
            padding: 0 !important;
          }

          .print-header {
            border-bottom: 2px solid #111827 !important;
            padding-bottom: 10px !important;
            margin-bottom: 14px !important;
          }

          .print-brand {
            font-size: 22px !important;
            font-weight: 900 !important;
            letter-spacing: 1px !important;
            margin: 0 !important;
            text-transform: uppercase !important;
          }

          .print-muted {
            color: #4b5563 !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            margin: 2px 0 0 0 !important;
          }

          .print-section-title {
            font-size: 15px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            margin: 0 0 8px 0 !important;
            color: #065f46 !important;
          }

          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 9px !important;
          }

          .print-day-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 1px solid #d1d5db !important;
            border-radius: 0 !important;
            padding: 9px !important;
            margin-bottom: 9px !important;
            background: white !important;
          }

          .print-day-title {
            font-size: 14px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding-bottom: 5px !important;
            margin: 0 0 7px 0 !important;
            color: #111827 !important;
          }

          .print-meal {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 7px !important;
            padding-bottom: 6px !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }

          .print-meal-meta {
            font-size: 9px !important;
            color: #047857 !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            margin: 0 0 2px 0 !important;
          }

          .print-meal-name {
            font-size: 11px !important;
            font-weight: 900 !important;
            color: #111827 !important;
            margin: 0 !important;
          }

          .print-meal-details {
            font-size: 10px !important;
            color: #374151 !important;
            line-height: 1.3 !important;
            margin: 2px 0 !important;
          }

          .print-macros {
            font-size: 9px !important;
            color: #111827 !important;
            font-weight: 700 !important;
            margin: 2px 0 0 0 !important;
          }

          .print-break {
            page-break-before: always !important;
          }

          .print-shopping-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 7px !important;
          }

          .print-shopping-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding: 5px 0 !important;
            display: flex !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }

          .print-checkbox {
            width: 10px !important;
            height: 10px !important;
            border: 1px solid #6b7280 !important;
            margin-top: 1px !important;
            flex-shrink: 0 !important;
          }

          .print-shopping-name {
            font-size: 10px !important;
            font-weight: 800 !important;
            color: #111827 !important;
            margin: 0 !important;
          }

          .print-shopping-amount {
            font-size: 9px !important;
            font-weight: 700 !important;
            color: #047857 !important;
            margin: 1px 0 0 0 !important;
          }

          .print-footer {
            margin-top: 14px !important;
            border-top: 1px solid #e5e7eb !important;
            padding-top: 6px !important;
            font-size: 9px !important;
            color: #6b7280 !important;
            text-align: center !important;
          }
        }

        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      <div className="print-only print-page">
        <header className="print-header">
          <h1 className="print-brand">NutriSmart Coach</h1>
          <p className="print-muted">
            Plan nutricional semanal personalizado · Dieta + macros + lista de compra
          </p>
        </header>

        <section>
          <h2 className="print-section-title">Dieta semanal</h2>

          <div className="print-grid">
            {normalizedPlan.map((dayData, idx) => (
              <article key={`${dayData.day}-${idx}`} className="print-day-card">
                <h3 className="print-day-title">{dayData.day}</h3>

                {dayData.meals.map((meal, mealIndex) => (
                  <div
                    key={`${dayData.day}-${meal.name}-${mealIndex}`}
                    className="print-meal"
                  >
                    <p className="print-meal-meta">
                      {meal.time} · {meal.name}
                    </p>

                    <p className="print-meal-name">{meal.food}</p>

                    <p className="print-meal-details">
                      {meal.details || meal.ingredients.join(", ") || "Porciones no especificadas"}
                    </p>

                    <p className="print-macros">
                      {Math.round(meal.calories || 0)} kcal ·{" "}
                      {Math.round(meal.protein || 0)}g proteína ·{" "}
                      {Math.round(meal.carbs || 0)}g carbs ·{" "}
                      {Math.round(meal.fat || 0)}g grasas
                    </p>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="print-break">
          <header className="print-header">
            <h1 className="print-brand">Lista de compra semanal</h1>
            <p className="print-muted">
              Cantidades aproximadas calculadas desde tu dieta.
            </p>
          </header>

          <div className="print-shopping-grid">
            {shoppingItems.map((item) => (
              <div key={item.id} className="print-shopping-item">
                <div className="print-checkbox" />

                <div>
                  <p className="print-shopping-name">{item.name}</p>
                  <p className="print-shopping-amount">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="print-footer">
          NutriSmart Coach · Los valores son aproximados y pueden variar según las marcas y porciones reales.
        </footer>
      </div>
    </>
  );
}

function normalizePlan(plan = []) {
  if (!Array.isArray(plan)) return [];

  return plan.map((day, dayIndex) => {
    const meals = Array.isArray(day?.meals)
      ? day.meals
      : Object.values(day?.meals || {});

    return {
      day: day?.day || `Día ${dayIndex + 1}`,
      meals: meals.map((meal, index) => {
        const ingredients = getIngredients(meal);

        return {
          time: meal?.time || defaultMealTime(index),
          name: meal?.name || defaultMealName(index),
          food: meal?.food || meal?.title || meal?.name || "Comida",
          details: meal?.details || ingredients.join(", "),
          ingredients,
          calories: Number(meal?.calories || meal?.kcal || 0),
          protein: Number(meal?.protein || 0),
          carbs: Number(meal?.carbs || 0),
          fat: Number(meal?.fat || 0),
        };
      }),
    };
  });
}

function buildPrintableShoppingList(plan = []) {
  const map = new Map();

  plan.forEach((day) => {
    day.meals.forEach((meal) => {
      getIngredients(meal).forEach((ingredient) => {
        const parsed = parseIngredient(ingredient);
        if (!parsed.name) return;

        const key = normalizeName(parsed.name);

        if (!map.has(key)) {
          map.set(key, {
            id: key,
            name: toTitleCase(parsed.name),
            grams: 0,
            ml: 0,
            units: 0,
            portions: 0,
            unknown: 0,
          });
        }

        const item = map.get(key);

        if (parsed.unit === "g") item.grams += parsed.value;
        else if (parsed.unit === "kg") item.grams += parsed.value * 1000;
        else if (parsed.unit === "ml") item.ml += parsed.value;
        else if (parsed.unit === "l") item.ml += parsed.value * 1000;
        else if (parsed.unit === "unit") item.units += parsed.value;
        else if (parsed.unit === "portion") item.portions += parsed.value;
        else item.unknown += 1;
      });
    });
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      amount: formatAmount(item),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getIngredients(meal) {
  if (Array.isArray(meal?.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients.filter(Boolean);
  }

  if (meal?.details) {
    return String(meal.details)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseIngredient(rawIngredient) {
  if (typeof rawIngredient === "object" && rawIngredient !== null) {
    const amountText = rawIngredient.amount || rawIngredient.quantity || "";
    const name = rawIngredient.name || rawIngredient.food || "Ingrediente";
    const amount = parseAmount(amountText);

    return {
      name,
      ...amount,
    };
  }

  const text = String(rawIngredient).trim();

  const match = text.match(
    /^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|unidad(?:es)?|huevo(?:s)?|pieza(?:s)?|rebanada(?:s)?|plátano(?:s)?|platano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones)?\s*(?:de)?\s*(.*)$/i
  );

  if (!match) {
    return {
      name: text,
      value: 1,
      unit: "unknown",
    };
  }

  const value = Number(String(match[1]).replace(",", "."));
  const unitText = (match[2] || "").toLowerCase();
  const name = (match[3] || text).trim();

  if (!unitText) return { name, value, unit: "unknown" };
  if (unitText === "g") return { name, value, unit: "g" };
  if (unitText === "kg") return { name, value, unit: "kg" };
  if (unitText === "ml") return { name, value, unit: "ml" };
  if (unitText === "l") return { name, value, unit: "l" };

  if (
    unitText.includes("unidad") ||
    unitText.includes("huevo") ||
    unitText.includes("pieza") ||
    unitText.includes("rebanada") ||
    unitText.includes("plátano") ||
    unitText.includes("platano") ||
    unitText.includes("banana") ||
    unitText.includes("lata")
  ) {
    return { name, value, unit: "unit" };
  }

  if (
    unitText.includes("plato") ||
    unitText.includes("ración") ||
    unitText.includes("raciones")
  ) {
    return { name, value, unit: "portion" };
  }

  return { name, value, unit: "unknown" };
}

function parseAmount(amountText = "") {
  const text = String(amountText).trim();

  const match = text.match(
    /(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|unidad(?:es)?|huevo(?:s)?|pieza(?:s)?|rebanada(?:s)?|plátano(?:s)?|platano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones)?/i
  );

  if (!match) return { value: 1, unit: "unknown" };

  const value = Number(String(match[1]).replace(",", "."));
  const unitText = (match[2] || "").toLowerCase();

  if (unitText === "g") return { value, unit: "g" };
  if (unitText === "kg") return { value, unit: "kg" };
  if (unitText === "ml") return { value, unit: "ml" };
  if (unitText === "l") return { value, unit: "l" };

  if (
    unitText.includes("unidad") ||
    unitText.includes("huevo") ||
    unitText.includes("pieza") ||
    unitText.includes("rebanada") ||
    unitText.includes("plátano") ||
    unitText.includes("platano") ||
    unitText.includes("banana") ||
    unitText.includes("lata")
  ) {
    return { value, unit: "unit" };
  }

  if (
    unitText.includes("plato") ||
    unitText.includes("ración") ||
    unitText.includes("raciones")
  ) {
    return { value, unit: "portion" };
  }

  return { value, unit: "unknown" };
}

function formatAmount(item) {
  const parts = [];

  if (item.grams > 0) {
    if (item.grams >= 1000) parts.push(`${formatNumber(item.grams / 1000)} kg`);
    else parts.push(`${Math.round(item.grams)} g`);
  }

  if (item.ml > 0) {
    if (item.ml >= 1000) parts.push(`${formatNumber(item.ml / 1000)} L`);
    else parts.push(`${Math.round(item.ml)} ml`);
  }

  if (item.units > 0) parts.push(`${Math.round(item.units)} ud`);
  if (item.portions > 0) parts.push(`${Math.round(item.portions)} raciones`);

  if (parts.length === 0 && item.unknown > 0) {
    parts.push(`${item.unknown} vez/semana`);
  }

  return parts.join(" + ") || "cantidad semanal";
}

function normalizeName(name = "") {
  return String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(text = "") {
  return String(text)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNumber(number) {
  return Number(number.toFixed(1)).toString();
}

function defaultMealTime(index) {
  const times = ["08:00", "13:30", "18:00", "21:00", "23:00"];
  return times[index] || "08:00";
}

function defaultMealName(index) {
  const names = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Extra"];
  return names[index] || "Comida";
}