import { Settings, Zap } from "lucide-react";

export default function DashboardHeader({ loadingData, navigate }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#10b981] text-[#06110c] shadow-[0_0_30px_#10b98155]">
          <Zap size={18} />
        </div>

        <div>
          <p className="text-base font-black italic leading-none">
            Nutri<span className="text-[#10b981]">Smart</span>
          </p>

          <p className="mt-1 text-[8px] font-black uppercase tracking-[0.28em] text-white/30">
            {loadingData ? "SYNC..." : "AI ACTIVE"}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/perfil")}
        className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition hover:border-[#10b981]/30 hover:bg-[#10b981]/10"
      >
        <Settings size={17} />
      </button>
    </header>
  );
}