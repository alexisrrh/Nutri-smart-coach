export default function PrimaryButton({
  children,
  className = "",
  disabled = false,
  icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-[0.14em] shadow-[0_16px_32px_var(--app-glow)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: "var(--app-primary)",
        color: "var(--app-surface)",
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--app-primary-soft)] to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}
