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
      <div className="relative min-h-[560px] overflow-hidden border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,0_100%)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="grid min-h-[510px] place-items-center">
          <div className="text-center">
            <div className="mx-auto mb-6 grid h-24 w-24 animate-pulse place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
              <Sparkles size={40} />
            </div>
            <h2 className="text-3xl font-black text-white">
              Analizando tu comida
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-white/50">
              NutriCoach está estimando calorías, macros y recomendación según
              tu objetivo.
            </p>
            <div className="mx-auto mt-6 h-1 w-56 overflow-hidden bg-white/10">
              <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-emerald-400 to-lime-300" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="relative min-h-[560px] overflow-hidden border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,0_100%)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="grid min-h-[510px] place-items-center">
          <div className="text-center">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
              <Apple size={42} />
            </div>

            <h2 className="text-3xl font-black text-white">
              Resultado nutricional
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-white/50">
              Cuando subas una imagen, aquí aparecerá el análisis nutricional
              completo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_94%,94%_100%,0_100%)]">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
              <Sparkles size={24} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                Análisis IA
              </p>
              <h2 className="text-2xl font-black text-white">Resultado</h2>
            </div>
          </div>

          {saved && (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-300 sm:flex">
              <CheckCircle2 size={17} />
              Guardado
            </div>
          )}
        </div>

        <div className="relative mb-6 overflow-hidden bg-gradient-to-br from-emerald-400 via-lime-300 to-green-400 p-6 text-[#03110a] shadow-[0_25px_80px_#22c55e30] [clip-path:polygon(0_0,100%_0,100%_84%,92%_100%,0_100%)]">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/35 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.28em] opacity-70">
              Comida detectada
            </p>

            <h3 className="mt-3 text-4xl font-black leading-tight">{food}</h3>

            <div className="mt-5 flex flex-wrap gap-3">
              <ScoreBadge scoreData={scoreData} />
              <span className="rounded-full bg-black/10 px-4 py-2 text-sm font-black">
                Objetivo: {formatGoal(goal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <MacroPanel
            icon={<Flame size={22} />}
            title="Calorías"
            value={calories}
            unit="kcal"
          />
          <MacroPanel
            icon={<Beef size={22} />}
            title="Proteína"
            value={protein}
            unit="g"
          />
          <MacroPanel
            icon={<Wheat size={22} />}
            title="Carbs"
            value={carbs}
            unit="g"
          />
          <MacroPanel
            icon={<Droplets size={22} />}
            title="Grasas"
            value={fat}
            unit="g"
          />
        </div>

        <div className="mb-6 border-l border-emerald-300/30 bg-white/[0.045] p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-300">
            <ShieldCheck size={20} />
            <p className="text-xs font-black uppercase tracking-[0.25em]">
              Recomendación
            </p>
          </div>

          <p className="leading-7 text-white/70">{recommendation}</p>
        </div>

        <div className="grid gap-4">
          <label>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-white/45">
              Tipo de comida
            </p>

            <div className="relative">
              <Utensils className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={20} />

              <select
                value={mealType}
                onChange={(e) => updateLastMealType(e.target.value)}
                className="w-full appearance-none border border-white/10 bg-white/[0.04] px-12 py-4 font-black text-white outline-none transition focus:border-emerald-300/50"
              >
                <option className="bg-[#020617]" value="desayuno">
                  Desayuno
                </option>
                <option className="bg-[#020617]" value="almuerzo">
                  Almuerzo
                </option>
                <option className="bg-[#020617]" value="cena">
                  Cena
                </option>
                <option className="bg-[#020617]" value="snack">
                  Snack
                </option>
              </select>
            </div>
          </label>

          {saved && (
            <div className="flex items-center justify-center gap-2 border border-emerald-300/20 bg-emerald-300/10 p-4 font-black text-emerald-300">
              <CheckCircle2 size={20} />
              Comida guardada automáticamente
            </div>
          )}

          <p className="text-xs leading-5 text-white/35">
            * Los valores son aproximados. Para mayor precisión, pesa los
            alimentos y registra porciones reales.
          </p>
        </div>
      </div>
    </div>
  );
}

function MacroPanel({ icon, title, value, unit }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-4 transition hover:border-emerald-300/25 hover:bg-white/[0.07]">
      <div className="mb-3 flex items-center gap-3 text-emerald-300">
        {icon}
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
          {title}
        </p>
      </div>

      <p className="text-3xl font-black text-white">
        {Math.round(value)}
        <span className="ml-1 text-sm text-white/40">{unit}</span>
      </p>
    </div>
  );
}

function ScoreBadge({ scoreData }) {
  return (
    <span className="rounded-full bg-black/10 px-4 py-2 text-sm font-black">
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