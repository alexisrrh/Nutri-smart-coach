import { Beef, Droplets, Flame, Sparkles, Wheat } from "lucide-react";

export default function FoodResultCard({ result }) {
  if (!result) return null;

  const score = Number(result.score || 0);
  const foodName = shorten(result.food || "Comida detectada", 32);
  const shortAdvice = getShortAdvice(result);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#10b981]/25 bg-[#06140d] p-3 shadow-[0_30px_120px_rgba(16,185,129,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_42%)]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_14px_#10b981]" />
            <p className="text-[8px] font-black uppercase tracking-[0.26em] text-[#10b981]">
              AI Food Result
            </p>
          </div>

          <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#10b981]">
            Verified
          </span>
        </div>

        <div className="grid grid-cols-[1fr_82px] gap-3">
          <div className="min-w-0">
            <h2 className="text-[23px] font-black uppercase italic leading-[0.95] text-white">
              {foodName}
            </h2>

            <p className="mt-2 line-clamp-2 text-[11px] normal-case leading-5 text-slate-400">
              {shortAdvice}
            </p>
          </div>

          <div className="relative grid h-[82px] w-[82px] place-items-center rounded-[26px] border border-[#10b981]/20 bg-[#10b981]/10">
            <div className="absolute inset-0 rounded-[26px] bg-[#10b981]/10 blur-xl" />
            <div className="relative text-center">
              <p className="text-3xl font-black italic leading-none text-[#10b981]">
                {score}
              </p>
              <p className="mt-1 text-[7px] font-black uppercase tracking-widest text-white/40">
                score
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-black/25 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/35">
                Calorías
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-5xl font-black italic leading-none text-white">
                  {Math.round(result.calories || 0)}
                </span>
                <span className="pb-1 text-xs font-black uppercase text-slate-500">
                  kcal
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-2 text-right">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
                proteína
              </p>
              <p className="text-xl font-black text-[#10b981]">
                {Math.round(result.protein || 0)}g
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <MacroMini icon={<Beef size={14} />} label="Prot" value={result.protein} unit="g" />
          <MacroMini icon={<Wheat size={14} />} label="Carb" value={result.carbs} unit="g" />
          <MacroMini icon={<Droplets size={14} />} label="Fat" value={result.fat} unit="g" />
        </div>

        <div className="mt-3 rounded-[24px] border border-[#10b981]/15 bg-[#10b981]/10 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#06110c]">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
                Veredicto IA
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] normal-case leading-5 text-emerald-100/85">
                {shortAdvice}
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

function shorten(text, max) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function getShortAdvice(result) {
  const score = Number(result.score || 0);
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);

  if (score >= 8) return "Buena opción para tu objetivo. Mantén una porción controlada.";
  if (protein < 20) return "Baja en proteína. Añade pollo, huevo, atún o yogur griego.";
  if (calories > 850) return "Alta en calorías. Reduce salsas, fritos o carbohidratos.";
  return "Comida aceptable. Puedes mejorarla ajustando porción y proteína.";
}