import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../components/ui";
import { listProgressLogs } from "../../services/progressService";
import { listCheckins } from "../../services/checkinService";

export function useProgressData() {
  const { user } = useAuth();
  const userId = user?.id;
  const toast = useToast();
  const loadErrorToastShownRef = useRef(false);

  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [usingCache, setUsingCache] = useState(false);

  const showLoadErrorToast = useCallback(() => {
    if (loadErrorToastShownRef.current) return;

    loadErrorToastShownRef.current = true;
    toast.error("No se pudo cargar el progreso.");
  }, [toast]);

  const getLogs = useCallback(async () => {
    if (!userId) return;

    setLoadingLogs(true);

    try {
      const result = await listProgressLogs(userId, { includeMeta: true });

      setLogs(result.logs);
      setUsingCache(result.fromCache && Boolean(result.error));
    } catch (error) {
      console.error("Error cargando progreso:", error);
      setErrorMessage("No se pudo cargar tu progreso.");
      showLoadErrorToast();
    } finally {
      setLoadingLogs(false);
    }
  }, [showLoadErrorToast, userId]);

  const getCheckins = useCallback(async () => {
    if (!userId) return;

    setLoadingCheckins(true);

    try {
      const checkinLogs = await listCheckins(userId);

      setCheckins(checkinLogs);
    } catch (error) {
      console.error("Error cargando check-ins:", error);
      setErrorMessage("No se pudieron cargar tus check-ins.");
      showLoadErrorToast();
    } finally {
      setLoadingCheckins(false);
    }
  }, [showLoadErrorToast, userId]);

  useEffect(() => {
    if (user) {
      loadErrorToastShownRef.current = false;
      Promise.resolve().then(getLogs);
      Promise.resolve().then(getCheckins);
    }
  }, [getCheckins, getLogs, user]);

  const refreshLogs = useCallback(async () => {
    await getLogs();
  }, [getLogs]);

  return {
    userId,
    logs,
    setLogs,
    checkins,
    setCheckins,
    loadingLogs,
    loadingCheckins,
    errorMessage,
    setErrorMessage,
    usingCache,
    refreshLogs,
    getLogs,
    getCheckins,
  };
}
