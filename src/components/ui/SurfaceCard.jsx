const variants = {
  default: "border-[var(--app-border)] shadow-[0_18px_42px_var(--app-glow)]",
  soft: "border-[var(--app-border)] shadow-[0_14px_32px_var(--app-glow)]",
  accent: "border-[var(--app-border)] shadow-[0_18px_42px_var(--app-glow)]",
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
      style={{
        backgroundColor:
          variant === "accent"
            ? "var(--app-primary-soft)"
            : variant === "soft"
              ? "var(--app-surface)"
              : "var(--app-card)",
        borderColor:
          variant === "accent" ? "var(--app-border)" : "var(--app-border)",
      }}
      className={`border backdrop-blur-xl ${
        radiusClasses[radius] || radiusClasses.lg
      } ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </Component>
  );
}
