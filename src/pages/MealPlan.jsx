import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  RefreshCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  Timer,
   Loader2,
   ScanLine,
} from "lucide-react";
import { MealPlanForm } from "../components/mealplan/MealPlanForm";
import { DayDietView } from "../components/mealplan/DayDietView";
import { ShoppingListView } from "../components/mealplan/ShoppingListView";
import { PrintablePlan } from "../components/mealplan/PrintablePlan";
import {
  cacheDietProgress,
  clearDietPlanCache,
  clearDietGenerationState,
  clearDietProgress,
  generateDietPlan,
  getCachedDietPlan,
  getDietGenerationState,
  getDietPlanWeek,
  getDietProgress,
  listDietPlans,
  setDietGenerationState,
} from "../services/dietService";
import { getCachedProfile } from "../services/profileService";
import { AiErrorNotice, AppShell, StatusBox, SurfaceCard } from "../components/ui";

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
  const isMountedRef = useRef(true);
  const [generationState, setGenerationState] = useState(() =>
    getDietGenerationState()
  );

  const [formData, setFormData] = useState(createInitialFormData);
  const [loading, setLoading] = useState(() =>
    isLoadingStateRecent(getDietGenerationState())
  );
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
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (isLoadingStateRecent(generationState)) {
        setLoading(true);
        setErrorMessage("");
        setNotice("Tu dieta se está generando...");
        return;
      }

      if (generationState.status === "loading") {
        const staleState = {
          ...generationState,
          status: "error",
          updatedAt: new Date().toISOString(),
          error: "La generación tardó demasiado. Inténtalo de nuevo.",
        };

        persistGenerationState(staleState);
        setGenerationState(staleState);
        setLoading(false);
        setNotice("");
        setErrorMessage(staleState.error);
        return;
      }

      if (generationState.status === "error" && generationState.error) {
        setErrorMessage(generationState.error);
        setLoading(false);
        return;
      }

      if (
        generationState.status === "success" &&
        !hasPlan &&
        Array.isArray(generationState.result?.week) &&
        generationState.result.week.length > 0
      ) {
        setPlan(getDietPlanWeek(generationState.result));
        setActiveDay(0);
        setNotice(
          generationState.result.usedFallback
            ? "Se generó una dieta base porque la IA tardó demasiado."
            : "Dieta generada correctamente."
        );
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [generationState, hasPlan]);

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

    if (loading || generationState.status === "loading") {
      return;
    }

    if (!isMountedRef.current) return;

    setLoading(true);
    setErrorMessage("");
    setNotice("");
    setShowShopping(false);

    let requestId = null;
    let startedAt = null;

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

      requestId = createGenerationRequestId();
      startedAt = new Date().toISOString();
      const loadingState = {
        status: "loading",
        startedAt,
        updatedAt: startedAt,
        requestId,
        result: null,
        error: "",
      };
      persistGenerationState(loadingState);
      if (isMountedRef.current) {
        setGenerationState(loadingState);
      }

      const data = await generateDietPlanWithRetry({
        profile: savedProfile,
        preferences: payloadPreferences,
        userId: savedProfile?.id || savedProfile?.user_id || "",
      });

      const latestGenerationState = getDietGenerationState();

      if (latestGenerationState.requestId !== requestId) {
        return;
      }

      const cleanPlan = data.week || [];

      if (!cleanPlan.length) {
        throw new Error("No se pudo generar una dieta válida.");
      }

      setPlan(cleanPlan);
      setProgress({});
      setActiveDay(0);
      cacheDietProgress({});

      const successState = {
        status: "success",
        startedAt,
        updatedAt: new Date().toISOString(),
        requestId,
        result: data,
        error: "",
      };

      persistGenerationState(successState);
      if (isMountedRef.current) {
        setGenerationState(successState);
      }

      setNotice(
        data.usedFallback
          ? "Se generó una dieta base porque la IA tardó demasiado."
          : "Dieta generada correctamente."
      );
    } catch (err) {
      console.error(err);
      if (!requestId || !startedAt) {
        setErrorMessage(
          err.message || "La generación tardó demasiado. Inténtalo de nuevo."
        );
        return;
      }

      const errorState = {
        status: "error",
        startedAt,
        updatedAt: new Date().toISOString(),
        requestId,
        result: null,
        error:
          err.message ||
          "La generación tardó demasiado. Inténtalo de nuevo.",
      };

      persistGenerationState(errorState);
      if (isMountedRef.current) {
        setGenerationState(errorState);
      }

      setErrorMessage(errorState.error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
    clearDietGenerationState();
    const idleState = {
      status: "idle",
      startedAt: null,
      updatedAt: null,
      requestId: null,
      result: null,
      error: "",
    };
    persistGenerationState(idleState);
    if (isMountedRef.current) {
      setGenerationState(idleState);
    }
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

          <AiErrorNotice message={errorMessage} />
          {notice && !errorMessage && <StatusBox type="success">{notice}</StatusBox>}

          {!hasPlan && !loading ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          ) : (
            <SurfaceCard
              className="flex min-h-0 flex-1 flex-col overflow-hidden p-0 pb-1"
              radius="lg"
            >
            <div
              className="shrink-0 border-b p-2"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: "var(--app-surface)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[var(--app-primary)]" />
                    <h2 className="text-[13px] font-black uppercase">
                      {showShopping ? "Lista de compra" : "Plan generado"}
                    </h2>
                  </div>

                  <p className="mt-0.5 truncate text-[9px] normal-case text-[var(--app-muted)]">
                    {hasPlan
                      ? `${plan.length} días · ${totalMeals} comidas · ${completedMeals}/${totalMeals} completadas`
                      : loading
                      ? "La IA está creando tu plan personalizado."
                      : "Tu dieta aparecerá aquí."}
                  </p>
                </div>

                {hasPlan && (
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-center shadow-[inset_0_0_0_1px_var(--app-border),0_0_24px_var(--app-glow)]"
                    style={{ backgroundColor: "var(--app-primary-soft)" }}
                  >
                    <span className="text-[10px] font-black text-[var(--app-primary)]">
                      {completionPercent}%
                    </span>
                  </div>
                )}
              </div>

              {hasPlan && (
                <>
                  <div
                    className="mt-1.5 h-1 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_var(--app-border)]"
                    style={{ backgroundColor: "var(--app-surface)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${completionPercent}%`,
                        background:
                          "linear-gradient(to right, var(--app-primary), color-mix(in srgb, var(--app-primary) 70%, white))",
                        boxShadow: "0 0 16px var(--app-glow)",
                      }}
                    />
                  </div>

                  <div className="mt-1 grid grid-cols-4 gap-1">
                    <ActionButton
                      icon={<RefreshCcw size={12} />}
                      label="Nueva dieta"
                      onClick={handleResetPlan}
                    />

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

              {!loading && hasPlan && (
                <div className="space-y-2">
                  <CompactDietSummary
                    daysCount={plan.length}
                    totalMeals={totalMeals}
                    totals={weekTotals}
                  />

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
          )}
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
}) {
  return (
    <SurfaceCard as="header" className="shrink-0 overflow-hidden p-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            <Sparkles size={11} />
            Smart Diet IA
          </div>

          <h1 className="text-[21px] font-black uppercase italic leading-[0.95] tracking-tight text-[var(--app-text)]">
            Dieta personalizada
          </h1>

          <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-muted)]">
            {hasPlan
              ? `${completedMeals}/${totalMeals} comidas completadas · ${completionPercent}% semanal`
              : "Plan por objetivo, días, comidas y alimentos disponibles."}
          </p>
        </div>

        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl"
          style={{ backgroundColor: "var(--app-primary-soft)", color: "var(--app-primary)" }}
        >
          <Sparkles size={16} />
        </div>
      </div>
    </SurfaceCard>
  );
}

function ActionButton({ icon, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-8 w-full place-items-center rounded-xl px-1 shadow-[inset_0_0_0_1px_var(--app-border)] transition active:scale-[0.98] disabled:opacity-30 ${
        active
          ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_22px_var(--app-glow)]"
          : "bg-[var(--app-surface)] text-[var(--app-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
      }`}
    >
      <span className={active ? "text-[var(--app-surface)]" : "text-[var(--app-primary)]"}>
        {icon}
      </span>
    </button>
  );
}

function CompactDietSummary({ daysCount, totalMeals, totals }) {
  const dailyCalories = daysCount
    ? Math.round(Number(totals?.calories || 0) / daysCount)
    : 0;
  const dailyProtein = daysCount
    ? Math.round(Number(totals?.protein || 0) / daysCount)
    : 0;

  return (
    <section
      className="rounded-[18px] border px-2.5 py-1.5 shadow-[0_16px_45px_var(--app-glow)]"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles size={13} className="shrink-0 text-[var(--app-primary)]" />

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Resumen semanal
          </p>

          <p className="mt-0.5 truncate text-[10px] font-bold normal-case leading-[1.25] text-[var(--app-muted)]">
            {daysCount} días • {totalMeals} comidas • {dailyCalories} kcal/día •{" "}
            {dailyProtein}g proteína
          </p>
        </div>
      </div>
    </section>
  );
}

function DietMotivationCard({ message }) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,var(--app-primary)1f,transparent_42%)]" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Sparkles size={13} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Coach IA
          </p>

          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold normal-case leading-[1.25] text-[var(--app-muted)]">
            {message}
          </p>
        </div>
      </div>
    </section>
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
    <section
      aria-label={`Creando dieta de ${formData?.planDays || "varios"} días`}
      className="min-h-0 overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 shadow-[0_24px_70px_var(--app-glow)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Creando dieta
          </p>

          <h3 className="mt-0.5 text-base font-black uppercase italic">
            AI Meal Plan
          </h3>
        </div>

      <div className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)]">
  <ScanLine size={21} className="animate-spin text-[var(--app-primary)]" />
</div>
      </div>

        <div className="relative h-[150px] overflow-hidden rounded-[18px] bg-[var(--app-surface)]">
        <div className="absolute inset-0 bg-[var(--app-bg)]/55" />
        <div className="absolute left-0 right-0 top-0 h-20 animate-[scanner_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-[var(--app-primary)]/30 to-transparent" />

        <div className="relative z-10 grid h-full place-items-center text-center">
          <div>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] backdrop-blur-xl">
              <Loader2 size={28} className="animate-spin" />
            </div>

            <p className="text-3xl font-black italic leading-none text-[var(--app-primary)]">
              {percent}%
            </p>

            <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]">
              Personalizando con IA
            </p>

            <p className="mt-1 inline-flex items-center justify-center gap-1 text-[9px] font-bold text-[var(--app-muted)]">
              <Timer size={11} />
              {seconds}s
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface)]">
        <div
          className="h-full rounded-full bg-[var(--app-primary)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-5 gap-1">
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const active = index === activeStep;

          return (
            <div
              key={step}
              className={`rounded-xl px-1 py-1.5 text-center ${
                completed
                  ? "bg-[var(--app-primary-soft)]"
                  : active
                  ? "bg-[var(--app-surface)]"
                  : "bg-[var(--app-surface)]"
              }`}
            >
              <div className="mb-0.5 flex justify-center">
                {completed ? (
                  <span className="text-[11px] font-black leading-none text-[var(--app-primary)]">
                    ✓
                  </span>
                ) : active ? (
                  <Sparkles size={11} className="text-[var(--app-primary)]" />
                ) : (
                  <Loader2 size={11} className="text-[var(--app-muted)]" />
                )}
              </div>

              <p
                className={`truncate text-[10px] font-black uppercase leading-3 ${
                  completed || active ? "text-[var(--app-text)]" : "text-slate-600"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </section>
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
    mealsPerDay: String(
      savedProfile?.meals_per_day ||
        savedProfile?.preferences?.meals_per_day ||
        4
    ),
    budget: "medium",
    cookingLevel: "easy",
    homeFoods: "",
    exclusions: "",
  };
}

function createGenerationRequestId() {
  return `diet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isLoadingStateRecent(state, maxAgeMs = 3 * 60 * 1000) {
  if (!state || state.status !== "loading" || !state.startedAt) {
    return false;
  }

  const startedAtMs = Date.parse(state.startedAt);
  if (Number.isNaN(startedAtMs)) return true;

  return Date.now() - startedAtMs <= maxAgeMs;
}

function persistGenerationState(state) {
  setDietGenerationState(state);
}

async function generateDietPlanWithRetry(args) {
  try {
    return await generateDietPlan(args);
  } catch (error) {
    const isTimeout = error?.code === "REQUEST_TIMEOUT";

    if (!isTimeout) {
      throw error;
    }

    return generateDietPlan(args);
  }
}

function buildShareText(plan) {
  const days = getSharePlanDays(plan);
  if (!days.length) return "NutriSmartCoach\nPlan nutricional semanal.";

  const totals = days.reduce(
    (acc, day) => {
      const meals = getShareMeals(day);
      acc.meals += meals.length;
      meals.forEach((meal) => {
        acc.calories += Number(meal?.calories || meal?.kcal || 0);
        acc.protein += Number(meal?.protein || 0);
      });
      return acc;
    },
    { meals: 0, calories: 0, protein: 0 }
  );

  const dayCount = days.length || 1;
  const summary = [
    "NutriSmartCoach",
    "Plan nutricional semanal",
    "",
    `Resumen: ${days.length} dias · ${totals.meals} comidas · ${Math.round(
      totals.calories / dayCount
    )} kcal/dia aprox. · ${Math.round(totals.protein / dayCount)}g proteina/dia`,
  ];

  const dayLines = days.slice(0, 7).map((day, dayIndex) => {
    const meals = getShareMeals(day);
    const mealLines =
      meals.length > 0
        ? meals.slice(0, 6).map((meal, mealIndex) => {
            const time = meal?.time ? `${meal.time} · ` : "";
            const label =
              meal?.name ||
              meal?.mealType ||
              meal?.meal_type ||
              meal?.type ||
              `Comida ${mealIndex + 1}`;
            const food = meal?.food || meal?.title || meal?.description || "Sin comida registrada";
            const calories = Number(meal?.calories || meal?.kcal || 0);
            const protein = Number(meal?.protein || 0);
            const macros = [
              calories > 0 ? `${Math.round(calories)} kcal` : "",
              protein > 0 ? `${Math.round(protein)}g P` : "",
            ]
              .filter(Boolean)
              .join(" · ");

            return `- ${time}${label}: ${food}${macros ? ` (${macros})` : ""}`;
          })
        : ["- Sin comida registrada"];

    return `${day?.day || day?.dia || `Dia ${dayIndex + 1}`}\n${mealLines.join("\n")}`;
  });

  const shoppingGroups = buildShareShoppingGroups(days);
  const shoppingLines = shoppingGroups.length
    ? [
        "",
        "Lista de compra resumida",
        ...shoppingGroups.map(
          (group) =>
            `${group.category}: ${group.items
              .slice(0, 6)
              .map((item) => `${item.name} (${item.amount})`)
              .join(", ")}${group.items.length > 6 ? "..." : ""}`
        ),
      ]
    : [];

  return [...summary, "", ...dayLines, ...shoppingLines].join("\n");
}

function getSharePlanDays(plan) {
  if (Array.isArray(plan)) return plan.filter(Boolean);
  if (Array.isArray(plan?.week)) return plan.week.filter(Boolean);
  if (Array.isArray(plan?.days)) return plan.days.filter(Boolean);
  if (Array.isArray(plan?.plan)) return plan.plan.filter(Boolean);
  return [];
}

function getShareMeals(day) {
  if (Array.isArray(day?.meals)) return day.meals.filter(Boolean);
  if (day?.meals && typeof day.meals === "object") {
    return Object.values(day.meals).filter(Boolean);
  }
  return [];
}

function buildShareShoppingGroups(days) {
  const grouped = new Map();

  days.forEach((day) => {
    getShareMeals(day).forEach((meal) => {
      getShareIngredients(meal).forEach((ingredient) => {
        const parsed = parseShareIngredient(ingredient);
        if (!parsed.name) return;

        const category = categorizeShareIngredient(parsed.name);
        const key = `${category}:${normalizeShareText(parsed.name)}:${parsed.unit}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            category,
            name: toShareTitleCase(parsed.name),
            unit: parsed.unit,
            value: 0,
          });
        }

        grouped.get(key).value += parsed.value;
      });
    });
  });

  const categories = ["Proteinas", "Carbohidratos", "Frutas y verduras", "Lacteos", "Otros"];
  const byCategory = new Map();

  Array.from(grouped.values()).forEach((item) => {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push({
      id: item.id,
      name: item.name,
      amount: formatShareAmount(item),
    });
  });

  return categories
    .map((category) => ({
      category,
      items: (byCategory.get(category) || []).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.items.length > 0)
    .slice(0, 5);
}

function getShareIngredients(meal) {
  if (Array.isArray(meal?.ingredients)) return meal.ingredients.filter(Boolean);
  if (Array.isArray(meal?.ingredientes)) return meal.ingredientes.filter(Boolean);
  if (meal?.details) {
    return String(meal.details)
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseShareIngredient(rawIngredient) {
  const raw =
    typeof rawIngredient === "object" && rawIngredient !== null
      ? `${rawIngredient.amount || rawIngredient.quantity || ""} ${
          rawIngredient.name || rawIngredient.food || ""
        }`.trim()
      : String(rawIngredient || "").trim();

  const match = raw.match(
    /^(\d+(?:[.,]\d+)?)\s*(kg|g|gr|gramos?|ml|l|litros?|unidad(?:es)?|ud|uds|pieza(?:s)?|huevo(?:s)?|rebanada(?:s)?|lata(?:s)?|racion(?:es)?|ración|raciones)?\s*(?:de)?\s*(.*)$/i
  );

  if (!match) return { name: raw, value: 1, unit: "ud" };

  const value = Number(String(match[1]).replace(",", ".")) || 1;
  const unitText = String(match[2] || "ud").toLowerCase();
  const name = (match[3] || raw).trim();

  if (unitText === "kg") return { name, value: value * 1000, unit: "g" };
  if (unitText === "g" || unitText === "gr" || unitText.startsWith("gramo")) {
    return { name, value, unit: "g" };
  }
  if (unitText === "l" || unitText.startsWith("litro")) return { name, value: value * 1000, unit: "ml" };
  if (unitText === "ml") return { name, value, unit: "ml" };
  if (unitText.includes("racion") || unitText.includes("ración")) return { name, value, unit: "raciones" };

  return { name, value, unit: "ud" };
}

function formatShareAmount(item) {
  if (item.unit === "g") {
    return item.value >= 1000
      ? `${formatShareNumber(item.value / 1000)} kg`
      : `${Math.round(item.value)} g`;
  }
  if (item.unit === "ml") {
    return item.value >= 1000
      ? `${formatShareNumber(item.value / 1000)} L`
      : `${Math.round(item.value)} ml`;
  }
  if (item.unit === "raciones") return `${Math.round(item.value)} raciones`;
  return `${Math.round(item.value)} ud`;
}

function categorizeShareIngredient(name = "") {
  const text = normalizeShareText(name);

  if (/(pollo|pavo|carne|ternera|atun|pescado|salmon|huevo|claras)/.test(text)) {
    return "Proteinas";
  }
  if (/(arroz|pasta|avena|pan|patata|boniato|quinoa|lentejas|garbanzos)/.test(text)) {
    return "Carbohidratos";
  }
  if (/(fruta|verdura|ensalada|brocoli|platano|banana|manzana|aguacate|tomate|lechuga)/.test(text)) {
    return "Frutas y verduras";
  }
  if (/(leche|yogur|queso)/.test(text)) return "Lacteos";

  return "Otros";
}

function normalizeShareText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toShareTitleCase(text = "") {
  return normalizeShareText(text)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatShareNumber(number) {
  return Number(number.toFixed(1)).toString();
}
