import BottomNav from "../BottomNav";

export default function DashboardLayout({ children }) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#06110c] px-3 pb-28 pt-3 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98118,transparent_35%)]" />

      <div className="relative z-10 mx-auto max-w-md space-y-3">
        {children}
      </div>

      <BottomNav />
    </section>
  );
}