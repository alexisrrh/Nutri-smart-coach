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
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:border-[#10b981]/35 hover:bg-[#10b981]/10 hover:text-[#86efac] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
