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
      className={`group relative min-h-[145px] overflow-hidden rounded-[2rem] p-5 text-left transition-all duration-300 active:scale-[0.98] ${
        featured
          ? "border border-emerald-400/30 bg-emerald-400 text-[#06110e] shadow-[0_25px_60px_rgba(16,185,129,0.24)]"
          : "border border-white/10 bg-[#07170f] hover:border-emerald-400/30 hover:bg-[#0b1d17]"
      }`}
    >
      {!featured && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100" />
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />
        </>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div
            className={`grid h-20 w-50 place-items-center rounded-[1.8rem] ${
              featured
                ? "bg-[#06110e]/10"
                : " border-emerald-600/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            }`}
          >
            {icon ? (
              <img
                src={icon}
                alt={label}
                className={`object-contain ${
                  featured
                    ? "h-20 w-20 -translate-y-0.5 brightness-0 contrast-200"
                    : "h-20 w-20 -translate-y-0.5"
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-xl font-black text-emerald-300">?</span>
            )}
          </div>

        
        </div>

        <div>
          <h3
            className={`text-[15px] font-black uppercase tracking-[0.22em] ${
              featured ? "text-[#06110e]" : "text-white text-center"
            }`}
          >
            {label}
          </h3>

          <p
            className={`mt-2 text-[13px] leading-relaxed ${
              featured ? "text-[#06110e]/70" : "text-white/45 text-center"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}