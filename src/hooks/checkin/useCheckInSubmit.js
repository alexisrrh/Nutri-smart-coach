import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  extractAiUsageFromError,
  formatAiUsageMessage,
} from "../../services/aiUsageService";
import {
  createCheckin,
  getCheckinProcessState,
  setCheckinProcessState,
} from "../../services/checkinService";

export function useCheckInSubmit({
  clearUpload,
  file,
  form,
  isMountedRef,
  resetForm,
  setError,
  setLoading,
  setSelectedCheckin,
  setSheetMode,
  onUsageUpdated,
  user,
}) {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState("");
  const clearMessage = useCallback(() => setMessage(""), []);
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "es";

  const createCheckInRequestId = useCallback(
    () => `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const createCheckinWithRetry = useCallback(async (args) => {
    try {
      return await createCheckin(args);
    } catch (error) {
      if (error?.code !== "REQUEST_TIMEOUT") {
        throw error;
      }

      return createCheckin(args);
    }
  }, []);

  const saveCheckIn = useCallback(async () => {
    setError("");
    setMessage("");

    if (!user) {
      setError(t("checkin.errors.loginRequiredShort"));
      return;
    }

    if (!file) {
      setError(t("checkin.errors.photoRequired"));
      return;
    }

    if (!form.weight) {
      setError(t("checkin.errors.weightRequired"));
      return;
    }

    try {
      const requestId = createCheckInRequestId();
      const startedAt = new Date().toISOString();
      const loadingState = {
        status: "loading",
        startedAt,
        updatedAt: startedAt,
        requestId,
        result: null,
        error: "",
      };

      setCheckinProcessState(loadingState);
      setLoading(true);
      setSelectedCheckin(null);
      setSheetMode("detail");

      const checkin = await createCheckinWithRetry({
        userId: user.id,
        image: file,
        weight: form.weight,
        waist: form.waist,
        chest: form.chest,
        hips: form.hips,
        notes: form.notes,
        language: activeLanguage,
      });

      const latestState = getCheckinProcessState();

      if (latestState.requestId && latestState.requestId !== requestId) {
        return;
      }

      setSheetMode("analysis");
      setSelectedCheckin(checkin);

      clearUpload();
      resetForm();

      const successState = {
        status: "success",
        startedAt,
        updatedAt: new Date().toISOString(),
        requestId,
        result: checkin,
        error: "",
      };

      setCheckinProcessState(successState);

      setMessage(t("checkin.success.saved"));
      onUsageUpdated?.(user.id);
    } catch (err) {
      console.error(err);

      const usageError = extractAiUsageFromError(err, "checkin_analysis");
      const errorMessage =
        usageError && err?.status === 429
          ? formatAiUsageMessage("checkin_analysis", usageError)
          : err.message ||
            t("checkin.errors.aiTimeout");

      const currentState = getCheckinProcessState();
      const requestId = currentState.requestId || null;
      const startedAt = currentState.startedAt || new Date().toISOString();
      const errorState = {
        status: "error",
        startedAt,
        updatedAt: new Date().toISOString(),
        requestId,
        result: null,
        error: errorMessage,
      };

      setCheckinProcessState(errorState);
      if (isMountedRef.current) {
        setError(errorMessage);
      }

      if (usageError) {
        onUsageUpdated?.(user.id);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    clearUpload,
    createCheckInRequestId,
    createCheckinWithRetry,
    file,
    form,
    isMountedRef,
    resetForm,
    setError,
    setLoading,
    setSelectedCheckin,
    setSheetMode,
    onUsageUpdated,
    user,
    t,
    activeLanguage,
  ]);

  return {
    clearMessage,
    message,
    saveCheckIn,
  };
}
