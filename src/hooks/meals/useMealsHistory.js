import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import { getCachedMeals, listMeals } from "../../services/mealService";

export function useMealsHistory() {
  const toast = useToast();
  const { t } = useTranslation();
  const [meals, setMeals] = useState(getCachedMeals);
  const [remoteError, setRemoteError] = useState("");

  const loadRemoteMeals = useCallback(async () => {
    try {
      setRemoteError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;

      setMeals(await listMeals(user.id));
    } catch (error) {
      console.error("Error cargando comidas remotas:", error);
      toast.error(t("meals.errors.loadHistoryToast"));
      setRemoteError(t("meals.errors.remoteHistory"));
    }
  }, [t, toast]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadRemoteMeals();
    });
  }, [loadRemoteMeals]);

  return {
    meals,
    setMeals,
    remoteError,
    setRemoteError,
    loadRemoteMeals,
    refreshMeals: loadRemoteMeals,
  };
}
