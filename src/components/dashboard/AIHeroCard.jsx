import { Dumbbell, Flame, Sparkles, TrendingUp } from "lucide-react";

import AIScoreRing from "./AIScoreRing";
import AIOrb from "./AIOrb";

export default function AIHeroCard({
  firstName,
  nutritionScore,
  totals,
  goals,
  navigate,
  smartTip,
  todayMeals,
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.4rem] border border-emerald-400/15 bg-[#07170f] p-3 shadow-[0_18px_60px_rgba(16,185,129,0.1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_38%)]" />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/70">
              Tu coach de hoy
            </p>

            <h1 className="mt-1 text-3xl font-black italic leading-none tracking-tight">
              Hola,{" "}
              <span className="text-emerald-300">
                {firstName || "crack"}
              </span>
            </h1>

            <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-white/60">
              {smartTip}
            </p>
          </div>

          <div className="scale-[0.65]">
            <AIOrb />
          </div>
        </div>

        <div className="-mt-2 mb-2 rounded-[1.15rem] border border-white/10 bg-black/20 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mb-1 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40">
                <Sparkles size={11} className="text-emerald-300" />
                AI Score
              </p>

              <p className="text-[11px] leading-4 text-white/70">
                Según tus comidas y actividad diaria.
              </p>
            </div>

            <div className="scale-[0.62]">
              <AIScoreRing score={nutritionScore} />
            </div>
          </div>
        </div>

        <div className="mb-3 space-y-1.5">
          <QuickInlineStat
            icon={<Flame size={14} />}
            label="Kcal"
            current={totals.calories}
            goal={goals.calories}
            unit=""
            accent="text-emerald-300"
          />

          <QuickInlineStat
            icon={<Dumbbell size={14} />}
            label="Proteína"
            current={totals.protein}
            goal={goals.protein}
            unit="g"
            accent="text-cyan-300"
          />

          <QuickInlineStat
            icon={<TrendingUp size={14} />}
            label="Comidas"
            current={todayMeals.length}
            goal={6}
            unit=""
            accent="text-white"
          />
        </div>
        <div className="flex justify-center pt-1">
          <HeroActionButton
            primary
            title="Escanear calorías"
            subtitle="Analizar comida"
            icon="/icons/scan-icon.png"
            onClick={() => navigate("/foto-comida")}
          />
        </div>
      </div>
    </section>
  );
}

function QuickInlineStat({
  icon,
  label,
  current,
  goal,
  unit = "",
  accent = "text-white",
}) {
  const safeGoal = Number(goal || 0);
  const safeCurrent = Number(current || 0);
  const progress = safeGoal > 0 ? Math.min(100, (safeCurrent / safeGoal) * 100) : 0;
  const left = Math.max(0, safeGoal - safeCurrent);

  return (
    <div className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-emerald-300">{icon}</div>

          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
            {label}
          </p>
        </div>

        <p className={`text-[13px] font-black italic ${accent}`}>
          {Math.round(safeCurrent)}
          {unit}
          <span className="ml-1 text-[10px] text-white/35">
            / {safeGoal}
            {unit}
          </span>
        </p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-1 flex justify-end">
        <p className="text-[8px] font-bold text-white/35">
          {left > 0
            ? `Faltan ${Math.round(left)}${unit}`
            : "Objetivo completado"}
        </p>
      </div>
    </div>
  );
}

function HeroActionButton({ title, subtitle, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`group relative mx-auto min-h-[64px] w-full max-w-[330px] overflow-hidden rounded-[1.35rem] border px-4 py-2.5 transition duration-300 active:scale-[0.98] ${
        primary
          ? "border-emerald-300/25 bg-gradient-to-br from-[#063d2d] via-[#07523b] to-[#0a6b4c] text-white shadow-[0_16px_36px_rgba(16,185,129,0.22)] hover:border-emerald-200/40 hover:shadow-[0_18px_42px_rgba(16,185,129,0.3)]"
          : "border-white/10 bg-white/[0.055] text-white hover:border-emerald-600/30 hover:bg-emerald-500/10"
      }`}
    >
      <div
        className={`absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl ${
          primary ? "bg-white/20" : "bg-emerald-600/10"
        }`}
      />

      <div className="relative z-10 flex h-full items-center justify-center gap-2.5">
        <div
          className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[1rem] ${
            primary ? "bg-[#06110e]/35" : "bg-emerald-500/10"
          }`}
        >
          <span
            className={`absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,#6ee7b7_72%,transparent_90%,transparent_100%)] animate-[spin_2.5s_linear_infinite] ${
              primary ? "opacity-60" : "opacity-100"
            }`}
          />

          <span
            className={`absolute inset-[2px] rounded-[0.9rem] ${
              primary ? "bg-[#07583f]" : "bg-[#101915]"
            }`}
          />

          <img
            src={icon}
            alt={title}
            className="relative z-10 h-10 w-10 object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center text-center">
          <p
            className={`text-sm font-black uppercase leading-tight tracking-[0.12em] ${
              primary ? "text-white" : "text-white"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-[11px] font-bold leading-tight ${
              primary ? "text-emerald-100/85" : "text-white/70"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}
