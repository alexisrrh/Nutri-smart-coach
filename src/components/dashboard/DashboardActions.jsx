import ActionCard from "./ActionCard";
import {
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  ScanLine,
  UserRoundSearch,
} from "lucide-react";

export default function DashboardActions({ navigate }) {
  return (
    <section className="space-y-1">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-300/55">
            Más herramientas
          </p>

          <h2 className="mt-0.5 text-[13px] font-black italic leading-none text-white">
            Continúa tu plan
          </h2>
        </div>

        <div className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-emerald-300">
          IA
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <ActionCard
          icon="/icons/scan-comida-icon.png"
          fallbackIcon={ClipboardList}
          label="Plan dieta"
          description="Dieta personalizada"
          badge="PLAN"
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon="/icons/bodyscan-icon.png"
          fallbackIcon={UserRoundSearch}
          label="Check-in foto"
          description="Físico con foto"
          badge="BODY"
          onClick={() => navigate("/checkin")}
        />

        <ActionCard
          icon="/icons/historial-icon.png"
          fallbackIcon={ScanLine}
          label="Historial"
          description="Comidas guardadas"
          badge="LOG"
          onClick={() => navigate("/comidas")}
        />

        <ActionCard
          icon="/icons/progreso-icon.png"
          fallbackIcon={ChartNoAxesColumnIncreasing}
          label="Progreso"
          description="Peso y medidas"
          badge="TRACK"
          onClick={() => navigate("/progreso")}
        />
      </div>
    </section>
  );
}
