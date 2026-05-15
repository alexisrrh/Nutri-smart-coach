import { Children } from "react";
import BottomNav from "../BottomNav";
import DashboardBackground from "./DashboardBackground";

export default function DashboardLayout({ children }) {
  const [header, ...content] = Children.toArray(children);

  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6">
      <section className="relative w-full max-w-[430px] min-h-screen overflow-hidden bg-[#06110e] px-3 pb-[92px] pt-2 text-white md:min-h-[880px] md:h-[880px] md:rounded-[40px] md:border-8 md:border-[#1f2937] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
        <DashboardBackground />

        <div className="relative z-10 flex h-[calc(100dvh-100px)] min-h-0 flex-col gap-2 overflow-hidden">
          <div className="shrink-0">{header}</div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col gap-2">{content}</div>
          </div>
        </div>

        <BottomNav />
      </section>
    </div>
  );
}
