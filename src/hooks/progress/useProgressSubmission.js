import { useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../components/ui";
import { createProgressLog } from "../../services/progressService";

export function useProgressSubmission({ getLogs, setErrorMessage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [peso, setPeso] = useState("");
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef(null);

  const clearSavedTimer = () => {
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setSaved(false);
    setErrorMessage("");

    try {
      await createProgressLog({
        userId: user.id,
        weight: peso,
        note: nota,
      });

      setPeso("");
      setNota("");
      setSaved(true);
      toast.success("Check-in guardado correctamente.");
      getLogs();

      clearSavedTimer();
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      console.error("Error guardando progreso:", error);
      setErrorMessage(error.message || "No se pudo guardar tu progreso.");
      toast.error("No se pudo guardar el check-in.");
    } finally {
      setLoading(false);
    }
  };

  return {
    peso,
    setPeso,
    nota,
    setNota,
    loading,
    saved,
    setSaved,
    handleSubmit,
  };
}
