import { Camera } from "lucide-react";

export default function AIScanHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#10b981]/15 bg-[#092016] p-3 shadow-[0_20px_60px_rgba(16,185,129,0.10)]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#10b981]/20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[7px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            AI Nutrition Scanner
          </p>

          <span className="rounded-full border border-[#10b981]/15 bg-[#10b981]/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#10b981]">
            LIVE
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-black uppercase italic leading-[0.92]">
              Escanea
              <br />
              <span className="text-[#10b981]">calorías</span>
            </h1>

            <p className="mt-2 max-w-[190px] text-[10px] leading-4 text-slate-300">
              Analiza comida con IA y detecta macros en segundos.
            </p>
          </div>

          <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[22px] bg-[#10b981]/15 shadow-[0_0_40px_rgba(16,185,129,0.18)]">
            <span className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,#6ee7b7_72%,transparent_90%,transparent_100%)] animate-[spin_2.5s_linear_infinite]" />
            <span className="absolute inset-[2px] rounded-[20px] bg-[#10b981]" />

            <Camera size={24} className="relative z-10 text-[#04110b]" />
          </div>
        </div>
      </div>
    </section>
  );
}