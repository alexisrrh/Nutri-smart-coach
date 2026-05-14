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
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#10b981] px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#03100a] shadow-[0_16px_32px_rgba(16,185,129,0.22)] transition hover:bg-[#86efac] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}
