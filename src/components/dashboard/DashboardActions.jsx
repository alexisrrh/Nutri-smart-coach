import { Camera, ScanLine, Utensils } from "lucide-react";
import ActionCard from "./ActionCard";

export default function DashboardActions({ navigate }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/35">
          Acciones IA
        </p>

        <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981]">
          rápido
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ActionCard
          icon={<Camera size={18} />}
          label="Scan"
          description="Analiza comida"
          badge="FOOD"
          onClick={() => navigate("/foto-comida")}
        />

        <ActionCard
          icon={<Utensils size={18} />}
          label="Dieta"
          description="Plan semanal"
          badge="PLAN"
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon={<ScanLine size={18} />}
          label="Check"
          description="Body scan"
          badge="BODY"
          onClick={() => navigate("/checkin")}
        />
      </div>
    </section>
  );
}