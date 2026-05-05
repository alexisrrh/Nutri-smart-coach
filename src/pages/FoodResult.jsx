import { useEffect, useState } from "react";
import { Apple, Beef, Flame, Wheat, Droplets, Sparkles } from "lucide-react";

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

    setTimeout(() => {
      setSaved(false);
    }, 2500);
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
      <div className="flex min-h-[500px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <div className="text-center">
          <div className="mx-auto mb-5 h-16 w-16 animate-pulse rounded-full bg-emerald-400/30" />
          <h2 className="text-2xl font-black text-white">
            Analizando tu comida...
          </h2>
          <p className="mt-3 text-white/50">
            NutriCoach está calculando calorías y macros.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
            <Apple size={34} />
          </div>

          <h2 className="text-2xl font-black text-white">
            Resultado nutricional
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-white/50">
            Cuando subas una imagen, aquí aparecerá el análisis completo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
          <Sparkles size={24} />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">
            Resultado del análisis
          </h2>
          <p className="text-sm text-white/50">Guardado automáticamente.</p>
        </div>
      </div>

      <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-lime-400 p-6 text-[#06130d]">
        <p className="text-sm font-black uppercase tracking-[0.25em] opacity-70">
          Comida detectada
        </p>

        <h3 className="mt-2 text-3xl font-black">{food}</h3>

        <ScoreBadge score={score} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MacroCard icon={<Flame size={24} />} title="Calorías" value={`${calories} kcal`} />
        <MacroCard icon={<Beef size={24} />} title="Proteínas" value={`${protein} g`} />
        <MacroCard icon={<Wheat size={24} />} title="Carbs" value={`${carbs} g`} />
        <MacroCard icon={<Droplets size={24} />} title="Grasas" value={`${fat} g`} />
      </div>

      <div className="mt-6 rounded-3xl bg-white/10 p-5">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
          Recomendación
        </p>
        <p className="text-white/70">{recommendation}</p>
      </div>

      <div className="mt-6">
        <p className="mb-2 font-bold text-white/80">Tipo de comida:</p>

        <select
          value={mealType}
          onChange={(e) => updateLastMealType(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#06130d] p-3 font-semibold text-white outline-none focus:border-emerald-400"
        >
          <option value="desayuno">Desayuno</option>
          <option value="almuerzo">Almuerzo</option>
          <option value="cena">Cena</option>
          <option value="snack">Snack</option>
        </select>

        {saved && (
          <p className="mt-3 rounded-2xl bg-green-400/10 p-3 text-center font-bold text-green-300">
            ✅ Comida guardada automáticamente
          </p>
        )}
      </div>

      <p className="mt-5 text-xs text-white/40">
        * Los valores son aproximados. Para mayor precisión, se recomienda pesar
        los alimentos.
      </p>
    </div>
  );
}

function MacroCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
        {icon}
      </div>
      <p className="text-sm text-white/50">{title}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function ScoreBadge({ score }) {
  let text = "Aceptable";
  let style = "bg-yellow-100 text-yellow-700";

  if (score === "excellent") {
    text = "Excelente para tu objetivo";
    style = "bg-green-100 text-green-700";
  }

  if (score === "bad") {
    text = "No recomendado";
    style = "bg-red-100 text-red-700";
  }

  return (
    <span className={`mt-4 inline-block rounded-xl px-4 py-2 text-sm font-black ${style}`}>
      {text}
    </span>
  );
}