import BottomNav from "../BottomNav";

export default function FoodPageLayout({ children }) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#04110b] px-3 pb-32 pt-3 text-white">
      <FoodBackground />

      <main className="relative z-10 mx-auto max-w-md">
        <div className="overflow-hidden rounded-[36px] border border-[#10b981]/20 bg-[#07170f]/95 p-3 shadow-[0_40px_140px_rgba(16,185,129,0.16)] backdrop-blur-xl">
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
      <div className="pointer-events-none absolute inset-0 bg-[#04110b]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98124,transparent_34%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-130px] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#10b981]/20 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-24 right-[-90px] h-[230px] w-[230px] rounded-full bg-emerald-400/10 blur-[90px]" />

      <div className="pointer-events-none absolute left-0 top-[120px] h-px w-full bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent" />
    </>
  );
}