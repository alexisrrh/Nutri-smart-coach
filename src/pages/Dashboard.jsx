import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Sparkles } from "lucide-react";
import { AppShell } from "../components/ui";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import AIHeroCard from "../components/dashboard/AIHeroCard";
import DashboardActions from "../components/dashboard/DashboardActions";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

import { getCachedDietPlans } from "../services/dietService";
import { getCachedMeals } from "../services/mealService";
import { getCachedCheckins } from "../services/checkinService";
import { getCachedProgressLogs } from "../services/progressService";
import { getCachedProfile } from "../services/profileService";
import { loadDashboardData } from "../services/dashboardPrefetchService";

import {
  getGoals,
  getSmartTip,
  getFirstName,
} from "../components/dashboard/dashboardUtils";
import {
  buildGamificationSnapshot,
  getGamificationState,
  getLocalDateKey,
  getWorkoutCompletions,
  isSameLocalDate,
  syncGamificationState,
} from "../services/gamificationService";

const DailyProgressCard = lazy(() =>
  import("../components/dashboard/DailyProgressCard")
);

function getInitialDashboardSnapshot() {
  const profile = getCachedProfile();
  const userId = profile?.id || profile?.user_id || null;
  const meals = getCachedMeals();
  const dietPlans = getCachedDietPlans();
  const checkins = getCachedCheckins(userId);
  const progressLogs = getCachedProgressLogs(userId);

  return {
    profile,
    meals,
    dietPlans,
    checkins,
    progressLogs,
    hasCachedSnapshot: Boolean(
      profile ||
        meals.length > 0 ||
        dietPlans.length > 0 ||
        checkins.length > 0 ||
        progressLogs.length > 0
    ),
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialSnapshot = useMemo(() => getInitialDashboardSnapshot(), []);

  const [profile, setProfile] = useState(() => initialSnapshot.profile);
  const [meals, setMeals] = useState(() => initialSnapshot.meals);
  const [dietPlans, setDietPlans] = useState(() => initialSnapshot.dietPlans);
  const [checkins, setCheckins] = useState(() => initialSnapshot.checkins);
  const [workoutCompletions] = useState(() => getWorkoutCompletions());
  const [loadingData, setLoadingData] = useState(
    () => !initialSnapshot.hasCachedSnapshot
  );
  const [syncing, setSyncing] = useState(
    () => initialSnapshot.hasCachedSnapshot
  );
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const preloadWorkoutMedia = async () => {
      const [{ exercises }, { preloadExercises }] = await Promise.all([
        import("../data/exercises"),
        import("../services/exerciseMediaService"),
      ]);

      if (cancelled || !Array.isArray(exercises) || exercises.length === 0) return;

      preloadExercises(exercises.slice(0, 16));

      preloadExercises(exercises);
    };

    const timeoutId = window.setTimeout(() => {
      void preloadWorkoutMedia();
    }, 1800);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const loadRemoteDashboardData = useCallback(async () => {
    setLoadError("");
    setSyncing(true);

    try {
      let sessionUser = user;

      if (!sessionUser) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        sessionUser = session?.user || null;
      }

      const currentCachedProfile = getCachedProfile();
      const userId =
        sessionUser?.id ||
        currentCachedProfile?.id ||
        currentCachedProfile?.user_id ||
        null;

      if (!userId) {
        setLoadError("Sesión no válida. Vuelve a iniciar sesión.");
        return;
      }

      const dashboardData = await loadDashboardData(userId, {
        fallbackToCache: false,
        maxCacheAgeMs: 15000,
      });

      setProfile(dashboardData.profile || null);
      setMeals(dashboardData.meals || []);
      setDietPlans(dashboardData.dietPlans || []);
      setCheckins(dashboardData.checkins || []);

      if (dashboardData.errors.length > 0) {
        setLoadError(
          formatDashboardError(
            dashboardData.errors[0],
            dashboardData.errors.length
          )
        );
      } else {
        setLoadError("");
      }
    } catch (error) {
      setLoadError(formatDashboardError(error, 1));
    } finally {
      setLoadingData(false);
      setSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadRemoteDashboardData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadRemoteDashboardData]);

  const goals = useMemo(() => getGoals(profile), [profile]);

  const todayMeals = useMemo(() => {
    const today = new Date().toDateString();

    return meals.filter((meal) => {
      const date = meal.created_at || meal.createdAt;
      if (!date) return false;

      return new Date(date).toDateString() === today;
    });
  }, [meals]);

  const totals = useMemo(() => {
    return todayMeals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories) || 0;
        acc.protein += Number(meal.protein) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fat += Number(meal.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const nutritionScore = useMemo(() => {
    const proteinScore = Math.min(totals.protein / goals.protein, 1) * 4;
    const caloriesScore = Math.min(totals.calories / goals.calories, 1) * 3;
    const carbsScore = Math.min(totals.carbs / goals.carbs, 1) * 1.5;
    const fatScore = Math.min(totals.fat / goals.fat, 1) * 1.5;

    return Math.min(
      10,
      Math.round((proteinScore + caloriesScore + carbsScore + fatScore) * 10) /
        10
    );
  }, [totals, goals]);

  const activeDiet = dietPlans[0];
  const firstName = getFirstName(profile?.name || profile?.nombre);
  const dailyMealGoal = useMemo(
    () => getDailyMealGoal({ dietPlan: activeDiet, profile }),
    [activeDiet, profile]
  );

  const todayKey = getLocalDateKey();
  const todayCheckins = useMemo(() => {
    return checkins.filter((checkin) =>
      isSameLocalDate(checkin.created_at || checkin.createdAt, todayKey)
    );
  }, [checkins, todayKey]);

  const todayWorkouts = useMemo(() => {
    return workoutCompletions.filter((completionDate) =>
      isSameLocalDate(completionDate, todayKey)
    );
  }, [todayKey, workoutCompletions]);

  const workoutRecommendation = useMemo(
    () =>
      getTodayWorkoutRecommendation({
        profile,
        completedToday: todayWorkouts.length > 0,
      }),
    [profile, todayWorkouts.length]
  );

  const gamificationActivity = useMemo(
    () => ({
      hasActiveDiet: Boolean(activeDiet),
      hasMealToday: todayMeals.length > 0,
      hasWorkoutToday: todayWorkouts.length > 0,
      hasCheckinToday: todayCheckins.length > 0,
      proteinCompleted: goals.protein > 0 && totals.protein >= goals.protein,
      protein: totals.protein,
      proteinGoal: goals.protein,
      dailyMealGoal,
      totalMeals: meals.length,
      totalCheckins: checkins.length,
      totalWorkouts: workoutCompletions.length,
    }),
    [
      activeDiet,
      checkins.length,
      dailyMealGoal,
      goals.protein,
      meals.length,
      todayCheckins.length,
      todayMeals.length,
      todayWorkouts.length,
      totals.protein,
      workoutCompletions.length,
    ]
  );

  const [gamification, setGamification] = useState(() =>
    buildGamificationSnapshot(getGamificationState(), {
      hasActiveDiet: Boolean(initialSnapshot.dietPlans[0]),
      hasMealToday: false,
      hasWorkoutToday: false,
      hasCheckinToday: false,
      proteinCompleted: false,
      protein: 0,
      proteinGoal: 0,
      dailyMealGoal,
      totalMeals: initialSnapshot.meals.length,
      totalCheckins: initialSnapshot.checkins.length,
      totalWorkouts: workoutCompletions.length,
    })
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setGamification(syncGamificationState(gamificationActivity));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [gamificationActivity]);

  const smartTip = getSmartTip(
    totals,
    goals,
    todayMeals.length,
    Boolean(activeDiet)
  );

  const motivationMessage = useMemo(
    () =>
      getDashboardMotivationMessage({
        mealsCount: todayMeals.length,
        hasActiveDiet: Boolean(activeDiet),
        nutritionScore,
        protein: totals.protein,
        proteinGoal: goals.protein,
        firstName,
      }),
    [
      todayMeals.length,
      activeDiet,
      nutritionScore,
      totals.protein,
      goals.protein,
      firstName,
    ]
  );

  return (
    <AppShell className="overflow-hidden" contentClassName="px-2 pt-2">
      <div
        className="flex h-full min-h-0 flex-col gap-1"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
        <div className="shrink-0">
          <DashboardHeader loadingData={loadingData} navigate={navigate} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loadingData ? (
            <DashboardSkeleton />
          ) : (
            <div className="flex flex-col gap-1.5">
            {syncing ? (
              <DashboardSyncBanner message="Sincronizando..." />
            ) : null}

            {loadError ? (
              <DashboardSyncBanner
                message={loadError}
                onRetry={syncing ? null : loadRemoteDashboardData}
              />
            ) : null}

            <div className="shrink-0">
              <AIHeroCard
                firstName={firstName}
                nutritionScore={nutritionScore}
                totals={totals}
                goals={goals}
                navigate={navigate}
                smartTip={smartTip}
                todayMeals={todayMeals}
                dailyMealGoal={dailyMealGoal}
              />
            </div>

            <div className="shrink-0 pt-0.5">
              <DashboardMotivationCard message={motivationMessage} />
            </div>

            <div className="shrink-0">
              <Suspense fallback={<DailyProgressSkeleton />}>
                <DailyProgressCard gamification={gamification} />
              </Suspense>
            </div>

            <div className="shrink-0">
              <DashboardWorkoutRecommendationCard
                recommendation={workoutRecommendation}
                navigate={navigate}
              />
            </div>

            <div className="shrink-0">
              <DashboardActions navigate={navigate} />
            </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DailyProgressSkeleton() {
  return (
    <section className="animate-pulse rounded-[1.35rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_18px_54px_var(--app-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-2.5 w-28 rounded-full bg-[var(--app-primary-soft)]" />
          <div className="h-5 w-40 rounded-full bg-[var(--app-primary-soft)]" />
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[var(--app-primary-soft)]" />
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-[var(--app-surface)]" />
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <div className="h-9 rounded-2xl bg-[var(--app-surface)]" />
        <div className="h-9 rounded-2xl bg-[var(--app-surface)]" />
      </div>
    </section>
  );
}

function DashboardSyncBanner({ message, onRetry }) {
  return (
    <section
      className="relative overflow-hidden rounded-[0.9rem] border px-2 py-1.5 shadow-[0_10px_28px_var(--app-glow)]"
      style={{
        backgroundColor: "var(--app-card)",
        borderColor: "var(--app-border)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--app-primary) 18%, transparent), transparent 36%), radial-gradient(circle at 100% 50%, var(--app-primary-soft), transparent 34%)",
        }}
      />

      <div className="relative z-10 flex items-start gap-2">
        <div
          className="grid h-6 w-6 shrink-0 place-items-center rounded-lg"
          style={{
            border: "1px solid var(--app-border)",
            backgroundColor: "var(--app-primary-soft)",
            color: "var(--app-primary)",
          }}
        >
          <AlertCircle size={12} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Sincronización
          </p>

          <p className="mt-0.5 text-[11px] font-bold leading-[1.2] text-[var(--app-muted)]">
            {message}
          </p>
        </div>

        {onRetry ? (
          <button
            onClick={onRetry}
            className="shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] transition hover:bg-[var(--app-primary-soft)]"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-primary)",
            }}
          >
            Reintentar
          </button>
        ) : null}
      </div>
    </section>
  );
}

function DashboardMotivationCard({ message }) {
  return (
    <section
      className="relative overflow-hidden rounded-[0.9rem] border px-2 py-1.5 shadow-[0_10px_28px_var(--app-glow)]"
      style={{
        backgroundColor: "var(--app-card)",
        borderColor: "var(--app-border)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 40%), radial-gradient(circle at 100% 50%, var(--app-primary-soft), transparent 34%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <div
          className="grid h-6 w-6 shrink-0 place-items-center rounded-lg"
          style={{
            border: "1px solid var(--app-border)",
            backgroundColor: "var(--app-primary-soft)",
            color: "var(--app-primary)",
          }}
        >
          <Sparkles size={12} />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Impulso IA
          </p>

          <p className="mt-0.5 line-clamp-1 text-[11px] font-bold leading-[1.2] text-[var(--app-muted)]">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardWorkoutRecommendationCard({ recommendation, navigate }) {
  return (
    <section
      className="relative overflow-hidden rounded-[0.9rem] border px-2.5 py-2 shadow-[0_10px_28px_var(--app-glow)]"
      style={{
        backgroundColor: "var(--app-card)",
        borderColor: "var(--app-border)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--app-primary) 18%, transparent), transparent 38%), radial-gradient(circle at 100% 50%, var(--app-primary-soft), transparent 32%)",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Entreno recomendado hoy
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <h2 className="text-[17px] font-black leading-none text-[var(--app-text)]">
              {recommendation.muscle}
            </h2>
            <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              {recommendation.level}
            </span>
          </div>

          <p className="mt-1 line-clamp-1 text-[11px] font-bold text-[var(--app-muted)]">
            {recommendation.completedToday
              ? "Entreno completado hoy"
              : recommendation.exerciseNames.join(" · ")}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(`/rutinas?muscle=${encodeURIComponent(recommendation.queryMuscle)}`)
          }
          className="shrink-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-surface)] shadow-[0_10px_24px_var(--app-glow)] transition active:scale-[0.98]"
        >
          Ver rutina
        </button>
      </div>
    </section>
  );
}

function formatDashboardError(error, count) {
  const message = String(error?.message || error || "").toLowerCase();
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  if (
    message.includes("sesión no válida") ||
    message.includes("session") ||
    message.includes("token") ||
    message.includes("auth")
  ) {
    return "Sesión no válida. Vuelve a iniciar sesión.";
  }

  if (
    !online ||
    message.includes("sin conexión") ||
    message.includes("offline") ||
    message.includes("fetch") ||
    message.includes("network")
  ) {
    return "Sin conexión. Mostramos lo último guardado y puedes reintentar.";
  }

  if (message.includes("timeout") || message.includes("aborted")) {
    return "La sincronización está tardando demasiado. Inténtalo otra vez.";
  }

  if (count > 1) {
    return "No pudimos sincronizar algunos datos. Reintenta para actualizar el dashboard.";
  }

  return "No pudimos sincronizar el dashboard ahora mismo. Reintenta en unos segundos.";
}

function getDashboardMotivationMessage({
  mealsCount,
  hasActiveDiet,
  nutritionScore,
  protein,
  proteinGoal,
  firstName,
}) {
  const name = firstName ? `${firstName}, ` : "";
  const proteinProgress =
    Number(proteinGoal || 0) > 0
      ? Number(protein || 0) / Number(proteinGoal)
      : 0;

  if (nutritionScore >= 8) {
    return `${name}vas por buen camino: mantén esta racha.`;
  }

  if (mealsCount > 0 && proteinProgress >= 0.6) {
    return "Buen avance hoy. Cada registro te da más control semanal.";
  }

  if (mealsCount > 0) {
    return "Cada comida registrada mejora tu claridad para decidir mejor.";
  }

  if (hasActiveDiet) {
    return "Completa tu próxima comida y mantén tu semana activa.";
  }

  return "Hoy es buen día para empezar con una acción pequeña.";
}

function getTodayWorkoutRecommendation({ profile, completedToday }) {
  const weekday = new Date().getDay();
  const schedule = {
    0: { muscle: "Abdomen", label: "Abdomen / descanso activo" },
    1: { muscle: "Pecho", label: "Pecho" },
    2: { muscle: "Espalda", label: "Espalda" },
    3: { muscle: "Piernas", label: "Piernas" },
    4: { muscle: "Hombros", label: "Hombros" },
    5: { muscle: "Glúteos", label: "Glúteos" },
    6: { muscle: "Bíceps", label: "Brazos" },
  };
  const today = schedule[weekday] || schedule[1];
  const level = getRecommendedWorkoutLevel(profile);
  const exerciseNames =
    DASHBOARD_WORKOUT_EXERCISE_HINTS[today.label] ||
    DASHBOARD_WORKOUT_EXERCISE_HINTS[today.muscle] ||
    DASHBOARD_WORKOUT_EXERCISE_HINTS.General;

  return {
    muscle: today.label,
    queryMuscle: today.muscle.toLowerCase(),
    level,
    completedToday,
    exerciseNames,
  };
}

const DASHBOARD_WORKOUT_EXERCISE_HINTS = {
  "Abdomen / descanso activo": ["Plancha", "Crunch controlado", "Movilidad"],
  Pecho: ["Press", "Flexiones", "Aperturas"],
  Espalda: ["Remo", "Jalón", "Peso muerto"],
  Piernas: ["Sentadilla", "Zancadas", "Prensa"],
  Hombros: ["Press militar", "Elevaciones", "Face pull"],
  Glúteos: ["Hip thrust", "Puente", "Patada de glúteo"],
  Brazos: ["Curl bíceps", "Fondos", "Extensión tríceps"],
  General: ["Fuerza base", "Core", "Movilidad"],
};

function getRecommendedWorkoutLevel(profile) {
  const activity =
    profile?.activity_level || profile?.activity || profile?.actividad || "";

  if (activity === "high" || activity === "alta") return "Avanzado";
  if (activity === "moderate" || activity === "moderada") return "Intermedio";

  return "Principiante";
}

function getDailyMealGoal({ dietPlan, profile }) {
  const dietMealGoal = getDietMealGoalForToday(dietPlan);
  if (dietMealGoal) return dietMealGoal;

  const profileMealGoal = Number(
    profile?.meals_per_day ||
      profile?.mealsPerDay ||
      profile?.preferences?.meals_per_day ||
      profile?.preferences?.mealsPerDay
  );

  return [3, 4, 5, 6].includes(profileMealGoal) ? profileMealGoal : 4;
}

function getDietMealGoalForToday(dietPlan) {
  const week = Array.isArray(dietPlan?.week)
    ? dietPlan.week
    : Array.isArray(dietPlan?.plan)
      ? dietPlan.plan
      : [];

  if (week.length === 0) return null;

  const createdAtMs = Date.parse(dietPlan?.created_at || dietPlan?.createdAt || "");

  if (!Number.isNaN(createdAtMs)) {
    const elapsedDays = getLocalDayDiff(new Date(createdAtMs), new Date());
    const currentPlanDay = week[elapsedDays];

    return getMealCountFromDietDay(currentPlanDay);
  }

  const mondayFirstDayIndex = (new Date().getDay() + 6) % 7;

  return getMealCountFromDietDay(week[mondayFirstDayIndex % week.length]);
}

function getMealCountFromDietDay(day) {
  const meals = Array.isArray(day?.meals)
    ? day.meals
    : Object.values(day?.meals || {});

  return meals.length > 0 ? meals.length : null;
}

function getLocalDayDiff(fromDate, toDate) {
  const from = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}
