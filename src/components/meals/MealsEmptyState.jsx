import { CalendarDays, Camera } from "lucide-react";

export function Empty({ onClick }) {
  return (
    <div className="rounded-[24px] bg-[var(--app-surface)] px-4 py-6 text-center shadow-[inset_0_0_0_1px_var(--app-border)]">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_24px_var(--app-glow)]">
        <CalendarDays size={22} />
      </div>

      <h3 className="text-base font-black uppercase tracking-tight text-[var(--app-text)]">
        Sin comidas registradas
      </h3>

      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-4 text-[var(--app-muted)]">
        Analiza una comida para empezar tu timeline nutricional.
      </p>

      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--app-primary)] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[var(--app-surface)] transition active:scale-[0.98] hover:bg-[var(--app-primary)]"
      >
        <Camera size={16} />
        Escanear comida
      </button>
    </div>
  );
}
