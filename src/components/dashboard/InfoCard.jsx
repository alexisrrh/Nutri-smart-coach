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
          ? "border-[#10b981]/25 bg-[#10b981]/10 shadow-[0_18px_60px_rgba(16,185,129,0.08)]"
          : "border-white/10 bg-[#07170f]"
      }`}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#10b981]/10 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div
              className={`grid h-9 w-9 place-items-center rounded-2xl ${
                highlight
                  ? "bg-[#10b981] text-[#06110c]"
                  : "border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]"
              }`}
            >
              {icon}
            </div>

            <span
              className={`h-2 w-2 rounded-full ${
                highlight
                  ? "bg-[#10b981] shadow-[0_0_14px_#10b981]"
                  : "bg-white/20"
              }`}
            />
          </div>

          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-500">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-black uppercase italic text-white">
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