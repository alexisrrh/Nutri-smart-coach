import { useEffect, useMemo, useState } from "react";

import AIScanHero from "../components/food/AIScanHero";
import FoodUploadCard from "../components/food/FoodUploadCard";
import FoodScannerLoader from "../components/food/FoodScannerLoader";
import FoodResultCard from "../components/food/FoodResultCard";
import NutritionInsights from "../components/food/NutritionInsights";
import SmartSwapCard from "../components/food/SmartSwapCard";
import DailyGoalCard from "../components/food/DailyGoalCard.jsx";
import { AppShell } from "../components/ui";

import { useFoodPhotoAnalysis } from "../hooks/food-photo/useFoodPhotoAnalysis";
import { useFoodPhotoImageUpload } from "../hooks/food-photo/useFoodPhotoImageUpload";
import { useFoodPhotoRecovery } from "../hooks/food-photo/useFoodPhotoRecovery";
import { supabase } from "../lib/supabase";
import { calculateNutritionGoals } from "../services/nutritionGoalsService";
import { getCachedProfile, getProfile } from "../services/profileService";

export default function FoodPhoto() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const {
    isMountedRef,
    setAnalysisState,
    loading,
    setLoading,
    result,
    setResult,
    error,
    setError,
    meals,
    setMeals,
    resetRecoveryState,
  } = useFoodPhotoRecovery();
  const { handleImage } = useFoodPhotoImageUpload({
    preview,
    setPreview,
    setImage,
    setError,
    setResult,
  });
  const { analyzeFood, discardAnalysis } = useFoodPhotoAnalysis({
    image,
    preview,
    description,
    loading,
    setAnalysisState,
    setLoading,
    setResult,
    setError,
    setMeals,
    isMountedRef,
    resetRecoveryState,
    result,
  });
  const [profile, setProfile] = useState(getCachedProfile);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id || cancelled) return;

      try {
        const profileData = await getProfile(user.id);
        if (!cancelled) setProfile(profileData);
      } catch (profileError) {
        console.warn("No se pudo cargar el perfil para metas:", profileError);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter((meal) => {
      const date = meal.created_at || meal.createdAt;
      if (!date) return false;

      return new Date(date).toDateString() === today;
    });

    return todayMeals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories || 0);
        acc.protein += Number(meal.protein || 0);
        return acc;
      },
      { calories: 0, protein: 0 }
    );
  }, [meals]);

  const goals = useMemo(() => calculateNutritionGoals(profile), [profile]);

  function resetScanner() {
    if (preview) URL.revokeObjectURL(preview);

    resetRecoveryState();
    setImage(null);
    setPreview("");
    setDescription("");
    setResult(null);
    setError("");
    setLoading(false);
  }

  return (
    <AppShell className="overflow-hidden" contentClassName="px-2 pt-2">
      <div className="flex h-full min-h-0 flex-col gap-2">
        {(!result || loading) && <AIScanHero />}

        {!result && !loading && (
          <FoodUploadCard
            preview={preview}
            description={description}
            onDescriptionChange={setDescription}
            handleImage={handleImage}
            analyzeFood={analyzeFood}
            loading={loading}
          />
        )}

        {error && (
          <div className="shrink-0 rounded-[18px] border border-red-400/20 bg-red-400/10 p-2.5 text-xs leading-4 text-red-200">
            {error}
          </div>
        )}

        {loading && <FoodScannerLoader preview={preview} />}

        {result && !loading && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto pb-[140px] pr-0.5 [scrollbar-width:none] md:pb-[150px] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-2">
                <FoodResultCard result={result} preview={preview} />
                <NutritionInsights result={result} />
                <SmartSwapCard result={result} />
                <DailyGoalCard totals={totals} goals={goals} />

                <div className="mb-6 mt-3 grid grid-cols-2 gap-2 md:mb-10">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="rounded-[18px] border px-3 py-3 text-[10px] font-black uppercase leading-3 tracking-[0.1em] shadow-[0_14px_40px_var(--app-glow)] transition active:scale-[0.98]"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "var(--app-primary)",
                      color: "var(--app-surface)",
                    }}
                  >
                    Analizar otra comida
                  </button>

                  <button
                    type="button"
                    onClick={discardAnalysis}
                    className="rounded-[18px] border px-3 py-3 text-[10px] font-black uppercase leading-3 tracking-[0.1em] transition active:scale-[0.98]"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "var(--app-surface)",
                      color: "var(--app-muted)",
                    }}
                  >
                    Descartar análisis
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
