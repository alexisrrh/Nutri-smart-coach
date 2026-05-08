import { Camera, Trophy } from "lucide-react";
import InfoCard from "./InfoCard";

export default function DashboardInfoGrid({
  lastMeal,
  lastCheckin,
  navigate,
  shortText,
}) {
  return (
    <section className="grid grid-cols-2 gap-2">
      <InfoCard
        title="Última comida"
        icon={<Camera size={15} />}
        value={shortText(
          lastMeal?.food || "Sin comida",
          24
        )}
        detail={
          lastMeal
            ? `${Math.round(
                lastMeal.calories || 0
              )} kcal`
            : "Escanea tu primera comida"
        }
        onClick={() => navigate("/foto-comida")}
      />

      <InfoCard
        title="Check-in"
        icon={<Trophy size={15} />}
        value={
          lastCheckin
            ? `${lastCheckin.weight || "-"} kg`
            : "Pendiente"
        }
        detail={
          lastCheckin
            ? new Date(
                lastCheckin.created_at
              ).toLocaleDateString("es-ES")
            : "Registra progreso"
        }
        onClick={() => navigate("/checkin")}
        highlight
      />
    </section>
  );
}