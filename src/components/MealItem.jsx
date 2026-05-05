import { Flame, Beef, Wheat, Droplets, Clock } from "lucide-react";

export default function MealItem({
  meal,
  day,
  index,
  progress,
  toggleMeal,
}) {
  const image = getMealImage(meal.food);
  const key = `${day}-${index}`;
  const done = progress[key];

  return (
    <div
      className={`overflow-hidden rounded-3xl border ${
        done ? "border-emerald-400/40" : "border-white/10"
      } bg-white/5 transition`}
    >
      <div className="relative">
        <img
          src={image}
          alt={meal.food}
          className={`h-56 w-full object-cover ${
            done ? "opacity-70" : ""
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06130d]/90 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-black text-emerald-300">
              <Clock size={14} />
              {meal.time} · {meal.name}
            </span>

            <button
              onClick={() => toggleMeal(day, index)}
              className={`rounded-xl px-3 py-1 text-xs font-black transition ${
                done
                  ? "bg-emerald-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {done ? "✔ Hecho" : "Marcar"}
            </button>
          </div>

          <h4
            className={`text-2xl font-black ${
              done ? "line-through text-white/50" : "text-white"
            }`}
          >
            {meal.food}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <MiniMacro icon={<Flame size={16} />} title="Calorías" value={`${meal.calories} kcal`} />
        <MiniMacro icon={<Beef size={16} />} title="Proteína" value={`${meal.protein} g`} />
        <MiniMacro icon={<Wheat size={16} />} title="Carbs" value={`${meal.carbs} g`} />
        <MiniMacro icon={<Droplets size={16} />} title="Grasas" value={`${meal.fat} g`} />
      </div>
    </div>
  );
}

function MiniMacro({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="mb-1 text-emerald-300">{icon}</div>
      <p className="text-xs font-bold uppercase text-white/40">{title}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}

function getMealImage(food = "") {
  const text = food.toLowerCase();

  if (text.includes("pollo")) return "https://images.unsplash.com/photo-1532550907401-a500c9a57435";
  if (text.includes("arroz")) return "https://images.unsplash.com/photo-1512058564366-18510be2db19";
  if (text.includes("pescado")) return "https://images.unsplash.com/photo-1467003909585-2f8a72700288";
  if (text.includes("ensalada")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd";

  return "https://images.unsplash.com/photo-1490645935967-10de6ba17061";
}