import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

import DashboardLayout from "../components/dashboard/DashboardLayout";
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

  const [profile, setProfile] = useState(getCachedProfile);
  const [meals, setMeals] = useState(getCachedMeals);
  const [dietPlans, setDietPlans] = useState(getCachedDietPlans);
  const [loadingData] = useState(false);

  async function loadRemoteDashboardData(savedProfile) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || savedProfile?.id || savedProfile?.user_id;

      if (!userId) return;

      const [profileRes, mealsRes, dietsRes] = await Promise.allSettled([
        getProfile(userId),
        listMeals(userId),
        listDietPlans(userId),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setProfile(profileRes.value);
      }

      if (mealsRes.status === "fulfilled") {
        setMeals(mealsRes.value);
      }

      if (dietsRes.status === "fulfilled") {
        setDietPlans(dietsRes.value);
      }
    } catch (error) {
      console.error("Error cargando dashboard remoto:", error);
    }
  }

  useEffect(() => {
    const savedProfile = getCachedProfile();

    // Cargar backend en segundo plano
    Promise.resolve().then(() => {
      loadRemoteDashboardData(savedProfile);
    });
  }, []);

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
      Math.round(
        (proteinScore + caloriesScore + carbsScore + fatScore) * 10
      ) / 10
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
    [todayMeals.length, activeDiet, nutritionScore, totals.protein, goals.protein, firstName]
  );

  if (loadingData) {
    return (
      <DashboardLayout>
        <DashboardHeader loadingData={loadingData} navigate={navigate} />
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader loadingData={loadingData} navigate={navigate} />

      <AIHeroCard
  firstName={firstName}
  nutritionScore={nutritionScore}
  totals={totals}
  goals={goals}
  navigate={navigate}
  smartTip={smartTip}
  todayMeals={todayMeals}
/>

      <DashboardMotivationCard message={motivationMessage} />

      <DashboardActions navigate={navigate} />
    </DashboardLayout>
  );
}

function DashboardMotivationCard({ message }) {
  return (
    <section className="relative overflow-hidden rounded-[1.2rem] border border-emerald-300/15 bg-[#07170f]/92 px-3 py-2.5 shadow-[0_14px_42px_rgba(16,185,129,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,#22d3ee17,transparent_40%),radial-gradient(circle_at_100%_50%,#10b98114,transparent_34%)]" />

      <div className="relative z-10 flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
          <Sparkles size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-300/65">
            Impulso IA
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-4 text-white/72">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
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
    Number(proteinGoal || 0) > 0 ? Number(protein || 0) / Number(proteinGoal) : 0;

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
