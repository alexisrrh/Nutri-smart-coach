export default function ActionCard({
  icon,
  label,
  description,
  onClick,
  badge = "AI",
}) {
  return (
    <button
      onClick={onClick}
      className="group relative min-h-[116px] overflow-hidden rounded-[26px] border border-white/10 bg-[#07170f] p-3 text-left transition duration-300 active:scale-[0.98] hover:border-[#10b981]/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b9811f,transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#10b981]/10 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_22px_#10b98118]">
            {icon}
          </div>

          <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#10b981]">
            {badge}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {label}
          </p>

          <p className="mt-1 line-clamp-2 text-[10px] normal-case leading-4 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}