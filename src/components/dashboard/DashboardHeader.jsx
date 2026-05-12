import { Settings } from "lucide-react";

export default function DashboardHeader({ loadingData, navigate }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl" />

          <img
            src="/favicon.png"
            alt="NutriSmart Coach"
            className="relative h-12 w-12 rounded-2xl border border-emerald-400/40 bg-[#06110c] object-cover p-1 shadow-[0_0_28px_#10b98155]"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-black italic leading-none tracking-tight text-white">
            Nutri<span className="text-emerald-300">Smart</span>
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_#10b981]" />

            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
              {loadingData ? "SYNCING..." : "AI ACTIVE"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/perfil")}
        className="group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition active:scale-95 hover:border-emerald-400/30 hover:bg-emerald-400/10"
      >
        <Settings
          size={18}
          className="relative z-10 text-white/70 transition group-hover:text-emerald-300"
        />
      </button>
    </header>
  );
}