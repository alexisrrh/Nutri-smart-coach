import { AlertTriangle, CheckCircle2, Sparkles, Target } from "lucide-react";

export default function NutritionInsights({ result }) {
  if (!result) return null;

  const insights = buildInsights(result);

  return (
    <section
      className="relative overflow-hidden rounded-[22px] border p-2.5"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--app-primary)]" />

            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              Insights IA
            </p>
          </div>

          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-primary)",
            }}
          >
            Smart
          </span>
        </div>

        <div className="space-y-1.5">
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
      : "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]";

  return (
    <div
      className="rounded-[16px] border p-2.5"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${styles}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-text)]">
            {title}
          </p>

          <p className="mt-0.5 text-xs leading-4 text-[var(--app-muted)]">
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
      icon: <CheckCircle2 size={14} />,
      type: "success",
    });
  } else {
    insights.push({
      title: "Se puede mejorar",
      text:
        result.goal_fit ||
        "Conviene ajustar porción o acompañamientos.",
      icon: <Target size={14} />,
      type: "warning",
    });
  }

  if (protein < 20) {
    insights.push({
      title: "Proteína baja",
      text: "Añade pollo, huevos, atún, yogur griego o proteína magra.",
      icon: <AlertTriangle size={14} />,
      type: "warning",
    });
  }

  if (calories > 850) {
    insights.push({
      title: "Alta en calorías",
      text: "Reduce salsas, fritos o porción de carbohidratos.",
      icon: <AlertTriangle size={14} />,
      type: "danger",
    });
  }

  if (insights.length === 1) {
    insights.push({
      title: "Siguiente mejora",
      text:
        result.recommendation ||
        "Mantén proteína alta y controla la porción.",
      icon: <Sparkles size={14} />,
      type: "success",
    });
  }

  return insights.slice(0, 1);
}
