import ActionCard from "./ActionCard";
import {
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  ScanLine,
  UserRoundSearch,
} from "lucide-react";
import { exercises } from "../../data/exercises";
import { preloadExercises } from "../../services/exerciseMediaService";

export default function DashboardActions({ navigate }) {
  const preloadAllExercises = () => {
    if (!Array.isArray(exercises) || exercises.length === 0) return;
    preloadExercises(exercises);
  };

  return (
    <section className="flex flex-col">
      <div className="flex items-end justify-between px-1 pb-1">
        <div>
          <p
            className="pb-1 text-center text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ color: "var(--app-primary)", opacity: 0.55 }}
          >
            Más herramientas
          </p>

          <h2 className="mt-0.5 pb-1 text-[14px] font-black leading-none text-[var(--app-text)]">
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

      <div className="grid grid-cols-2 gap-2 ">
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
          icon="/icons/rutinas.png"
          fallbackIcon={ClipboardList}
          label="Rutinas"
          description="Rutina semanal"
          onClick={() => navigate("/rutinas")}
          imageClassName="scale-[1.15] "
        />

        <ActionCard
          icon="/icons/ejercicios.png"
          fallbackIcon={ClipboardList}
          label="Ejercicios"
          description="Ejercicios por músculo"
          onClick={() => {
            preloadAllExercises();
            navigate("/ejercicios");
          }}
          imageClassName="scale-[1.12] "
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