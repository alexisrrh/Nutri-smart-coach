import { Dumbbell, Flame, Sparkles, TrendingUp } from "lucide-react";

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
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[#07170f] p-5 shadow-[0_25px_90px_rgba(16,185,129,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_38%)]" />
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative z-10">
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

        <div className="grid grid-cols-2 gap-3">
          <HeroActionButton
            primary
            title="Escanear"
            subtitle="comida"
            icon="/icons/scan-icon.png"
            onClick={() => navigate("/foto-comida")}
          />

          <HeroActionButton
            title="Crear"
            subtitle="dieta IA"
            icon="/icons/dieta.png"
            onClick={() => navigate("/plan-comidas")}
          />
        </div>
      </div>
    </section>
  );
}

function HeroActionButton({ title, subtitle, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`group relative min-h-[82px] overflow-hidden rounded-[1.8rem] border p-3 transition duration-300 active:scale-[0.98] ${
        primary
          ? "border border-emerald-400/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 text-[#04100a] shadow-[0_18px_45px_rgba(16,185,129,0.22)]"
          : "border-white/10 bg-white/[0.055] text-white hover:border-emerald-600/30 hover:bg-emerald-500/10"
      }`}
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
          primary ? "bg-white/25" : "bg-emerald-600/10"
        }`}
      />

     <div className="relative z-10 flex h-full items-center justify-center gap-3">
        <div
          className={`relative grid h-16 w-17 shrink-0 place-items-center overflow-hidden rounded-[1.35rem] ${
            primary ? "bg-[#06110e]/10" : "bg-emerald-500/10"
          }`}
        >
          <span
            className={`absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,#6ee7b7_72%,transparent_90%,transparent_100%)] animate-[spin_2.5s_linear_infinite] ${
              primary ? "opacity-70" : "opacity-100"
            }`}
          />

          <span
            className={`absolute inset-[2px] rounded-[1.25rem] ${
              primary ? "bg-emerald-900" : "bg-[#101915]"
            }`}
          />

          <img
            src={icon}
            alt={title}
            className="relative z-11 h-15 w-28 object-cover -translate-y-0.5"
          />
        </div>

  <div className="flex flex-col items-center justify-center text-center">
         <p
  className={`text-[1.05rem] font-bold italic tracking-tight ${
    primary ? "text-[#04100a]" : "text-white"
  }`}
>
            {title}
          </p>

          <p
            className={`mt-1 text-[13px] font-bold ${
              primary ? "text-[#04100a]/60" : "text-white/55"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </button>
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