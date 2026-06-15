import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

const SHOPPING_CATEGORIES = [
  "Proteinas",
  "Carbohidratos",
  "Frutas y verduras",
  "Lacteos",
  "Otros",
];

const PrintablePlan = forwardRef(({ plan }, ref) => {
  const { t } = useTranslation();
  const days = useMemo(() => getPlanDays(plan), [plan]);
  const summary = useMemo(() => getPlanSummary(days), [days]);
  const shoppingList = useMemo(() => buildShoppingList(days), [days]);

  if (!days.length) return null;

  return (
    <div ref={ref} className="pdf-printable-root">
      <style>{`
        .pdf-printable-root {
          display: none !important;
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          #root > :not(.pdf-printable-root) {
            display: none !important;
          }

          .pdf-printable-root {
            display: block !important;
            box-sizing: border-box;
            width: 100%;
            background: #ffffff !important;
            color: #111827;
            font-family: Inter, "Segoe UI", Arial, sans-serif;
            font-size: 10.5px;
            line-height: 1.35;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-header {
            border-bottom: 2px solid var(--app-primary);
            padding-bottom: 10px;
            margin-bottom: 12px;
          }

          .pdf-brand {
            margin: 0;
            color: #065f46;
            font-size: 24px;
            line-height: 1;
            font-weight: 900;
          }

          .pdf-subtitle {
            margin: 4px 0 0;
            color: #4b5563;
            font-size: 12px;
            font-weight: 700;
          }

          .pdf-summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 7px;
            margin-bottom: 14px;
          }

          .pdf-summary-card {
            border: 1px solid #d1fae5;
            border-radius: 10px;
            background: #ecfdf5 !important;
            padding: 7px;
          }

          .pdf-summary-label {
            margin: 0;
            color: #047857;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .pdf-summary-value {
            margin: 2px 0 0;
            color: #111827;
            font-size: 13px;
            font-weight: 900;
          }

          .pdf-day {
            break-inside: avoid;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 10px;
            overflow: hidden;
          }

          .pdf-day-title {
            margin: 0;
            padding: 7px 9px;
            background: #064e3b !important;
            color: #ffffff;
            font-size: 13px;
            font-weight: 900;
          }

          .pdf-meal-list {
            padding: 8px;
          }

          .pdf-meal {
            border-bottom: 1px solid #e5e7eb;
            padding: 6px 0;
          }

          .pdf-meal:last-child {
            border-bottom: 0;
          }

          .pdf-meal-top {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .pdf-meal-name {
            margin: 0;
            color: #111827;
            font-size: 11px;
            font-weight: 800;
          }

          .pdf-meal-meta {
            margin: 2px 0 0;
            color: #6b7280;
            font-size: 9.5px;
            font-weight: 700;
          }

          .pdf-macros {
            flex-shrink: 0;
            color: #047857;
            font-size: 9px;
            font-weight: 800;
            text-align: right;
            white-space: nowrap;
          }

          .pdf-food {
            margin: 4px 0 0;
            color: #374151;
            font-size: 10px;
          }

          .pdf-empty {
            margin: 0;
            color: #6b7280;
            font-style: italic;
          }

          .pdf-shopping {
            break-before: page;
            margin-top: 0;
          }

          .pdf-section-title {
            margin: 0 0 8px;
            color: #065f46;
            font-size: 16px;
            font-weight: 900;
          }

          .pdf-shopping-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .pdf-shopping-card {
            break-inside: avoid;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 8px;
          }

          .pdf-shopping-card h3 {
            margin: 0 0 5px;
            color: #047857;
            font-size: 11px;
            font-weight: 900;
          }

          .pdf-shopping-card ul {
            margin: 0;
            padding-left: 15px;
          }

          .pdf-shopping-card li {
            margin-bottom: 2px;
            color: #374151;
            font-size: 9.5px;
          }
        }
      `}</style>

      <header className="pdf-header">
        <h1 className="pdf-brand">NutriSmartCoach</h1>
        <p className="pdf-subtitle">{t("mealPlan.print.subtitle")}</p>
      </header>

      <section className="pdf-summary" aria-label={t("mealPlan.print.summary.aria")}>
        <SummaryCard label={t("mealPlan.print.summary.days")} value={summary.days} />
        <SummaryCard label={t("mealPlan.print.summary.meals")} value={summary.meals} />
        <SummaryCard label={t("mealPlan.print.summary.kcal")} value={summary.averageCalories} />
        <SummaryCard label={t("mealPlan.print.summary.protein")} value={`${summary.averageProtein}g`} />
      </section>

      <section>
        {days.map((day, dayIndex) => {
          const meals = getMeals(day);
          const dayName = getDayName(day, dayIndex, t);

          return (
            <article className="pdf-day" key={`${dayName}-${dayIndex}`}>
              <h2 className="pdf-day-title">{dayName}</h2>
              <div className="pdf-meal-list">
                {meals.length > 0 ? (
                  meals.map((meal, mealIndex) => (
                    <MealRow
                      key={`${getMealLabel(meal, mealIndex, t)}-${mealIndex}`}
                      meal={meal}
                      mealIndex={mealIndex}
                      t={t}
                    />
                  ))
                ) : (
                  <p className="pdf-empty">{t("mealPlan.print.noMeal")}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {shoppingList.length > 0 && (
        <section className="pdf-shopping">
          <h2 className="pdf-section-title">{t("mealPlan.print.shoppingTitle")}</h2>
          <div className="pdf-shopping-grid">
            {shoppingList.map((group) => (
              <article className="pdf-shopping-card" key={group.category}>
                <h3>{t(group.translationKey)}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      {item.name} - {item.amount}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

function SummaryCard({ label, value }) {
  return (
    <div className="pdf-summary-card">
      <p className="pdf-summary-label">{label}</p>
      <p className="pdf-summary-value">{value}</p>
    </div>
  );
}

function MealRow({ meal, mealIndex, t }) {
  const time = meal?.time || defaultMealTime(mealIndex);
  const label = getMealLabel(meal, mealIndex);
  const food = meal?.food || meal?.title || meal?.description || "";
  const calories = Math.round(Number(meal?.calories || meal?.kcal || 0));
  const protein = Math.round(Number(meal?.protein || 0));
  const carbs = Math.round(Number(meal?.carbs || 0));
  const fat = Math.round(Number(meal?.fat || meal?.fats || 0));

  return (
    <div className="pdf-meal">
      <div className="pdf-meal-top">
        <div>
          <p className="pdf-meal-name">{label}</p>
          <p className="pdf-meal-meta">{time}</p>
        </div>
        <div className="pdf-macros">
          {calories > 0 && <span>{calories} kcal</span>}
          {protein > 0 && <span> · P {protein}g</span>}
          {carbs > 0 && <span> · C {carbs}g</span>}
          {fat > 0 && <span> · G {fat}g</span>}
        </div>
      </div>
      <p className="pdf-food">{food || t("mealPlan.print.noMeal")}</p>
    </div>
  );
}

function getPlanDays(plan) {
  if (Array.isArray(plan)) return plan.filter(Boolean);
  if (Array.isArray(plan?.week)) return plan.week.filter(Boolean);
  if (Array.isArray(plan?.days)) return plan.days.filter(Boolean);
  if (Array.isArray(plan?.plan)) return plan.plan.filter(Boolean);
  return [];
}

function getMeals(day) {
  if (Array.isArray(day?.meals)) return day.meals.filter(Boolean);
  if (day?.meals && typeof day.meals === "object") {
    return Object.values(day.meals).filter(Boolean);
  }
  return [];
}

function getDayName(day, index, t) {
  const raw = String(day?.day || day?.dia || "").toLowerCase();

  if (raw.startsWith("lunes") || raw.startsWith("monday")) return t("mealPlan.weekdays.long.monday");
  if (raw.startsWith("martes") || raw.startsWith("tuesday")) return t("mealPlan.weekdays.long.tuesday");
  if (raw.startsWith("miércoles") || raw.startsWith("miercoles") || raw.startsWith("wednesday"))
    return t("mealPlan.weekdays.long.wednesday");
  if (raw.startsWith("jueves") || raw.startsWith("thursday")) return t("mealPlan.weekdays.long.thursday");
  if (raw.startsWith("viernes") || raw.startsWith("friday")) return t("mealPlan.weekdays.long.friday");
  if (raw.startsWith("sábado") || raw.startsWith("sabado") || raw.startsWith("saturday"))
    return t("mealPlan.weekdays.long.saturday");
  if (raw.startsWith("domingo") || raw.startsWith("sunday")) return t("mealPlan.weekdays.long.sunday");

  return day?.day || day?.dia || t("mealPlan.print.dayFallback", { index: index + 1 });
}

function getMealLabel(meal, index, t) {
  return meal?.name || meal?.mealType || meal?.meal_type || meal?.type || defaultMealName(index, t);
}

function defaultMealName(index, t) {
  return [
    t("meal.defaultNames.breakfast"),
    t("meal.defaultNames.lunch"),
    t("meal.defaultNames.snack"),
    t("meal.defaultNames.dinner"),
  ][index] || t("meal.defaultNames.fallback", { index: index + 1 });
}

function defaultMealTime(index) {
  return ["08:00", "13:30", "17:30", "21:00"][index] || "";
}

function getPlanSummary(days) {
  const totals = days.reduce(
    (acc, day) => {
      const meals = getMeals(day);
      acc.meals += meals.length;
      meals.forEach((meal) => {
        acc.calories += Number(meal?.calories || meal?.kcal || 0);
        acc.protein += Number(meal?.protein || 0);
      });
      return acc;
    },
    { meals: 0, calories: 0, protein: 0 }
  );

  const dayCount = days.length || 1;

  return {
    days: days.length,
    meals: totals.meals,
    averageCalories: Math.round(totals.calories / dayCount),
    averageProtein: Math.round(totals.protein / dayCount),
  };
}

function buildShoppingList(days) {
  const grouped = new Map();

  days.forEach((day) => {
    getMeals(day).forEach((meal) => {
      getIngredients(meal).forEach((ingredient) => {
        const parsed = parseIngredient(ingredient);
        if (!parsed.name) return;

        const category = categorizeIngredient(parsed.name);
        const key = `${category}:${normalizeText(parsed.name)}:${parsed.unit}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            category,
            name: toTitleCase(parsed.name),
            unit: parsed.unit,
            value: 0,
            unknownLabels: [],
          });
        }

        const item = grouped.get(key);
        item.value += parsed.value;
        if (parsed.unit === "unidad") item.unknownLabels.push(parsed.raw);
      });
    });
  });

  const byCategory = new Map();

  Array.from(grouped.values()).forEach((item) => {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push({
      id: item.id,
      name: item.name,
      amount: formatAmount(item),
    });
  });

  return SHOPPING_CATEGORIES.map((category) => ({
    category,
    translationKey: getShoppingCategoryTranslationKey(category),
    items: (byCategory.get(category) || []).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((group) => group.items.length > 0);
}

function getIngredients(meal) {
  if (Array.isArray(meal?.ingredients)) return meal.ingredients.filter(Boolean);
  if (Array.isArray(meal?.ingredientes)) return meal.ingredientes.filter(Boolean);
  if (meal?.details) {
    return String(meal.details)
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseIngredient(rawIngredient) {
  const raw =
    typeof rawIngredient === "object" && rawIngredient !== null
      ? `${rawIngredient.amount || rawIngredient.quantity || ""} ${
          rawIngredient.name || rawIngredient.food || ""
        }`.trim()
      : String(rawIngredient || "").trim();

  const match = raw.match(
    /^(\d+(?:[.,]\d+)?)\s*(kg|g|gr|gramos?|ml|l|litros?|unidad(?:es)?|ud|uds|pieza(?:s)?|huevo(?:s)?|rebanada(?:s)?|lata(?:s)?|racion(?:es)?|ración|raciones)?\s*(?:de)?\s*(.*)$/i
  );

  if (!match) return { raw, name: raw, value: 1, unit: "unidad" };

  const value = Number(String(match[1]).replace(",", ".")) || 1;
  const unitText = String(match[2] || "unidad").toLowerCase();
  const name = (match[3] || raw).trim();

  if (unitText === "kg") return { raw, name, value: value * 1000, unit: "g" };
  if (unitText === "g" || unitText === "gr" || unitText.startsWith("gramo")) {
    return { raw, name, value, unit: "g" };
  }
  if (unitText === "l" || unitText.startsWith("litro")) return { raw, name, value: value * 1000, unit: "ml" };
  if (unitText === "ml") return { raw, name, value, unit: "ml" };
  if (unitText.includes("racion") || unitText.includes("ración")) {
    return { raw, name, value, unit: "raciones" };
  }

  return { raw, name, value, unit: "ud" };
}

function formatAmount(item) {
  if (item.unit === "g") {
    return item.value >= 1000
      ? `${formatNumber(item.value / 1000)} kg`
      : `${Math.round(item.value)} g`;
  }
  if (item.unit === "ml") {
    return item.value >= 1000
      ? `${formatNumber(item.value / 1000)} L`
      : `${Math.round(item.value)} ml`;
  }
  if (item.unit === "raciones") return `${Math.round(item.value)} raciones`;
  return `${Math.round(item.value)} ud`;
}

function categorizeIngredient(name = "") {
  const text = normalizeText(name);

  if (/(pollo|pavo|carne|ternera|atun|pescado|salmon|huevo|claras)/.test(text)) {
    return "Proteinas";
  }
  if (/(arroz|pasta|avena|pan|patata|boniato|quinoa|lentejas|garbanzos)/.test(text)) {
    return "Carbohidratos";
  }
  if (/(fruta|verdura|ensalada|brocoli|platano|banana|manzana|aguacate|tomate|lechuga)/.test(text)) {
    return "Frutas y verduras";
  }
  if (/(leche|yogur|queso)/.test(text)) return "Lacteos";

  return "Otros";
}

function getShoppingCategoryTranslationKey(category) {
  switch (category) {
    case "Proteinas":
      return "diet.shopping.categories.proteins";
    case "Carbohidratos":
      return "diet.shopping.categories.carbs";
    case "Frutas y verduras":
      return "diet.shopping.categories.fruitsVegetables";
    case "Lacteos":
      return "diet.shopping.categories.dairy";
    default:
      return "diet.shopping.categories.other";
  }
}

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(text = "") {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNumber(number) {
  return Number(number.toFixed(1)).toString();
}

PrintablePlan.displayName = "PrintablePlan";

export { PrintablePlan };
export default PrintablePlan;
