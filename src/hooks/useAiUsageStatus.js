import { useCallback, useEffect, useState } from "react";
import {
  createFallbackAiUsageState,
  extractAiUsageFromError,
  fetchDailyAiUsage,
  getAiUsageForType,
} from "../services/aiUsageService";

export function useAiUsageStatus(type, userId) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));

  const refreshUsage = useCallback(
    async (nextUserId = userId) => {
      if (!nextUserId) {
        setUsage(null);
        return null;
      }

      setLoading(true);

      try {
        const summary = await fetchDailyAiUsage(nextUserId);
        const nextUsage = getAiUsageForType(summary.usage, type);
        setUsage(nextUsage || null);
        return nextUsage || null;
      } catch (error) {
        const nextUsage = extractAiUsageFromError(error, type);
        if (nextUsage) {
          setUsage(nextUsage);
          return nextUsage;
        }

        const fallbackUsage = createFallbackAiUsageState(type);
        setUsage(fallbackUsage);
        console.warn("No se pudo sincronizar el uso diario de IA:", {
          type,
          userId: nextUserId || null,
          status: error?.status || null,
          code: error?.code || null,
          message: error?.message || "",
        });

        return fallbackUsage;
      } finally {
        setLoading(false);
      }
    },
    [type, userId]
  );

  const applyUsageError = useCallback(
    (error) => {
      const nextUsage = extractAiUsageFromError(error, type);
      if (nextUsage) {
        setUsage(nextUsage);
      }
      return nextUsage;
    },
    [type]
  );

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) return;
      await refreshUsage(userId);
    });

    return () => {
      cancelled = true;
    };
  }, [refreshUsage, userId]);

  return {
    applyUsageError,
    loading,
    refreshUsage,
    setUsage,
    usage,
  };
}
