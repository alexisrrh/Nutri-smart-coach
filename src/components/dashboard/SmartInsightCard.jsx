import { Sparkles, Target, TrendingUp } from "lucide-react";

export default function SmartInsightCard({
  smartTip,
  nutritionScore,
  mealCount = 0,
  hasDiet = false,
}) {
  const insight = getInsight({ smartTip, nutritionScore, mealCount, hasDiet });

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#10b981]/15 bg-[#07170f] p-3">
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#10b981]/20 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#10b981]" />
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
              Insight IA
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1">
            <TrendingUp size={10} className={insight.color} />
            <span className={`text-[8px] font-black ${insight.color}`}>
              {insight.status}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-black uppercase italic text-white">
          {insight.title}
        </h3>

        <p className="mt-2 text-[11px] normal-case leading-5 text-slate-400">
          {insight.text}
        </p>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-[#10b981]" />
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/35">
              Acción recomendada
            </p>
          </div>

          <p className="mt-1 text-xs font-black normal-case text-white">
            {insight.action}
          </p>
        </div>
      </div>
    </section>
  );
}

function getInsight({ smartTip, nutritionScore, mealCount, hasDiet }) {
  if (!hasDiet) {
    return {
      status: "SETUP",
      color: "text-yellow-400",
      title: "Tu IA necesita una base",
      text: "Aún no tienes una dieta activa. Con un plan semanal, el sistema podrá comparar tus comidas contra un objetivo real.",
      action: "Crea tu dieta IA para activar recomendaciones precisas.",
    };
  }

  if (mealCount === 0) {
    return {
      status: "PEND.",
      color: "text-cyan-400",
      title: "Falta activar el día",
      text: "Hoy todavía no hay comidas escaneadas. La IA necesita al menos un registro para evaluar tu ritmo nutricional.",
      action: "Escanea tu primera comida del día.",
    };
  }

  if (nutritionScore >= 8) {
    return {
      status: "ÓPTIMO",
      color: "text-[#10b981]",
      title: "Tu día va fuerte",
      text: "Tus métricas están bien alineadas con el objetivo. Mantener este ritmo aumenta la probabilidad de progreso semanal.",
      action: "Mantén proteína alta y evita picoteos innecesarios.",
    };
  }

  if (nutritionScore >= 5) {
    return {
      status: "MEDIO",
      color: "text-yellow-400",
      title: "Hay margen de mejora",
      text: smartTip || "La IA detecta que puedes mejorar una métrica clave hoy.",
      action: "Haz tu próxima comida más limpia y alta en proteína.",
    };
  }

  return {
    status: "BAJO",
    color: "text-red-400",
    title: "Necesitas corregir el rumbo",
    text: smartTip || "Tu día todavía no está alineado con el objetivo principal.",
    action: "Escanea tu próxima comida antes de comer para decidir mejor.",
  };
}