import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  getCheckinProcessState,
  listCheckins,
  setCheckinProcessState,
} from "../../services/checkinService";
import { getCachedProfile } from "../../services/profileService";

export function useCheckInLoad() {
  const isMountedRef = useRef(true);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(() =>
    isRecentCheckInProcessState(getCheckinProcessState())
  );
  const [error, setError] = useState(() => {
    const storedState = getCheckinProcessState();
    return storedState.status === "error" ? storedState.error || "" : "";
  });
  const [selectedCheckin, setSelectedCheckin] = useState(() => {
    const storedState = getCheckinProcessState();
    return storedState.status === "success" ? storedState.result || null : null;
  });
  const [sheetMode, setSheetMode] = useState(() => {
    const storedState = getCheckinProcessState();
    return storedState.status === "success" ? "analysis" : "detail";
  });

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setError("");
    setProfile(getCachedProfile());

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (isMountedRef.current) {
        setError("Necesitas iniciar sesión para guardar tu check-in físico.");
      }
      return;
    }

    if (!isMountedRef.current) return;
    setUser(user);

    try {
      const checkins = await listCheckins(user.id);
      if (!isMountedRef.current) return;
      setHistory(checkins);
    } catch (err) {
      console.error(err);
      if (isMountedRef.current) {
        setError("No se pudo cargar el historial de check-ins.");
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    Promise.resolve().then(loadData);

    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      const storedState = getCheckinProcessState();

      if (storedState.status === "loading") {
        if (isRecentCheckInProcessState(storedState)) {
          setLoading(true);
        } else {
          const staleState = {
            ...storedState,
            status: "error",
            updatedAt: new Date().toISOString(),
            error:
              "La IA está tardando demasiado. Vuelve a intentarlo en unos segundos.",
          };
          setCheckinProcessState(staleState);
          setLoading(false);
          setError(staleState.error);
        }
      }

      if (storedState.status === "success" && storedState.result) {
        setSelectedCheckin(storedState.result);
        setSheetMode("analysis");
        setHistory((prev) => mergeCheckinsIntoHistory(prev, storedState.result));
        setLoading(false);
        setError("");
      }

      if (storedState.status === "error" && storedState.error) {
        setLoading(false);
        setError(storedState.error);
      }
    });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [loadData]);

  useEffect(() => {
    if (!loading) return;

    const intervalId = setInterval(() => {
      const storedState = getCheckinProcessState();

      if (storedState.status === "success" && storedState.result) {
        setHistory((prev) => mergeCheckinsIntoHistory(prev, storedState.result));
        setSelectedCheckin(storedState.result);
        setSheetMode("analysis");
        setError("");
        setLoading(false);
        clearInterval(intervalId);
        return;
      }

      if (storedState.status === "error") {
        setError(storedState.error || "No se pudo guardar el check-in.");
        setLoading(false);
        clearInterval(intervalId);
      }
    }, 1200);

    return () => clearInterval(intervalId);
  }, [loading]);

  return {
    error,
    history,
    isMountedRef,
    loading,
    profile,
    selectedCheckin,
    setError,
    setHistory,
    setLoading,
    setSelectedCheckin,
    setSheetMode,
    setUser,
    sheetMode,
    user,
  };
}

function isRecentCheckInProcessState(state, maxAgeMs = 3 * 60 * 1000) {
  if (!state || state.status !== "loading" || !state.startedAt) {
    return false;
  }

  const startedAtMs = Date.parse(state.startedAt);
  if (Number.isNaN(startedAtMs)) return true;

  return Date.now() - startedAtMs <= maxAgeMs;
}

function mergeCheckinsIntoHistory(history, checkin) {
  if (!checkin) return history;

  const nextHistory = history.filter(
    (item) => String(item.id) !== String(checkin.id)
  );

  return [checkin, ...nextHistory];
}
