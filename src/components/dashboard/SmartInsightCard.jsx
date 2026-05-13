import { Lightbulb, Target } from "lucide-react";

export default function SmartInsightCard({
  smartTip,
  nutritionScore,
  mealCount = 0,
  hasDiet = false,
}) {
  const insight = getInsight({
    smartTip,
    nutritionScore,
    mealCount,
    hasDiet,
  });

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[#07170f] p-5 shadow-[0_20px_70px_rgba(16,185,129,0.08)]">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Lightbulb size={19} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/60">
                Consejo IA
              </p>

              <h3 className="mt-1 text-lg font-black italic leading-tight text-white">
                {insight.title}
              </h3>
            </div>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${insight.badgeClass}`}
          >
            {insight.status}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-white/60">
          {insight.text}
        </p>

        <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target size={15} className="text-emerald-300" />

            <p className="text-[9px] font-black uppercase tracking-widest text-white/35">
              Próximo paso recomendado
            </p>
          </div>

          <p className="text-sm font-bold leading-relaxed text-white">
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
      status: "Configurar",
      badgeClass: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
      title: "Primero crea tu plan base",
      text:
        "Aún no tienes una dieta activa. Cuando crees tu plan semanal, NutriSmart podrá comparar tus comidas contra una meta real.",
      action:
        "Crea una dieta IA desde la sección Plan para recibir recomendaciones más precisas.",
    };
  }

  if (mealCount === 0) {
    return {
      status: "Pendiente",
      badgeClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      title: "Activa el seguimiento de hoy",
      text:
        "Todavía no has escaneado comidas hoy. Cuando subas tu primera foto, verás cuántas calorías llevas y cuánto te falta.",
      action:
        "Escanea tu primera comida para empezar a completar tu objetivo diario.",
    };
  }

  if (nutritionScore >= 8) {
    return {
      status: "Excelente",
      badgeClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      title: "Vas muy bien hoy",
      text:
        "Tus comidas van alineadas con tu objetivo. Mantener este ritmo hará que tu progreso semanal sea más fácil de sostener.",
      action:
        "Sigue priorizando proteína y evita calorías extra innecesarias.",
    };
  }

  if (nutritionScore >= 5) {
    return {
      status: "Mejorable",
      badgeClass: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
      title: "Puedes mejorar la próxima comida",
      text:
        smartTip ||
        "La IA detecta que aún puedes mejorar alguna métrica importante de hoy.",
      action:
        "Haz tu próxima comida más alta en proteína y escanéala para ajustar mejor tu día.",
    };
  }

  return {
    status: "Atención",
    badgeClass: "border-red-400/20 bg-red-400/10 text-red-300",
    title: "Vamos a corregir el rumbo",
    text:
      smartTip ||
      "Tu día todavía no está alineado con el objetivo, pero puedes mejorarlo con tu próxima comida.",
    action:
      "Elige una comida más limpia, alta en proteína y escanéala antes de cerrar el día.",
  };
}
