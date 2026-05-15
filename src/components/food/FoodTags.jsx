import {
  Beef,
  Flame,
  ShieldCheck,
  Sparkles,
  Wheat,
} from "lucide-react";

export default function FoodTags({ result }) {
  if (!result) return null;

  const tags = buildTags(result);

  if (tags.length === 0) return null;

  return (
    <section className="mt-1.5">
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tags.map((tag) => (
          <div
            key={tag.label}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 ${tag.color}`}
          >
            <div className="opacity-90">
              {tag.icon}
            </div>

            <span className="text-[7px] font-black uppercase tracking-[0.14em]">
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
      icon: <Beef size={10} />,
      color:
        "border-[#10b981]/15 bg-[#10b981]/10 text-[#10b981]",
    });
  }

  if (carbs <= 25) {
    tags.push({
      label: "Low carb",
      icon: <Wheat size={10} />,
      color:
        "border-cyan-400/15 bg-cyan-400/10 text-cyan-300",
    });
  }

  if (calories <= 550) {
    tags.push({
      label: "Ligera",
      icon: <Flame size={10} />,
      color:
        "border-orange-400/15 bg-orange-400/10 text-orange-300",
    });
  }

  if (fat <= 18) {
    tags.push({
      label: "Baja grasa",
      icon: <ShieldCheck size={10} />,
      color:
        "border-yellow-400/15 bg-yellow-400/10 text-yellow-300",
    });
  }

  if (score >= 8) {
    tags.push({
      label: "IA recomienda",
      icon: <Sparkles size={10} />,
      color:
        "border-purple-400/15 bg-purple-400/10 text-purple-300",
    });
  }

  return tags.slice(0, 4);
}