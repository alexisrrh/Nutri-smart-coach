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

  return (
    <section className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagChip
          key={tag.label}
          icon={tag.icon}
          label={tag.label}
          color={tag.color}
        />
      ))}
    </section>
  );
}

function TagChip({ icon, label, color }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${color}`}
    >
      {icon}

      <span className="text-[9px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
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
      icon: <Beef size={12} />,
      color:
        "border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]",
    });
  }

  if (carbs <= 20) {
    tags.push({
      label: "Low carb",
      icon: <Wheat size={12} />,
      color:
        "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    });
  }

  if (calories <= 500) {
    tags.push({
      label: "Ligera",
      icon: <Flame size={12} />,
      color:
        "border-orange-400/20 bg-orange-400/10 text-orange-300",
    });
  }

  if (fat <= 15) {
    tags.push({
      label: "Baja grasa",
      icon: <ShieldCheck size={12} />,
      color:
        "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    });
  }

  if (score >= 8) {
    tags.push({
      label: "AI recomendado",
      icon: <Sparkles size={12} />,
      color:
        "border-purple-400/20 bg-purple-400/10 text-purple-300",
    });
  }

  return tags;
}