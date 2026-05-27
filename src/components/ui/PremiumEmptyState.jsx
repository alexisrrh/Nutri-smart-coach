import { Sparkles } from "lucide-react";

export default function PremiumEmptyState({
  actionLabel,
  className = "",
  description,
  icon,
  onAction,
  title,
}) {
  const Icon = icon || Sparkles;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.25rem] border border-[var(--app-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--app-card)_92%,var(--app-surface)),var(--app-surface))] p-4 text-center shadow-[0_16px_38px_var(--app-glow)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--app-primary-soft),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--app-text)_6%,transparent)]" />
      <span className="pointer-events-none absolute left-[18%] top-5 h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] opacity-70 shadow-[0_0_12px_var(--app-glow)] animate-[restOrbPulse_3s_ease-in-out_infinite]" />
      <span className="pointer-events-none absolute bottom-8 right-[20%] h-1 w-1 rounded-full bg-[color:color-mix(in_srgb,var(--app-primary)_70%,var(--app-text))] opacity-60 shadow-[0_0_10px_var(--app-glow)]" />

      <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_26px_var(--app-glow)]">
        <span className="absolute inset-1 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,transparent)]" />
        <Icon size={23} className="relative z-10" />
      </div>

      <h3 className="relative z-10 mt-3 text-[17px] font-black leading-tight text-[var(--app-text)]">
        {title}
      </h3>

      <p className="relative z-10 mx-auto mt-2 max-w-[19rem] text-xs font-medium leading-5 text-[var(--app-muted)]">
        {description}
      </p>

      {onAction && actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="relative z-10 mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--app-primary)] px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--app-surface)] shadow-[0_12px_28px_var(--app-glow)] transition active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
