import { Flame, Dumbbell, Sparkles } from "lucide-react";

export default function DailyGoalCard({ totals, goals }) {
  const caloriesPercent = Math.min(
    100,
    Math.round((totals.calories / goals.calories) * 100)
  );

  const proteinPercent = Math.min(
    100,
    Math.round((totals.protein / goals.protein) * 100)
  );

  return (
    <section className="rounded-[22px] border border-white/10 bg-[#07170f] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#10b981]" />

          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#10b981]">
            Objetivo de hoy
          </p>
        </div>

        <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <GoalItem
          icon={<Flame size={13} />}
          label="Calorías"
          value={totals.calories}
          goal={goals.calories}
          percent={caloriesPercent}
          unit="kcal"
        />

        <GoalItem
          icon={<Dumbbell size={13} />}
          label="Proteína"
          value={totals.protein}
          goal={goals.protein}
          percent={proteinPercent}
          unit="g"
        />
      </div>

      <p className="mt-2 text-[10px] leading-4 text-white/50">
        Sigue registrando comidas para completar tus objetivos diarios.
      </p>
    </section>
  );
}

function GoalItem({
  icon,
  label,
  value,
  goal,
  percent,
  unit,
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 p-2.5">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#10b981]">
          {icon}

          <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
            {label}
          </p>
        </div>

        <p className="text-[8px] font-black text-[#10b981]">
          {percent}%
        </p>
      </div>

      <p className="text-lg font-black italic text-white">
        {Math.round(value)}
        <span className="ml-1 text-[9px] text-white/35">
          / {goal}
          {unit}
        </span>
      </p>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}