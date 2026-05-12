import {
  Camera,
  Dumbbell,
  Flame,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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
  const hasMeals = todayMeals.length > 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[#07170f] p-5 shadow-[0_25px_90px_rgba(16,185,129,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_38%)]" />
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/70">
              Tu coach de hoy
            </p>

            <h1 className="mt-2 text-4xl font-black italic leading-none tracking-tight">
              Hola,{" "}
              <span className="text-emerald-300">
                {firstName || "crack"}
              </span>
            </h1>

            <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-white/65">
              {smartTip}
            </p>
          </div>

          <div className="scale-[0.92]">
            <AIOrb />
          </div>
        </div>

        {/* SCORE */}
        <div className="mb-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <Sparkles size={13} className="text-emerald-300" />
                AI Score
              </p>

              <p className="text-sm leading-relaxed text-white/75">
                Calculado según tus comidas, proteínas y actividad diaria.
              </p>
            </div>

            <AIScoreRing score={nutritionScore} />
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <QuickStat
            icon={<Flame size={16} />}
            label="Calorías"
            value={Math.round(totals.calories)}
            unit="kcal"
          />

          <QuickStat
            icon={<Dumbbell size={16} />}
            label="Proteína"
            value={Math.round(totals.protein)}
            unit="g"
          />

          <QuickStat
            icon={<TrendingUp size={16} />}
            label="Comidas"
            value={todayMeals.length}
            unit="hoy"
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/foto-comida")}
            className="group relative overflow-hidden rounded-2xl bg-emerald-400  py-4 text-xs font-black uppercase tracking-widest text-[#04100a] shadow-[0_40px_40px_rgba(16,185,129,0.25)] transition hover:scale-[1.02] hover:bg-white"
          >
            <span className="relative z-10 flex items-center justify-center gap-1">
              <Camera size={18} />
              Analizar comida
            </span>

            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-700 group-hover:translate-x-full" />
          </button>

          <button
            onClick={() =>
              navigate(hasMeals ? "/plan-comidas" : "/foto-comida")
            }
            className="rounded-2xl border border-white/10 bg-white/[0.05] py-4 text-xs font-black uppercase tracking-widest text-white/75 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            {hasMeals ? "Crear dieta" : "Subir comida"}
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickStat({ icon, label, value, unit }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <div className="mb-2 text-emerald-300">{icon}</div>

      <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <p className="mt-1 text-xl font-black italic text-white">
        {value}

        <span className="ml-1 text-[9px] font-bold uppercase text-emerald-300/50">
          {unit}
        </span>
      </p>
    </div>
  );
}