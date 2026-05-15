import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  RefreshCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  Timer,
} from "lucide-react";
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
import { AppShell, SecondaryButton, StatusBox, SurfaceCard } from "../components/ui";

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
  const safeActiveDay = hasPlan
    ? Math.max(0, Math.min(activeDay, plan.length - 1))
    : 0;

  const completedMeals = useMemo(
    () => Object.values(progress).filter(Boolean).length,
    [progress]
  );

  const totalMeals = useMemo(
    () => plan.reduce((acc, day) => acc + (day.meals?.length || 0), 0),
    [plan]
  );

  const weekTotals = useMemo(() => getWeekTotals(plan), [plan]);

  const completionPercent =
    totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  const motivationMessage = useMemo(
    () =>
      getDietMotivationMessage({
        completedMeals,
        totalMeals,
        completionPercent,
        goal: formData.goal || profile?.goal || profile?.objetivo,
        totals: weekTotals,
      }),
    [
      completedMeals,
      totalMeals,
      completionPercent,
      formData.goal,
      profile,
      weekTotals,
    ]
  );

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
    <>
      <PrintablePlan plan={plan} />

      <AppShell
        className="overflow-hidden"
        contentClassName="px-2 pt-2"
      >
        <div className="flex h-full min-h-0 flex-col gap-1">
          <DietHeroCard
            hasPlan={hasPlan}
            completionPercent={completionPercent}
            completedMeals={completedMeals}
            totalMeals={totalMeals}
            handleResetPlan={handleResetPlan}
          />

          {!profileComplete && (
            <StatusBox
              type="error"
              action={() => navigate("/perfil")}
              actionLabel="Completar perfil"
            >
              Completa tu perfil para generar una dieta precisa.
            </StatusBox>
          )}

          {errorMessage && <StatusBox type="error">{errorMessage}</StatusBox>}
          {notice && !errorMessage && <StatusBox type="success">{notice}</StatusBox>}

          {!hasPlan && !loading && (
            <div className="min-h-0 overflow-y-auto pb-4 pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            </div>
          )}

          <SurfaceCard
            className="flex min-h-0 flex-1 flex-col overflow-hidden p-0 pb-1"
            radius="lg"
          >
            <div className="shrink-0 border-b border-white/[0.08] bg-white/[0.025] p-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#10b981]" />
                    <h2 className="text-[13px] font-black uppercase italic">
                      {showShopping ? "Lista de compra" : "Plan generado"}
                    </h2>
                  </div>

                  <p className="mt-0.5 truncate text-[9px] normal-case text-slate-500">
                    {hasPlan
                      ? `${plan.length} días · ${totalMeals} comidas · ${completedMeals}/${totalMeals} completadas`
                      : loading
                      ? "La IA está creando tu plan personalizado."
                      : "Tu dieta aparecerá aquí."}
                  </p>
                </div>

                {hasPlan && (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#10b981]/10 text-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.22),0_0_24px_rgba(16,185,129,0.08)]">
                    <span className="text-[10px] font-black text-[#10b981]">
                      {completionPercent}%
                    </span>
                  </div>
                )}
              </div>

              {hasPlan && (
                <>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#22d3ee] shadow-[0_0_16px_rgba(16,185,129,0.55)] transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>

                  <div className="mt-1.5 grid grid-cols-3 gap-1">
                    <ActionButton
                      icon={<ShoppingCart size={12} />}
                      label={showShopping ? "Dieta" : "Compra"}
                      onClick={() => setShowShopping((prev) => !prev)}
                      active={showShopping}
                    />

                    <ActionButton
                      icon={<Download size={12} />}
                      label="PDF"
                      onClick={() => window.print()}
                    />

                    <ActionButton
                      icon={<Share2 size={12} />}
                      label="Enviar"
                      onClick={handleShare}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {loading && <GeneratingDietLoader formData={formData} />}

              {!loading && !hasPlan && <EmptyPlan />}

              {!loading && hasPlan && (
                <div className="space-y-2">
                  <DietSummary plan={plan} getWeekTotals={getWeekTotals} />

                  {!showShopping ? (
                    <>
                      <DietMotivationCard message={motivationMessage} />

                      <DayDietView
                        plan={plan}
                        activeDay={safeActiveDay}
                        setActiveDay={setActiveDay}
                        progress={progress}
                        toggleMeal={toggleMeal}
                      />
                    </>
                  ) : (
                    <ShoppingListView plan={plan} />
                  )}
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>
      </AppShell>
    </>
  );
}

function DietHeroCard({
  hasPlan,
  completionPercent,
  completedMeals,
  totalMeals,
  handleResetPlan,
}) {
  return (
    <SurfaceCard as="header" className="shrink-0 overflow-hidden p-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#10b981]">
            <Sparkles size={11} />
            Smart Diet IA
          </div>

          <h1 className="text-[21px] font-black uppercase italic leading-[0.95] tracking-tight text-white">
            Dieta personalizada
          </h1>

          <p className="mt-0.5 text-[10px] leading-4 text-white/60">
            {hasPlan
              ? `${completedMeals}/${totalMeals} comidas completadas · ${completionPercent}% semanal`
              : "Plan por objetivo, días, comidas y alimentos disponibles."}
          </p>
        </div>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#10b981]/10 text-[#10b981]">
          <Sparkles size={16} />
        </div>
      </div>

      {hasPlan && (
        <SecondaryButton
          type="button"
          onClick={handleResetPlan}
          icon={<RefreshCcw size={13} />}
          className="mt-2.5 w-full py-2 text-[9px]"
        >
          Nueva dieta
        </SecondaryButton>
      )}
    </SurfaceCard>
  );
}

function ActionButton({ icon, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-2xl px-2 text-[10px] font-black uppercase tracking-wide shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition active:scale-[0.98] disabled:opacity-30 ${
        active
          ? "bg-[#10b981] text-[#06110c] shadow-[0_0_22px_rgba(16,185,129,0.18)]"
          : "bg-white/[0.045] text-slate-300 hover:bg-[#10b981]/10 hover:text-white"
      }`}
    >
      <span className={active ? "text-[#06110c]" : "text-[#10b981]"}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function DietMotivationCard({ message }) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[#10b981]/15 bg-[#07170f]/95 px-2.5 py-1.5 shadow-[0_16px_45px_rgba(16,185,129,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,#10b9811f,transparent_42%)]" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
          <Sparkles size={13} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
            Coach IA
          </p>

          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold normal-case leading-[1.25] text-white/75">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}

function EmptyPlan() {
  return (
    <div className="min-h-[200px] rounded-[22px] bg-white/[0.035] p-3.5 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]">
      <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-2xl bg-[#10b981]/10 text-[#10b981] shadow-[0_0_24px_rgba(16,185,129,0.10)]">
        <Sparkles size={18} />
      </div>

      <p className="text-[13px] font-black uppercase">Tu dieta aparecerá aquí</p>

      <p className="mx-auto mt-1 max-w-xs text-[11px] normal-case leading-4 text-slate-400">
        Configura tus preferencias y genera un plan inteligente.
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
    <div className="relative overflow-hidden rounded-[24px] border border-[#10b981]/20 bg-[#07170f] p-2.5 shadow-[0_24px_70px_rgba(16,185,129,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98122,transparent_42%)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#10b981]/18 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#10b981]">
              Smart Diet IA
            </p>

            <h3 className="mt-0.5 text-[18px] font-black uppercase italic leading-none text-white">
              Creando tu dieta
            </h3>

            <p className="mt-1 text-[11px] normal-case leading-4 text-slate-400">
              {formData?.planDays} días · {formData?.mealsPerDay} comidas/día ·{" "}
              {Number(formData?.mealsPerDay) === 2
                ? "ayuno intermitente"
                : "plan personalizado"}
            </p>
          </div>

          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[20px] border border-[#10b981]/25 bg-[#10b981]/10">
            <div className="absolute inset-1 animate-spin rounded-[16px] border-2 border-transparent border-t-[#10b981]" />
            <div className="absolute inset-3.5 animate-pulse rounded-2xl bg-[#10b981]/10" />

            <span className="relative text-[15px] font-black text-[#10b981]">
              {percent}%
            </span>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold normal-case text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Timer size={12} />
            {seconds}s
          </span>

          <span className="text-[#10b981]">
            {percent < 96 ? "Procesando..." : "Finalizando..."}
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-5 gap-1">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <div
                key={step}
                className={`rounded-2xl border px-1 py-1.5 text-center ${
                  completed
                    ? "border-[#10b981]/25 bg-[#10b981]/10"
                    : active
                    ? "border-[#10b981]/40 bg-[#10b981]/5"
                    : "border-white/5 bg-black/10"
                }`}
              >
                <div
                  className={`mx-auto mb-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-black ${
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

function getDietMotivationMessage({
  completedMeals,
  totalMeals,
  completionPercent,
  goal,
  totals,
}) {
  const normalizedGoal = String(goal || "").toLowerCase();
  const protein = Math.round(Number(totals?.protein || 0));
  const calories = Math.round(Number(totals?.calories || 0));

  if (!totalMeals) {
    return "Tu plan está listo para convertirse en una rutina sostenible.";
  }

  if (completionPercent >= 85) {
    return "Vas por muy buen camino: la constancia vale más que la perfección.";
  }

  if (completionPercent >= 50) {
    return "Cada comida completada refuerza tu adherencia semanal.";
  }

  if (completedMeals > 0) {
    return "Buen inicio. Mantener el ritmo hará que el plan sea más fácil de seguir.";
  }

  if (normalizedGoal.includes("lose") || normalizedGoal.includes("perder")) {
    return "Completar esta semana ayuda a construir una base sólida de constancia.";
  }

  if (normalizedGoal.includes("gain") || normalizedGoal.includes("ganar")) {
    return protein > 0
      ? `Tu plan prioriza proteína y estructura para apoyar tu progreso.`
      : "Tu plan está diseñado para sostener entrenamiento y recuperación.";
  }

  if (normalizedGoal.includes("maintain") || normalizedGoal.includes("mantener")) {
    return "Tu plan busca ayudarte a mantener constancia sin complicarte.";
  }

  if (calories > 0) {
    return "Tu semana ya tiene estructura. Ahora toca convertirla en hábito.";
  }

  return "Tu plan está diseñado para ayudarte a comer con más intención.";
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
