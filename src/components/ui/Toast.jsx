import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";

const toastConfig = {
  success: {
    icon: CheckCircle2,
    label: "Exito",
    className: "text-emerald-300",
  },
  error: {
    icon: CircleAlert,
    label: "Error",
    className: "text-red-300",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "text-[var(--app-primary)]",
  },
  warning: {
    icon: TriangleAlert,
    label: "Aviso",
    className: "text-amber-300",
  },
};

export default function Toast({ toast, onClose }) {
  const type = toast?.type || "info";
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className="pointer-events-auto w-full overflow-hidden rounded-[22px] border p-3 shadow-[0_18px_44px_var(--app-glow)] backdrop-blur-xl animate-[toastIn_220ms_ease-out]"
      style={{
        backgroundColor: "color-mix(in srgb, var(--app-card) 88%, transparent)",
        borderColor: "var(--app-border)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-2xl border bg-[var(--app-primary-soft)] ${config.className}`}
          style={{ borderColor: "var(--app-border)" }}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${config.className}`}>
            {toast.title || config.label}
          </p>
          <p className="mt-1 text-[12px] font-bold leading-5 text-[var(--app-text)]">
            {toast.message}
          </p>
        </div>

        {toast.closable !== false && (
          <button
            type="button"
            onClick={() => onClose?.(toast.id)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--app-muted)] transition hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
            aria-label="Cerrar notificacion"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
