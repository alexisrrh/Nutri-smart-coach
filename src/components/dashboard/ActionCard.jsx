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
    className={`group relative flex h-full min-h-0 flex-col items-center justify-center overflow-visible px-2 py-1 text-center transition-all duration-300 active:scale-[0.98] ${
      featured
        ? "text-[#06110e]"
        : ""
    }`}
  >
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
      <div
        className={`relative grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-[1rem] ${
          featured
            ? "bg-[#06110e]/10 shadow-[0_0_30px_rgba(255,255,255,0.07)]"
            : "bg-emerald-500/12 shadow-[0_0_28px_rgba(16,185,129,0.18)]"
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
                ? "h-[60px] w-[60px] brightness-0 contrast-200"
                : "h-[60px] w-[60px]"
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

        <div className="-mt-0.25 text-center">
          <h3
            className={`text-[11px] font-black uppercase tracking-[0.12em] ${
              featured ? "text-[#06110e]" : "text-white"
            }`}
          >
            {label}
          </h3>

          <p
            className={`mt-0.25 text-[14px] leading-tight ${
              featured ? "text-[#06110e]/58" : "text-white/38"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
