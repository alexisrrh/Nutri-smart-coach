export default function FormField({
  children,
  className = "",
  error,
  hint,
  icon,
  label,
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[var(--app-muted)]">
          {icon && <span className="text-[var(--app-primary)]">{icon}</span>}
          {label}
        </span>
      )}

      {children}

      {hint && !error && <span className="mt-2 block text-xs text-[var(--app-muted)]">{hint}</span>}
      {error && <span className="mt-2 block text-xs font-bold text-red-200">{error}</span>}
    </label>
  );
}
