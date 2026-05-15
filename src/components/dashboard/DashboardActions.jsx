import ActionCard from "./ActionCard";
import {
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  ScanLine,
  UserRoundSearch,
} from "lucide-react";

export default function DashboardActions({ navigate }) {
  return (
    <section className="flex h-full min-h-0 flex-col ">
      <div className="flex items-end justify-between px-1 pb-1">
        <div>
          <p className=" ml-28 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300/55 text-center pb-1">
            Más herramientas
          </p>

          <h2 className=" ml-30 mt-0.5 text-[14px] font-black italic leading-none text-white  pb-1">
            Continúa tu plan
          </h2>
        </div>

        <div className="rounded-full border border-emerald-800/15 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
          IA
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1">
        <ActionCard
          icon="/icons/scan-comida-icon.png"
          fallbackIcon={ClipboardList}
          label="Plan dieta"
          description="Dieta personalizada"
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon="/icons/bodyscan-icon.png"
          fallbackIcon={UserRoundSearch}
          label="Check-in foto"
          description="Físico con foto"
          onClick={() => navigate("/checkin")}
        />

        <ActionCard
          icon="/icons/historial-icon.png"
          fallbackIcon={ScanLine}
          label="Historial"
          description="Comidas guardadas"
          onClick={() => navigate("/comidas")}
        />

        <ActionCard
          icon="/icons/progreso-icon.png"
          fallbackIcon={ChartNoAxesColumnIncreasing}
          label="Progreso"
          description="Peso y medidas"
          onClick={() => navigate("/progreso")}
        />
      </div>
    </section>
  );
}
