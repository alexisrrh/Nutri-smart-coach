import {
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
          {/* ANALIZAR */}
          <button
            onClick={() => navigate("/foto-comida")}
            className="group relative overflow-hidden rounded-[1.6rem] bg-emerald-400 p-3 text-left text-[#06110e] shadow-[0_18px_40px_rgba(16,185,129,0.25)] transition active:scale-[0.98]"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/25 blur-2xl" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#06110e]/12">
                <ScanFoodIcon />
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                  Analizar
                </p>

                <p className="mt-0.5 text-[10px] font-bold text-[#06110e]/65">
                  comida
                </p>
              </div>
            </div>
          </button>

          {/* DIETA */}
          <button
            onClick={() =>
              navigate(hasMeals ? "/plan-comidas" : "/foto-comida")
            }
            className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-3 text-left text-white transition active:scale-[0.98] hover:border-emerald-400/30 hover:bg-emerald-400/10"
          >
            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <DietPlanIcon />
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                  Crear
                </p>

                <p className="mt-0.5 text-[10px] font-bold text-white/45">
                  dieta IA
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickStat({ icon, label, value, unit }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <div className="mb-2 text-emerald-300">
        {icon}
      </div>

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

function ScanFoodIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 8.5H5.8C4.8 8.5 4 9.3 4 10.3V17.2C4 18.2 4.8 19 5.8 19H18.2C19.2 19 20 18.2 20 17.2V10.3C20 9.3 19.2 8.5 18.2 8.5H17L15.8 6.7C15.5 6.3 15 6 14.5 6H9.5C9 6 8.5 6.3 8.2 6.7L7 8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M12 16A3 3 0 1 0 12 10A3 3 0 0 0 12 16Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M3 5V3H5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M21 5V3H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M3 19V21H5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M21 19V21H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DietPlanIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M5 3V8C5 9.1 5.9 10 7 10C8.1 10 9 9.1 9 8V3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16 3C18.2 4.2 19.5 6.3 19.5 9C19.5 11.1 18.4 12.8 17 13.5V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13 17H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}