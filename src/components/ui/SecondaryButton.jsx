export default function SecondaryButton({
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
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: "var(--app-border)",
        color: "var(--app-muted)",
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
