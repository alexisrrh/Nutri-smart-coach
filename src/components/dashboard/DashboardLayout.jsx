import BottomNav from "../BottomNav";
import DashboardBackground from "./DashboardBackground";

export default function DashboardLayout({ children }) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#06110c] px-4 pb-32 pt-5 text-white">
      <DashboardBackground />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-4">
        {children}
      </div>

      <BottomNav />
    </section>
  );
}