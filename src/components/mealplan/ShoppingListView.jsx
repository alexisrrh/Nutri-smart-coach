import React, { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Milk,
  ShoppingBag,
  Wheat,
  Beef,
  Apple,
  Package,
} from "lucide-react";

export function ShoppingListView({ plan }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [openCategories, setOpenCategories] = useState({
    proteinas: true,
    carbohidratos: true,
    frutasVerduras: true,
    lacteos: true,
    otros: true,
  });

  const shoppingGroups = useMemo(() => buildShoppingGroups(plan), [plan]);

  const allItems = Object.values(shoppingGroups).flat();
  const totalItems = allItems.length;
  const checkedCount = allItems.filter((item) => checkedItems[item.id]).length;
  const progress =
    totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  if (totalItems === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-[#07120d] p-6 text-center">
        <ShoppingBag className="mx-auto mb-3 text-[#10b981]" size={28} />

        <p className="text-sm font-black uppercase text-white">
          Lista de compra vacía
        </p>

        <p className="mx-auto mt-2 max-w-sm text-xs normal-case leading-5 text-slate-400">
          Genera una dieta con ingredientes para crear automáticamente la lista
          semanal.
        </p>
      </div>
    );
  }

  const toggleItem = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCategory = (categoryKey) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const clearChecked = () => setCheckedItems({});

  return (
    <section className="space-y-4 rounded-xl border border-white/5 bg-[#07120d] p-4 sm:p-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
            <ShoppingBag size={14} />
            Lista de compra semanal
          </div>

          <h3 className="mt-1 text-2xl font-black uppercase italic tracking-tight text-white">
            Compra inteligente
          </h3>

          <p className="mt-1 text-xs normal-case text-slate-400">
            Cantidades aproximadas sumadas para toda la semana.
          </p>
        </div>

        <button
          type="button"
          onClick={clearChecked}
          disabled={checkedCount === 0}
          className="rounded-lg border border-white/5 bg-[#0d2218] px-4 py-2.5 text-[10px] font-black uppercase tracking-wide text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reiniciar
        </button>
      </header>

      <div className="rounded-xl border border-white/5 bg-[#0d2218]/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wide text-white">
            Progreso de compra
          </p>

          <p className="text-xs font-black text-[#10b981]">
            {checkedCount}/{totalItems} · {progress}%
          </p>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <ShoppingCategory
          title="Proteínas"
          categoryKey="proteinas"
          icon={<Beef size={16} />}
          items={shoppingGroups.proteinas}
          checkedItems={checkedItems}
          open={openCategories.proteinas}
          onToggleCategory={toggleCategory}
          onToggleItem={toggleItem}
        />

        <ShoppingCategory
          title="Carbohidratos"
          categoryKey="carbohidratos"
          icon={<Wheat size={16} />}
          items={shoppingGroups.carbohidratos}
          checkedItems={checkedItems}
          open={openCategories.carbohidratos}
          onToggleCategory={toggleCategory}
          onToggleItem={toggleItem}
        />

        <ShoppingCategory
          title="Frutas y verduras"
          categoryKey="frutasVerduras"
          icon={<Apple size={16} />}
          items={shoppingGroups.frutasVerduras}
          checkedItems={checkedItems}
          open={openCategories.frutasVerduras}
          onToggleCategory={toggleCategory}
          onToggleItem={toggleItem}
        />

        <ShoppingCategory
          title="Lácteos"
          categoryKey="lacteos"
          icon={<Milk size={16} />}
          items={shoppingGroups.lacteos}
          checkedItems={checkedItems}
          open={openCategories.lacteos}
          onToggleCategory={toggleCategory}
          onToggleItem={toggleItem}
        />

        <ShoppingCategory
          title="Otros"
          categoryKey="otros"
          icon={<Package size={16} />}
          items={shoppingGroups.otros}
          checkedItems={checkedItems}
          open={openCategories.otros}
          onToggleCategory={toggleCategory}
          onToggleItem={toggleItem}
        />
      </div>
    </section>
  );
}

function ShoppingCategory({
  title,
  categoryKey,
  icon,
  items,
  checkedItems,
  open,
  onToggleCategory,
  onToggleItem,
}) {
  if (!items || items.length === 0) return null;

  const checkedCount = items.filter((item) => checkedItems[item.id]).length;

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0d2218]/40">
      <button
        type="button"
        onClick={() => onToggleCategory(categoryKey)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981]/10 text-[#10b981]">
            {icon}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wide text-white">
              {title}
            </p>

            <p className="text-[10px] font-bold normal-case text-slate-500">
              {checkedCount}/{items.length} comprados
            </p>
          </div>
        </div>

        <div className="text-slate-500">
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </div>
      </button>

      {open && (
        <div className="grid gap-2 border-t border-white/5 p-3 sm:grid-cols-2">
          {items.map((item) => {
            const isChecked = checkedItems[item.id];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleItem(item.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  isChecked
                    ? "border-[#10b981]/15 bg-[#10b981]/5 opacity-55"
                    : "border-white/5 bg-[#07120d] hover:bg-[#0d2218]"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    isChecked
                      ? "border-[#10b981] bg-[#10b981] text-slate-950"
                      : "border-white/20 text-transparent"
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs font-black uppercase tracking-wide ${
                      isChecked
                        ? "text-slate-500 line-through"
                        : "text-slate-200"
                    }`}
                  >
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-[11px] font-bold normal-case text-[#10b981]">
                    {item.amount}
                  </p>
                </div>

                {isChecked && (
                  <CheckCircle2 className="shrink-0 text-[#10b981]" size={15} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildShoppingGroups(plan = []) {
  const itemsMap = new Map();

  plan.forEach((day) => {
    const meals = Array.isArray(day?.meals)
      ? day.meals
      : Object.values(day?.meals || {});

    meals.forEach((meal) => {
      const ingredients = getIngredients(meal);

      ingredients.forEach((ingredient) => {
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
    .map((item) => ({
      ...item,
      amount: formatAmount(item),
    }))
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

  if (!unitText) {
    return {
      name,
      value,
      unit: "unknown",
    };
  }

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

  if (!match) {
    return { value: 1, unit: "unknown" };
  }

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
    if (item.grams >= 1000) {
      parts.push(`${formatNumber(item.grams / 1000)} kg`);
    } else {
      parts.push(`${Math.round(item.grams)} g`);
    }
  }

  if (item.ml > 0) {
    if (item.ml >= 1000) {
      parts.push(`${formatNumber(item.ml / 1000)} L`);
    } else {
      parts.push(`${Math.round(item.ml)} ml`);
    }
  }

  if (item.units > 0) {
    parts.push(`${Math.round(item.units)} ud`);
  }

  if (item.portions > 0) {
    parts.push(`${Math.round(item.portions)} raciones`);
  }

  if (parts.length === 0 && item.unknown > 0) {
    parts.push(`${item.unknown} vez/semana`);
  }

  return parts.join(" + ") || "cantidad semanal";
}

function categorizeIngredient(name = "") {
  const text = name.toLowerCase();

  const proteinWords = [
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
    "proteína",
    "proteina",
  ];

  const carbWords = [
    "arroz",
    "pasta",
    "avena",
    "pan",
    "patata",
    "boniato",
    "tostada",
    "cereal",
    "quinoa",
    "lentejas",
    "garbanzos",
  ];

  const fruitVegWords = [
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
    "zanahoria",
    "aguacate",
    "tomate",
  ];

  const dairyWords = [
    "yogur",
    "leche",
    "queso",
    "requesón",
    "requeson",
    "fresco batido",
  ];

  if (proteinWords.some((word) => text.includes(word))) return "proteinas";
  if (carbWords.some((word) => text.includes(word))) return "carbohidratos";
  if (fruitVegWords.some((word) => text.includes(word)))
    return "frutasVerduras";
  if (dairyWords.some((word) => text.includes(word))) return "lacteos";

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