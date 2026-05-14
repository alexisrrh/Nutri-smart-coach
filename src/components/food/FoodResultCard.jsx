import { Beef, Droplets, Flame, Sparkles, Wheat } from "lucide-react";

export default function FoodResultCard({ result, preview }) {
  if (!result) return null;

  const score = Number(result.score || 0);
  const advice = getShortAdvice(result);

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#10b981]/20 bg-[#06140d] p-2 shadow-[0_24px_80px_rgba(16,185,129,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_42%)]" />

      <div className="relative z-10 space-y-2">
        <div className="relative h-[132px] overflow-hidden rounded-[20px] border border-white/10 bg-black/30">
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

          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border border-[#10b981]/20 bg-black/50 px-2.5 py-1 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_12px_#10b981]" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#10b981]">
              AI Scan
            </span>
          </div>

          <div className="absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-[16px] border border-[#10b981]/25 bg-[#10b981]/15 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-[22px] font-black italic leading-none text-[#10b981]">
                {score}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wide text-white/45">
                score
              </p>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2">
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              Comida detectada
            </p>

            <h2 className="line-clamp-1 text-[15px] font-black uppercase italic leading-tight text-white drop-shadow">
              {result.food || "Comida detectada"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_92px] gap-2">
          <div className="rounded-[20px] border border-[#10b981]/20 bg-[#10b981]/10 p-2">
            <div className="mb-1.5 flex items-center gap-1.5 text-[#10b981]">
              <Flame size={13} />
              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Energía
              </p>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-[28px] font-black italic leading-none text-white">
                {Math.round(result.calories || 0)}
              </span>
              <span className="pb-0.5 text-[10px] font-black uppercase text-slate-400">
                kcal
              </span>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-black/25 p-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-wide text-white/35">
              proteína
            </p>

            <p className="mt-1 text-[23px] font-black italic leading-none text-[#10b981]">
              {Math.round(result.protein || 0)}
              <span className="text-[10px]">g</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MacroMini icon={<Beef size={12} />} label="Prot" value={result.protein} unit="g" />
          <MacroMini icon={<Wheat size={12} />} label="Carbs" value={result.carbs} unit="g" />
          <MacroMini icon={<Droplets size={12} />} label="Grasas" value={result.fat} unit="g" />
        </div>

        <div className="rounded-[18px] border border-white/10 bg-black/20 p-2">
          <div className="flex items-start gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#10b981] text-[#06110c]">
              <Sparkles size={15} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#10b981]">
                Veredicto IA
              </p>

              <p className="mt-0.5 text-xs leading-4 text-emerald-100/85">
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
    <div className="rounded-xl border border-white/10 bg-black/20 p-2">
      <div className="mb-1 flex items-center gap-1 text-[#10b981]">
        {icon}

        <p className="text-[10px] font-black uppercase tracking-wide text-white/35">
          {label}
        </p>
      </div>

      <p className="text-base font-black text-white">
        {Math.round(value || 0)}
        <span className="ml-1 text-[10px] text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

function getShortAdvice(result) {
  const score = Number(result.score || 0);
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);

  if (score >= 8) return "Buena opción. Mantén una porción controlada.";
  if (protein < 20) return "Baja en proteína. Añade una fuente magra.";
  if (calories > 850) return "Alta en calorías. Reduce salsas o fritos.";

  return "Comida aceptable. Ajusta porción y proteína.";
}
