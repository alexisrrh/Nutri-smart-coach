import { Camera, Trophy } from "lucide-react";
import InfoCard from "./InfoCard";

export default function DashboardInfoGrid({
  lastMeal,
  lastCheckin,
  navigate,
  shortText,
}) {
  const hasMeal = Boolean(lastMeal);
  const hasCheckin = Boolean(lastCheckin);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/35">
          Resumen rápido
        </p>

        <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981]">
          Live data
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoCard
          title="Última comida"
          icon={<Camera size={15} />}
          value={shortText(lastMeal?.food || "Sin comida", 24)}
          detail={
            hasMeal
              ? `${Math.round(lastMeal.calories || 0)} kcal · ${
                  lastMeal.protein || 0
                }g proteína`
              : "Escanea tu primera comida"
          }
          onClick={() => navigate("/foto-comida")}
          highlight={hasMeal}
        />

        <InfoCard
          title="Check-in"
          icon={<Trophy size={15} />}
          value={hasCheckin ? `${lastCheckin.weight || "-"} kg` : "Pendiente"}
          detail={
            hasCheckin
              ? `${new Date(lastCheckin.created_at).toLocaleDateString(
                  "es-ES"
                )} · ${lastCheckin.body_fat_range || "sin grasa"}`
              : "Registra tu progreso"
          }
          onClick={() => navigate("/checkin")}
          highlight={hasCheckin}
        />
      </div>
    </section>
  );
}