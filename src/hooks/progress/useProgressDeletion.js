import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../components/ui";
import { deleteCheckin } from "../../services/checkinService";

export function useProgressDeletion({
  setCheckins,
  setErrorMessage,
  selectedCheckin,
  setSelectedCheckin,
}) {
  const { user } = useAuth();
  const userId = user?.id;
  const toast = useToast();
  const [checkinToDelete, setCheckinToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteCheckin = async (checkin) => {
    if (!checkin?.id || !userId || deletingId) return;

    try {
      setCheckinToDelete(null);
      setDeletingId(checkin.id);
      setErrorMessage("");

      await deleteCheckin(checkin.id, userId);

      setCheckins((prev) =>
        prev.filter((item) => String(item.id) !== String(checkin.id))
      );

      if (String(selectedCheckin?.id) === String(checkin.id)) {
        setSelectedCheckin(null);
      }

      toast.success("Check-in eliminado.");
    } catch (error) {
      console.error("Error borrando check-in:", error);
      setErrorMessage(error.message || "No se pudo borrar el check-in.");
      toast.error("No se pudo eliminar el check-in.");
    } finally {
      setDeletingId(null);
    }
  };

  return {
    checkinToDelete,
    setCheckinToDelete,
    deletingId,
    handleDeleteCheckin,
  };
}
