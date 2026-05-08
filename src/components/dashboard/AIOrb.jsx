import { Sparkles } from "lucide-react";

export default function AIOrb() {
  return (
    <div className="relative flex h-[132px] w-[132px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#10b981]/20 blur-3xl" />

      <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-[#10b981]/20 border-t-[#10b981]" />

      <div className="absolute inset-[12px] animate-[spin_14s_linear_infinite_reverse] rounded-full border border-cyan-300/10 border-b-cyan-300/40" />

      <div className="absolute inset-[26px] rounded-full border border-white/10 bg-black/35 backdrop-blur-xl" />

      <div className="absolute inset-[42px] rounded-full bg-gradient-to-br from-[#10b981] via-emerald-300 to-cyan-300 shadow-[0_0_45px_#10b98188]" />

      <div className="relative z-10 flex flex-col items-center">
        <Sparkles size={20} className="text-[#06110c]" />

        <p className="mt-1 text-[7px] font-black uppercase tracking-[0.28em] text-[#06110c]/70">
          AI
        </p>
      </div>

      <span className="absolute left-3 top-6 h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />
      <span className="absolute bottom-6 right-4 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
      <span className="absolute right-1 top-1/2 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
    </div>
  );
}