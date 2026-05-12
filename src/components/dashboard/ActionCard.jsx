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
          ? "border border-emerald-400/30 bg-emerald-400 text-[#06110e] shadow-[0_40px_60px_rgba(16,185,129,0.24)]"
          : "border border-white/10 bg-[#07170f] hover:border-emerald-400/30 hover:bg-[#0b1d17]"
      }`}
    >
      {!featured && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100" />

          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        </>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* TOP */}
        <div className="flex items-center flex justify-center">
          {/* ICON */}
          <div
            className={`relative grid h-25 w-25 place-items-center overflow-hidden rounded-[1.8rem] ${
              featured
                ? "bg-[#06110e]/10"
                : "bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            }`}
          >
            {/* ROTATING LIGHT */}
            <span className="absolute -inset-6 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_55%,#6ee7b7_70%,transparent_85%,transparent_100%)] animate-[spin_2.2s_linear_infinite]" />

            {/* INNER BG */}
            <span className="absolute inset-[4px] rounded-[1.6rem] bg-[#07170f]" />

            {/* INNER BORDER */}
            <span className="absolute inset-[3px] rounded-[1.6rem] border border-emerald-500/25" />

            {/* ICON */}
            {icon ? (
              <img
                src={icon}
                alt={label}
                className={`relative z-10 object-contain ${
                  featured
                    ? "h-30 w-32 brightness-0 contrast-200 "
                    : "h-25 w-32"
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="relative z-10 text-xl font-black text-emerald-300">
                ?
              </span>
            )}
          </div>

        
        </div>

        {/* TEXT */}
        <div>
          <h3
            className={`text-[15px] font-black uppercase tracking-[0.22em] ${
              featured ? "text-[#06110e]" : "text-white text-center"
            }`}
          >
            {label}
          </h3>

          <p
            className={`mt-2 text-[12px] leading-relaxed ${
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