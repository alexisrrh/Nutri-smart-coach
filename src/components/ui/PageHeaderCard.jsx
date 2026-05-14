import MetaBadge from "./MetaBadge";
import SurfaceCard from "./SurfaceCard";

export default function PageHeaderCard({
  badge,
  badgeIcon,
  icon,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <SurfaceCard as="header" className={`p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {badge && <MetaBadge icon={badgeIcon}>{badge}</MetaBadge>}

        {icon && (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#10b981]/10 text-[#10b981]">
            {icon}
          </div>
        )}
      </div>

      <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
        {title}
      </h1>

      {description && (
        <p className="mt-3 max-w-[19rem] text-sm leading-6 text-white/64">
          {description}
        </p>
      )}

      {children}
    </SurfaceCard>
  );
}
