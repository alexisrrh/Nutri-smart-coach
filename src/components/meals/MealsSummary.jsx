import { Beef, Droplets, Flame, Sparkles, Wheat } from "lucide-react";
import { SurfaceCard } from "../ui";

export function MacroSummary({ totals, mealsCount }) {
  return (
    <SurfaceCard className="p-2" radius="lg">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Resumen
          </p>

          <p className="mt-0.5 text-[11px] text-[var(--app-muted)]">
            {mealsCount} análisis filtrado{mealsCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Flame size={15} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <SummaryChip icon={<Flame size={11} />} title="Kcal" value={totals.calories} />
        <SummaryChip icon={<Beef size={11} />} title="Prot" value={totals.protein} unit="g" />
        <SummaryChip icon={<Wheat size={11} />} title="Carbs" value={totals.carbs} unit="g" />
        <SummaryChip icon={<Droplets size={11} />} title="Grasa" value={totals.fat} unit="g" />
      </div>
    </SurfaceCard>
  );
}

export function MealsMotivationCard({ message }) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 shadow-[0_14px_42px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,color-mix(in_srgb,var(--app-primary)_10%,transparent),transparent_40%),radial-gradient(circle_at_100%_50%,color-mix(in_srgb,var(--app-primary)_14%,transparent),transparent_34%)]" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Sparkles size={13} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Coach IA
          </p>
          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold leading-4 text-[var(--app-muted)]">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryChip({ icon, title, value, unit = "" }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[var(--app-surface)] p-1.5 shadow-[inset_0_0_0_1px_var(--app-border)]">
      <div className="mb-0.5 text-[var(--app-primary)]">{icon}</div>
            <p className="text-[9px] font-black uppercase tracking-tight text-[var(--app-muted)]">
              {title}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-black text-[var(--app-text)]">
              {Math.round(Number(value) || 0)}
        <span className="ml-0.5 text-[9px] text-[var(--app-muted)]">{unit}</span>
            </p>
    </div>
  );
}
