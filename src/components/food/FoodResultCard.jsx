import { Beef, Droplets, Flame, Sparkles, Wheat } from "lucide-react";

export default function FoodResultCard({ result, preview }) {
  if (!result) return null;

  const score = Number(result.score || 0);
  const advice = getShortAdvice(result);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#10b981]/25 bg-[#06140d] p-3 shadow-[0_30px_120px_rgba(16,185,129,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98126,transparent_42%)]" />

      <div className="relative z-10 space-y-3">
        <div className="relative h-[210px] overflow-hidden rounded-[30px] border border-white/10 bg-black/30">
          {preview || result.image_url ? (
            <img
              src={preview || result.image_url}
              alt={result.food || "Comida analizada"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-white/30">
              Sin imagen
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#06140d] via-[#06140d]/35 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-black/50 px-3 py-1.5 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_14px_#10b981]" />
            <span className="text-[8px] font-black uppercase tracking-[0.22em] text-[#10b981]">
              AI Scan
            </span>
          </div>

          <div className="absolute right-3 top-3 grid h-[70px] w-[70px] place-items-center rounded-[24px] border border-[#10b981]/25 bg-[#10b981]/15 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-3xl font-black italic leading-none text-[#10b981]">
                {score}
              </p>
              <p className="mt-1 text-[7px] font-black uppercase tracking-widest text-white/45">
                score
              </p>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <p className="mb-1 text-[8px] font-black uppercase tracking-[0.24em] text-white/40">
              Comida detectada
            </p>

            <h2 className="text-[18px] font-black uppercase italic leading-[1.1] text-white drop-shadow">
              {result.food || "Comida detectada"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_105px] gap-2">
          <div className="rounded-[26px] border border-[#10b981]/20 bg-[#10b981]/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-[#10b981]">
              <Flame size={15} />
              <p className="text-[8px] font-black uppercase tracking-[0.22em]">
                Energía
              </p>
            </div>

            <div className="flex items-end gap-1.5">
              <span className="text-4xl font-black italic leading-none text-white">
                {Math.round(result.calories || 0)}
              </span>
              <span className="pb-1 text-xs font-black uppercase text-slate-400">
                kcal
              </span>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-black/25 p-3 text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
              proteína
            </p>

            <p className="mt-2 text-3xl font-black italic text-[#10b981]">
              {Math.round(result.protein || 0)}
              <span className="text-xs">g</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MacroMini
            icon={<Beef size={14} />}
            label="Proteína"
            value={result.protein}
            unit="g"
          />

          <MacroMini
            icon={<Wheat size={14} />}
            label="Carbs"
            value={result.carbs}
            unit="g"
          />

          <MacroMini
            icon={<Droplets size={14} />}
            label="Grasas"
            value={result.fat}
            unit="g"
          />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#06110c]">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
                Veredicto IA
              </p>

              <p className="mt-1 text-[11px] normal-case leading-5 text-emerald-100/85">
                {advice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroMini({ icon, label, value, unit }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[#10b981]">
        {icon}

        <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
          {label}
        </p>
      </div>

      <p className="text-lg font-black text-white">
        {Math.round(value || 0)}
        <span className="ml-1 text-[9px] text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

function getShortAdvice(result) {
  const score = Number(result.score || 0);
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);

  if (score >= 8) {
    return "Buena opción para tu objetivo. Mantén una porción controlada.";
  }

  if (protein < 20) {
    return "Baja en proteína. Puedes mejorarla añadiendo una fuente magra.";
  }

  if (calories > 850) {
    return "Alta en calorías. Reduce salsas, fritos o carbohidratos.";
  }

  return "Comida aceptable. Ajusta porción y proteína para mejorarla.";
}