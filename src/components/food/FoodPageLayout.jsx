import BottomNav from "../BottomNav";

export default function FoodPageLayout({ children }) {
  return (
    <section className="relative h-dvh overflow-hidden bg-[#04110b] px-2 pb-[92px] pt-2 text-white md:flex md:items-center md:justify-center md:p-6">
      <FoodBackground />

      <main className="relative z-10 mx-auto flex h-[calc(100dvh-100px)] min-h-0 w-full max-w-[430px] justify-center md:h-[880px] md:min-h-[880px]">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] border border-[#10b981]/15 bg-[#07170f]/95 p-2 shadow-[0_30px_100px_rgba(16,185,129,0.12)] backdrop-blur-xl md:rounded-[40px] md:border-8 md:border-[#1f2937] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          {children}
        </div>
      </main>

      <BottomNav />
    </section>
  );
}

function FoodBackground() {
  return (
    <>
      {/* BASE */}
      <div className="pointer-events-none absolute inset-0 bg-[#04110b]" />

      {/* TOP GLOW */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98120,transparent_34%)]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:34px_34px]" />

      {/* MAIN LIGHT */}
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#10b981]/18 blur-[110px]" />

      {/* SIDE LIGHT */}
      <div className="pointer-events-none absolute bottom-24 right-[-80px] h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[80px]" />

      {/* HORIZONTAL LINE */}
      <div className="pointer-events-none absolute left-0 top-[120px] h-px w-full bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent" />

      {/* VIGNETTE */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,#020806_100%)]" />
    </>
  );
}
