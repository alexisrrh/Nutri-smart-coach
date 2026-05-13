import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function ActionCard({
  icon,
  fallbackIcon,
  label,
  description,
  onClick,
  featured = false,
}) {
  const [imageError, setImageError] = useState(false);
  const FallbackIcon = fallbackIcon || Sparkles;

  return (
    <button
      onClick={onClick}
      className={`group relative min-h-[88px] overflow-hidden rounded-[1.5rem] p-3 text-left transition-all duration-300 active:scale-[0.98] ${
        featured
          ? "border border-emerald-400/30 bg-emerald-400 text-[#06110e] shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
          : "border border-white/10 bg-[#07170f] hover:border-emerald-400/30 hover:bg-[#0b1d17]"
      }`}
    >
      {!featured && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98118,transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100" />
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl" />
        </>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-between">
        <div
          className={`relative grid h-14 w-14 place-items-center overflow-hidden rounded-[1.15rem] ${
            featured
              ? "bg-[#06110e]/10"
              : "bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
          }`}
        >
          <span className="pointer-events-none absolute -inset-5 z-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_55%,#6ee7b7_70%,transparent_85%,transparent_100%)] animate-[spin_2.8s_linear_infinite]" />
          <span className="pointer-events-none absolute inset-[3px] z-[1] rounded-[1rem] bg-[#07170f]" />
          <span className="pointer-events-none absolute inset-[3px] z-[2] rounded-[1rem] border border-emerald-500/25" />

          {icon && !imageError ? (
            <img
              src={icon}
              alt={label}
              className={`relative z-20 object-contain ${
                featured
                  ? "h-10 w-10 brightness-0 contrast-200"
                  : "h-10 w-10"
              }`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                setImageError(true);
              }}
            />
          ) : (
            <span
              className={`relative z-20 ${
                featured ? "text-[#06110e]" : "text-emerald-300"
              }`}
            >
              <FallbackIcon size={28} strokeWidth={2.4} />
            </span>
          )}
        </div>

        <div className="mt-2 text-center">
          <h3
            className={`text-[11px] font-black uppercase tracking-[0.16em] ${
              featured ? "text-[#06110e]" : "text-white"
            }`}
          >
            {label}
          </h3>

          <p
            className={`mt-1 text-[9px] leading-tight ${
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
