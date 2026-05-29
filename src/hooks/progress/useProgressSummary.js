import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import {
  getCachedProgressSummary,
  loadProgressSummary,
} from "../../services/progressService";

export function useProgressSummary() {
  const { user, loadingAuth } = useAuth();
  const userId = user?.id || null;
  const loadTokenRef = useRef(0);

  const [summary, setSummary] = useState(() =>
    getCachedProgressSummary(userId)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!userId) {
      setSummary(getCachedProgressSummary(userId));
      setLoading(false);
      return getCachedProgressSummary(userId);
    }

    const currentToken = ++loadTokenRef.current;
    setLoading(true);
    setError("");

    try {
      const nextSummary = await loadProgressSummary(userId);
      if (loadTokenRef.current === currentToken) {
        setSummary(nextSummary);
      }

      return nextSummary;
    } catch (loadError) {
      if (loadTokenRef.current === currentToken) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar tu progreso."
        );
      }

      throw loadError;
    } finally {
      if (loadTokenRef.current === currentToken) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (loadingAuth) return;

    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;

      const cachedSummary = getCachedProgressSummary(userId);
      setSummary(cachedSummary);
      setError("");

      if (!userId) {
        setLoading(false);
        return;
      }

      const currentToken = ++loadTokenRef.current;
      setLoading(true);

      void loadProgressSummary(userId)
        .then((nextSummary) => {
          if (active && loadTokenRef.current === currentToken) {
            setSummary(nextSummary);
          }
        })
        .catch((loadError) => {
          if (active && loadTokenRef.current === currentToken) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "No se pudo cargar tu progreso."
            );
          }
        })
        .finally(() => {
          if (active && loadTokenRef.current === currentToken) {
            setLoading(false);
          }
        });
    });

    return () => {
      active = false;
    };
  }, [loadingAuth, userId]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
