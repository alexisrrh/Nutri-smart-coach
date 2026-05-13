import BottomNav from "../BottomNav";

export default function FoodPageLayout({ children }) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#04110b] px-2 pb-24 pt-2 text-white">
      <FoodBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-[430px] justify-center">
        <div className="w-full overflow-hidden rounded-[26px] border border-[#10b981]/15 bg-[#07170f]/95 p-2 shadow-[0_30px_100px_rgba(16,185,129,0.12)] backdrop-blur-xl">
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