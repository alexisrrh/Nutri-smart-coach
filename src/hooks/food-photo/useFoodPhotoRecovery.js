import { useEffect, useRef, useState } from "react";
import {
  clearFoodAnalysisProcessState,
  getCachedMeals,
  getFoodAnalysisProcessState,
  setFoodAnalysisProcessState,
} from "../../services/mealService";

const IDLE_FOOD_ANALYSIS_STATE = {
  status: "idle",
  startedAt: null,
  updatedAt: null,
  requestId: null,
  result: null,
  error: "",
};

function isRecentFoodAnalysisState(state, maxAgeMs = 3 * 60 * 1000) {
  if (!state || state.status !== "loading" || !state.startedAt) {
    return false;
  }

  const startedAtMs = Date.parse(state.startedAt);
  if (Number.isNaN(startedAtMs)) return true;

  return Date.now() - startedAtMs <= maxAgeMs;
}

function getInitialLoadingState() {
  return isRecentFoodAnalysisState(getFoodAnalysisProcessState());
}

function getInitialResultState() {
  const storedState = getFoodAnalysisProcessState();
  return storedState.status === "success" ? storedState.result || null : null;
}

function getInitialErrorState() {
  const storedState = getFoodAnalysisProcessState();
  return storedState.status === "error" ? storedState.error || "" : "";
}

export function useFoodPhotoRecovery() {
  const isMountedRef = useRef(true);
  const [analysisState, setAnalysisState] = useState(() =>
    getFoodAnalysisProcessState()
  );
  const [loading, setLoading] = useState(getInitialLoadingState);
  const [result, setResult] = useState(getInitialResultState);
  const [error, setError] = useState(getInitialErrorState);
  const [meals, setMeals] = useState(getCachedMeals);

  useEffect(() => {
    isMountedRef.current = true;

    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      const storedState = getFoodAnalysisProcessState();

      if (storedState.status === "loading") {
        if (isRecentFoodAnalysisState(storedState)) {
          setLoading(true);
          setError("");
        } else {
          const staleState = {
            ...storedState,
            status: "error",
            updatedAt: new Date().toISOString(),
            error:
              "La IA está tardando demasiado. Vuelve a intentarlo en unos segundos.",
          };
          setFoodAnalysisProcessState(staleState);
          setAnalysisState(staleState);
          setLoading(false);
          setError(staleState.error);
        }
      }

      if (storedState.status === "success" && storedState.result) {
        setResult(storedState.result);
        setMeals(getCachedMeals());
        setLoading(false);
        setError("");
      }

      if (storedState.status === "error" && storedState.error) {
        setError(storedState.error);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const intervalId = setInterval(() => {
      const storedState = getFoodAnalysisProcessState();
      setAnalysisState(storedState);

      if (storedState.status === "success" && storedState.result) {
        setResult(storedState.result);
        setMeals(getCachedMeals());
        setError("");
        setLoading(false);
        clearInterval(intervalId);
        return;
      }

      if (storedState.status === "error") {
        setError(storedState.error || "No se pudo analizar la comida.");
        setLoading(false);
        clearInterval(intervalId);
      }
    }, 1200);

    return () => clearInterval(intervalId);
  }, [loading]);

  const resetRecoveryState = () => {
    clearFoodAnalysisProcessState();
    setAnalysisState(IDLE_FOOD_ANALYSIS_STATE);
    setLoading(false);
    setResult(null);
    setError("");
  };

  return {
    isMountedRef,
    analysisState,
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
  };
}
