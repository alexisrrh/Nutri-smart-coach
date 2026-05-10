import { Clock3, Flame } from "lucide-react";

export default function RecentMealsSlider({ meals = [] }) {
  if (!meals.length) return null;

  return (
    <section className="mt-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
          Escaneos recientes
        </p>

        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
          History
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {meals.map((meal, index) => (
          <div
            key={meal.id || index}
            className="relative h-[170px] min-w-[150px] overflow-hidden rounded-[28px] border border-white/10 bg-[#07170f]"
          >
            {meal.image || meal.image_url ? (
              <img
                src={meal.image || meal.image_url}
                alt={meal.food || "Comida"}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-black/25 text-[10px] font-black uppercase tracking-widest text-white/25">
                Sin foto
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#04110b] via-[#04110b]/35 to-transparent" />

            <div className="absolute left-3 top-3 rounded-full border border-[#10b981]/25 bg-black/50 px-2 py-1 backdrop-blur-xl">
              <p className="text-[7px] font-black uppercase tracking-widest text-[#10b981]">
                {meal.score || 0}/10
              </p>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <p className="line-clamp-2 text-[10px] font-black uppercase italic leading-4 text-white">
                {meal.food || "Comida analizada"}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#10b981]">
                  <Flame size={11} />
                  <span className="text-[8px] font-black">
                    {Math.round(meal.calories || 0)} kcal
                  </span>
                </div>

                <div className="flex items-center gap-1 text-white/40">
                  <Clock3 size={10} />
                  <span className="text-[7px] font-black uppercase">
                    reciente
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}