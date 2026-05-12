import { Settings } from "lucide-react";

export default function DashboardHeader({ loadingData, navigate }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* LOGO */}
        <div className="relative">
          <div className="absolute inset-0 rounded-[1.3rem] bg-emerald-400/20 blur-xl" />

            <div className="flex items-center gap-3 ">
           <img
  src="/favicon.png"
  alt="NutriSmart Coach"
 className="h-18 w-17 rounded-2xl object-cover bg-transparent p-1 shadow-[0_0_50px_#10b98155] border border-emerald-500"
/>

          </div>
        </div>

        {/* BRAND */}
        <div>
          <h1 className="text-[1.55rem] font-black italic leading-none tracking-tight text-white">
            Nutri<span className="text-emerald-300">SmartCoach</span>
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_#10b981]" />

            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35">
              {loadingData ? "SYNCING..." : "AI ACTIVE"}
            </p>
          </div>
        </div>
      </div>

      {/* SETTINGS */}
      <button
        onClick={() => navigate("/perfil")}
        className="group relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition duration-300 active:scale-95 hover:border-emerald-400/30 hover:bg-emerald-400/10"
      >
        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle,#10b98122,transparent_70%)]" />

        <Settings
          size={18}
          className="relative z-10 text-white/70 transition group-hover:text-emerald-300"
        />
      </button>
    </header>
  );
}