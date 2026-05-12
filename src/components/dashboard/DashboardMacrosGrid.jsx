import { Beef, Droplets, Flame, Wheat } from "lucide-react";

export default function DashboardMacrosGrid({ totals, goals }) {
  const caloriesLeft = Math.max(0, Math.round(goals.calories - totals.calories));
  const caloriesPercent = getPercent(totals.calories, goals.calories);

  return (
    <section className="space-y-3">
      <div className="rounded-[2rem] border border-emerald-400/15 bg-[#07170f] p-5 shadow-[0_20px_70px_rgba(16,185,129,0.08)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/70">
              Progreso de hoy
            </p>

            <h2 className="mt-2 text-3xl font-black italic leading-none text-white">
              {Math.round(totals.calories)}
              <span className="ml-1 text-sm text-white/35">
                / {goals.calories} kcal
              </span>
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {caloriesLeft > 0
                ? `Te faltan ${caloriesLeft} kcal por registrar hoy. Escanea tus próximas comidas para completar tu objetivo.`
                : "Ya completaste tus calorías objetivo de hoy. Mantén el equilibrio en tus próximas comidas."}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-400 px-3 py-2 text-center text-[#06110e]">
            <p className="text-xl font-black">{caloriesPercent}%</p>
            <p className="text-[8px] font-black uppercase tracking-widest">
              completo
            </p>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-700"
            style={{ width: `${caloriesPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MacroMini
          icon={<Beef size={15} />}
          label="Proteína"
          current={totals.protein}
          goal={goals.protein}
          unit="g"
        />

        <MacroMini
          icon={<Wheat size={15} />}
          label="Carbs"
          current={totals.carbs}
          goal={goals.carbs}
          unit="g"
        />

        <MacroMini
          icon={<Droplets size={15} />}
          label="Grasas"
          current={totals.fat}
          goal={goals.fat}
          unit="g"
        />
      </div>
    </section>
  );
}

function MacroMini({ icon, label, current, goal, unit }) {
  const percent = getPercent(current, goal);
  const left = Math.max(0, Math.round(goal - current));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-emerald-300">{icon}</span>
        <span className="text-[9px] font-black text-white/35">
          {percent}%
        </span>
      </div>

      <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <p className="mt-1 text-lg font-black italic text-white">
        {Math.round(current)}
        <span className="ml-1 text-[9px] text-white/35">
          / {goal}
          {unit}
        </span>
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-300 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-[9px] font-bold text-white/35">
        Faltan {left}
        {unit}
      </p>
    </div>
  );
}

function getPercent(current, goal) {
  if (!goal || goal <= 0) return 0;

  return Math.min(100, Math.round((Number(current || 0) / Number(goal)) * 100));
}