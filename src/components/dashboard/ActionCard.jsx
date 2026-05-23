import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function ActionCard({
  icon,
  fallbackIcon,
  label,
  description,
  onClick,
  featured = false,
  imageClassName = "",
}) {
  const [imageError, setImageError] = useState(false);
  const FallbackIcon = fallbackIcon || Sparkles;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-h-[110px] flex-col items-center justify-center rounded-[1rem] px-2 py-2 text-center transition-all duration-150 ease-out active:translate-y-[2px] active:brightness-90 ${
        featured ? "text-[var(--app-surface)]" : ""
      }`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
        <div
          className={`theme-icon-tile relative grid h-[80px] w-[80px] place-items-center overflow-hidden rounded-[1rem] bg-[var(--app-primary-soft)] shadow-[0_0_28px_var(--app-glow)] transition-all duration-150 ease-out group-active:translate-y-[3px] group-active:shadow-[inset_0_3px_10px_rgba(0,0,0,0.45)] group-active:brightness-90 ${
            featured ? "shadow-[0_0_30px_var(--app-glow)]" : ""
          }`}
        >
   <span className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,var(--app-primary)_72%,transparent_90%,transparent_100%)] opacity-70 animate-[spin_2.5s_linear_infinite]" />

<span className="absolute inset-[2px] rounded-[0.9rem] bg-[var(--app-primary)] theme-icon-tile-inner" />

          {icon && !imageError ? (
            <img
              src={icon}
              alt={label}
              className={`relative z-20 object-contain ${
                featured
                  ? "h-[76px] w-[76px]  "
                  : "h-[76px] w-[76px]"
              } ${imageClassName}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <span
              className={`relative z-20 ${
                featured
                  ? "text-[var(--app-surface)]"
                  : "text-[var(--app-primary)]"
              }`}
            >
              <FallbackIcon size={28} strokeWidth={2.4} />
            </span>
          )}
        </div>

        <div className="text-center">
          <h3
            className={`text-[11px] font-black uppercase tracking-[0.12em] ${
              featured ? "text-[var(--app-surface)]" : "text-[var(--app-text)]"
            }`}
          >
            {label}
          </h3>

          <p
            className={`text-[14px] leading-tight ${
              featured
                ? "text-[var(--app-surface)]/58"
                : "text-[var(--app-muted)]"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
