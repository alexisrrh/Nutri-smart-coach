import { ArrowLeft, Camera, Sparkles } from "lucide-react";
import { SurfaceCard } from "../ui";

export function HistoryHeader({ onBack, onScan }) {
  return (
    <SurfaceCard as="header" className="overflow-hidden p-2" radius="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            <Sparkles size={11} />
            Historial IA
          </div>

          <h1 className="text-[22px] font-black uppercase italic leading-none text-[var(--app-text)]">
            Historial
          </h1>

          <p className="mt-0.5 text-[11px] leading-4 text-[var(--app-muted)]">
            Tus comidas analizadas.
          </p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <IconAction onClick={onBack} label="Volver">
            <ArrowLeft size={15} />
          </IconAction>

          <IconAction onClick={onScan} label="Escanear" active>
            <Camera size={15} />
          </IconAction>
        </div>
      </div>
    </SurfaceCard>
  );
}

function IconAction({ children, onClick, label, active = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-2xl transition active:scale-[0.96] ${
        active
          ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_24px_var(--app-glow)]"
          : "bg-[var(--app-surface)] text-slate-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:text-[var(--app-text)]"
      }`}
    >
      {children}
    </button>
  );
}
