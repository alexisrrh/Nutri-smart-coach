import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import AIHeroCard from "../components/dashboard/AIHeroCard";
import DashboardMacrosGrid from "../components/dashboard/DashboardMacrosGrid";
import DashboardActions from "../components/dashboard/DashboardActions";
import DashboardInfoGrid from "../components/dashboard/DashboardInfoGrid";
import SmartInsightCard from "../components/dashboard/SmartInsightCard";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import { API_URL } from "../config/api";
import { STORAGE_KEYS } from "../config/storageKeys";
import {
  getGoals,
  getSmartTip,
  getFirstName,
  shortText,
  safeParse,
} from "../components/dashboard/dashboardUtils";




export function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
useEffect(() => {
  const savedProfile = safeParse(
    localStorage.getItem(STORAGE_KEYS.PROFILE),
    null
  );

  const localMeals = safeParse(
    localStorage.getItem(STORAGE_KEYS.MEALS),
    []
  );

  setProfile(savedProfile);
  setMeals(localMeals);
  setLoadingData(false);

  loadRemoteDashboardData(savedProfile, localMeals);
}, []);

  async function loadRemoteDashboardData(savedProfile, localMeals) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || savedProfile?.id || savedProfile?.user_id;

      if (!userId) return;

      const [mealsRes, checkinsRes, dietsRes] = await Promise.allSettled([
        fetch(`${API_URL}/meal-analyses/${userId}`),
        fetch(`${API_URL}/checkins/${userId}`),
        fetch(`${API_URL}/diet-plans/${userId}`),
      ]);

      if (mealsRes.status === "fulfilled" && mealsRes.value.ok) {
        const data = await mealsRes.value.json();
        const remoteMeals = data.meal_analyses || localMeals;

        setMeals(remoteMeals);
     localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(remoteMeals));
      }

      if (checkinsRes.status === "fulfilled" && checkinsRes.value.ok) {
        const data = await checkinsRes.value.json();
        setCheckins(data.checkins || []);
      }

      if (dietsRes.status === "fulfilled" && dietsRes.value.ok) {
        const data = await dietsRes.value.json();
        setDietPlans(data.diet_plans || []);
      }
    } catch (error) {
      console.error("Error cargando dashboard remoto:", error);
    }
  }

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

  const lastMeal = meals[0];
  const lastCheckin = checkins[0];
  const activeDiet = dietPlans[0];

  const firstName = getFirstName(profile?.name || profile?.nombre);

  const smartTip = getSmartTip(
    totals,
    goals,
    todayMeals.length,
    Boolean(activeDiet)
  );

  if (loadingData && !profile && meals.length === 0) {
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
        navigate={navigate}
        smartTip={smartTip}
        todayMeals={todayMeals}
      />

      <DashboardMacrosGrid totals={totals} goals={goals} />

      <DashboardActions navigate={navigate} />

      <SmartInsightCard
        smartTip={smartTip}
        nutritionScore={nutritionScore}
        mealCount={todayMeals.length}
        hasDiet={Boolean(activeDiet)}
      />

      <DashboardInfoGrid
        lastMeal={lastMeal}
        lastCheckin={lastCheckin}
        navigate={navigate}
        shortText={shortText}
      />
    </DashboardLayout>
  );
}