import { Settings, Zap } from "lucide-react";

export default function DashboardHeader({ loadingData, navigate }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-[#10b981] text-[#06110c] shadow-[0_0_30px_#10b98155]">
          <Zap size={18} className="fill-current" />

          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#06110c] bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]" />
        </div>

        <div>
          <p className="text-base font-black italic leading-none">
            Nutri<span className="text-[#10b981]">Smart</span>
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10b981]" />

            <p className="text-[8px] font-black uppercase tracking-[0.26em] text-white/35">
              {loadingData ? "SYNC..." : "AI ACTIVE"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/perfil")}
        className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition active:scale-95 hover:border-[#10b981]/30 hover:bg-[#10b981]/10"
      >
        <Settings size={17} />
      </button>
    </header>
  );
}