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
        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-white/48">
          {icon && <span className="text-[#86efac]">{icon}</span>}
          {label}
        </span>
      )}

      {children}

      {hint && !error && <span className="mt-2 block text-xs text-white/45">{hint}</span>}
      {error && <span className="mt-2 block text-xs font-bold text-red-200">{error}</span>}
    </label>
  );
}
