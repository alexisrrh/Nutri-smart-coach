import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../services/analytics";
import AIScanHero from "../components/food/AIScanHero";
import FoodUploadCard from "../components/food/FoodUploadCard";
import FoodScannerLoader from "../components/food/FoodScannerLoader";
import FoodResultCard from "../components/food/FoodResultCard";
import NutritionInsights from "../components/food/NutritionInsights";
import SmartSwapCard from "../components/food/SmartSwapCard";
import DailyGoalCard from "../components/food/DailyGoalCard.jsx";
import { AiErrorNotice, AiUsageCard, AppShell } from "../components/ui";

import { useFoodPhotoAnalysis } from "../hooks/food-photo/useFoodPhotoAnalysis";
import { useFoodPhotoImageUpload } from "../hooks/food-photo/useFoodPhotoImageUpload";
import { useFoodPhotoRecovery } from "../hooks/food-photo/useFoodPhotoRecovery";
import { useAiUsageStatus } from "../hooks/useAiUsageStatus";
import { supabase } from "../lib/supabase";
import { calculateNutritionGoals } from "../services/nutritionGoalsService";
import { getCachedProfile, getProfile } from "../services/profileService";

export default function FoodPhoto() {
  const { t, i18n } = useTranslation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState(getCachedProfile);
  const [userId, setUserId] = useState("");
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
  const {
    captureFoodPhoto,
    handleCameraCapture,
    handleImage,
    isNativeCameraAvailable,
  } = useFoodPhotoImageUpload({
    preview,
    setPreview,
    setImage,
    setError,
    setResult,
  });
  const goals = useMemo(() => calculateNutritionGoals(profile), [profile]);
  const {
    refreshUsage: refreshFoodUsage,
    usage: foodUsage,
  } = useAiUsageStatus("food_analysis", userId);
  const analysisContext = useMemo(
    () => ({
      goal: profile?.goal || profile?.objetivo || "general",
      caloriesGoal: goals.calories,
      proteinGoal: goals.protein,
      weight: profile?.weight ?? profile?.peso ?? null,
      height: profile?.height ?? profile?.altura ?? null,
      level:
        profile?.level ||
        profile?.training_level ||
        profile?.activity_level ||
        profile?.activity ||
        "",
      phase: profile?.phase || profile?.fase || profile?.preferences?.phase || profile?.preferences?.fase || "",
    }),
    [goals.calories, goals.protein, profile]
  );
  const { analyzeFood, discardAnalysis } = useFoodPhotoAnalysis({
    image,
    preview,
    description,
    language: normalizeAnalysisLanguage(i18n.resolvedLanguage || i18n.language),
    profileContext: analysisContext,
    loading,
    setAnalysisState,
    setLoading,
    setResult,
    setError,
    setMeals,
    isMountedRef,
    resetRecoveryState,
    result,
    onUsageUpdated: refreshFoodUsage,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id || cancelled) return;

      setUserId(user.id);

      try {
        const profileData = await getProfile(user.id);
        if (!cancelled) setProfile(profileData);
      } catch (profileError) {
        console.warn(t("food.errors.profileLoadFailed"), profileError);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [t]);

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

  useEffect(() => {
    if (!result) return;

    trackEvent("analyze_food", {
      food: result.food || "unknown",
      calories: Number(result.calories || 0),
      protein: Number(result.protein || 0),
      score: Number(result.score || 0),
    });
  }, [result]);


  return (
    <AppShell
      className="overflow-hidden pb-2"
      contentClassName="px-2 pt-2"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-1">
        {(!result || loading) && <AIScanHero />}

        <AiUsageCard
          profile={profile}
          type="food_analysis"
          usage={foodUsage}
          className="shrink-0"
        />

        <p className="px-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
          {t("food.usage.planNotice", { free: 3, premium: 20 })}
        </p>

        {!result && !loading && (
          <FoodUploadCard
            preview={preview}
            description={description}
            onDescriptionChange={setDescription}
            captureFoodPhoto={captureFoodPhoto}
            handleCameraCapture={handleCameraCapture}
            handleImage={handleImage}
            isNativeCameraAvailable={isNativeCameraAvailable}
            analyzeFood={analyzeFood}
            loading={loading}
          />
        )}

        <AiErrorNotice message={error} />

        {loading && <FoodScannerLoader preview={preview} />}

        {result && !loading && (
          <>
            <div className="space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    {t("food.actions.analyzeAnother")}
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
                    {t("food.actions.discardAnalysis")}
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

function normalizeAnalysisLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();

  return normalized.startsWith("en") ? "en" : "es";
}
