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
      className={`group relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-[0.8rem] px-1 py-0.5 text-center transition-all duration-300 active:scale-[0.98] ${
        featured
          ? "border border-emerald-400/30 bg-emerald-400 text-[#06110e] shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
          : "bg-transparent"
      }`}
    >
      {!featured && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98118,transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-0.5">
        <div
          className={`relative grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-[1rem] ${
            featured
              ? "bg-[#06110e]/10 shadow-[0_0_32px_rgba(255,255,255,0.08)]"
              : "bg-emerald-500/12 shadow-[0_0_34px_rgba(16,185,129,0.22)]"
          }`}
        >
          <span className="pointer-events-none absolute -inset-5 z-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_55%,#6ee7b7_70%,transparent_85%,transparent_100%)] animate-[spin_2.8s_linear_infinite]" />

          <span className="pointer-events-none absolute inset-[2px] z-[1] rounded-[0.95rem] bg-[#07170f]" />

          <span className="pointer-events-none absolute inset-[2px] z-[2] rounded-[0.95rem] border border-emerald-500/25" />

          {icon && !imageError ? (
            <img
              src={icon}
              alt={label}
              className={`relative z-20 object-contain ${
                featured
                  ? "h-[68px] w-[68px] brightness-0 contrast-200"
                  : "h-[68px] w-[68px]"
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
              <FallbackIcon size={26} strokeWidth={2.4} />
            </span>
          )}
        </div>

        <div className="text-center">
          <h3
            className={`text-[8px] font-black uppercase tracking-[0.12em] ${
              featured ? "text-[#06110e]" : "text-white"
            }`}
          >
            {label}
          </h3>

          <p
            className={`mt-0.5 text-[6px] leading-tight ${
              featured ? "text-[#06110e]/58" : "text-white/34"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
