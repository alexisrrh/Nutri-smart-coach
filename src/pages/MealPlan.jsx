import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  Timer,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { DietSummary } from "../components/mealplan/DietSummary";
import { MealPlanForm } from "../components/mealplan/MealPlanForm";
import { DayDietView } from "../components/mealplan/DayDietView";
import { ShoppingListView } from "../components/mealplan/ShoppingListView";
import { PrintablePlan } from "../components/mealplan/PrintablePlan";
import {
  cacheDietProgress,
  clearDietPlanCache,
  clearDietProgress,
  generateDietPlan,
  getCachedDietPlan,
  getDietPlanWeek,
  getDietProgress,
  listDietPlans,
} from "../services/dietService";
import { getCachedProfile } from "../services/profileService";



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
  { value: "4", label: "4 días" },
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

  const [formData, setFormData] = useState(createInitialFormData);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(() => getDietPlanWeek(getCachedDietPlan()));
  const [activeDay, setActiveDay] = useState(0);
  const [progress, setProgress] = useState(getDietProgress);
  const [showShopping, setShowShopping] = useState(false);
  const [profile] = useState(getCachedProfile);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile]);
  const hasPlan = plan.length > 0;
  const safeActiveDay = hasPlan ? Math.max(0, Math.min(activeDay, plan.length - 1)) : 0;

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

  useEffect(() => {
    const userId = profile?.id || profile?.user_id;

    if (!userId) return;

    Promise.resolve().then(async () => {
      try {
        const dietPlans = await listDietPlans(userId);
        const activePlan = dietPlans[0];

        if (activePlan) {
          setPlan(getDietPlanWeek(activePlan));
          setActiveDay(0);
        }
      } catch (error) {
        console.error("Error cargando dietas:", error);
      }
    });
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setNotice("");
    setShowShopping(false);

    try {
      const savedProfile = getCachedProfile();

      if (!isProfileComplete(savedProfile)) {
        throw new Error("Completa tu perfil antes de generar una dieta.");
      }

      const payloadPreferences = {
        ...formData,
        days: Number(formData.planDays),
        planDays: Number(formData.planDays),
        mealsPerDay: Number(formData.mealsPerDay),
        lowCarb: formData.dietType === "low_carb" || formData.dietType === "keto",
        intermittentFasting: Number(formData.mealsPerDay) === 2,
        homeFoods: formData.homeFoods || "",
        exclusions: formData.exclusions || "",
      };

      const data = await generateDietPlan({
        profile: savedProfile,
        preferences: payloadPreferences,
        userId: savedProfile?.id || savedProfile?.user_id || "",
      });

      const cleanPlan = data.week || [];

      if (!cleanPlan.length) {
        throw new Error("No se pudo generar una dieta válida.");
      }

      setPlan(cleanPlan);
      setProgress({});
      setActiveDay(0);

      cacheDietProgress({});

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

    clearDietPlanCache();
    clearDietProgress();
  }

  function toggleMeal(mealId) {
    setProgress((prev) => {
      const updated = { ...prev, [mealId]: !prev[mealId] };
      cacheDietProgress(updated);
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98122,transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#10b981]/20 blur-[120px]" />

      <main className="relative z-10 mx-auto max-w-md space-y-3 px-3 pt-3 lg:max-w-[520px]">
        <DietHeroCard
          hasPlan={hasPlan}
          completionPercent={completionPercent}
          completedMeals={completedMeals}
          totalMeals={totalMeals}
          handleResetPlan={handleResetPlan}
          formData={formData}
        />

        {!profileComplete && (
          <StatusBox
            type="error"
            message="Completa tu perfil para generar una dieta precisa."
            action={() => navigate("/perfil")}
          />
        )}

        {errorMessage && <StatusBox type="error" message={errorMessage} />}
        {notice && !errorMessage && <StatusBox type="success" message={notice} />}

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

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#07170f] shadow-[0_30px_120px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3">
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

            <div className="flex gap-1.5">
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
            {loading && <GeneratingDietLoader formData={formData} />}

            {!loading && !hasPlan && <EmptyPlan />}

            {!loading && hasPlan && (
              <div className="space-y-4">
                <DietSummary plan={plan} getWeekTotals={getWeekTotals} />

                {!showShopping ? (
                  <DayDietView
                    plan={plan}
                    activeDay={safeActiveDay}
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

function DietHeroCard({
  hasPlan,
  completionPercent,
  completedMeals,
  totalMeals,
  handleResetPlan,
  formData,
}) {
  return (
    <header className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#07170f] p-5 shadow-[0_30px_120px_rgba(16,185,129,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98124,transparent_42%)]" />
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#10b981]/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_14px_#10b981]" />
            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
              Smart Diet IA
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetPlan}
            disabled={!hasPlan}
            className="inline-flex items-center gap-1 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-[#10b981] disabled:opacity-30"
          >
            <RefreshCcw size={11} />
            {hasPlan ? "Nueva" : "Crear"}
          </button>
        </div>

        <h1 className="text-[34px] font-black uppercase italic leading-none">
          Dieta
          <span className="block text-[#10b981]">personalizada</span>
        </h1>

        <p className="mt-3 max-w-xs text-[11px] normal-case leading-5 text-slate-400">
          Plan inteligente por objetivo, días, comidas, presupuesto y alimentos disponibles.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <HeroMini label="Días" value={formData?.planDays || "7"} />
          <HeroMini label="Comidas" value={formData?.mealsPerDay || "4"} />
          <HeroMini
            label="Modo"
            value={Number(formData?.mealsPerDay) === 2 ? "Ayuno" : "Smart"}
          />
        </div>

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
                className="h-full rounded-full bg-[#10b981] transition-all"
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
  );
}

function HeroMini({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">
      <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <p className="mt-1 text-xs font-black uppercase text-white">
        {value}
      </p>
    </div>
  );
}

function ActionButton({ icon, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-2.5 py-2 text-[8px] font-black uppercase tracking-wide transition active:scale-[0.97] disabled:opacity-30 ${
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
              type="button"
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

      <p className="text-sm font-black uppercase">
        Sin dieta generada
      </p>

      <p className="mx-auto mt-2 max-w-xs text-[11px] normal-case leading-5 text-slate-400">
        Elige objetivo, días, comidas y preferencias para crear tu dieta.
      </p>
    </div>
  );
}

function GeneratingDietLoader({ formData }) {
  const [percent, setPercent] = useState(7);
  const [seconds, setSeconds] = useState(0);

  const steps = ["Perfil", "Macros", "Menú", "Porciones", "Compra"];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return prev;
        if (prev < 45) return prev + 6;
        if (prev < 80) return prev + 3;
        return prev + 1;
      });
    }, 500);

    const secondsInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(secondsInterval);
    };
  }, []);

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#07170f] p-4 shadow-[0_30px_90px_rgba(16,185,129,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98126,transparent_42%)]" />
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#10b981]/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10">
        <div className="mb-5 overflow-hidden rounded-[30px] border border-white/10 bg-black/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#10b981]">
                Smart Diet IA
              </p>

              <h3 className="mt-1 text-2xl font-black uppercase italic leading-none">
                Creando tu dieta
              </h3>

              <p className="mt-2 text-[11px] normal-case leading-4 text-slate-400">
                {formData?.planDays} días · {formData?.mealsPerDay} comidas/día ·{" "}
                {Number(formData?.mealsPerDay) === 2 ? "ayuno intermitente" : "plan personalizado"}
              </p>
            </div>

            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-[28px] border border-[#10b981]/25 bg-[#10b981]/10">
              <div className="absolute inset-1 animate-spin rounded-[24px] border-2 border-transparent border-t-[#10b981]" />
              <div className="absolute inset-4 animate-pulse rounded-2xl bg-[#10b981]/10" />

              <span className="relative text-2xl font-black text-[#10b981]">
                {percent}%
              </span>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-[#10b981] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-bold normal-case text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Timer size={12} />
              {seconds}s
            </span>

            <span className="text-[#10b981]">
              {percent < 96 ? "Procesando..." : "Finalizando..."}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <div
                key={step}
                className={`rounded-2xl border px-1 py-2 text-center ${
                  completed
                    ? "border-[#10b981]/25 bg-[#10b981]/10"
                    : active
                    ? "border-[#10b981]/40 bg-[#10b981]/5"
                    : "border-white/5 bg-black/10"
                }`}
              >
                <div
                  className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${
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
                  className={`truncate text-[7px] font-black uppercase tracking-tight ${
                    completed || active ? "text-white" : "text-slate-600"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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

function createInitialFormData() {
  const savedProfile = getCachedProfile();

  return {
    dietType: "balanced",
    goal: mapProfileGoalToForm(
      savedProfile?.goal || savedProfile?.objetivo || "lose_fat"
    ),
    planDays: "7",
    mealsPerDay: "4",
    budget: "medium",
    cookingLevel: "easy",
    homeFoods: "",
    exclusions: "",
  };
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
