import { Camera } from "lucide-react";

export default function AIScanHero() {
  return (
    <section className="relative shrink-0 overflow-hidden rounded-[24px] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_20px_60px_var(--app-glow)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            AI Nutrition Scanner
          </p>

          <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--app-primary)]">
            LIVE
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-black uppercase italic leading-[0.9] text-[var(--app-text)]">
              Escanea
              <br />
              <span className="text-[var(--app-primary)]">calorías</span>
            </h1>

            <p className="mt-1.5 max-w-[220px] text-xs leading-4 text-[var(--app-muted)]">
              Foto clara, macros y score en segundos.
            </p>
          </div>

          <div className="theme-icon-tile relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[20px] bg-[var(--app-primary-soft)] shadow-[0_0_40px_var(--app-glow)]">
            <span className="absolute -inset-4 animate-[spin_2.5s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,var(--app-primary)_72%,transparent_90%,transparent_100%)]" />
            <span className="absolute inset-[2px] rounded-[18px] bg-[var(--app-primary)]" />

            <Camera size={22} className="relative z-10 text-[var(--app-surface)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
