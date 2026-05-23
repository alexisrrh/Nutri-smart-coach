export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-description" : undefined}
        className="w-full max-w-sm overflow-hidden rounded-[28px] border p-4 shadow-[0_22px_70px_var(--app-glow)]"
        style={{
          backgroundColor: "var(--app-card)",
          borderColor: "var(--app-border)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-16 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

        <div className="relative">
          <div
            className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
              isDanger
                ? "bg-red-400/10 text-red-300"
                : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
            }`}
          >
            {isDanger ? "Accion critica" : "Confirmacion"}
          </div>

          <h2
            id="confirm-dialog-title"
            className="text-[18px] font-black uppercase italic leading-tight tracking-tight text-[var(--app-text)]"
          >
            {title}
          </h2>

          {description && (
            <p
              id="confirm-dialog-description"
              className="mt-2 text-[12px] font-semibold leading-5 text-[var(--app-muted)]"
            >
              {description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-2xl border text-[11px] font-black uppercase tracking-wide text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
              style={{
                backgroundColor: "var(--app-surface)",
                borderColor: "var(--app-border)",
              }}
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`h-11 rounded-2xl text-[11px] font-black uppercase tracking-wide transition active:scale-[0.98] ${
                isDanger
                  ? "bg-red-400 text-white shadow-[0_0_22px_rgba(248,113,113,0.28)] hover:bg-red-300"
                  : "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_22px_var(--app-glow)]"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
