import { Camera, Flame, Gauge, Dumbbell } from "lucide-react";

export default function AIScanHero({ result }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#092016] p-4">
      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#10b981]/25 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
            AI Nutrition Scanner
          </p>

          <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#10b981]">
            Live
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[30px] font-black uppercase italic leading-[0.9]">
              Escanea <br />
              <span className="text-[#10b981]">tu comida</span>
            </h1>

            <p className="mt-3 max-w-[210px] text-[11px] normal-case leading-4 text-slate-300">
              Calorías, macros y calidad nutricional en segundos.
            </p>
          </div>

          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[26px] bg-[#10b981] text-[#04110b] shadow-[0_0_40px_#10b98155]">
            <Camera size={30} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <HeroStat
            icon={<Flame size={13} />}
            label="Kcal"
            value={result ? Math.round(result.calories || 0) : "--"}
          />

          <HeroStat
            icon={<Dumbbell size={13} />}
            label="Prot"
            value={result ? `${Math.round(result.protein || 0)}g` : "--"}
          />

          <HeroStat
            icon={<Gauge size={13} />}
            label="Score"
            value={result ? `${result.score || 0}/10` : "--"}
          />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-[#10b981]">
        {icon}

        <p className="text-[7px] font-black uppercase tracking-widest text-white/40">
          {label}
        </p>
      </div>

      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}