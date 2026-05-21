import ActionCard from "./ActionCard";
import {
  Activity,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Dumbbell,
  ScanLine,
  UserRoundSearch,
} from "lucide-react";

export default function DashboardActions({ navigate }) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-end justify-between px-1 pb-1">
        <div>
          <p
            className="ml-28 pb-1 text-center text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ color: "var(--app-primary)", opacity: 0.55 }}
          >
            Más herramientas
          </p>

          <h2 className="ml-30 mt-0.5 pb-1 text-[14px] font-black leading-none text-[var(--app-text)]">
            Continúa tu plan
          </h2>
        </div>

        <div
          className="rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em]"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-primary-soft)",
            color: "var(--app-primary)",
          }}
        >
          IA
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1">
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
          fallbackIcon={Dumbbell}
          label="RUTINAS"
          description="Entrena por músculo"
          onClick={() => navigate("/rutinas")}
        />

        <ActionCard
          fallbackIcon={Activity}
          label="EJERCICIOS"
          description="Biblioteca fitness"
          onClick={() => navigate("/ejercicios")}
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
