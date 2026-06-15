import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../services/analytics";
import {
  Download,
  RefreshCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  Utensils,
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
  listDietProgress,
  listDietPlans,
  rewriteDietMeal,
  setDietGenerationState,
  syncDietMealProgress,
} from "../services/dietService";
import { getCachedProfile } from "../services/profileService";
import { getPremiumStatus } from "../services/premiumService";
import {
  AiErrorNotice,
  AppShell,
  PremiumEmptyState,
  StatusBox,
  SurfaceCard,
  AiUsageCard,
} from "../components/ui";
import { useAiUsageStatus } from "../hooks/useAiUsageStatus";
import { formatAiUsageMessage } from "../services/aiUsageService";

export function MealPlan() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMountedRef = useRef(true);
  const [generationState, setGenerationState] = useState(() =>
    getDietGenerationState()
  );

  const [formData, setFormData] = useState(createInitialFormData);
  const [loading, setLoading] = useState(() =>
    isLoadingStateRecent(getDietGenerationState())
  );
  const [plan, setPlan] = useState(() => getDietPlanWeek(getCachedDietPlan()));
  const [dietPlanId, setDietPlanId] = useState(
    () => getCachedDietPlan()?.id || null
  );
  const [activeDay, setActiveDay] = useState(0);
  const [progress, setProgress] = useState(getDietProgress);
  const [showShopping, setShowShopping] = useState(false);
  const [profile] = useState(getCachedProfile);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [rewriteTarget, setRewriteTarget] = useState(null);
  const [rewriteReason, setRewriteReason] = useState("");
  const [rewriteMealState, setRewriteMealState] = useState({});
  const [rewriteDialogError, setRewriteDialogError] = useState("");
  const currentGenerationRequestIdRef = useRef(null);
  const { applyUsageError, refreshUsage, usage } = useAiUsageStatus(
    "diet_generation",
    profile?.id || profile?.user_id || ""
  );

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile]);
  const userId = profile?.id || profile?.user_id || "";
  const isPremium = Boolean(
    premiumStatus?.plan === "premium" &&
      premiumStatus?.is_premium === true &&
      ["active", "trialing"].includes(premiumStatus?.subscription_status)
  );
  const hasPlan = plan.length > 0;
  const safeActiveDay = hasPlan
    ? Math.max(0, Math.min(activeDay, plan.length - 1))
    : 0;
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "es";

  const DIET_TYPES = useMemo(
    () => [
      { value: "balanced", label: t("diet.form.dietTypes.balanced") },
      { value: "low_carb", label: t("diet.form.dietTypes.lowCarb") },
      { value: "keto", label: t("diet.form.dietTypes.keto") },
      { value: "hyperprotein", label: t("diet.form.dietTypes.hyperprotein") },
      { value: "vegetarian", label: t("diet.form.dietTypes.vegetarian") },
      { value: "vegan", label: t("diet.form.dietTypes.vegan") },
    ],
    [t]
  );

  const GOAL_TYPES = useMemo(
    () => [
      { value: "lose_fat", label: t("diet.form.goals.loseFat") },
      { value: "gain_muscle", label: t("diet.form.goals.gainMuscle") },
      { value: "maintain", label: t("diet.form.goals.maintain") },
    ],
    [t]
  );

  const BUDGET_TYPES = useMemo(
    () => [
      { value: "low", label: t("diet.form.budget.low") },
      { value: "medium", label: t("diet.form.budget.medium") },
      { value: "high", label: t("diet.form.budget.high") },
    ],
    [t]
  );

  const PLAN_DAYS = useMemo(
    () => [
      { value: "2", label: t("diet.form.planDays.2") },
      { value: "3", label: t("diet.form.planDays.3") },
      { value: "4", label: t("diet.form.planDays.4") },
      { value: "5", label: t("diet.form.planDays.5") },
      { value: "7", label: t("diet.form.planDays.7") },
    ],
    [t]
  );

  const MEALS_PER_DAY = useMemo(
    () => [
      { value: "2", label: t("diet.form.mealsPerDay.fasting") },
      { value: "3", label: t("diet.form.mealsPerDay.3") },
      { value: "4", label: t("diet.form.mealsPerDay.4") },
      { value: "5", label: t("diet.form.mealsPerDay.5") },
      { value: "6", label: t("diet.form.mealsPerDay.6") },
    ],
    [t]
  );

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
        t,
      }),
    [
      completedMeals,
      totalMeals,
      completionPercent,
      formData.goal,
      profile,
      weekTotals,
      t,
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
        setNotice(t("mealPlan.status.generating"));
        return;
      }

      if (generationState.status === "loading") {
        const staleState = {
          ...generationState,
          status: "error",
          updatedAt: new Date().toISOString(),
          error: t("mealPlan.errors.timeout"),
        };

        persistGenerationState(staleState);
        setGenerationState(staleState);
        setLoading(false);
        setNotice("");
        setErrorMessage(staleState.error);
        return;
      }

      if (generationState.status === "error") {
        if (
          generationState.requestId &&
          generationState.requestId === currentGenerationRequestIdRef.current
        ) {
          return;
        }

        const idleState = {
          status: "idle",
          startedAt: null,
          updatedAt: null,
          requestId: null,
          result: null,
          error: "",
        };

        persistGenerationState(idleState);
        setGenerationState(idleState);
        setErrorMessage("");
        setNotice("");
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
            ? t("mealPlan.status.fallbackGenerated")
            : t("mealPlan.status.generated")
        );
        setLoading(false);
        setErrorMessage("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [generationState, hasPlan, t]);

  useEffect(() => {
    if (!userId) return;

    Promise.resolve().then(async () => {
      try {
        const dietPlans = await listDietPlans(userId);
        const activePlan = dietPlans[0];

        if (activePlan) {
          setPlan(getDietPlanWeek(activePlan));
          setDietPlanId(activePlan.id || null);
          setActiveDay(0);

          const remoteProgress = await listDietProgress(userId, {
            dietPlanId: activePlan.id || null,
          });

          if (isMountedRef.current) {
            setProgress(remoteProgress);
          }
        }

        if (isMountedRef.current) {
          setErrorMessage("");
        }
      } catch (error) {
        logMealPlanIssue({
          endpoint: `/diet-plans/${userId}`,
          operation: "cargar dietas guardadas",
          error,
        });
      }
    });
  }, [profile, userId]);

  useEffect(() => {
    if (!userId) return;

    Promise.resolve().then(async () => {
      try {
        const status = await getPremiumStatus();
        if (isMountedRef.current) setPremiumStatus(status);
      } catch (error) {
        logMealPlanIssue({
          endpoint: "/premium/status",
          operation: "consultar el estado premium",
          error,
          level: "warn",
        });
      }
    });
  }, [userId]);

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
        throw new Error(t("mealPlan.errors.profileIncomplete"));
      }

      const payloadPreferences = {
        ...formData,
        days: Number(formData.planDays),
        planDays: Number(formData.planDays),
        mealsPerDay: Number(formData.mealsPerDay),
        language: currentLanguage,
        lowCarb: formData.dietType === "low_carb" || formData.dietType === "keto",
        intermittentFasting: Number(formData.mealsPerDay) === 2,
        homeFoods: formData.homeFoods || "",
        exclusions: formData.exclusions || "",
      };

      requestId = createGenerationRequestId();
      currentGenerationRequestIdRef.current = requestId;
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
        throw new Error(t("mealPlan.errors.invalidPlan"));
      }

      setPlan(cleanPlan);
      setDietPlanId(data.diet_plan_id || data.dietPlan?.id || null);
      trackEvent("generate_diet", {
  diet_type: formData.dietType,
  goal: formData.goal,
  days: formData.planDays,
  meals_per_day: formData.mealsPerDay,
});
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
          ? t("mealPlan.status.fallbackGenerated")
          : t("mealPlan.status.generated")
      );
      await refreshUsage(profile?.id || profile?.user_id || "");
    } catch (err) {
      logMealPlanIssue({
        endpoint: "/generate-diet",
        operation: "generar dieta",
        error: err,
      });
      if (!requestId || !startedAt) {
        setErrorMessage(err.message || t("mealPlan.errors.timeout"));
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
          t("mealPlan.errors.timeout"),
      };

      persistGenerationState(errorState);
      if (isMountedRef.current) {
        setGenerationState(errorState);
      }

      applyUsageError(err);
      setErrorMessage(
        err?.status === 429
          ? formatAiUsageMessage("diet_generation", err.data?.usage?.diet_generation, profile)
          : errorState.error
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }

  function handleResetPlan() {
    setPlan([]);
    setDietPlanId(null);
    setProgress({});
    setActiveDay(0);
    setShowShopping(false);
    setNotice("");
    setErrorMessage("");
    currentGenerationRequestIdRef.current = null;
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

      if (userId) {
        void syncDietMealProgress({
          userId,
          mealId,
          completed: updated[mealId],
          dietPlanId,
        }).catch((error) => {
          console.warn("No se pudo sincronizar el progreso de dieta:", error);
        });
      }

      return updated;
    });
  }

  function openRewriteMeal(target) {
    setRewriteTarget(target);
    setRewriteReason("");
    setRewriteDialogError("");
    setErrorMessage("");
  }

  async function submitRewriteMeal() {
    if (!rewriteTarget) return;

    const normalizedReason = rewriteReason.trim();

    if (!normalizedReason) {
      setRewriteDialogError(t("mealPlan.rewrite.needReason"));
      return;
    }

    if (!isPremium) {
      trackEvent("premium_feature_clicked", {
  feature: "rewrite_meal",
});
      navigate("/premium");
      return;
    }

    try {
      setErrorMessage("");
      setNotice("");
      setRewriteDialogError("");
      setRewriteMealState({ mealId: rewriteTarget.mealId });

      const data = await rewriteDietMeal({
        dietPlanId,
        userId,
        dayIndex: rewriteTarget.dayIndex,
        mealId: rewriteTarget.mealId,
        mealIndex: rewriteTarget.mealIndex,
        dayName: rewriteTarget.dayName,
        mealName: rewriteTarget.mealName,
        mealType: rewriteTarget.mealType,
        foodName: rewriteTarget.foodName,
        meal: rewriteTarget.meal,
        reason: normalizedReason,
      });

      if (!Array.isArray(data.week) || data.week.length === 0) {
        throw new Error(t("mealPlan.rewrite.noResponse"));
      }

      setPlan(data.week);
      setRewriteTarget(null);
      setRewriteReason("");
      setRewriteDialogError("");
      setNotice(t("mealPlan.rewrite.success"));
    } catch (error) {
      if (error?.status === 403 && error?.data?.upgradeAvailable) {
        setErrorMessage(t("mealPlan.rewrite.premiumRequired"));
        navigate("/premium");
        return;
      }

      logMealPlanIssue({
        endpoint: `/diet-plans/${dietPlanId}/rewrite-meal`,
        operation: "cambiar la comida",
        error,
      });

      const message = error?.message || t("mealPlan.rewrite.error");
      setRewriteDialogError(message);
      setErrorMessage(message);
    } finally {
      setRewriteMealState({});
    }
  }

  async function handleShare() {
    const text = buildShareText(plan, t);

    try {
      if (navigator.share) {
        await navigator.share({
          title: t("mealPlan.share.shareTitle"),
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setNotice(t("mealPlan.share.copied"));
      }
    } catch {
      setErrorMessage(t("mealPlan.share.failed"));
    }
  }

  return (
    <>
      <PrintablePlan plan={plan} />

<AppShell
  className="pb-1"
  contentClassName="px-2 pt-2"
  scrollClassName="overflow-x-hidden overscroll-x-none   [scrollbar-width:none] touch-pan-y pb-[calc(var(--bottom-nav-space)+30px)]"
>
  <div className="flex flex-col gap-3">
          <DietHeroCard
            hasPlan={hasPlan}
            completionPercent={completionPercent}
            completedMeals={completedMeals}
            totalMeals={totalMeals}
          />

          <AiUsageCard
            profile={profile}
            type="diet_generation"
            usage={usage}
            className="shrink-0"
          />

          {!profileComplete && (
            <StatusBox
              type="error"
              action={() => navigate("/perfil")}
              actionLabel={t("mealPlan.actions.completeProfile")}
            >
              {t("mealPlan.errors.profileIncomplete")}
            </StatusBox>
          )}

          <AiErrorNotice message={errorMessage} />
          {notice && !errorMessage && <StatusBox type="success">{notice}</StatusBox>}

          {!hasPlan && !loading ? (
<div className="pr-0.5 pb-[calc(var(--bottom-nav-space)+40px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <PremiumEmptyState
                icon={Utensils}
                title={t("mealPlan.empty.title")}
                description={t("mealPlan.empty.description")}
                actionLabel={t("mealPlan.empty.action")}
              
              />
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
  className="flex flex-col p-2"
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
                      {showShopping ? t("mealPlan.plan.shoppingTitle") : t("mealPlan.plan.generatedTitle")}
                    </h2>
                  </div>

                  <p className="mt-0.5 truncate text-[9px] normal-case text-[var(--app-muted)]">
                    {hasPlan
                      ? t("mealPlan.plan.progress", { days: plan.length, totalMeals, completedMeals })
                      : loading
                      ? t("mealPlan.plan.loading")
                      : t("mealPlan.plan.empty")}
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
                      label={t("mealPlan.actions.newDiet")}
                      onClick={handleResetPlan}
                    />

                    <ActionButton
                      icon={<ShoppingCart size={12} />}
                      label={showShopping ? t("mealPlan.actions.diet") : t("mealPlan.actions.shopping")}
                      onClick={() => setShowShopping((prev) => !prev)}
                      active={showShopping}
                    />

                    <ActionButton
                      icon={<Download size={12} />}
                      label={t("mealPlan.actions.pdf")}
                      onClick={() => window.print()}
                    />

                    <ActionButton
                      icon={<Share2 size={12} />}
                      label={t("mealPlan.actions.share")}
                      onClick={handleShare}
                    />
                  </div>
                </>
              )}
            </div>

<div className="p-2">
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
                        isPremium={isPremium}
                        onRewriteMeal={openRewriteMeal}
                        rewriteMealState={rewriteMealState}
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

      {rewriteTarget && (
        <RewriteMealDialog
          isPremium={isPremium}
          reason={rewriteReason}
          setReason={setRewriteReason}
          error={rewriteDialogError}
          setError={setRewriteDialogError}
          loading={Boolean(rewriteMealState.mealId)}
          onClose={() => setRewriteTarget(null)}
          onConfirm={submitRewriteMeal}
          onUpgrade={() => navigate("/premium")}
        />
      )}
    </>
  );
}

function DietHeroCard({
  hasPlan,
  completionPercent,
  completedMeals,
  totalMeals,
}) {
  const { t } = useTranslation();

  return (
    <SurfaceCard as="header" className="shrink-0 overflow-hidden p-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            <Sparkles size={11} />
            {t("mealPlan.hero.badge")}
          </div>

          <h1 className="text-[21px] font-black uppercase italic leading-[0.95] tracking-tight text-[var(--app-text)]">
            {t("mealPlan.hero.title")}
          </h1>

          <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-muted)]">
            {hasPlan
              ? t("mealPlan.hero.activeSummary", { completedMeals, totalMeals, completionPercent })
              : t("mealPlan.hero.emptySummary")}
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
  const { t } = useTranslation();
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
            {t("mealPlan.summary.badge")}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-bold normal-case leading-[1.25] text-[var(--app-muted)]">
            {t("mealPlan.summary.value", { daysCount, totalMeals, dailyCalories, dailyProtein })}
          </p>
        </div>
      </div>
    </section>
  );
}

function DietMotivationCard({ message }) {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,var(--app-primary)1f,transparent_42%)]" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Sparkles size={13} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("mealPlan.motivation.badge")}
          </p>

          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold normal-case leading-[1.25] text-[var(--app-muted)]">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}

function RewriteMealDialog({
  isPremium,
  reason,
  setReason,
  error,
  setError,
  loading,
  onClose,
  onConfirm,
  onUpgrade,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-bg)]/75 px-3 pb-5 pt-10 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-[24px] border border-[var(--app-primary)]/20 bg-[var(--app-card)] p-3 shadow-[0_24px_80px_var(--app-glow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              {t("mealPlan.rewrite.badge")}
            </p>
            <h3 className="mt-1 text-[16px] font-black text-[var(--app-text)]">
              {t("mealPlan.rewrite.title")}
            </h3>
            <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
              {isPremium
                ? t("mealPlan.rewrite.premiumDescription")
                : t("mealPlan.rewrite.freeDescription")}
            </p>
          </div>

          <button
            type="button"
            aria-label={t("mealPlan.rewrite.close")}
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
          >
            ×
          </button>
        </div>

        {isPremium ? (
          <>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError("");
              }}
              placeholder={t("mealPlan.rewrite.placeholder")}
              className={`mt-3 min-h-24 w-full resize-none rounded-2xl border bg-[var(--app-surface)] px-3 py-2 text-[12px] font-medium text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] ${
                error
                  ? "border-rose-400/60"
                  : "border-[var(--app-border)]"
              }`}
            />

            <p
              className={`mt-1.5 text-[10px] font-medium leading-4 ${
                loading
                  ? "text-[var(--app-primary)]"
                  : error
                  ? "text-rose-300"
                  : "text-[var(--app-muted)]"
              }`}
            >
              {loading
                ? t("mealPlan.rewrite.loading")
                : error || t("mealPlan.rewrite.helper")}
            </p>
          </>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)] disabled:opacity-50"
          >
            {t("mealPlan.rewrite.cancel")}
          </button>

          <button
            type="button"
            onClick={isPremium ? onConfirm : onUpgrade}
            disabled={loading || (isPremium && !reason.trim())}
            className="rounded-2xl bg-[var(--app-primary)] px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-surface)] shadow-[0_16px_32px_var(--app-glow)] disabled:opacity-50"
          >
            {loading ? t("mealPlan.rewrite.loading") : isPremium ? t("mealPlan.rewrite.confirm") : t("mealPlan.rewrite.upgrade")}
          </button>
        </div>
      </section>
    </div>
  );
}

function GeneratingDietLoader({ formData }) {
  const { t } = useTranslation();
  const [percent, setPercent] = useState(7);
  const [seconds, setSeconds] = useState(0);

  const steps = [
    t("mealPlan.loader.steps.profile"),
    t("mealPlan.loader.steps.macros"),
    t("mealPlan.loader.steps.menu"),
    t("mealPlan.loader.steps.portions"),
    t("mealPlan.loader.steps.shopping"),
  ];

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
      aria-label={t("mealPlan.loader.aria", { days: formData?.planDays || t("mealPlan.loader.variousDays") })}
      className="min-h-0 overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 shadow-[0_24px_70px_var(--app-glow)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("mealPlan.loader.title")}
          </p>

          <h3 className="mt-0.5 text-base font-black uppercase italic">
            {t("mealPlan.loader.subtitle")}
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
              {t("mealPlan.loader.personalizing")}
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
  t,
}) {
  const normalizedGoal = String(goal || "").toLowerCase();
  const protein = Math.round(Number(totals?.protein || 0));
  const calories = Math.round(Number(totals?.calories || 0));

  if (!totalMeals) {
    return t("mealPlan.motivation.noMeals");
  }

  if (completionPercent >= 85) {
    return t("mealPlan.motivation.highProgress");
  }

  if (completionPercent >= 50) {
    return t("mealPlan.motivation.mediumProgress");
  }

  if (completedMeals > 0) {
    return t("mealPlan.motivation.started");
  }

  if (normalizedGoal.includes("lose") || normalizedGoal.includes("perder")) {
    return t("mealPlan.motivation.loseFat");
  }

  if (normalizedGoal.includes("gain") || normalizedGoal.includes("ganar")) {
    return protein > 0
      ? t("mealPlan.motivation.gainMuscleWithProtein")
      : t("mealPlan.motivation.gainMuscle");
  }

  if (normalizedGoal.includes("maintain") || normalizedGoal.includes("mantener")) {
    return t("mealPlan.motivation.maintain");
  }

  if (calories > 0) {
    return t("mealPlan.motivation.withStructure");
  }

  return t("mealPlan.motivation.default");
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

function logMealPlanIssue({ endpoint, operation, error, level = "error" }) {
  const logger = level === "warn" ? console.warn : console.error;

  logger("MealPlan request failed:", {
    endpoint,
    operation,
    status: error?.status ?? null,
    code: error?.code ?? null,
    message: error?.message || "",
  });
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

function buildShareText(plan, t) {
  const days = getSharePlanDays(plan);
  if (!days.length) {
    return `${t("mealPlan.share.brand")}\n${t("mealPlan.share.title")}.`;
  }

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
    t("mealPlan.share.brand"),
    t("mealPlan.share.title"),
    "",
    t("mealPlan.share.summary", {
      days: days.length,
      meals: totals.meals,
      calories: Math.round(totals.calories / dayCount),
      protein: Math.round(totals.protein / dayCount),
    }),
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
              t("meal.defaultNames.fallback", { index: mealIndex + 1 });
            const food = meal?.food || meal?.title || meal?.description || t("mealPlan.share.noMeal");
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
        : [`- ${t("mealPlan.share.noMeal")}`];

    return `${getShareDayLabel(day, dayIndex, t)}\n${mealLines.join("\n")}`;
  });

  const shoppingGroups = buildShareShoppingGroups(days);
  const shoppingLines = shoppingGroups.length
    ? [
        "",
        t("mealPlan.share.shoppingTitle"),
        ...shoppingGroups.map(
          (group) =>
            `${t(group.translationKey)}: ${group.items
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

function getShareDayLabel(day, index, t) {
  const raw = String(day?.day || day?.dia || "").toLowerCase();

  if (raw.startsWith("lunes") || raw.startsWith("monday")) return t("mealPlan.weekdays.long.monday");
  if (raw.startsWith("martes") || raw.startsWith("tuesday")) return t("mealPlan.weekdays.long.tuesday");
  if (raw.startsWith("miércoles") || raw.startsWith("miercoles") || raw.startsWith("wednesday"))
    return t("mealPlan.weekdays.long.wednesday");
  if (raw.startsWith("jueves") || raw.startsWith("thursday")) return t("mealPlan.weekdays.long.thursday");
  if (raw.startsWith("viernes") || raw.startsWith("friday")) return t("mealPlan.weekdays.long.friday");
  if (raw.startsWith("sábado") || raw.startsWith("sabado") || raw.startsWith("saturday"))
    return t("mealPlan.weekdays.long.saturday");
  if (raw.startsWith("domingo") || raw.startsWith("sunday")) return t("mealPlan.weekdays.long.sunday");

  return day?.day || day?.dia || t("mealPlan.share.dayFallback", { index: index + 1 });
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

  const categories = [
    { key: "Proteinas", translationKey: "diet.shopping.categories.proteins" },
    { key: "Carbohidratos", translationKey: "diet.shopping.categories.carbs" },
    { key: "Frutas y verduras", translationKey: "diet.shopping.categories.fruitsVegetables" },
    { key: "Lacteos", translationKey: "diet.shopping.categories.dairy" },
    { key: "Otros", translationKey: "diet.shopping.categories.other" },
  ];
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
      category: category.key,
      translationKey: category.translationKey,
      items: (byCategory.get(category.key) || []).sort((a, b) => a.name.localeCompare(b.name)),
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
