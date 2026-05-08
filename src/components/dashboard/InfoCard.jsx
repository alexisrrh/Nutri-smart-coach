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
      className={`group relative overflow-hidden rounded-[28px] border p-3 text-left transition duration-300 ${
        highlight
          ? "border-[#10b981]/25 bg-[#10b981]/10"
          : "border-white/10 bg-[#091710]"
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,#10b98118,transparent_50%)]" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
              highlight
                ? "bg-[#10b981] text-[#06110c]"
                : "border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]"
            }`}
          >
            {icon}
          </div>

          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>
        </div>

        <p className="truncate text-sm font-black uppercase italic text-white">
          {value}
        </p>

        <p className="mt-1 line-clamp-2 text-[10px] normal-case leading-4 text-slate-500">
          {detail}
        </p>
      </div>
    </button>
  );
}