import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart2,
  Calendar,
  CheckCircle2,
  Download,
  Plus,
  RefreshCcw,
  Scan,
  Share2,
  ShoppingCart,
  Sparkles,
  User,
} from "lucide-react";

import { DietSummary } from "../components/mealplan/DietSummary";
import { MealPlanForm } from "../components/mealplan/MealPlanForm";
import { DayDietView } from "../components/mealplan/DayDietView";
import { ShoppingListView } from "../components/mealplan/ShoppingListView";
import { PrintablePlan } from "../components/mealplan/PrintablePlan";

const PROFILE_KEY = "nutricoach_profile";
const PLAN_KEY = "smart_diet_plan";
const PROGRESS_KEY = "smart_diet_progress";

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://nutricoach-backend-frlc.onrender.com";

const DIET_TYPES = [
  { value: "balanced", label: "⚖️ Balanceada" },
  { value: "keto", label: "🥑 Cetogénica" },
  { value: "vegetarian", label: "🌱 Vegetariana" },
  { value: "vegan", label: "🌿 Vegana" },
  { value: "hyperprotein", label: "🥩 Alta proteína" },
];

const GOAL_TYPES = [
  { value: "lose_fat", label: "🔥 Perder grasa" },
  { value: "gain_muscle", label: "💪 Ganar músculo" },
  { value: "maintain", label: "🏃‍♂️ Mantener" },
];

const BUDGET_TYPES = [
  { value: "low", label: "🪙 Económico" },
  { value: "medium", label: "💵 Estándar" },
  { value: "high", label: "💎 Premium" },
];

export function MealPlan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dietType: "balanced",
    goal: "lose_fat",
    mealsPerDay: "4",
    budget: "medium",
    cookingLevel: "easy",
    exclusions: "",
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [progress, setProgress] = useState({});
  const [showShopping, setShowShopping] = useState(false);
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);
    const savedPlan = safeParse(localStorage.getItem(PLAN_KEY), []);
    const savedProgress = safeParse(localStorage.getItem(PROGRESS_KEY), {});

    setProfile(savedProfile);
    setPlan(normalizePlan(savedPlan));
    setProgress(savedProgress);

    if (savedProfile?.goal || savedProfile?.objetivo) {
      setFormData((prev) => ({
        ...prev,
        goal: mapProfileGoalToForm(savedProfile.goal || savedProfile.objetivo),
      }));
    }
  }, []);

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile]);
  const hasPlan = plan.length > 0;

  const completedMeals = useMemo(() => {
    return Object.values(progress).filter(Boolean).length;
  }, [progress]);

  const totalMeals = useMemo(() => {
    return plan.reduce((acc, day) => acc + (day.meals?.length || 0), 0);
  }, [plan]);

  const completionPercent =
    totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setNotice("");
    setShowShopping(false);

    try {
      const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);

      if (!isProfileComplete(savedProfile)) {
        throw new Error(
          "Completa tu perfil antes de generar una dieta personalizada."
        );
      }
const response = await fetch(`${API_URL}/generate-diet`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    profile: savedProfile,
    preferences: formData,
    user_id: savedProfile?.id || savedProfile?.user_id || "",
  }),
});
      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("El backend no devolvió una respuesta válida.");
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            `Error en el servidor: ${response.status}`
        );
      }

      const cleanPlan = normalizePlan(data.week || []);

      if (cleanPlan.length === 0) {
        throw new Error("No se pudo generar una dieta válida.");
      }

      setPlan(cleanPlan);
      setProgress({});
      setActiveDay(0);

      localStorage.setItem(PLAN_KEY, JSON.stringify(cleanPlan));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({}));

      if (data.usedFallback) {
        setNotice(
          "Se generó una dieta base porque la IA falló temporalmente."
        );
      } else {
        setNotice("Dieta generada correctamente.");
      }
    } catch (err) {
      console.error("Fallo de conexión con el Smart Coach:", err);
      setErrorMessage(
        err.message || "No se ha podido conectar con el servidor de IA."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPlan = () => {
    setPlan([]);
    setProgress({});
    setActiveDay(0);
    setShowShopping(false);
    setNotice("");
    setErrorMessage("");

    localStorage.removeItem(PLAN_KEY);
    localStorage.removeItem(PROGRESS_KEY);
  };

  const toggleMeal = (mealId) => {
    setProgress((prev) => {
      const updated = { ...prev, [mealId]: !prev[mealId] };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleShare = async () => {
    const text = buildShareText(plan);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mi dieta semanal - Nutri Smart Coach",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setNotice("Dieta copiada al portapapeles.");
      }
    } catch (error) {
      console.error("Error compartiendo dieta:", error);
      setErrorMessage("No se pudo compartir la dieta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#06110c] pb-28 text-white font-sans">
      <PrintablePlan plan={plan} />

      <main className="mx-auto max-w-6xl space-y-3 px-3 pt-4 sm:space-y-5 sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.32em] text-[#10b981]">
              NUTRI SMART COACH
            </div>

            <h1 className="mt-1 text-2xl font-black uppercase italic leading-none tracking-tight text-white sm:text-4xl">
              Dieta personalizada
            </h1>

            <p className="mt-1 max-w-xl text-[11px] normal-case leading-4 text-slate-500 sm:text-xs">
              Semana completa con comidas, porciones, macros y compra.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetPlan}
            disabled={!hasPlan}
            className="flex shrink-0 items-center gap-1.5  border border-[#10b981]/20 bg-[#0d2218] px-3 py-2 text-[9px] font-black uppercase tracking-wide text-[#10b981] transition hover:bg-[#10b981]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {hasPlan ? <RefreshCcw size={13} /> : <Plus size={13} />}
            Nueva
          </button>
        </header>

        {!profileComplete && (
          <div className="flex flex-col gap-3  border border-amber-500/20 bg-[#1a1605] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-500"
                size={17}
              />

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                  Falta completar tu perfil
                </h4>

                <p className="mt-1 text-[11px] normal-case leading-4 text-amber-200/60">
                  Necesitamos edad, peso, altura y objetivo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className=" bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-black transition hover:bg-amber-400"
            >
              Completar perfil
            </button>
          </div>
        )}

        {errorMessage && <StatusBox type="error" message={errorMessage} />}
        {notice && !errorMessage && (
          <StatusBox type="success" message={notice} />
        )}

        <MealPlanForm
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          handleSubmit={handleSubmit}
          DIET_TYPES={DIET_TYPES}
          GOAL_TYPES={GOAL_TYPES}
          BUDGET_TYPES={BUDGET_TYPES}
        />

        <section className="overflow-hidden border border-white/5 bg-[#091710] shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 border-b border-white/5 bg-[#07120d] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#10b981]" />
                <h2 className="text-base font-black uppercase tracking-tight text-white">
                  Tu dieta semanal
                </h2>
              </div>

              <p className="mt-1 text-[11px] normal-case text-slate-500">
                {hasPlan
                  ? `${completedMeals}/${totalMeals} comidas · ${completionPercent}% completado`
                  : "Genera una dieta para comenzar."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ActionButton
                icon={<ShoppingCart size={13} />}
                label={showShopping ? "Dieta" : "Compra"}
                onClick={() => setShowShopping((prev) => !prev)}
                active={showShopping}
                disabled={!hasPlan}
              />

              <ActionButton
                icon={<Download size={13} />}
                label="PDF"
                onClick={() => window.print()}
                disabled={!hasPlan}
              />

              <ActionButton
                icon={<Share2 size={13} />}
                label="Enviar"
                onClick={handleShare}
                disabled={!hasPlan}
              />
            </div>
          </div>

          <div className="p-4">
            {loading && <GeneratingDietLoader loading={loading} />}

            {!loading && !hasPlan && <EmptyPlan />}

            {!loading && hasPlan && (
              <div className="space-y-4">
                <DietSummary plan={plan} getWeekTotals={getWeekTotals} />

                {!showShopping ? (
                  <DayDietView
                    plan={plan}
                    activeDay={activeDay}
                    setActiveDay={setActiveDay}
                    progress={progress}
                    toggleMeal={toggleMeal}
                  />
                ) : (
                  <ShoppingListView plan={plan} />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav navigate={navigate} />
    </div>
  );
}

function ActionButton({ icon, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 border px-2.5 py-2 text-[9px] font-black uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
          : "border-white/5 bg-[#0d2218] text-slate-300 hover:bg-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBox({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={` border p-3 text-xs font-bold normal-case leading-5 ${
        isError
          ? "border-red-500/20 bg-red-500/10 text-red-200"
          : "border-[#10b981]/20 bg-[#10b981]/10 text-emerald-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}

function EmptyPlan() {
  return (
    <div className=" border border-dashed border-white/10 bg-[#07120d] p-6 text-center">
      <Sparkles className="mx-auto mb-3 text-[#10b981]" size={28} />

      <p className="text-sm font-black uppercase tracking-wide text-white">
        No hay dieta generada
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs normal-case leading-5 text-slate-400">
        Configura tus preferencias y genera una dieta semanal optimizada.
      </p>
    </div>
  );
}

function BottomNav({ navigate }) {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-[#091710]/95 px-6 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between text-slate-400">
        <NavItem
          icon={<BarChart2 size={20} />}
          label="Inicio"
          active
          onClick={() => navigate("/dashboard")}
        />

        <NavItem
          icon={<Scan size={20} />}
          label="Analizar"
          onClick={() => navigate("/foto-comida")}
        />

        <NavItem
          icon={<Calendar size={20} />}
          label="Historial"
          onClick={() => navigate("/comidas")}
        />

        <NavItem
          icon={<User size={20} />}
          label="Perfil"
          onClick={() => navigate("/perfil")}
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition ${
        active ? "text-[#10b981]" : "hover:text-white"
      }`}
    >
      {icon}

      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

function GeneratingDietLoader({ loading }) {
  const [percent, setPercent] = React.useState(7);

  const steps = ["Perfil", "Macros", "Comidas", "Porciones", "Compra"];

  React.useEffect(() => {
    if (!loading) return;

    setPercent(7);

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return prev;
        if (prev < 45) return prev + 5;
        if (prev < 80) return prev + 3;
        return prev + 1;
      });
    }, 550);

    return () => clearInterval(interval);
  }, [loading]);

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <div className="overflow-hidden border border-[#10b981]/20 bg-[#07120d] p-4 shadow-2xl shadow-[#10b981]/5">
      <div className="relative overflow-hidden border border-white/5 bg-[#0d2218]/70 p-4">
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 bg-[#10b981]/20 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10b981]">
              Smart Diet IA
            </p>

            <h3 className="mt-1 text-xl font-black uppercase italic leading-none text-white">
              Creando tu dieta
            </h3>

            <p className="mt-2 text-[11px] normal-case leading-4 text-slate-400">
              {percent < 90
                ? "Calculando comidas, macros y lista semanal."
                : "Últimos ajustes. Ya casi está lista."}
            </p>
          </div>

          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <div className="absolute inset-0  border border-[#10b981]/20" />
            <div className="absolute inset-1 animate-spin border-2 border-transparent border-t-[#10b981]" />

            <span className="relative text-lg font-black text-[#10b981]">
              {percent}%
            </span>
          </div>
        </div>

        <div className="relative mt-4 h-2 overflow-hidden bg-white/5">
          <div
            className="h-full  bg-[#10b981] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1.5">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <div
                key={step}
                className={` border px-1 py-2 text-center transition-all ${
                  completed
                    ? "border-[#10b981]/25 bg-[#10b981]/10"
                    : active
                      ? "border-[#10b981]/40 bg-[#10b981]/5"
                      : "border-white/5 bg-black/10"
                }`}
              >
                <div
                  className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center text-[9px] font-black ${
                    completed
                      ? "bg-[#10b981] text-[#06110c]"
                      : active
                        ? "animate-pulse border border-[#10b981] text-[#10b981]"
                        : "border border-white/10 text-slate-600"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <p
                  className={`truncate text-[8px] font-black uppercase tracking-tight ${
                    completed || active ? "text-white" : "text-slate-600"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold normal-case text-slate-500">
          <span>No cierres esta pantalla</span>
          <span className="text-[#10b981]">
            {percent < 96 ? "Procesando..." : "Finalizando..."}
          </span>
        </div>
      </div>
    </div>
  );
}

function normalizePlan(weekArray) {
  if (!Array.isArray(weekArray)) return [];

  return weekArray.map((day, dayIndex) => {
    const mealsArray = Array.isArray(day?.meals)
      ? day.meals
      : Object.values(day?.meals || {});

    return {
      day: day?.day || `Día ${dayIndex + 1}`,
      meals: mealsArray.map((meal, index) => {
        const food = meal?.food || meal?.title || meal?.name || "Comida";

        const ingredients =
          Array.isArray(meal?.ingredients) && meal.ingredients.length > 0
            ? meal.ingredients
            : meal?.details
              ? meal.details.split(",").map((item) => item.trim()).filter(Boolean)
              : [];

        return {
          id: meal?.id || `${day?.day || dayIndex}-${index}`,
          type: meal?.type || meal?.name || `meal-${index}`,
          time: meal?.time || defaultMealTime(index),
          name: meal?.name || defaultMealName(index),
          title: food,
          food,
          ingredients,
          details: meal?.details || ingredients.join(", "),
          calories: Number(meal?.calories || meal?.kcal || 0),
          protein: Number(meal?.protein || 0),
          carbs: Number(meal?.carbs || 0),
          fat: Number(meal?.fat || 0),
        };
      }),
    };
  });
}

function getWeekTotals(plan) {
  return (plan || []).reduce(
    (totals, day) => {
      const meals = Array.isArray(day?.meals) ? day.meals : [];

      meals.forEach((meal) => {
        totals.calories += Number(meal.calories || meal.kcal || 0);
        totals.protein += Number(meal.protein || 0);
        totals.carbs += Number(meal.carbs || 0);
        totals.fat += Number(meal.fat || 0);
      });

      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function isProfileComplete(profile) {
  if (!profile) return false;

  const age = profile.age || profile.edad;
  const weight = profile.weight || profile.peso;
  const height = profile.height || profile.altura;
  const goal = profile.goal || profile.objetivo;

  return Boolean(age && weight && height && goal);
}

function mapProfileGoalToForm(goal) {
  if (goal === "perder_grasa") return "lose_fat";
  if (goal === "ganar_musculo") return "gain_muscle";
  if (goal === "mantener_peso") return "maintain";

  return goal || "lose_fat";
}

function defaultMealTime(index) {
  const times = ["08:00", "13:30", "18:00", "21:00", "23:00"];
  return times[index] || "08:00";
}

function defaultMealName(index) {
  const names = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Extra"];
  return names[index] || "Comida";
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildShareText(plan) {
  if (!plan?.length) return "Nutri Smart Coach - Dieta semanal.";

  return plan
    .map((day) => {
      const meals = day.meals
        .map(
          (meal) =>
            `${meal.time} · ${meal.name}: ${meal.food} (${meal.calories} kcal)`
        )
        .join("\n");

      return `${day.day}\n${meals}`;
    })
    .join("\n\n");
}