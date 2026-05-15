import BottomNav from "../BottomNav";

export default function AppShell({
  children,
  className = "",
  contentClassName = "",
  withBottomNav = true,
  wide = false,
}) {
  const shellWidthClass = wide ? "max-w-[520px]" : "max-w-[430px]";

  return (
    <main className={`h-[100svh] w-full overflow-hidden bg-[#030a08] text-white md:flex md:items-center md:justify-center md:p-6 ${className}`}>
      <section className={`relative mx-auto flex h-full min-h-0 w-full ${shellWidthClass} flex-col overflow-hidden bg-[#06110e] px-4 pb-[var(--bottom-nav-space)] pt-5 md:min-h-[880px] md:rounded-[40px] md:border-8 md:border-[#1f2937] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] ${contentClassName}`}>
        <AppBackground />

        <div className="relative z-10 min-h-0 flex-1">{children}</div>

        {withBottomNav && <BottomNav />}
      </section>
    </main>
  );
}

function AppBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,#10b98122,transparent_34%),radial-gradient(circle_at_10%_82%,#38bdf815,transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#10b981]/16 blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,#020806_100%)]" />
    </>
  );
}
