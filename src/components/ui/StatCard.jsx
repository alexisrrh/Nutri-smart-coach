import SurfaceCard from "./SurfaceCard";

const tones = {
  emerald: "text-[var(--app-primary)] bg-[var(--app-primary-soft)]",
  cyan: "text-cyan-200 bg-cyan-300/10",
  amber: "text-amber-200 bg-amber-300/10",
  rose: "text-rose-200 bg-rose-400/10",
  neutral: "text-[var(--app-muted)] bg-[var(--app-surface)]",
};

export default function StatCard({
  label,
  value,
  unit,
  icon,
  tone = "emerald",
  className = "",
}) {
  const toneClass = tones[tone] || tones.emerald;

  return (
    <SurfaceCard variant="soft" radius="md" className={`p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--app-muted)]">{label}</p>
          <p className="mt-1 truncate text-2xl font-black tracking-tight text-[var(--app-text)]">
            {value}
            {unit && <span className="ml-1 text-sm font-bold text-[var(--app-primary)]">{unit}</span>}
          </p>
        </div>

        {icon && (
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${toneClass}`}>
            {icon}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
