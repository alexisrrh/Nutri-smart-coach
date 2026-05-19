const variants = {
  default:
    "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
  cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  neutral: "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]",
  danger: "border-red-400/20 bg-red-400/10 text-red-200",
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
};

export default function MetaBadge({
  children,
  className = "",
  icon,
  variant = "default",
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${variants[variant] || variants.default} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
