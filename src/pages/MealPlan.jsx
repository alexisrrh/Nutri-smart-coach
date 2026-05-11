import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  RefreshCcw,
  Share2,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import BottomNav from "../components/BottomNav";
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
  { value: "balanced", label: "Balanceada" },
  { value: "low_carb", label: "Sin carbohidratos" },
  { value: "keto", label: "Keto" },
  { value: "hyperprotein", label: "Alta proteína" },
  { value: "vegetarian", label: "Vegetariana" },
  { value: "vegan", label: "Vegana" },
];

const GOAL_TYPES = [
  { value: "lose_fat", label: "Perder grasa" },
  { value: "gain_muscle", label: "Ganar músculo" },
  { value: "maintain", label: "Mantener" },
];

const BUDGET_TYPES = [
  { value: "low", label: "Económico" },
  { value: "medium", label: "Normal" },
  { value: "high", label: "Premium" },
];

const PLAN_DAYS = [
  { value: "2", label: "2 días" },
  { value: "3", label: "3 días" },
  { value: "5", label: "5 días" },
  { value: "7", label: "7 días" },
];

const MEALS_PER_DAY = [
  { value: "2", label: "2 comidas · ayuno" },
  { value: "3", label: "3 comidas" },
  { value: "4", label: "4 comidas" },
  { value: "5", label: "5 comidas" },
  { value: "6", label: "6 comidas" },
];

export function MealPlan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dietType: "balanced",
    goal: "lose_fat",
    planDays: "7",
    mealsPerDay: "4",
    budget: "medium",
    cookingLevel: "easy",
    homeFoods: "",
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

  const completedMeals = useMemo(
    () => Object.values(progress).filter(Boolean).length,
    [progress]
  );

  const totalMeals = useMemo(
    () => plan.reduce((acc, day) => acc + (day.meals?.length || 0), 0),
    [plan]
  );

  const completionPercent =
    totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setNotice("");
    setShowShopping(false);

    try {
      const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);

      if (!isProfileComplete(savedProfile)) {
        throw new Error("Completa tu perfil antes de generar una dieta.");
      }

      const response = await fetch(`${API_URL}/generate-diet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: savedProfile,
          preferences: {
            ...formData,
            days: Number(formData.planDays),
            mealsPerDay: Number(formData.mealsPerDay),
            lowCarb:
              formData.dietType === "low_carb" || formData.dietType === "keto",
          },
          user_id: savedProfile?.id || savedProfile?.user_id || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || "Error generando dieta.");
      }

      const cleanPlan = normalizePlan(data.week || []);

      if (!cleanPlan.length) {
        throw new Error("No se pudo generar una dieta válida.");
      }

      setPlan(cleanPlan);
      setProgress({});
      setActiveDay(0);

      localStorage.setItem(PLAN_KEY, JSON.stringify(cleanPlan));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({}));

      setNotice(
        data.usedFallback
          ? "Se generó una dieta base porque la IA tardó demasiado."
          : "Dieta generada correctamente."
      );
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "No se pudo generar la dieta.");
    } finally {
      setLoading(false);
    }
  }

  function handleResetPlan() {
    setPlan([]);
    setProgress({});
    setActiveDay(0);
    setShowShopping(false);
    setNotice("");
    setErrorMessage("");

    localStorage.removeItem(PLAN_KEY);
    localStorage.removeItem(PROGRESS_KEY);
  }

  function toggleMeal(mealId) {
    setProgress((prev) => {
      const updated = { ...prev, [mealId]: !prev[mealId] };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  async function handleShare() {
    const text = buildShareText(plan);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mi dieta semanal - NutriSmart Coach",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setNotice("Dieta copiada al portapapeles.");
      }
    } catch {
      setErrorMessage("No se pudo compartir la dieta.");
    }
  }

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#06110c] pb-32 text-white">
      <PrintablePlan plan={plan} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98120,transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:34px_34px]" />

      <main className="relative z-10 mx-auto max-w-md space-y-3 px-3 pt-3 lg:max-w-6xl">
        <header className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#07170f] p-4 shadow-[0_30px_120px_rgba(16,185,129,0.12)]">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#10b981]/20 blur-3xl" />

          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />
                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
                  Smart Diet IA
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetPlan}
                disabled={!hasPlan}
                className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-[#10b981] disabled:opacity-30"
              >
                {hasPlan ? "Nueva" : "Crear"}
              </button>
            </div>

            <h1 className="text-[32px] font-black uppercase italic leading-none">
              Dieta
              <span className="block text-[#10b981]">personalizada</span>
            </h1>

            <p className="mt-3 max-w-xs text-[11px] normal-case leading-5 text-slate-400">
              Genera una dieta por objetivo, días, comidas, presupuesto y alimentos que tienes en casa.
            </p>

            {hasPlan && (
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    Progreso semanal
                  </p>
                  <p className="text-sm font-black text-[#10b981]">
                    {completionPercent}%
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#10b981]"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>

                <p className="mt-2 text-[10px] normal-case text-slate-500">
                  {completedMeals}/{totalMeals} comidas completadas
                </p>
              </div>
            )}
          </div>
        </header>

        {!profileComplete && (
          <StatusBox
            type="error"
            message="Completa tu perfil para generar una dieta precisa."
            action={() => navigate("/perfil")}
          />
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
          PLAN_DAYS={PLAN_DAYS}
          MEALS_PER_DAY={MEALS_PER_DAY}
        />

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#07170f]">
          <div className="flex items-center justify-between border-b border-white/10 p-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#10b981]" />
                <h2 className="text-sm font-black uppercase italic">
                  Plan generado
                </h2>
              </div>

              <p className="mt-1 text-[10px] normal-case text-slate-500">
                {hasPlan
                  ? `${plan.length} días · ${totalMeals} comidas`
                  : "Configura y genera tu dieta."}
              </p>
            </div>

            <div className="flex gap-2">
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

          <div className="p-3">
            {loading && <GeneratingDietLoader />}

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

      <BottomNav />
    </section>
  );
}

function ActionButton({ icon, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-2.5 py-2 text-[8px] font-black uppercase tracking-wide transition disabled:opacity-30 ${
        active
          ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
          : "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  );
}

function StatusBox({ type, message, action }) {
  const isError = type === "error";

  return (
    <div
      className={`rounded-[26px] border p-3 text-[11px] font-bold normal-case leading-5 ${
        isError
          ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
          : "border-[#10b981]/20 bg-[#10b981]/10 text-emerald-100"
      }`}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        )}
        <div>
          <p>{message}</p>
          {action && (
            <button
              onClick={action}
              className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]"
            >
              Completar perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyPlan() {
  return (
    <div className="rounded-[30px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
      <Sparkles className="mx-auto mb-3 text-[#10b981]" size={30} />
      <p className="text-sm font-black uppercase">Sin dieta generada</p>
      <p className="mx-auto mt-2 max-w-xs text-[11px] normal-case leading-5 text-slate-400">
        Elige objetivo, días, comidas y preferencias para crear tu dieta.
      </p>
    </div>
  );
}

function GeneratingDietLoader() {
  return (
    <div className="rounded-[30px] border border-[#10b981]/20 bg-[#10b981]/10 p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-2xl border-2 border-transparent border-t-[#10b981]" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            Creando dieta IA
          </p>
          <p className="mt-1 text-[11px] normal-case text-slate-300">
            Ajustando comidas, macros y porciones...
          </p>
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
      meals: mealsArray.map((meal, index) => ({
        id: meal?.id || `${day?.day || dayIndex}-${index}`,
        time: meal?.time || defaultMealTime(index),
        name: meal?.name || defaultMealName(index),
        food: meal?.food || meal?.title || "Comida",
        title: meal?.food || meal?.title || "Comida",
        details: meal?.details || "",
        ingredients: meal?.details
          ? meal.details.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        calories: Number(meal?.calories || meal?.kcal || 0),
        protein: Number(meal?.protein || 0),
        carbs: Number(meal?.carbs || 0),
        fat: Number(meal?.fat || 0),
      })),
    };
  });
}

function getWeekTotals(plan) {
  return (plan || []).reduce(
    (totals, day) => {
      day.meals?.forEach((meal) => {
        totals.calories += Number(meal.calories || 0);
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
  return ["08:00", "13:30", "17:30", "21:00", "22:30", "23:30"][index] || "08:00";
}

function defaultMealName(index) {
  return ["Desayuno", "Comida", "Merienda", "Cena", "Snack", "Extra"][index] || "Comida";
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildShareText(plan) {
  if (!plan?.length) return "NutriSmart Coach - Dieta semanal.";

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