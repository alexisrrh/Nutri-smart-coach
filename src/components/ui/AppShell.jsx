import BottomNav from "../BottomNav";

export default function AppShell({
  children,
  className = "",
  contentClassName = "",
  withBottomNav = true,
  hideBottomNav = false,
  wide = false,
}) {
  const showBottomNav = withBottomNav && !hideBottomNav;
  const shellWidthClass = wide ? "max-w-[520px]" : "max-w-[430px]";
  const rootClass = showBottomNav
    ? "h-[100svh] overflow-hidden"
    : "min-h-[100svh] overflow-y-auto overflow-x-hidden";
  const sectionClass = showBottomNav
    ? `relative mx-auto flex h-full min-h-0 w-full ${shellWidthClass} flex-col overflow-hidden px-4 pb-[var(--bottom-nav-space)] pt-5 md:min-h-[880px] md:rounded-[40px] md:border-8 md:shadow-[0_32px_64px_-12px_var(--app-glow)] ${contentClassName}`
    : `relative mx-auto flex min-h-[100svh] w-full ${shellWidthClass} flex-col overflow-hidden px-4 pb-6 pt-5 md:min-h-[880px] md:rounded-[40px] md:border-8 md:shadow-[0_32px_64px_-12px_var(--app-glow)] ${contentClassName}`;

  return (
    <main
      className={`${rootClass} w-full md:flex md:items-center md:justify-center md:p-6 ${className}`}
      style={{
        backgroundColor: "var(--app-surface)",
        color: "var(--app-text)",
      }}
    >
      <section
        className={sectionClass}
        style={{
          backgroundColor: "var(--app-card)",
          borderColor: "var(--app-border)",
        }}
      >
        <AppBackground />

        <div className="relative z-10 min-h-0 flex-1">{children}</div>

        {showBottomNav && <BottomNav />}
      </section>
    </main>
  );
}

function AppBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 10%, var(--app-glow), transparent 34%), radial-gradient(circle at 10% 82%, color-mix(in srgb, var(--app-primary) 28%, transparent), transparent 38%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div
        className="pointer-events-none absolute left-1/2 top-[-140px] h-[280px] w-[280px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{ backgroundColor: "var(--app-glow)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 48%, color-mix(in srgb, var(--app-surface) 92%, black) 100%)",
        }}
      />
    </>
  );
}
