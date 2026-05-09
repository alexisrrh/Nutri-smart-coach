import { Clock3, Sparkles } from "lucide-react";

export default function MealHistorySlider({ meals = [] }) {
  if (!meals.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            Historial IA
          </p>

          <h2 className="mt-1 text-lg font-black uppercase italic">
            Últimos escaneos
          </h2>
        </div>

        <div className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-[#10b981]">
            {meals.length} comidas
          </span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {meals.map((meal, index) => (
          <MealCard key={meal.id || index} meal={meal} />
        ))}
      </div>
    </section>
  );
}

function MealCard({ meal }) {
  const score = Number(meal.score || 0);

  return (
    <div className="w-[220px] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#07170f]">
      {/* IMAGE */}
      <div className="relative h-[150px] overflow-hidden">
        {meal.image_url ? (
          <img
            src={meal.image_url}
            alt={meal.food}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center bg-black/20">
            <Sparkles size={28} className="text-[#10b981]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#06110c] via-transparent to-transparent" />

        <div className="absolute right-3 top-3 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 backdrop-blur-xl">
          <span className="text-[9px] font-black text-[#10b981]">
            {score}/10
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3">
        <p className="truncate text-sm font-black uppercase italic text-white">
          {meal.food || "Comida"}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
              kcal
            </p>

            <p className="text-xl font-black text-[#10b981]">
              {Math.round(meal.calories || 0)}
            </p>
          </div>

          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
              proteína
            </p>

            <p className="text-lg font-black text-white">
              {Math.round(meal.protein || 0)}g
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[9px] text-slate-500">
          <Clock3 size={11} />

          <span>
            {meal.created_at
              ? new Date(meal.created_at).toLocaleDateString("es-ES")
              : "Reciente"}
          </span>
        </div>
      </div>
    </div>
  );
}