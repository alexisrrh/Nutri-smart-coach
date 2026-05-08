import { Camera } from "lucide-react";
import AIStat from "./AIStat";
import AIScoreRing from "./AIScoreRing";
import AIOrb from "./AIOrb";

export default function AIHeroCard({
  firstName,
  nutritionScore,
  totals,
  navigate,
  smartTip,
  todayMeals,
}) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#07170f] p-4 shadow-[0_30px_120px_rgba(16,185,129,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98118,transparent_40%)]" />
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#10b981]/20 blur-3xl" />
      <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_12px_#10b981]" />

            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
              AI SYSTEM ACTIVE
            </p>
          </div>

          <div className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-[#10b981]">
              LIVE
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[28px] font-black uppercase italic leading-none">
              Hola,
            </h1>

            <h2 className="mt-1 truncate text-[32px] font-black uppercase italic leading-none text-[#10b981]">
              {firstName}
            </h2>

            <p className="mt-3 max-w-[205px] text-[11px] normal-case leading-5 text-slate-300">
              {smartTip}
            </p>
          </div>

          <div className="-mr-2 scale-75">
            <AIOrb />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-black/20 p-3">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-white/35">
              AI Score
            </p>

            <p className="mt-1 text-xs normal-case leading-5 text-slate-400">
              Calculado con tus comidas, macros y progreso.
            </p>
          </div>

          <AIScoreRing score={nutritionScore} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <AIStat
            title="Proteína"
            value={`${Math.round(totals.protein)}g`}
            color={totals.protein > 0 ? "text-[#10b981]" : "text-white/40"}
          />

          <AIStat
            title="Kcal"
            value={Math.round(totals.calories)}
            color={totals.calories > 0 ? "text-orange-400" : "text-white/40"}
          />

          <AIStat
            title="Estado"
            value={todayMeals.length ? "Activo" : "Pend."}
            color={todayMeals.length ? "text-cyan-400" : "text-yellow-400"}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/foto-comida")}
            className="group relative overflow-hidden rounded-2xl bg-[#10b981] py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#04100a]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Camera size={16} />
              Escanear
            </span>

            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-700 group-hover:translate-x-full" />
          </button>

          <button
            onClick={() => navigate("/checkin")}
            className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:border-[#10b981]/30 hover:bg-[#10b981]/10"
          >
            Body Scan
          </button>
        </div>
      </div>
    </section>
  );
}