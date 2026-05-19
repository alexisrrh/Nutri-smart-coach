import { Sparkles } from "lucide-react";

export function CheckInStatus({ lastCheckin, weightDiff }) {
  const bodyFat = lastCheckin?.body_fat_range || "No estimable";
  const confidence = lastCheckin?.confidence ? `${lastCheckin.confidence}%` : "-";
  const definition =
    weightDiff === null ? "Pendiente" : weightDiff <= 0 ? "Mejorando" : "En ajuste";
  const change =
    weightDiff === null ? "-" : `${weightDiff > 0 ? "+" : ""}${weightDiff} kg`;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_18px_60px_var(--app-glow)]">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10 mb-2 flex items-center justify-between gap-3">
        <div className="theme-icon-tile-muted inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-primary)]">
          <Sparkles size={11} />
          Resultado actual
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]">
          IA corporal
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2">
        <Chip label="Grasa" value={bodyFat} />
        <Chip label="Confianza" value={confidence} />
        <Chip label="Definición" value={definition} />
        <Chip label="Cambio" value={change} />
      </div>
    </section>
  );
}

function Chip({ label, value }) {
  return (
    <div className="theme-icon-tile-muted rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-muted)]">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}
