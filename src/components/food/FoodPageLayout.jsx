import BottomNav from "../BottomNav";

export default function FoodPageLayout({ children }) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#06110c] px-3 pb-32 pt-3 text-white">
      <FoodBackground />

      <div className="relative z-10 mx-auto max-w-md space-y-3">
        {children}
      </div>

      <BottomNav />
    </section>
  );
}

function FoodBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[#06110c]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98122,transparent_32%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#10b981]/20 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-20 right-[-80px] h-[220px] w-[220px] rounded-full bg-emerald-400/10 blur-3xl" />
    </>
  );
}