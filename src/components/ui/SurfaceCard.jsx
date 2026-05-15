const variants = {
  default:
    "border-white/10 bg-[#091814]/90 shadow-[0_18px_42px_rgba(0,0,0,0.24)]",
  soft:
    "border-white/10 bg-white/[0.045] shadow-[0_14px_32px_rgba(0,0,0,0.18)]",
  accent:
    "border-[#10b981]/20 bg-[#10b981]/10 shadow-[0_18px_42px_rgba(16,185,129,0.12)]",
  danger:
    "border-red-400/20 bg-red-400/10 shadow-[0_18px_42px_rgba(0,0,0,0.18)]",
};

const radiusClasses = {
  sm: "rounded-2xl",
  md: "rounded-[22px]",
  lg: "rounded-[28px]",
  xl: "rounded-[34px]",
};

export default function SurfaceCard({
  as: Component = "section",
  children,
  className = "",
  variant = "default",
  radius = "lg",
  ...props
}) {
  return (
    <Component
      {...props}
      className={`border backdrop-blur-xl ${
        radiusClasses[radius] || radiusClasses.lg
      } ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </Component>
  );
}