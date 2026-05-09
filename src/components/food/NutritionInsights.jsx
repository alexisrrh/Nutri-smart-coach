import { AlertTriangle, CheckCircle2, Sparkles, Target } from "lucide-react";

export default function NutritionInsights({ result }) {
  if (!result) return null;

  const insights = buildInsights(result);

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07170f] p-4">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#10b981]" />

            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#10b981]">
              Insights IA
            </p>
          </div>

          <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#10b981]">
            Smart
          </span>
        </div>

        <div className="space-y-2">
          {insights.map((item) => (
            <InsightRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              text={item.text}
              type={item.type}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightRow({ icon, title, text, type }) {
  const styles =
    type === "warning"
      ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
      : type === "danger"
      ? "border-red-400/20 bg-red-400/10 text-red-300"
      : "border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-start gap-3">
        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border ${styles}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-white">
            {title}
          </p>

          <p className="mt-1 text-[11px] normal-case leading-5 text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function buildInsights(result) {
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);
  const score = Number(result.score || 0);

  const insights = [];

  if (score >= 8) {
    insights.push({
      title: "Buena elección",
      text:
        result.goal_fit ||
        "Esta comida encaja bastante bien con tu objetivo actual.",
      icon: <CheckCircle2 size={16} />,
      type: "success",
    });
  } else {
    insights.push({
      title: "Se puede mejorar",
      text:
        result.goal_fit ||
        "La comida puede encajar, pero conviene ajustar porción o acompañamientos.",
      icon: <Target size={16} />,
      type: "warning",
    });
  }

  if (protein < 20) {
    insights.push({
      title: "Proteína baja",
      text: "Añadir pollo, huevos, atún, yogur griego o proteína magra mejoraría la saciedad.",
      icon: <AlertTriangle size={16} />,
      type: "warning",
    });
  }

  if (calories > 850) {
    insights.push({
      title: "Comida alta en calorías",
      text: "Si tu objetivo es perder grasa, reduce salsas, fritos o porción de carbohidratos.",
      icon: <AlertTriangle size={16} />,
      type: "danger",
    });
  }

  if (insights.length === 1) {
    insights.push({
      title: "Siguiente mejora",
      text:
        result.recommendation ||
        "Mantén proteína alta y controla la porción para mejorar el resultado.",
      icon: <Sparkles size={16} />,
      type: "success",
    });
  }

  return insights.slice(0, 1);
}