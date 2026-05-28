import { useCallback, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  analyzeMeal,
  cacheMeal,
  deleteMeal,
  getFoodAnalysisProcessState,
  removeMealFromCache,
  setFoodAnalysisProcessState,
} from "../../services/mealService";
import {
  extractAiUsageFromError,
  formatAiUsageMessage,
} from "../../services/aiUsageService";

function createAnalysisRequestId() {
  return `food-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function analyzeMealWithRetry(args) {
  try {
    return await analyzeMeal(args);
  } catch (error) {
    if (error?.code !== "REQUEST_TIMEOUT") {
      throw error;
    }

    return analyzeMeal(args);
  }
}

export function useFoodPhotoAnalysis({
  image,
  preview,
  description,
  profileContext = null,
  loading,
  setAnalysisState,
  setLoading,
  setResult,
  setError,
  setMeals,
  isMountedRef,
  resetRecoveryState,
  result,
  onUsageUpdated,
}) {
  const analysisInFlightRef = useRef(false);

  const analyzeFood = useCallback(async () => {
    const trimmedDescription = description.trim();

    if (!image && !trimmedDescription) {
      setError("Sube una foto o describe tu comida.");

      return;
    }

    if (loading || analysisInFlightRef.current) return;

    analysisInFlightRef.current = true;
    let activeUserId = null;

    try {
      const requestId = createAnalysisRequestId();
      const startedAt = new Date().toISOString();
      const loadingState = {
        status: "loading",
        startedAt,
        updatedAt: startedAt,
        requestId,
        result: null,
        error: "",
      };

      setFoodAnalysisProcessState(loadingState);
      setAnalysisState(loadingState);
      setLoading(true);
      setResult(null);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn("No se pudo obtener usuario Supabase:", userError.message);
      }

      activeUserId = user?.id || null;

      const mealToSave = await analyzeMealWithRetry({
        image,
        description: trimmedDescription,
        goal: profileContext?.goal || "perder_grasa",
        userId: user?.id,
        profileContext,
      });

      const latestState = getFoodAnalysisProcessState();

      if (latestState.requestId && latestState.requestId !== requestId) {
        return;
      }

      const nextMeals = cacheMeal(mealToSave, mealToSave.image_url || preview);
      const successState = {
        status: "success",
        startedAt,
        updatedAt: new Date().toISOString(),
        requestId,
        result: mealToSave,
        error: "",
      };

      setFoodAnalysisProcessState(successState);
      if (isMountedRef.current) {
        setAnalysisState(successState);
        setResult(mealToSave);
        setMeals(nextMeals);
      }

      onUsageUpdated?.(activeUserId);
    } catch (error) {
      console.error("Error analizando comida:", error);

      const usageError = extractAiUsageFromError(error, "food_analysis");
      const errorMessage =
        usageError && error?.status === 429
          ? formatAiUsageMessage("food_analysis", usageError)
          : error?.message ||
            "No se pudo analizar la comida. Revisa la conexión e inténtalo de nuevo.";

      const currentState = getFoodAnalysisProcessState();
      const errorState = {
        status: "error",
        startedAt: currentState.startedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestId: currentState.requestId || null,
        result: null,
        error: errorMessage,
      };

      setFoodAnalysisProcessState(errorState);

      if (isMountedRef.current) {
        setAnalysisState(errorState);
        setError(errorMessage);
      }

      if (usageError) {
        onUsageUpdated?.(activeUserId);
      }
    } finally {
      analysisInFlightRef.current = false;

      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    description,
    image,
    isMountedRef,
    loading,
    preview,
    profileContext,
    setAnalysisState,
    setError,
    setLoading,
    setMeals,
    setResult,
    onUsageUpdated,
  ]);

  const discardAnalysis = useCallback(async () => {
    if (!result) return;

    try {
      setLoading(true);
      setError("");

      if (result.id) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.warn("No se pudo obtener usuario Supabase:", userError.message);
        }

        if (user?.id) {
          await deleteMeal(result.id, user.id);
        }
      }

      setMeals(removeMealFromCache(result));
      resetRecoveryState();
      setResult(null);
      setError("");
      setLoading(false);
    } catch (error) {
      console.error("Error descartando análisis:", error);
      setError(
        error?.message ||
          "No se pudo descartar el análisis. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [
    result,
    resetRecoveryState,
    setError,
    setLoading,
    setMeals,
    setResult,
  ]);

  return {
    analyzeFood,
    discardAnalysis,
  };
}
