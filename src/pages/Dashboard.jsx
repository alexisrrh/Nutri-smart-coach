import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Sparkles } from "lucide-react";
import { AppShell } from "../components/ui";
import { supabase } from "../lib/supabase";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import AIHeroCard from "../components/dashboard/AIHeroCard";
import DashboardActions from "../components/dashboard/DashboardActions";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

import { getCachedDietPlans, listDietPlans } from "../services/dietService";
import { getCachedMeals, listMeals } from "../services/mealService";
import { getCachedProfile, getProfile } from "../services/profileService";

import {
  getGoals,
  getSmartTip,
  getFirstName,
} from "../components/dashboard/dashboardUtils";

export function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => getCachedProfile());
  const [meals, setMeals] = useState(() => getCachedMeals());
  const [dietPlans, setDietPlans] = useState(() => getCachedDietPlans());
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadRemoteDashboardData = useCallback(async () => {
    setLoadingData(true);
    setLoadError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cachedProfile = getCachedProfile();
      const userId = user?.id || cachedProfile?.id || cachedProfile?.user_id;

      if (!userId) {
        setLoadError("Sesión no válida. Vuelve a iniciar sesión.");
        return;
      }

      const [profileRes, mealsRes, dietsRes] = await Promise.allSettled([
        getProfile(userId, { fallbackToCache: false }),
        listMeals(userId, { fallbackToCache: false }),
        listDietPlans(userId, { fallbackToCache: false }),
      ]);

      const errors = [];

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value || null);
      } else {
        errors.push(profileRes.reason);
      }

      if (mealsRes.status === "fulfilled") {
        setMeals(mealsRes.value || []);
      } else {
        errors.push(mealsRes.reason);
      }

      if (dietsRes.status === "fulfilled") {
        setDietPlans(dietsRes.value || []);
      } else {
        errors.push(dietsRes.reason);
      }

      if (errors.length > 0) {
        setLoadError(formatDashboardError(errors[0], errors.length));
      }
    } catch (error) {
      setLoadError(formatDashboardError(error, 1));
    } finally {
      setLoadingData(false);
    }
  }, []);

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

  if (loadingData) {
    return (
      <AppShell className="overflow-hidden" contentClassName="px-2 pt-2">
        <div className="flex h-full min-h-0 flex-col gap-1 bg-[#06110e]">
          <div className="shrink-0">
            <DashboardHeader loadingData={loadingData} navigate={navigate} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <DashboardSkeleton />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="overflow-hidden" contentClassName="px-2 pt-2">
      <div className="flex h-full min-h-0 flex-col gap-1 bg-[#06110e]">
        <div className="shrink-0">
          <DashboardHeader loadingData={loadingData} navigate={navigate} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-1.5">
            {loadError ? (
              <DashboardSyncBanner
                message={loadError}
                onRetry={loadRemoteDashboardData}
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
              />
            </div>

            <div className="shrink-0 pt-0.5">
              <DashboardMotivationCard message={motivationMessage} />
            </div>

            <div className="shrink-0">
              <DashboardActions navigate={navigate} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DashboardSyncBanner({ message, onRetry }) {
  return (
    <section className="relative overflow-hidden rounded-[0.9rem] border border-amber-400/12 bg-[#07170f]/92 px-2 py-1.5 shadow-[0_10px_28px_rgba(16,185,129,0.06)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,#f59e0b16,transparent_36%),radial-gradient(circle_at_100%_50%,#10b98112,transparent_34%)]" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-amber-400/15 bg-amber-400/10 text-amber-300">
          <AlertCircle size={12} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300/70">
            Sincronización
          </p>

          <p className="mt-0.5 text-[11px] font-bold leading-[1.2] text-white/72">
            {message}
          </p>
        </div>

        <button
          onClick={onRetry}
          className="shrink-0 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-300 transition hover:bg-emerald-400/15"
        >
          Reintentar
        </button>
      </div>
    </section>
  );
}

function DashboardMotivationCard({ message }) {
  return (
    <section className="relative overflow-hidden rounded-[0.9rem] border border-emerald-300/10 bg-[#07170f]/90 px-2 py-1.5 shadow-[0_10px_28px_rgba(16,185,129,0.06)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,#22d3ee17,transparent_40%),radial-gradient(circle_at_100%_50%,#10b98114,transparent_34%)]" />

      <div className="relative z-10 flex items-center gap-2">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
          <Sparkles size={12} />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300/60">
            Impulso IA
          </p>

          <p className="mt-0.5 line-clamp-1 text-[11px] font-bold leading-[1.2] text-white/72">
            {message}
          </p>
        </div>
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
