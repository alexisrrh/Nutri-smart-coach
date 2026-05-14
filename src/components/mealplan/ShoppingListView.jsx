import { useMemo, useState } from "react";
import {
  Apple,
  Beef,
  Check,
  Milk,
  Package,
  ShoppingBag,
  Wheat,
} from "lucide-react";

export function ShoppingListView({ plan }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState("proteinas");

  const shoppingGroups = useMemo(() => buildShoppingGroups(plan), [plan]);

  const categories = [
    {
      key: "proteinas",
      label: "Proteínas",
      icon: <Beef size={15} />,
      items: shoppingGroups.proteinas,
    },
    {
      key: "carbohidratos",
      label: "Carbos",
      icon: <Wheat size={15} />,
      items: shoppingGroups.carbohidratos,
    },
    {
      key: "frutasVerduras",
      label: "Verdes",
      icon: <Apple size={15} />,
      items: shoppingGroups.frutasVerduras,
    },
    {
      key: "lacteos",
      label: "Lácteos",
      icon: <Milk size={15} />,
      items: shoppingGroups.lacteos,
    },
    {
      key: "otros",
      label: "Otros",
      icon: <Package size={15} />,
      items: shoppingGroups.otros,
    },
  ].filter((category) => category.items.length > 0);

  const allItems = categories.flatMap((category) => category.items);

  const totalItems = allItems.length;

  const checkedCount = allItems.filter(
    (item) => checkedItems[item.id]
  ).length;

  const progress =
    totalItems > 0
      ? Math.round((checkedCount / totalItems) * 100)
      : 0;

  const activeItems =
    categories.find((category) => category.key === activeCategory)?.items ||
    categories[0]?.items ||
    [];

  if (totalItems === 0) {
    return (
      <div className="rounded-[30px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
        <ShoppingBag
          className="mx-auto mb-3 text-[#10b981]"
          size={30}
        />

        <p className="text-sm font-black uppercase text-white">
          Lista vacía
        </p>

        <p className="mt-2 text-[11px] normal-case leading-5 text-slate-400">
          Genera una dieta con ingredientes para crear la compra.
        </p>
      </div>
    );
  }

  function toggleItem(id) {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#10b981]/15 bg-[#07170f] p-4 shadow-[0_24px_80px_rgba(16,185,129,0.08)]">
      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-[#10b981]">
              <ShoppingBag size={14} />
              Compra semanal
            </div>

            <h3 className="mt-1 text-xl font-black uppercase italic leading-none text-white">
              Lista inteligente
            </h3>

            <p className="mt-1 text-[11px] normal-case text-slate-500">
              {checkedCount}/{totalItems} productos comprados
            </p>
          </div>

          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] border border-[#10b981]/20 bg-[#10b981]/10">
            <div className="text-center">
              <p className="text-lg font-black text-[#10b981]">
                {progress}%
              </p>

              <p className="text-[7px] font-black uppercase tracking-widest text-white/40">
                listo
              </p>
            </div>
          </div>
        </header>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/5">
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
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-wide transition-all ${
                activeCategory === category.key
                  ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
                  : "border-white/10 bg-black/20 text-slate-400 hover:bg-white/[0.03]"
              }`}
            >
              {category.icon}

              {category.label}

              <span className="opacity-70">
                {category.items.length}
              </span>
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
                className={`group relative overflow-hidden rounded-[24px] border p-3 text-left transition-all ${
                  isChecked
                    ? "border-[#10b981]/25 bg-[#10b981]/5 opacity-70"
                    : "border-white/10 bg-black/20 hover:border-[#10b981]/20 hover:bg-black/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-xl border transition-all ${
                      isChecked
                        ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
                        : "border-white/15 bg-[#0d2218]"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[11px] font-black uppercase tracking-wide ${
                        isChecked
                          ? "text-slate-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {item.name}
                    </p>

                    <p className="mt-1 text-[11px] font-bold normal-case text-[#10b981]">
                      {item.amount}
                    </p>
                  </div>
                </div>

                {!isChecked && (
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-y-0 -left-24 w-24 rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
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

        const normalized = normalizeIngredientName(parsed.name);
        const unitGroup = getUnitGroup(parsed.unit);
        const key = `${normalized.key}:${unitGroup}`;

        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            id: key,
            name: normalized.label,
            category: categorizeIngredient(normalized.key),
            unitGroup,
            grams: 0,
            ml: 0,
            units: 0,
            portions: 0,
            unknown: 0,
            unknownLabels: [],
          });
        }

        const item = itemsMap.get(key);

        if (parsed.unit === "g") item.grams += parsed.value;
        else if (parsed.unit === "kg")
          item.grams += parsed.value * 1000;
        else if (parsed.unit === "ml")
          item.ml += parsed.value;
        else if (parsed.unit === "l")
          item.ml += parsed.value * 1000;
        else if (parsed.unit === "unit")
          item.units += parsed.value;
        else if (parsed.unit === "portion")
          item.portions += parsed.value;
        else {
          item.unknown += 1;
          item.unknownLabels.push(parsed.rawAmount || ingredient);
        }
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
  if (
    Array.isArray(meal?.ingredients) &&
    meal.ingredients.length > 0
  ) {
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
      ? `${rawIngredient.amount || ""} ${
          rawIngredient.name || ""
        }`
      : String(rawIngredient).trim();

  const match = text.match(
    /^(\d+(?:[.,]\d+)?)\s*(kg|g|gr|gramos?|ml|l|litros?|unidad(?:es)?|ud|uds|pieza(?:s)?|huevo(?:s)?|rebanada(?:s)?|plátano(?:s)?|platano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones)?\s*(?:de)?\s*(.*)$/i
  );

  if (!match) {
    return {
      name: text,
      value: 1,
      unit: "unknown",
    };
  }

  const value = Number(
    String(match[1]).replace(",", ".")
  );

  const unitText = (match[2] || "").toLowerCase();

  const matchedName = (match[3] || "").trim();
  const name = matchedName || getNameFromUnitText(unitText) || text;

  if (unitText === "g" || unitText === "gr" || unitText.startsWith("gramo")) {
    return { name, value, unit: "g" };
  }
  if (unitText === "kg") return { name, value, unit: "kg" };
  if (unitText === "ml") return { name, value, unit: "ml" };
  if (unitText === "l" || unitText.startsWith("litro")) {
    return { name, value, unit: "l" };
  }

  if (
    unitText.includes("unidad") ||
    unitText === "ud" ||
    unitText === "uds" ||
    unitText.includes("pieza") ||
    unitText.includes("huevo") ||
    unitText.includes("rebanada") ||
    unitText.includes("banana") ||
    unitText.includes("platano") ||
    unitText.includes("plátano") ||
    unitText.includes("lata")
  ) {
    return { name, value, unit: "unit" };
  }

  if (
    unitText.includes("plato") ||
    unitText.includes("ración")
  ) {
    return { name, value, unit: "portion" };
  }

  return {
    name,
    value,
    unit: "unknown",
  };
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

  if (item.units > 0) {
    parts.push(`${Math.round(item.units)} ud`);
  }

  if (item.portions > 0) {
    parts.push(`${Math.round(item.portions)} raciones`);
  }

  if (parts.length === 0 && item.unknown > 0) {
    parts.push(formatUnknownAmount(item));
  }

  return parts.join(" + ") || "cantidad semanal";
}

function getNameFromUnitText(unitText) {
  if (/^huevo(?:s)?$/.test(unitText)) return "huevos";
  if (/^pl[aá]tano(?:s)?$/.test(unitText)) return "plátanos";
  if (/^banana(?:s)?$/.test(unitText)) return "bananas";

  return "";
}

function categorizeIngredient(name = "") {
  const text = normalizeText(name);

  if (
    [
      "pollo",
      "pavo",
      "carne",
      "ternera",
      "atun",
      "atún",
      "pescado",
      "salmon",
      "salmón",
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
      "fruta",
      "verdura",
      "ensalada",
      "brocoli",
      "brócoli",
      "platano",
      "plátano",
      "banana",
      "manzana",
      "aguacate",
      "tomate",
    ].some((word) => text.includes(word))
  ) {
    return "frutasVerduras";
  }

  if (
    ["leche", "yogur", "queso"].some((word) =>
      text.includes(word)
    )
  ) {
    return "lacteos";
  }

  return "otros";
}

function normalizeName(name = "") {
  return normalizeText(name);
}

function normalizeIngredientName(name = "") {
  const key = normalizeName(name);
  const canonicalKey = getCanonicalIngredientKey(key);

  return {
    key: canonicalKey,
    label: CANONICAL_INGREDIENT_LABELS[canonicalKey] || toTitleCase(canonicalKey),
  };
}

function getCanonicalIngredientKey(key) {
  if (/^huevos?$/.test(key)) return "huevos";

  if (
    key === "arroz" ||
    key === "arroz cocido" ||
    key === "arroz blanco" ||
    key === "arroz blanco cocido"
  ) {
    return "arroz";
  }

  if (
    key === "pollo" ||
    key === "pechuga pollo" ||
    key === "pechuga de pollo" ||
    key === "pollo plancha" ||
    key === "pollo a la plancha"
  ) {
    return "pollo";
  }

  return key;
}

function getUnitGroup(unit) {
  if (unit === "g" || unit === "kg") return "weight";
  if (unit === "ml" || unit === "l") return "volume";
  if (unit === "unit") return "unit";
  if (unit === "portion") return "portion";

  return "unknown";
}

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatUnknownAmount(item) {
  const uniqueLabels = Array.from(
    new Set(
      item.unknownLabels
        .map((label) => String(label).trim())
        .filter(Boolean)
    )
  );

  if (uniqueLabels.length === 1) return uniqueLabels[0];

  return `${item.unknown} vez/semana`;
}

function toTitleCase(text = "") {
  return String(text)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function formatNumber(number) {
  return Number(number.toFixed(1)).toString();
}

const CANONICAL_INGREDIENT_LABELS = {
  arroz: "Arroz",
  huevos: "Huevos",
  pollo: "Pollo",
};
