import { Sparkles, ScanFace } from "lucide-react";

export function CheckInHero({ profile }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#091710] px-4 py-3 shadow-2xl shadow-black/20">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#10b981]/25 bg-[#0d2218] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#10b981]">
          <Sparkles size={12} />
          AI Body Analysis
        </div>

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-[28px] bg-[#10b981]/20 blur-2xl" />
            <div className="relative grid h-14 w-14 place-items-center rounded-[24px] border border-[#10b981]/20 bg-[#0d2218]/95 text-[#10b981]">
              <ScanFace size={26} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-black uppercase italic leading-[0.9] tracking-tight text-white sm:text-4xl">
              Check-in corporal
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-slate-400">
              Analiza tu físico y compara tu progreso semanal con IA.
            </p>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
              Objetivo
              <span className="text-[#10b981]">
                {profile?.goal || "Activo"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
