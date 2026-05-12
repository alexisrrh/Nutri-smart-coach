import {
  ScanLine,
  Utensils,
  History,
  LineChart,
} from "lucide-react";

import ActionCard from "./ActionCard";

export default function DashboardActions({ navigate }) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/60">
          Más herramientas
        </p>

        <h3 className="mt-1 text-lg font-black italic text-white">
          Continúa tu progreso
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ActionCard
          icon={<Utensils size={18} />}
          label="Plan IA"
          description="Dieta semanal personalizada"
          badge="PLAN"
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon={<ScanLine size={18} />}
          label="Body Scan"
          description="Check-in físico semanal"
          badge="BODY"
          onClick={() => navigate("/checkin")}
        />

        <ActionCard
          icon={<History size={18} />}
          label="Historial"
          description="Comidas escaneadas"
          badge="LOG"
          onClick={() => navigate("/comidas")}
        />

        <ActionCard
          icon={<LineChart size={18} />}
          label="Progreso"
          description="Peso y evolución"
          badge="TRACK"
          onClick={() => navigate("/progreso")}
        />
      </div>
    </section>
  );
}