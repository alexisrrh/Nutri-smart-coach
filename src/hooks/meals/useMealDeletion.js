import { useCallback, useState } from "react";
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
            throw new Error("No hay usuario conectado para borrar esta comida.");
          }

          await deleteRemoteMeal(mealId, user.id);
          toast.success("Comida eliminada del historial.");
        }

        const updated = removeMealFromCache(mealToDelete);
        setMeals(updated);
        if (selectedMeal?.id === mealId) {
          setSelectedMeal(null);
        }
      } catch (error) {
        console.error("Error borrando comida:", error);
        toast.error("No se pudo borrar la comida.");
        setRemoteError(
          error?.message ||
            "No se pudo borrar en remoto. El historial local se mantiene intacto."
        );
      } finally {
        setDeletingId("");
      }
    },
    [selectedMeal, setMeals, setRemoteError, setSelectedMeal, toast]
  );

  const clearMeals = useCallback(async () => {
    try {
      setRemoteError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error("No hay usuario conectado para borrar el historial remoto.");
      }

      await clearRemoteMeals(user.id);

      setMeals([]);
      if (selectedMeal) {
        setSelectedMeal(null);
      }
      toast.success("Historial de comidas borrado.");
    } catch (error) {
      console.error("Error limpiando historial:", error);
      toast.error("No se pudo borrar el historial.");
      setRemoteError(
        error?.message ||
          "No se pudo borrar el historial remoto. El historial local se mantiene intacto."
      );
    }
  }, [selectedMeal, setMeals, setRemoteError, setSelectedMeal, toast]);

  return {
    deletingId,
    deleteMeal,
    clearMeals,
  };
}
