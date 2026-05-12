import {
  Camera,
  ScanLine,
  Utensils,
  ArrowRight,
} from "lucide-react";

import ActionCard from "./ActionCard";

export default function DashboardActions({ navigate }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/60">
            Acciones rápidas
          </p>

          <h3 className="mt-1 text-lg font-black italic text-white">
            ¿Qué quieres hacer hoy?
          </h3>
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-300 sm:flex">
          IA ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* BOTÓN PRINCIPAL */}
        <div className="sm:col-span-2">
          <button
            onClick={() => navigate("/foto-comida")}
            className="group relative h-full min-h-[145px] w-full overflow-hidden rounded-[2rem] bg-emerald-400 p-5 text-left text-[#06110e] shadow-[0_25px_60px_rgba(16,185,129,0.22)] transition duration-300 hover:scale-[1.01]"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#06110e]/10">
                  <Camera size={24} />
                </div>

                <span className="rounded-full bg-[#06110e]/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                  FOOD AI
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black italic leading-none">
                  Analizar comida
                </h3>

                <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-[#06110e]/75">
                  Toma una foto y descubre calorías, proteínas y recomendaciones inteligentes.
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  Escanear ahora
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* TARJETAS PEQUEÑAS */}
        <div className="grid gap-3">
          <ActionCard
            icon={<Utensils size={18} />}
            label="Plan IA"
            description="Crea tu dieta semanal personalizada"
            badge="PLAN"
            onClick={() => navigate("/plan-comidas")}
          />

          <ActionCard
            icon={<ScanLine size={18} />}
            label="Body Scan"
            description="Registra cambios físicos y progreso"
            badge="BODY"
            onClick={() => navigate("/checkin")}
          />
        </div>
      </div>
    </section>
  );
}