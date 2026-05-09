import { Camera, Sparkles, Zap } from "lucide-react";

export default function AIScanHero() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#07170f] p-4 shadow-[0_30px_120px_rgba(16,185,129,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_42%)]" />
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#10b981]/20 blur-3xl" />
      <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_14px_#10b981]" />

            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
              AI FOOD SCANNER
            </p>
          </div>

          <div className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-[#10b981]">
              LIVE
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-black uppercase italic leading-none">
              Escanea
            </h1>

            <h2 className="mt-1 text-[34px] font-black uppercase italic leading-none text-[#10b981]">
              tu comida
            </h2>

            <p className="mt-3 max-w-[230px] text-[11px] normal-case leading-5 text-slate-300">
              La IA analiza calorías, macros, ingredientes y si encaja con tu objetivo.
            </p>
          </div>

          <div className="relative grid h-[104px] w-[104px] shrink-0 place-items-center rounded-[30px] border border-[#10b981]/20 bg-black/30">
            <div className="absolute inset-0 rounded-[30px] border border-[#10b981]/20 animate-ping opacity-20" />

            <div className="absolute inset-3 rounded-[24px] border border-white/10" />

            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#10b981] text-[#06110c] shadow-[0_0_40px_#10b98166]">
              <Camera size={28} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <HeroMiniStat icon={<Zap size={13} />} label="Rápido" value="IA" />
          <HeroMiniStat icon={<Sparkles size={13} />} label="Macros" value="Auto" />
          <HeroMiniStat icon={<Camera size={13} />} label="Foto" value="Scan" />
        </div>
      </div>
    </section>
  );
}

function HeroMiniStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-[#10b981]">
        {icon}
        <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
          {label}
        </p>
      </div>

      <p className="text-xs font-black uppercase text-white">{value}</p>
    </div>
  );
}