import { Clock3, Sparkles } from "lucide-react";

export default function MealHistorySlider({ meals = [] }) {
  if (!meals.length) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[7px] font-black uppercase tracking-[0.22em] text-[#10b981]">
            Historial IA
          </p>

          <h2 className="mt-0.5 text-base font-black uppercase italic">
            Últimos escaneos
          </h2>
        </div>

        <div className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1">
          <span className="text-[7px] font-black uppercase tracking-widest text-[#10b981]">
            {meals.length} comidas
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {meals.map((meal, index) => (
          <MealCard key={meal.id || index} meal={meal} />
        ))}
      </div>
    </section>
  );
}

function MealCard({ meal }) {
  const score = Number(meal.score || 0);
  const image = meal.image || meal.image_url;

  return (
    <div className="w-[170px] shrink-0 overflow-hidden rounded-[20px] border border-white/10 bg-[#07170f]">
      <div className="relative h-[105px] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={meal.food || "Comida"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center bg-black/20">
            <Sparkles size={22} className="text-[#10b981]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#06110c] via-transparent to-transparent" />

        <div className="absolute right-2 top-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-0.5 backdrop-blur-xl">
          <span className="text-[8px] font-black text-[#10b981]">
            {score}/10
          </span>
        </div>
      </div>

      <div className="p-2.5">
        <p className="truncate text-xs font-black uppercase italic text-white">
          {meal.food || "Comida"}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
              kcal
            </p>

            <p className="text-base font-black text-[#10b981]">
              {Math.round(meal.calories || 0)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
              prot
            </p>

            <p className="text-base font-black text-white">
              {Math.round(meal.protein || 0)}g
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-500">
          <Clock3 size={10} />

          <span>{formatMealDate(meal)}</span>
        </div>
      </div>
    </div>
  );
}

function formatMealDate(meal) {
  const date = meal.created_at || meal.createdAt;

  if (!date) return "Reciente";

  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}