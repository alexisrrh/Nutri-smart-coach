import { Sparkles } from "lucide-react";

export default function AIOrb() {
  return (
    <div className="relative flex h-[140px] w-[140px] items-center justify-center">
      {/* GLOW */}

      <div className="absolute inset-0 rounded-full bg-[#10b981]/20 blur-3xl" />

      {/* OUTER RING */}

      <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[#10b981]/20 border-t-[#10b981]" />

      {/* SECOND RING */}

      <div className="absolute inset-[12px] animate-[spin_12s_linear_infinite_reverse] rounded-full border border-emerald-300/10 border-b-emerald-400/40" />

      {/* THIRD RING */}

      <div className="absolute inset-[24px] rounded-full border border-white/10 bg-black/30 backdrop-blur-xl" />

      {/* CORE */}

      <div className="absolute inset-[38px] rounded-full bg-gradient-to-br from-[#10b981] via-emerald-400 to-cyan-300 opacity-90 shadow-[0_0_45px_#10b98188]" />

      {/* CENTER */}

      <div className="relative z-10 flex flex-col items-center">
        <Sparkles
          size={22}
          className="text-[#06110c]"
        />

        <p className="mt-1 text-[8px] font-black uppercase tracking-[0.28em] text-white/70">
          AI
        </p>
      </div>

      {/* PARTICLES */}

      <div className="absolute left-2 top-5 h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />

      <div className="absolute bottom-5 right-3 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

      <div className="absolute right-0 top-1/2 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
    </div>
  );
}