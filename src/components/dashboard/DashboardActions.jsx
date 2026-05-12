import ActionCard from "./ActionCard";

export default function DashboardActions({ navigate }) {
  return (
    <section className="space-y-4">
      {/* HEADER */}
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/55">
            Más herramientas
          </p>

          <h2 className="mt-1 text-2xl font-black italic leading-none text-white">
            Continúa tu progreso
          </h2>
        </div>

        <div className="hidden rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-300 sm:block ">
          IA SYSTEM
        </div>
      </div >

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3 ">
        <ActionCard
          icon="/icons/scan-comida-icon.png"
          label="PLAN DIETA IA"
          description="Dieta personalizada"
          badge="PLAN"
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon="/icons/bodyscan-icon.png"
          label="BODY SCAN"
          description="Check-in físico"
          badge="BODY"
          onClick={() => navigate("/checkin")}
        />

        <ActionCard
          icon="/icons/historial-icon.png"
          label="HISTORIAL"
          description="Comidas guardadas"
          badge="LOG"
          onClick={() => navigate("/comidas")}
        />

        <ActionCard
          icon="/icons/progreso-icon.png"
          label="PROGRESO"
          description="Peso y evolución"
          badge="TRACK"
          onClick={() => navigate("/progreso")}
        />
      </div>
    </section>
  );
}