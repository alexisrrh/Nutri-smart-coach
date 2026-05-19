export default function InfoCard({
  title,
  icon,
  value,
  detail,
  onClick,
  highlight = false,
}) {
  return (
    <button
      onClick={onClick}
        className={`group relative min-h-[126px] overflow-hidden rounded-[28px] border p-3 text-left transition duration-300 active:scale-[0.98] ${
          highlight
          ? "border-[var(--app-border)] bg-[var(--app-primary-soft)] shadow-[0_18px_60px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)]"
      }`}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--app-primary-soft)] blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div
              className={`theme-icon-tile-muted grid h-9 w-9 place-items-center rounded-2xl ${
                highlight
                  ? "bg-[var(--app-primary)] text-[var(--app-surface)]"
                  : "border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
              }`}
            >
              {icon}
            </div>

            <span
              className={`h-2 w-2 rounded-full ${
                highlight
                  ? "bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]"
                  : "bg-[var(--app-surface)]"
              }`}
            />
          </div>

          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-500">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-black uppercase italic text-[var(--app-text)]">
            {value}
          </p>
        </div>

        <p className="mt-2 line-clamp-2 text-[10px] normal-case leading-4 text-slate-500">
          {detail}
        </p>
      </div>
    </button>
  );
}
