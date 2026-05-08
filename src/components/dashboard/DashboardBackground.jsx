export default function DashboardBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[#06110c]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98124,transparent_34%),radial-gradient(circle_at_bottom_left,#22c55e12,transparent_34%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:38px_38px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#10b981]/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-20 right-[-80px] h-[220px] w-[220px] rounded-full bg-emerald-400/10 blur-3xl" />
    </>
  );
}