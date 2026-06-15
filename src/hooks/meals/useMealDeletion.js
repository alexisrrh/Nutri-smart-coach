import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import {
  clearMeals as clearRemoteMeals,
  deleteMeal as deleteRemoteMeal,
  removeMealFromCache,
} from "../../services/mealService";

export function useMealDeletion({
  setMeals,
  selectedMeal,
  setSelectedMeal,
  setRemoteError,
}) {
  const toast = useToast();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState("");

  const deleteMeal = useCallback(
    async (mealToDelete) => {
      if (!mealToDelete) return;

      const mealId = mealToDelete.id;

      try {
        setRemoteError("");

        if (mealId) {
          setDeletingId(mealId);

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user?.id) {
            throw new Error(t("meals.errors.noUserDelete"));
          }

          await deleteRemoteMeal(mealId, user.id);
          toast.success(t("meals.success.deleteMeal"));
        }

        const updated = removeMealFromCache(mealToDelete);
        setMeals(updated);
        if (selectedMeal?.id === mealId) {
          setSelectedMeal(null);
        }
      } catch (error) {
        console.error("Error borrando comida:", error);
        toast.error(t("meals.errors.deleteMealToast"));
        setRemoteError(
          error?.message ||
            t("meals.errors.deleteMealRemote")
        );
      } finally {
        setDeletingId("");
      }
    },
    [selectedMeal, setMeals, setRemoteError, setSelectedMeal, t, toast]
  );

  const clearMeals = useCallback(async () => {
    try {
      setRemoteError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error(t("meals.errors.noUserClear"));
      }

      await clearRemoteMeals(user.id);

      setMeals([]);
      if (selectedMeal) {
        setSelectedMeal(null);
      }
      toast.success(t("meals.success.clearMeals"));
    } catch (error) {
      console.error("Error limpiando historial:", error);
      toast.error(t("meals.errors.clearMealsToast"));
      setRemoteError(
        error?.message ||
          t("meals.errors.clearMealsRemote")
      );
    }
  }, [selectedMeal, setMeals, setRemoteError, setSelectedMeal, t, toast]);

  return {
    deletingId,
    deleteMeal,
    clearMeals,
  };
}
