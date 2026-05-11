import { useMemo, useState } from "react";
import { Camera, GitCompare, Sparkles } from "lucide-react";
import { formatDate } from "./checkinUtils";

export function CheckInCompare({ history = [] }) {
  const [position, setPosition] = useState(50);

  const { first, latest } = useMemo(() => {
    if (!Array.isArray(history) || history.length < 2) {
      return { first: null, latest: null };
    }

    return {
      latest: history[0],
      first: history[history.length - 1],
    };
  }, [history]);

  if (!first || !latest || !first.image_url || !latest.image_url) {
    return (
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20">
        <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#10b981]/12 blur-3xl" />

        <div className="relative z-10 text-center">
          <Camera className="mx-auto mb-3 text-[#10b981]" size={30} />

          <p className="text-sm font-black uppercase italic">
            Comparador bloqueado
          </p>

          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-400">
            Necesitas al menos 2 check-ins con foto para comparar tu progreso.
          </p>
        </div>
      </section>
    );
  }

  const weightDiff = getDiff(latest.weight, first.weight);
  const waistDiff = getDiff(latest.waist, first.waist);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#091710] p-4 shadow-[0_30px_120px_rgba(16,185,129,0.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98120,transparent_42%)]" />
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-[#10b981]">
              <GitCompare size={14} />
              Transformación
            </div>

            <h3 className="mt-1 text-xl font-black uppercase italic leading-none">
              Antes vs Ahora
            </h3>
          </div>

          <div className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#10b981]">
            IA visual
          </div>
        </div>

        <div className="relative h-[430px] overflow-hidden rounded-[32px] border border-white/10 bg-black/30">
          <img
            src={first.image_url}
            alt="Antes"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${position}%` }}
          >
            <img
              src={latest.image_url}
              alt="Ahora"
              className="h-full w-full object-cover"
              style={{ width: `${10000 / position}%` }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/85 via-transparent to-black/20" />

          <div
            className="absolute inset-y-0 z-20 w-[2px] bg-[#10b981]"
            style={{ left: `${position}%` }}
          >
            <div className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#10b981]/40 bg-[#06110c] shadow-[0_0_30px_rgba(16,185,129,0.45)]">
              <Sparkles size={18} className="text-[#10b981]" />
            </div>
          </div>

          <div className="absolute left-3 top-3 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/50">
              Ahora
            </p>
            <p className="text-[10px] font-black text-[#10b981]">
              {formatDate(latest.created_at)}
            </p>
          </div>

          <div className="absolute right-3 top-3 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-right backdrop-blur-xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/50">
              Antes
            </p>
            <p className="text-[10px] font-black text-[#10b981]">
              {formatDate(first.created_at)}
            </p>
          </div>

          <input
            type="range"
            min="5"
            max="95"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="absolute bottom-4 left-4 right-4 z-30 h-2 cursor-pointer accent-[#10b981]"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <CompareMetric label="Peso" value={formatDiff(weightDiff, "kg")} />
          <CompareMetric label="Cintura" value={formatDiff(waistDiff, "cm")} />
        </div>
      </div>
    </section>
  );
}

function CompareMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-[#10b981]">
        {value}
      </p>
    </div>
  );
}

function getDiff(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (!currentValue || !previousValue) return null;

  return Number((currentValue - previousValue).toFixed(1));
}

function formatDiff(value, unit) {
  if (value === null) return "-";

  return `${value > 0 ? "+" : ""}${value} ${unit}`;
}