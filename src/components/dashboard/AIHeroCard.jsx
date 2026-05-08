import {
  Camera,
  Sparkles,
  Zap,
} from "lucide-react";

import AIStat from "./AIStat";

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
        {/* TOP */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_12px_#10b981]" />

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

        {/* CENTER */}

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[30px] font-black uppercase italic leading-none">
              Hola,
            </h1>

            <h2 className="mt-1 text-[34px] font-black uppercase italic leading-none text-[#10b981]">
              {firstName}
            </h2>

            <p className="mt-3 max-w-[210px] text-[11px] normal-case leading-5 text-slate-300">
              {smartTip}
            </p>
          </div>

          {/* SCORE */}

          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[#10b981]/20 bg-black/30">
            <div className="absolute inset-2 rounded-full border border-[#10b981]/10" />

            <div className="absolute inset-0 rounded-full border border-[#10b981]/20 animate-ping opacity-20" />

            <div className="text-center">
              <p className="text-5xl font-black italic leading-none text-[#10b981]">
                {nutritionScore}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/40">
                AI Score
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <AIStat
            title="Proteína"
            value={`${Math.round(totals.protein)}g`}
            color="text-[#10b981]"
          />

          <AIStat
            title="Kcal"
            value={Math.round(totals.calories)}
            color="text-orange-400"
          />

          <AIStat
            title="Estado"
            value={todayMeals.length ? "Activo" : "Pend."}
            color="text-cyan-400"
          />
        </div>

        {/* BUTTONS */}

        <div className="mt-5 grid grid-cols-2 gap-2">
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

        {/* AI TIP */}

        <div className="mt-4 rounded-2xl border border-[#10b981]/15 bg-[#10b981]/10 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#06110c]">
              <Sparkles size={17} />
            </div>

            <p className="text-[11px] normal-case leading-5 text-emerald-100/85">
              Tu IA detecta patrones nutricionales y adapta recomendaciones en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}