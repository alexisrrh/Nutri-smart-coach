export default function ActionCard({
  icon,
  label,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#091710] p-3 text-left transition duration-300 hover:border-[#10b981]/40 hover:bg-[#10b981]/10"
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_55%)]" />

      <div className="relative z-10">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_20px_#10b98122]">
          {icon}
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          {label}
        </p>

        <p className="mt-1 text-[10px] normal-case leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </button>
  );
}