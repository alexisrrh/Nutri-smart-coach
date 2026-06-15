import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import {
  getCheckinProcessState,
  listCheckins,
  setCheckinProcessState,
} from "../../services/checkinService";
import { getCachedProfile } from "../../services/profileService";

export function useCheckInLoad() {
  const { t } = useTranslation();
  const isMountedRef = useRef(true);

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [loading, setLoading] = useState(() =>
    isRecentCheckInProcessState(getCheckinProcessState())
  );

  const [error, setError] = useState(() => {
    const storedState = getCheckinProcessState();
    return storedState.status === "error"
      ? localizeCheckinError(storedState.error || "", t)
      : "";
  });

  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [sheetMode, setSheetMode] = useState("detail");

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setInitialLoading(true);
    setError("");
    setProfile(getCachedProfile());

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (isMountedRef.current) {
        setError(t("checkin.errors.loginRequired"));
        setInitialLoading(false);
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
        setError(t("checkin.errors.loadHistory"));
      }
    } finally {
      if (isMountedRef.current) {
        setInitialLoading(false);
      }
    }
  }, [t]);

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
            error: t("checkin.errors.aiTimeout"),
          };

          setCheckinProcessState(staleState);
          setLoading(false);
          setError(staleState.error);
        }
      }

      if (storedState.status === "success" && storedState.result) {
        setHistory((prev) => mergeCheckinsIntoHistory(prev, storedState.result));
        setLoading(false);
        setError("");

        setCheckinProcessState({
          status: "idle",
          result: null,
          error: "",
          updatedAt: new Date().toISOString(),
        });
      }

      if (storedState.status === "error" && storedState.error) {
        setLoading(false);
        setError(localizeCheckinError(storedState.error, t));
      }
    });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [loadData, t]);

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

        setCheckinProcessState({
          status: "idle",
          result: null,
          error: "",
          updatedAt: new Date().toISOString(),
        });

        clearInterval(intervalId);
        return;
      }

      if (storedState.status === "error") {
        setError(
          localizeCheckinError(storedState.error || t("checkin.errors.saveFailed"), t)
        );
        setLoading(false);
        clearInterval(intervalId);
      }
    }, 1200);

    return () => clearInterval(intervalId);
  }, [loading, t]);

  return {
    error,
    history,
    initialLoading,
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

function localizeCheckinError(message, t) {
  const normalized = String(message || "").toLowerCase();

  if (!normalized) return "";
  if (
    normalized.includes("guardar tu check-in") ||
    normalized.includes("save the check-in") ||
    normalized.includes("guardar el check-in") ||
    normalized.includes("save a check-in")
  ) {
    return t("checkin.errors.saveFailed");
  }

  if (
    normalized.includes("historial de check-ins") ||
    normalized.includes("check-in history") ||
    normalized.includes("loading check-ins")
  ) {
    return t("checkin.errors.loadHistory");
  }

  if (
    normalized.includes("iniciar sesión") ||
    normalized.includes("sign in") ||
    normalized.includes("sign in to save")
  ) {
    return t("checkin.errors.loginRequired");
  }

  if (
    normalized.includes("tardando demasiado") ||
    normalized.includes("taking too long") ||
    normalized.includes("too long")
  ) {
    return t("checkin.errors.aiTimeout");
  }

  return message;
}
