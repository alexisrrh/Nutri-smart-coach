import {
  Beef,
  Droplets,
  Flame,
  Sparkles,
  Wheat,
} from "lucide-react";

export default function FoodResultCard({ result, preview }) {
  if (!result) return null;

  const score = Number(result.score || 0);

  return (
    <section className="mt-3 overflow-hidden rounded-[32px] border border-[#10b981]/20 bg-[#081811] shadow-[0_30px_120px_rgba(16,185,129,0.14)]">
      {/* IMAGE */}
      <div className="relative h-[270px] overflow-hidden">
        {preview && (
          <img
            src={preview}
            alt="Food"
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#04110b] via-[#04110b]/20 to-transparent" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_40%)]" />

        {/* TOP */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <div className="rounded-full border border-[#10b981]/25 bg-black/40 px-3 py-1 backdrop-blur-xl">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
              AI RESULT
            </p>
          </div>

          <div className="grid h-[74px] w-[74px] place-items-center rounded-[26px] border border-[#10b981]/25 bg-black/45 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-3xl font-black italic leading-none text-[#10b981]">
                {score}
              </p>

              <p className="mt-1 text-[7px] font-black uppercase tracking-widest text-white/40">
                score
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            Comida detectada
          </p>

          <h2 className="mt-2 text-[20px] font-black uppercase italic leading-[1.1] text-white">
            {result.food || "Comida detectada"}
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-3 p-3">
        {/* MAIN STATS */}
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-2">
          <MainStat
            icon={<Flame size={16} />}
            label="Calorías"
            value={Math.round(result.calories || 0)}
            unit="kcal"
          />

          <ProteinStat
            value={Math.round(result.protein || 0)}
          />
        </div>

        {/* MACROS */}
        <div className="grid grid-cols-3 gap-2">
          <MiniStat
            icon={<Beef size={13} />}
            label="Prot"
            value={result.protein}
            unit="g"
          />

          <MiniStat
            icon={<Wheat size={13} />}
            label="Carb"
            value={result.carbs}
            unit="g"
          />

          <MiniStat
            icon={<Droplets size={13} />}
            label="Fat"
            value={result.fat}
            unit="g"
          />
        </div>

        {/* VERDICT */}
        <div className="rounded-[24px] bg-[#10b981]/10 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#04110b]">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#10b981]">
                Veredicto IA
              </p>

              <p className="mt-1 text-[11px] leading-5 text-emerald-100/85">
                {getAdvice(result)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MainStat({ icon, label, value, unit }) {
  return (
    <div className="rounded-[24px] bg-black/25 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#10b981]">
        {icon}

        <p className="text-[8px] font-black uppercase tracking-[0.22em]">
          {label}
        </p>
      </div>

      <div className="flex items-end gap-2">
        <p className="text-5xl font-black italic leading-none text-white">
          {value}
        </p>

        <p className="pb-1 text-xs font-black uppercase text-slate-500">
          {unit}
        </p>
      </div>
    </div>
  );
}

function ProteinStat({ value }) {
  return (
    <div className="rounded-[24px] bg-[#10b981] p-4 text-[#04110b]">
      <p className="text-[8px] font-black uppercase tracking-[0.22em] opacity-70">
        proteína
      </p>

      <div className="mt-2">
        <p className="text-4xl font-black italic leading-none">
          {value}
          <span className="ml-1 text-sm">g</span>
        </p>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, unit }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <div className="mb-1 flex items-center gap-1 text-[#10b981]">
        {icon}

        <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
          {label}
        </p>
      </div>

      <p className="text-lg font-black text-white">
        {Math.round(value || 0)}
        <span className="ml-1 text-[9px] text-slate-500">
          {unit}
        </span>
      </p>
    </div>
  );
}

function getAdvice(result) {
  const score = Number(result.score || 0);
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);

  if (score >= 8) {
    return "Muy buena opción para tu objetivo. Alta calidad nutricional.";
  }

  if (protein < 20) {
    return "Baja en proteína. Añadir una fuente magra mejoraría el resultado.";
  }

  if (calories > 850) {
    return "Alta en calorías. Reduce frituras, salsas o carbohidratos.";
  }

  return "Comida aceptable. Ajusta proteína y porción para mejorarla.";
}