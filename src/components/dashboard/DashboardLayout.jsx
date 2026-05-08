import BottomNav from "../BottomNav";
import DashboardBackground from "./DashboardBackground";

export default function DashboardLayout({ children }) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#06110c] px-3 pb-32 pt-3 text-white">
      <DashboardBackground />

      <div className="relative z-10 mx-auto max-w-md space-y-3">
        {children}
      </div>

      <BottomNav />
    </section>
  );
}