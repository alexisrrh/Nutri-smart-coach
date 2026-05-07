import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Beef,
  CheckCircle2,
  Droplets,
  Flame,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wheat,
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
  const fiber = Number(result?.fiber) || 0;
const sugar = Number(result?.sugar) || 0;
const sodium = Number(result?.sodium) || 0;

const description =
  result?.description || "Análisis visual generado por IA.";

const portionEstimate =
  result?.portion_estimate || "Porción no especificada.";

const ingredientsDetected =
  result?.ingredients_detected || [];

const confidence = Number(result?.confidence) || 75;

const goalFit =
  result?.goal_fit ||
  "La IA no generó una explicación del objetivo.";

const improvements =
  result?.improvements || [];

const warning = result?.warning || "";

  const recommendation =
    result?.recommendation ||
    "Estimación aproximada. Para mayor precisión, pesa los alimentos.";

  const score = result?.score || "good";
  const scoreData = useMemo(() => getScoreData(score), [score]);

  useEffect(() => {
    if (!result) return;

    const existing = safeParse(localStorage.getItem(STORAGE_KEY), []);

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

    const existing = safeParse(localStorage.getItem(STORAGE_KEY), []);
    if (existing.length === 0) return;

    const updatedMeals = existing.map((meal, index) =>
      index === 0 ? { ...meal, mealType: newType } : meal
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
  };

  if (loading) {
    return (
      <ResultShell>
        <div className="grid min-h-[220px] place-items-center sm:min-h-[320px]">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 animate-pulse place-items-center border border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981] sm:h-16 sm:w-16">
              <Sparkles size={30} />
            </div>

            <h2 className="text-xl font-black uppercase italic text-white sm:text-2xl">
              Analizando comida
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs normal-case leading-5 text-slate-400">
              Calculando calorías, macros y recomendación.
            </p>

            <div className="mx-auto mt-4 h-1 w-44 overflow-hidden bg-white/10">
              <div className="h-full w-1/2 animate-pulse bg-[#10b981]" />
            </div>
          </div>
        </div>
      </ResultShell>
    );
  }

  if (!result) {
    return (
      <ResultShell>
        <div className="grid min-h-[220px] place-items-center sm:min-h-[320px]">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981] sm:h-16 sm:w-16">
              <Apple size={32} />
            </div>

            <h2 className="text-xl font-black uppercase italic text-white sm:text-2xl">
              Resultado nutricional
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs normal-case leading-5 text-slate-400">
              Aquí aparecerá el análisis de tu comida.
            </p>
          </div>
        </div>
      </ResultShell>
    );
  }

  return (
    <ResultShell>
      <div className="relative space-y-3">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981]">
              <Sparkles size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black tracking-[0.3em] text-[#10b981]">
                ANÁLISIS IA
              </p>

              <h2 className="text-xl font-black uppercase italic leading-none text-white">
                Resultado
              </h2>
            </div>
          </div>

          {saved && (
            <div className="hidden items-center gap-2 border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-2 text-[10px] font-black text-[#10b981] sm:flex">
              <CheckCircle2 size={14} />
              Guardado
            </div>
          )}
        </header>

        <section className="relative overflow-hidden border border-[#10b981]/20 bg-[#10b981] p-4 text-[#03110a] shadow-[0_18px_50px_#22c55e20]">
          <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/25 blur-3xl" />

          <div className="relative">
            <p className="text-[9px] font-black tracking-[0.28em] opacity-70">
              COMIDA DETECTADA
            </p>

            <h3 className="mt-1.5 text-xl font-black uppercase italic leading-tight sm:text-2xl">
              {food}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <ScoreBadge scoreData={scoreData} />

              <span className="bg-black/10 px-3 py-1.5 text-[10px] font-black">
                Objetivo: {formatGoal(goal)}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-2">
          <MacroPanel
            icon={<Flame size={15} />}
            title="Kcal"
            value={calories}
            unit=""
          />

          <MacroPanel
            icon={<Beef size={15} />}
            title="Prot"
            value={protein}
            unit="g"
          />

          <MacroPanel
            icon={<Wheat size={15} />}
            title="Carb"
            value={carbs}
            unit="g"
          />

          <MacroPanel
            icon={<Droplets size={15} />}
            title="Grasa"
            value={fat}
            unit="g"
          />
        </section>
        <section className="grid gap-3 lg:grid-cols-2">
  <InfoCard
    title="Descripción detectada"
    value={description}
  />

  <InfoCard
    title="Porción estimada"
    value={portionEstimate}
  />
</section>

        <section className="border-l border-[#10b981]/40 bg-white/[0.04] p-3">
          <div className="mb-2 flex items-center gap-2 text-[#10b981]">
            <ShieldCheck size={16} />

            <p className="text-[9px] font-black tracking-[0.25em]">
              RECOMENDACIÓN
            </p>
          </div>

          <p className="text-xs normal-case leading-5 text-slate-300">
            {recommendation}
          </p>
        </section>
      <section className="grid gap-3 lg:grid-cols-3">
  <MacroMini
    label="Fibra"
    value={`${fiber}g`}
  />

  <MacroMini
    label="Azúcar"
    value={`${sugar}g`}
  />

  <MacroMini
    label="Sodio"
    value={`${sodium}mg`}
  />
</section>
<section className="border border-white/10 bg-white/[0.04] p-3">
  <div className="mb-2 flex items-center justify-between gap-3">
    <p className="text-[9px] font-black tracking-[0.22em] text-[#10b981]">
      CONFIANZA DEL ANÁLISIS
    </p>

    <span className="text-sm font-black text-white">
      {confidence}%
    </span>
  </div>

  <div className="h-2 overflow-hidden bg-white/5">
    <div
      className="h-full bg-[#10b981] transition-all duration-500"
      style={{ width: `${confidence}%` }}
    />
  </div>
</section>
<section className="border-l border-[#10b981]/40 bg-[#10b981]/5 p-3">
  <div className="mb-2 flex items-center gap-2 text-[#10b981]">
    <ShieldCheck size={16} />

    <p className="text-[9px] font-black tracking-[0.22em]">
      ENCAJE CON TU OBJETIVO
    </p>
  </div>

  <p className="text-xs normal-case leading-5 text-slate-300">
    {goalFit}
  </p>
</section>
{ingredientsDetected.length > 0 && (
  <section>
    <p className="mb-2 text-[9px] font-black tracking-[0.22em] text-[#10b981]">
      INGREDIENTES DETECTADOS
    </p>

    <div className="flex flex-wrap gap-2">
      {ingredientsDetected.map((ingredient, index) => (
        <span
          key={index}
          className="border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-slate-300"
        >
          {ingredient}
        </span>
      ))}
    </div>
  </section>
)}
{improvements.length > 0 && (
  <section className="border border-white/10 bg-white/[0.03] p-3">
    <p className="mb-3 text-[9px] font-black tracking-[0.22em] text-[#10b981]">
      MEJORAS RECOMENDADAS
    </p>

    <div className="space-y-2">
      {improvements.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-2 text-xs text-slate-300"
        >
          <div className="mt-1 h-1.5 w-1.5 shrink-0 bg-[#10b981]" />
          <p className="normal-case leading-5">
            {item}
          </p>
        </div>
      ))}
    </div>
  </section>
)}
{warning && (
  <section className="border border-amber-500/20 bg-amber-500/10 p-3">
    <div className="flex items-start gap-2">
      <ShieldCheck
        size={15}
        className="mt-0.5 shrink-0 text-amber-400"
      />

      <div>
        <p className="text-[9px] font-black tracking-[0.22em] text-amber-400">
          ADVERTENCIA
        </p>

        <p className="mt-1 text-xs normal-case leading-5 text-amber-100/80">
          {warning}
        </p>
      </div>
    </div>
  </section>
)}



        <section className="grid gap-3">
          <label>
            <p className="mb-1.5 text-[9px] font-black tracking-[0.2em] text-white/45">
              TIPO DE COMIDA
            </p>

            <div className="relative">
              <Utensils
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#10b981]"
                size={16}
              />

              <select
                value={mealType}
                onChange={(e) => updateLastMealType(e.target.value)}
                className="h-11 w-full appearance-none border border-white/10 bg-white/[0.04] px-10 text-xs font-black text-white outline-none transition focus:border-[#10b981]/50"
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
            <div className="flex items-center justify-center gap-2 border border-[#10b981]/20 bg-[#10b981]/10 p-2.5 text-[11px] font-black text-[#10b981]">
              <CheckCircle2 size={16} />
              Comida guardada automáticamente
            </div>
          )}

          <p className="text-[10px] normal-case leading-4 text-white/35">
            * Los valores son aproximados y pueden variar según porciones reales.
          </p>
        </section>
      </div>
    </ResultShell>
  );
}

function ResultShell({ children }) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#0d1714] p-4 shadow-2xl shadow-black/20 sm:p-5">
      <div className="absolute -right-20 -top-20 h-56 w-56 bg-[#10b981]/10 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

function MacroPanel({ icon, title, value, unit }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-2.5 transition hover:border-[#10b981]/25 hover:bg-white/[0.07]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[#10b981]">
        {icon}

        <p className="text-[8px] font-black tracking-[0.12em] text-white/40">
          {title}
        </p>
      </div>

      <p className="text-lg font-black text-white sm:text-xl">
        {Math.round(value)}
        <span className="ml-0.5 text-[9px] text-white/40">{unit}</span>
      </p>
    </div>
  );
}

function ScoreBadge({ scoreData }) {
  return (
    <span className="bg-black/10 px-3 py-1.5 text-[10px] font-black">
      {scoreData.label}
    </span>
  );
}

function getScoreData(score) {
  if (score === "excellent" || Number(score) >= 8) {
    return { label: "Excelente" };
  }

  if (score === "bad" || Number(score) <= 4) {
    return { label: "Mejorable" };
  }

  return { label: "Aceptable" };
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "No definido";
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function InfoCard({ title, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-1 text-[9px] font-black tracking-[0.2em] text-[#10b981]">
        {title}
      </p>

      <p className="text-xs normal-case leading-5 text-slate-300">
        {value}
      </p>
    </div>
  );
}

function MacroMini({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-[8px] font-black tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
}