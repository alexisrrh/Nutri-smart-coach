import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Beef,
  Flame,
  Wheat,
  Droplets,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Utensils,
} from "lucide-react";

const STORAGE_KEY = "nutricoach_meals";

export default function FoodResult({ result, loading, goal }) {
  const [mealType, setMealType] = useState("almuerzo");
  const [saved, setSaved] = useState(false);

  const food = result?.food || result?.food_name || "Comida guardada";
  const calories = Number(result?.calories) || 0;
  const protein = Number(result?.protein) || 0;
  const carbs = Number(result?.carbs) || 0;
  const fat = Number(result?.fat) || 0;

  const recommendation =
    result?.recommendation ||
    "Estimación aproximada. Para mayor precisión, pesa los alimentos.";

  const score = result?.score || "good";

  const scoreData = useMemo(() => getScoreData(score), [score]);

  useEffect(() => {
    if (!result) return;

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const newMeal = {
      id: crypto.randomUUID(),
      food,
      calories,
      protein,
      carbs,
      fat,
      recommendation,
      score,
      goal,
      mealType,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newMeal, ...existing]));
    setSaved(true);

    const timer = setTimeout(() => setSaved(false), 2500);

    return () => clearTimeout(timer);
  }, [result]);

  const updateLastMealType = (newType) => {
    setMealType(newType);

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (existing.length === 0) return;

    const updatedMeals = existing.map((meal, index) =>
      index === 0 ? { ...meal, mealType: newType } : meal
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
  };

  if (loading) {
    return (
      <div className="relative min-h-[260px] overflow-hidden border border-white/10 bg-[#0d1714] p-4 shadow-2xl sm:min-h-[420px] sm:p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 bg-emerald-500/15 blur-3xl" />

        <div className="grid min-h-[230px] place-items-center sm:min-h-[360px]">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center bg-emerald-500/15 text-emerald-400 sm:h-20 sm:w-20">
              <Sparkles size={34} />
            </div>

            <h2 className="text-2xl font-black italic text-white sm:text-3xl">
              Analizando comida
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-xs normal-case leading-5 text-white/50 sm:text-sm">
              NutriSmart Coach está calculando macros y calorías.
            </p>

            <div className="mx-auto mt-5 h-1 w-40 overflow-hidden bg-white/10 sm:w-52">
              <div className="h-full w-1/2 animate-pulse bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="relative min-h-[260px] overflow-hidden border border-white/10 bg-[#0d1714] p-4 shadow-2xl sm:min-h-[420px] sm:p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 bg-emerald-500/10 blur-3xl" />

        <div className="grid min-h-[230px] place-items-center sm:min-h-[360px]">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center bg-emerald-500/15 text-emerald-400 sm:h-20 sm:w-20">
              <Apple size={36} />
            </div>

            <h2 className="text-2xl font-black italic text-white sm:text-3xl">
              Resultado nutricional
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-xs normal-case leading-5 text-white/50 sm:text-sm">
              Aquí aparecerá el análisis de la comida.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#0d1714] p-4 shadow-2xl sm:p-6">
      <div className="absolute -right-24 -top-24 h-64 w-64 bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center bg-emerald-500/15 text-emerald-400">
              <Sparkles size={22} />
            </div>

            <div>
              <p className="text-[9px] font-black tracking-[0.3em] text-emerald-400 sm:text-xs">
                ANÁLISIS IA
              </p>

              <h2 className="text-xl font-black italic text-white sm:text-2xl">
                Resultado
              </h2>
            </div>
          </div>

          {saved && (
            <div className="hidden items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400 sm:flex">
              <CheckCircle2 size={16} />
              Guardado
            </div>
          )}
        </div>

        <div className="relative mb-4 overflow-hidden bg-emerald-500 p-3 text-[#03110a] shadow-[0_20px_50px_#22c55e25] sm:mb-5 sm:p-5">
          <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/20 blur-3xl" />

          <div className="relative">
            <p className="text-[9px] font-black tracking-[0.28em] opacity-70 sm:text-xs">
              COMIDA DETECTADA
            </p>

            <h3 className="mt-2 text-xl font-black leading-tight sm:text-3xl">
              {food}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              <ScoreBadge scoreData={scoreData} />

              <span className="bg-black/10 px-3 py-2 text-[10px] font-black sm:text-xs">
                Objetivo: {formatGoal(goal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
          <MacroPanel
            icon={<Flame size={18} />}
            title="Calorías"
            value={calories}
            unit="kcal"
          />

          <MacroPanel
            icon={<Beef size={18} />}
            title="Proteína"
            value={protein}
            unit="g"
          />

          <MacroPanel
            icon={<Wheat size={18} />}
            title="Carbs"
            value={carbs}
            unit="g"
          />

          <MacroPanel
            icon={<Droplets size={18} />}
            title="Grasas"
            value={fat}
            unit="g"
          />
        </div>

        <div className="mb-4 border-l border-emerald-500/30 bg-white/[0.04] p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={18} />

            <p className="text-[9px] font-black tracking-[0.25em] sm:text-xs">
              RECOMENDACIÓN
            </p>
          </div>

          <p className="text-xs normal-case leading-6 text-white/70 sm:text-sm">
            {recommendation}
          </p>
        </div>

        <div className="grid gap-3">
          <label>
            <p className="mb-2 text-[9px] font-black tracking-[0.2em] text-white/45 sm:text-xs">
              TIPO DE COMIDA
            </p>

            <div className="relative">
              <Utensils
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
                size={18}
              />

              <select
                value={mealType}
                onChange={(e) => updateLastMealType(e.target.value)}
                className="w-full appearance-none border border-white/10 bg-white/[0.04] px-12 py-3 text-xs font-black text-white outline-none transition focus:border-emerald-500/50"
              >
                <option className="bg-[#08120f]" value="desayuno">
                  Desayuno
                </option>

                <option className="bg-[#08120f]" value="almuerzo">
                  Almuerzo
                </option>

                <option className="bg-[#08120f]" value="cena">
                  Cena
                </option>

                <option className="bg-[#08120f]" value="snack">
                  Snack
                </option>
              </select>
            </div>
          </label>

          {saved && (
            <div className="flex items-center justify-center gap-2 border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-black text-emerald-400">
              <CheckCircle2 size={18} />
              Comida guardada automáticamente
            </div>
          )}

          <p className="text-[10px] normal-case leading-4 text-white/35 sm:text-xs">
            * Los valores son aproximados y pueden variar.
          </p>
        </div>
      </div>
    </div>
  );
}

function MacroPanel({ icon, title, value, unit }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-2.5 transition hover:border-emerald-500/25 hover:bg-white/[0.07] sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-emerald-400">
        {icon}

        <p className="text-[8px] font-black tracking-[0.16em] text-white/40 sm:text-[10px]">
          {title}
        </p>
      </div>

      <p className="text-xl font-black text-white sm:text-3xl">
        {Math.round(value)}

        <span className="ml-1 text-[10px] text-white/40 sm:text-sm">
          {unit}
        </span>
      </p>
    </div>
  );
}

function ScoreBadge({ scoreData }) {
  return (
    <span className="bg-black/10 px-3 py-2 text-[10px] font-black sm:text-xs">
      {scoreData.label}
    </span>
  );
}

function getScoreData(score) {
  if (score === "excellent") {
    return { label: "Excelente para tu objetivo" };
  }

  if (score === "bad") {
    return { label: "No recomendado" };
  }

  return { label: "Aceptable" };
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";

  return "No definido";
}