export default function ActionCard({
  icon,
  label,
  description,
  onClick,
  badge = "AI",
  featured = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative min-h-[118px] overflow-hidden rounded-[1.7rem] p-4 text-left transition duration-300 active:scale-[0.98] ${
        featured
          ? "border border-emerald-400/30 bg-emerald-400 text-[#06110e] shadow-[0_20px_55px_rgba(16,185,129,0.22)]"
          : "border border-white/10 bg-[#07170f] hover:border-emerald-400/35 hover:bg-[#0a1d16]"
      }`}
    >
      {!featured && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100" />
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
        </>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl shadow-[0_0_22px_rgba(16,185,129,0.12)] ${
              featured
                ? "bg-[#06110e]/15 text-[#06110e]"
                : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            }`}
          >
            {icon}
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[7px] font-black uppercase tracking-widest ${
              featured
                ? "bg-[#06110e]/15 text-[#06110e]"
                : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            }`}
          >
            {badge}
          </span>
        </div>

        <div>
          <p
            className={`text-[11px] font-black uppercase tracking-[0.18em] ${
              featured ? "text-[#06110e]" : "text-white"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-1 line-clamp-2 text-[11px] leading-4 ${
              featured ? "text-[#06110e]/70" : "text-white/45"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}