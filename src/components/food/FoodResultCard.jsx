import { Beef, Droplets, Flame, Sparkles, Wheat } from "lucide-react";

export default function FoodResultCard({ result, preview }) {
  if (!result) return null;

  const score = Number(result.score || 0);
  const advice = getShortAdvice(result);

  return (
    <section
      className="relative overflow-hidden rounded-[24px] border p-2 shadow-[0_24px_80px_var(--app-glow)]"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top right, var(--app-primary-soft), transparent 42%)",
        }}
      />

      <div className="relative z-10 space-y-2">
        <div className="relative h-[132px] overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)]">
          {preview || result.image_url ? (
            <img
              src={preview || result.image_url}
              alt={result.food || "Comida analizada"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-[var(--app-muted)]">
              Sin imagen
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--app-surface) 0%, color-mix(in srgb, var(--app-surface) 35%, transparent) 65%, transparent 100%)",
            }}
          />

          <div
            className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-xl"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "color-mix(in srgb, var(--app-surface) 55%, transparent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_12px_var(--app-glow)]"
              style={{ backgroundColor: "var(--app-primary)" }}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              AI Scan
            </span>
          </div>

          <div
            className="theme-icon-tile absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-[16px] border backdrop-blur-xl"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-primary-soft)",
            }}
          >
            <div className="text-center">
              <p className="text-[22px] font-black leading-none text-[var(--app-primary)]">
                {score}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
                score
              </p>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2">
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Comida detectada
            </p>

            <h2 className="line-clamp-1 text-[15px] font-black leading-tight text-[var(--app-text)] drop-shadow">
              {result.food || "Comida detectada"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_92px] gap-2">
          <div
            className="rounded-[20px] border p-2"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-primary-soft)",
            }}
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[var(--app-primary)]">
              <Flame size={13} />
              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Energía
              </p>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-[28px] font-black leading-none text-[var(--app-text)]">
                {Math.round(result.calories || 0)}
              </span>
              <span className="pb-0.5 text-[10px] font-black uppercase text-[var(--app-muted)]">
                kcal
              </span>
            </div>
          </div>

          <div
            className="rounded-[20px] border p-2 text-right"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-surface)",
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
              proteína
            </p>

            <p className="mt-1 text-[23px] font-black leading-none text-[var(--app-primary)]">
              {Math.round(result.protein || 0)}
              <span className="text-[10px]">g</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MacroMini icon={<Beef size={12} />} label="Prot" value={result.protein} unit="g" />
          <MacroMini icon={<Wheat size={12} />} label="Carbs" value={result.carbs} unit="g" />
          <MacroMini icon={<Droplets size={12} />} label="Grasas" value={result.fat} unit="g" />
        </div>

        <div className="rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
          <div className="flex items-start gap-2.5">
            <div className="theme-icon-tile grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-[var(--app-surface)]">
              <Sparkles size={15} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Veredicto IA
              </p>

              <p className="mt-0.5 text-xs leading-4 text-[var(--app-text)]/85">
                {advice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroMini({ icon, label, value, unit }) {
  return (
    <div
      className="rounded-xl border p-2"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
      }}
    >
      <div className="mb-1 flex items-center gap-1 text-[var(--app-primary)]">
        {icon}

        <p className="text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
          {label}
        </p>
      </div>

      <p className="text-base font-black text-[var(--app-text)]">
        {Math.round(value || 0)}
        <span className="ml-1 text-[10px] text-[var(--app-muted)]">{unit}</span>
      </p>
    </div>
  );
}

function getShortAdvice(result) {
  const score = Number(result.score || 0);
  const protein = Number(result.protein || 0);
  const calories = Number(result.calories || 0);

  if (score >= 8) return "Buena opción. Mantén una porción controlada.";
  if (protein < 20) return "Baja en proteína. Añade una fuente magra.";
  if (calories > 850) return "Alta en calorías. Reduce salsas o fritos.";

  return "Comida aceptable. Ajusta porción y proteína.";
}
