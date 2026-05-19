import { Camera, GitCompare } from "lucide-react";
import { formatDate } from "./checkinUtils";

export function CheckInCompare({ history = [], onSelect }) {
  const first = Array.isArray(history) && history.length > 1 ? history[history.length - 1] : null;
  const latest = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--app-border)] bg-[#091710] px-3 py-3 shadow-[0_20px_70px_var(--app-glow)]">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-primary)]">
            <GitCompare size={13} />
            Comparación semanal
          </div>

          <h3 className="mt-1 text-sm font-black uppercase italic leading-none text-[var(--app-text)]">
            Semana anterior / Semana actual
          </h3>
        </div>

        <div className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
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
        <div className="rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-4 text-center">
          <Camera className="mx-auto mb-2 text-[var(--app-primary)]" size={22} />
          <p className="text-[10px] font-black uppercase text-[var(--app-text)]">
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
      className={`overflow-hidden rounded-[24px] border text-left transition ${active ? "border-[var(--app-border)]" : "border-[var(--app-border)]"} bg-[var(--app-surface)]`}
    >
      <div className="px-3 pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-[10px] font-black text-[var(--app-primary)]">{date}</p>
      </div>

      <div className="p-3">
        <div className="relative h-28 overflow-hidden rounded-[20px]">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/75 via-transparent to-transparent" />

          {active && (
            <div className="absolute bottom-2 left-2 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--app-primary)]">
              Actual
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
