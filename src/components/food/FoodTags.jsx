import { Beef, Flame, ShieldCheck, Sparkles, Wheat } from "lucide-react";

export default function FoodTags({ result }) {
  if (!result) return null;

  const tags = buildTags(result);

  if (tags.length === 0) return null;

  return (
    <section className="mt-2">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tags.map((tag) => (
          <div
            key={tag.label}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 ${tag.color}`}
          >
            {tag.icon}
            <span className="text-[8px] font-black uppercase tracking-[0.16em]">
              {tag.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildTags(result) {
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);
  const carbs = Number(result.carbs || 0);
  const fat = Number(result.fat || 0);
  const score = Number(result.score || 0);

  const tags = [];

  if (protein >= 25) {
    tags.push({
      label: "Alta proteína",
      icon: <Beef size={11} />,
      color: "border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]",
    });
  }

  if (carbs <= 25) {
    tags.push({
      label: "Low carb",
      icon: <Wheat size={11} />,
      color: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    });
  }

  if (calories <= 550) {
    tags.push({
      label: "Ligera",
      icon: <Flame size={11} />,
      color: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    });
  }

  if (fat <= 18) {
    tags.push({
      label: "Baja grasa",
      icon: <ShieldCheck size={11} />,
      color: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    });
  }

  if (score >= 8) {
    tags.push({
      label: "IA recomienda",
      icon: <Sparkles size={11} />,
      color: "border-purple-400/20 bg-purple-400/10 text-purple-300",
    });
  }

  return tags.slice(0, 4);
}