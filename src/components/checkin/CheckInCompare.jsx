import { Camera, GitCompare } from "lucide-react";
import { formatDate } from "./checkinUtils";

export function CheckInCompare({ history = [], onSelect }) {
  const first = Array.isArray(history) && history.length > 1 ? history[history.length - 1] : null;
  const latest = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#10b981]/18 bg-[#091710] px-3 py-3 shadow-[0_20px_70px_rgba(16,185,129,0.08)]">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#10b981]">
            <GitCompare size={13} />
            Comparación semanal
          </div>

          <h3 className="mt-1 text-sm font-black uppercase italic leading-none text-white">
            Semana anterior / Semana actual
          </h3>
        </div>

        <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          IA visual
        </div>
      </div>

      {first && latest && first.image_url && latest.image_url ? (
        <div className="grid grid-cols-2 gap-2">
          <CompareFrame
            title="Semana anterior"
            date={formatDate(first.created_at)}
            image={first.image_url}
            onClick={() => onSelect?.(first)}
          />

          <CompareFrame
            title="Semana actual"
            date={formatDate(latest.created_at)}
            image={latest.image_url}
            active
            onClick={() => onSelect?.(latest)}
          />
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-center">
          <Camera className="mx-auto mb-2 text-[#10b981]" size={22} />
          <p className="text-[10px] font-black uppercase text-white">
            Comparación pendiente
          </p>
          <p className="mt-1 text-[10px] leading-5 text-slate-400">
            Necesitas dos check-ins con foto para comparar semanas.
          </p>
        </div>
      )}
    </section>
  );
}

function CompareFrame({ title, date, image, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-[24px] border text-left transition ${active ? "border-[#10b981]/25" : "border-white/10"} bg-black/25`}
    >
      <div className="px-3 pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-[10px] font-black text-[#10b981]">{date}</p>
      </div>

      <div className="p-3">
        <div className="relative h-28 overflow-hidden rounded-[20px]">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/75 via-transparent to-transparent" />

          {active && (
            <div className="absolute bottom-2 left-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#10b981]">
              Actual
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
