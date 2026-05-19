import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const variants = {
  error: {
    icon: AlertTriangle,
    className: "border-red-400/20 bg-red-400/10 text-red-200",
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-text)]",
  },
  info: {
    icon: Info,
    className: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  },
};

export default function StatusBox({
  action,
  actionLabel,
  children,
  className = "",
  icon,
  type = "info",
}) {
  const variant = variants[type] || variants.info;
  const Icon = icon || variant.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-[22px] border p-4 text-sm font-bold leading-6 ${variant.className} ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p>{children}</p>

        {action && actionLabel && (
          <button
            type="button"
            onClick={action}
            className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--app-text)] transition hover:text-[var(--app-primary)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
