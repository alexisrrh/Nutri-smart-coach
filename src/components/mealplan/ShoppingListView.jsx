import React, { useMemo, useState } from "react";
import {
  Beef,
  Check,
  Milk,
  Package,
  ShoppingBag,
  Wheat,
  Apple,
} from "lucide-react";

export function ShoppingListView({ plan }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState("proteinas");

  const shoppingGroups = useMemo(() => buildShoppingGroups(plan), [plan]);

  const categories = [
    {
      key: "proteinas",
      label: "Proteínas",
      icon: <Beef size={14} />,
      items: shoppingGroups.proteinas,
    },
    {
      key: "carbohidratos",
      label: "Carbos",
      icon: <Wheat size={14} />,
      items: shoppingGroups.carbohidratos,
    },
    {
      key: "frutasVerduras",
      label: "Verdes",
      icon: <Apple size={14} />,
      items: shoppingGroups.frutasVerduras,
    },
    {
      key: "lacteos",
      label: "Lácteos",
      icon: <Milk size={14} />,
      items: shoppingGroups.lacteos,
    },
    {
      key: "otros",
      label: "Otros",
      icon: <Package size={14} />,
      items: shoppingGroups.otros,
    },
  ].filter((category) => category.items.length > 0);

  const allItems = categories.flatMap((category) => category.items);
  const totalItems = allItems.length;
  const checkedCount = allItems.filter((item) => checkedItems[item.id]).length;
  const progress =
    totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const activeItems =
    categories.find((category) => category.key === activeCategory)?.items ||
    categories[0]?.items ||
    [];

  if (totalItems === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-[#07120d] p-5 text-center">
        <ShoppingBag className="mx-auto mb-2 text-[#10b981]" size={26} />
        <p className="text-sm font-black uppercase text-white">Lista vacía</p>
        <p className="mt-1 text-xs normal-case text-slate-400">
          Genera una dieta con ingredientes para crear la compra.
        </p>
      </div>
    );
  }

  const toggleItem = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-[#07120d] p-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
            <ShoppingBag size={14} />
            Compra semanal
          </div>

          <p className="mt-1 text-xs normal-case text-slate-400">
            {checkedCount}/{totalItems} comprados · {progress}%
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCheckedItems({})}
          disabled={checkedCount === 0}
          className="rounded-lg border border-white/5 bg-[#0d2218] px-3 py-2 text-[9px] font-black uppercase tracking-wide text-slate-300 disabled:opacity-40"
        >
          Reiniciar
        </button>
      </header>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveCategory(category.key)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wide transition ${
              activeCategory === category.key
                ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
                : "border-white/5 bg-[#0d2218] text-slate-400"
            }`}
          >
            {category.icon}
            {category.label}
            <span className="opacity-70">{category.items.length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {activeItems.map((item) => {
          const isChecked = checkedItems[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                isChecked
                  ? "border-[#10b981]/15 bg-[#10b981]/5 opacity-55"
                  : "border-white/5 bg-[#0d2218]/60 hover:bg-[#0d2218]"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isChecked
                    ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
                    : "border-white/20 text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-xs font-black uppercase tracking-wide ${
                    isChecked ? "text-slate-500 line-through" : "text-slate-200"
                  }`}
                >
                  {item.name}
                </p>

                <p className="mt-0.5 text-[11px] font-bold normal-case text-[#10b981]">
                  {item.amount}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function buildShoppingGroups(plan = []) {
  const itemsMap = new Map();

  plan.forEach((day) => {
    const meals = Array.isArray(day?.meals)
      ? day.meals
      : Object.values(day?.meals || {});

    meals.forEach((meal) => {
      getIngredients(meal).forEach((ingredient) => {
        const parsed = parseIngredient(ingredient);
        if (!parsed.name) return;

        const key = normalizeName(parsed.name);

        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            id: key,
            name: toTitleCase(parsed.name),
            category: categorizeIngredient(parsed.name),
            grams: 0,
            ml: 0,
            units: 0,
            portions: 0,
            unknown: 0,
          });
        }

        const item = itemsMap.get(key);

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

  const groups = {
    proteinas: [],
    carbohidratos: [],
    frutasVerduras: [],
    lacteos: [],
    otros: [],
  };

  Array.from(itemsMap.values())
    .map((item) => ({ ...item, amount: formatAmount(item) }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((item) => {
      groups[item.category].push(item);
    });

  return groups;
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
  const text =
    typeof rawIngredient === "object"
      ? `${rawIngredient.amount || rawIngredient.quantity || ""} ${
          rawIngredient.name || rawIngredient.food || ""
        }`
      : String(rawIngredient).trim();

  const match = text.match(
    /^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|unidad(?:es)?|huevo(?:s)?|pieza(?:s)?|rebanada(?:s)?|plátano(?:s)?|platano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones)?\s*(?:de)?\s*(.*)$/i
  );

  if (!match) return { name: text, value: 1, unit: "unknown" };

  const value = Number(String(match[1]).replace(",", "."));
  const unitText = (match[2] || "").toLowerCase();
  const name = (match[3] || text).trim();

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

function formatAmount(item) {
  const parts = [];

  if (item.grams > 0) {
    parts.push(
      item.grams >= 1000
        ? `${formatNumber(item.grams / 1000)} kg`
        : `${Math.round(item.grams)} g`
    );
  }

  if (item.ml > 0) {
    parts.push(
      item.ml >= 1000
        ? `${formatNumber(item.ml / 1000)} L`
        : `${Math.round(item.ml)} ml`
    );
  }

  if (item.units > 0) parts.push(`${Math.round(item.units)} ud`);
  if (item.portions > 0) parts.push(`${Math.round(item.portions)} raciones`);
  if (parts.length === 0 && item.unknown > 0) {
    parts.push(`${item.unknown} vez/semana`);
  }

  return parts.join(" + ") || "cantidad semanal";
}

function categorizeIngredient(name = "") {
  const text = name.toLowerCase();

  if (
    [
      "pollo",
      "pavo",
      "carne",
      "ternera",
      "salmón",
      "salmon",
      "pescado",
      "merluza",
      "atún",
      "atun",
      "huevo",
      "claras",
    ].some((word) => text.includes(word))
  ) {
    return "proteinas";
  }

  if (
    [
      "arroz",
      "pasta",
      "avena",
      "pan",
      "patata",
      "boniato",
      "quinoa",
      "lentejas",
      "garbanzos",
    ].some((word) => text.includes(word))
  ) {
    return "carbohidratos";
  }

  if (
    [
      "verduras",
      "ensalada",
      "fruta",
      "plátano",
      "platano",
      "banana",
      "frutos rojos",
      "manzana",
      "brócoli",
      "brocoli",
      "aguacate",
      "tomate",
    ].some((word) => text.includes(word))
  ) {
    return "frutasVerduras";
  }

  if (
    ["yogur", "leche", "queso", "requesón", "requeson"].some((word) =>
      text.includes(word)
    )
  ) {
    return "lacteos";
  }

  return "otros";
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