import ActionCard from "./ActionCard";

export default function DashboardActions({ navigate }) {
  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-300/55">
            Más herramientas
          </p>

          <h2 className="mt-0.5 text-lg font-black italic leading-none text-white">
            Continúa tu progreso
          </h2>
        </div>

        <div className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-emerald-300">
          IA
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ActionCard
          icon="/icons/scan-comida-icon.png"
          label="Plan dieta"
          description="Dieta personalizada"
          badge="PLAN"
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon="/icons/bodyscan-icon.png"
          label="Body scan"
          description="Check-in físico"
          badge="BODY"
          onClick={() => navigate("/checkin")}
        />

        <ActionCard
          icon="/icons/historial-icon.png"
          label="Historial"
          description="Comidas guardadas"
          badge="LOG"
          onClick={() => navigate("/comidas")}
        />

        <ActionCard
          icon="/icons/progreso-icon.png"
          label="Progreso"
          description="Peso y evolución"
          badge="TRACK"
          onClick={() => navigate("/progreso")}
        />
      </div>
    </section>
  );
}