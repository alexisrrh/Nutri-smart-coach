import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import AIHeroCard from "../components/dashboard/AIHeroCard";
import DashboardActions from "../components/dashboard/DashboardActions";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

import { API_URL } from "../config/api";
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
  const [dietPlans, setDietPlans] = useState([]);
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
        fetch(`${API_URL}/diet-plans/${userId}`),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setProfile(profileRes.value);
      }

      if (mealsRes.status === "fulfilled") {
        setMeals(mealsRes.value);
      }

      if (dietsRes.status === "fulfilled" && dietsRes.value.ok) {
        const data = await dietsRes.value.json();
        setDietPlans(data.diet_plans || []);
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


      <DashboardActions navigate={navigate} />
    </DashboardLayout>
  );
}
