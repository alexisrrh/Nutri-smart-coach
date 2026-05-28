import { ArrowLeft, ArrowRight, BarChart3, Bolt, Crown, Layers3, Sparkles, TimerReset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell, MetaBadge, SecondaryButton, SurfaceCard } from "../components/ui";

const comparisonRows = [
  { label: "Análisis IA", free: "4/día", premium: "Hasta 100/día" },
  { label: "Dietas", free: "1/día", premium: "Hasta 10/día" },
  { label: "Prioridad", free: "Normal", premium: "Prioritaria" },
  { label: "Progreso", free: "Básico", premium: "Avanzado" },
  { label: "Capas futuras", free: "Estándar", premium: "Acceso temprano" },
];

const premiumHighlights = [
  {
    icon: Bolt,
    title: "Límites ampliados",
    copy: "Hasta 100 análisis de comida, 10 dietas IA y 7 check-ins IA al día para usuarios premium.",
  },
  {
    icon: BarChart3,
    title: "Progreso avanzado",
    copy: "Lecturas más profundas, ritmo de evolución y señales más claras para decidir con contexto.",
  },
  {
    icon: TimerReset,
    title: "Prioridad operativa",
    copy: "Respuestas y colas preparadas para una experiencia más rápida y consistente.",
  },
  {
    icon: Layers3,
    title: "Futuras funciones",
    copy: "Una base lista para nuevas capas premium sin romper la experiencia actual.",
  },
];

export function Premium() {
  const navigate = useNavigate();

  return (
    <AppShell
      withBottomNav={true}
      hideBottomNav
      wide
      contentClassName="!px-2 !pt-2 !pb-[calc(140px+env(safe-area-inset-bottom))]"
    >
      <main className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-3 rounded-[36px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-3 py-3 shadow-[0_24px_60px_-18px_var(--app-glow)] md:my-6 md:min-h-[880px] md:rounded-[40px] md:border-8 md:px-4 md:py-4">
          <header className="shrink-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <SecondaryButton
                onClick={() => navigate(-1)}
                icon={<ArrowLeft size={14} />}
                className="w-auto px-2.5 py-1.5 text-[10px]"
              >
                Volver
              </SecondaryButton>

              <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
                Premium preview
              </MetaBadge>
            </div>

            <SurfaceCard className="relative overflow-hidden p-4" radius="xl">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--app-primary) 9%, transparent), transparent 28%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 6%, transparent), transparent 34%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_28%,rgba(0,0,0,0.1)_100%)]" />

              <div className="relative z-10 flex items-start gap-4">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-[1.5rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] text-[var(--app-primary)] shadow-[0_0_32px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--app-primary)_18%,transparent),transparent_58%)] opacity-80" />
                  <div className="absolute inset-2 rounded-full border border-[var(--app-primary)]/12 animate-[restOrbPulse_4.5s_ease-in-out_infinite]" />
                  <div className="absolute inset-3 rounded-full border border-[var(--app-primary)]/20 animate-[restOrbPulse_5.4s_ease-in-out_infinite]" />
                  <Crown size={28} className="relative z-10" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <MetaBadge variant="neutral">Premium</MetaBadge>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
                      Próximamente
                    </span>
                  </div>

                  <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-[var(--app-text)]">
                    Premium que amplía tus límites diarios y acelera la lectura.
                  </h1>
                  <p className="mt-2 max-w-[30rem] text-[13px] font-medium leading-6 text-[var(--app-muted)]">
                    Un nivel de cuenta diseñado para escalar la IA, priorizar respuestas y abrir futuras capas
                    sin cambiar la base del producto.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <PremiumChip>Límites ampliados</PremiumChip>
                    <PremiumChip>Hasta 100 análisis de comida al día</PremiumChip>
                    <PremiumChip>Hasta 10 dietas IA al día</PremiumChip>
                    <PremiumChip>Hasta 7 check-ins IA al día</PremiumChip>
                    <PremiumChip>Análisis prioritario</PremiumChip>
                    <PremiumChip>Progreso avanzado</PremiumChip>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </header>

          <SurfaceCard className="p-3.5" radius="lg" variant="soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <MetaBadge variant="neutral">Comparación</MetaBadge>
                <h2 className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--app-text)]">
                  Free vs Premium
                </h2>
                <p className="mt-1.5 text-[12px] font-medium leading-5 text-[var(--app-muted)]">
                  La diferencia clave es capacidad, velocidad y margen para crecer.
                </p>
              </div>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                Vista previa
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              <div className="grid grid-cols-[1.2fr_.8fr_.9fr] gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                <span />
                <span className="text-center">Free</span>
                <span className="text-center text-[var(--app-primary)]">Premium</span>
              </div>

              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.2fr_.8fr_.9fr] items-center gap-2 rounded-[1rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                >
                  <span className="min-w-0 truncate text-[12px] font-medium text-[var(--app-text)]">
                    {row.label}
                  </span>
                  <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-center text-[9px] font-semibold text-[var(--app-muted)]">
                    {row.free}
                  </span>
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_72%,transparent)_0%,color-mix(in_srgb,var(--app-primary-soft)_42%,transparent)_100%)] px-2 py-1 text-center text-[9px] font-semibold text-[var(--app-text)] shadow-[0_0_16px_var(--app-glow)]">
                    {row.premium}
                  </span>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-3.5" radius="lg" variant="soft">
            <MetaBadge variant="neutral">Ventajas</MetaBadge>
            <h2 className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--app-text)]">
              Lo que desbloquea
            </h2>
            <div className="mt-3 grid gap-2">
              {premiumHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-[1rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold leading-tight text-[var(--app-text)]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                        {item.copy}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-3.5" radius="lg" variant="soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <MetaBadge variant="neutral">CTA</MetaBadge>
                <h2 className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--app-text)]">
                  Próximamente
                </h2>
                <p className="mt-1.5 text-[12px] font-medium leading-5 text-[var(--app-muted)]">
                  La base ya está preparada. El bloqueo de pago todavía no está activo.
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.1rem] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
                <ArrowRight size={17} />
              </span>
            </div>

            <div className="mt-3">
              <SecondaryButton disabled icon={<Sparkles size={14} />}>
                Próximamente
              </SecondaryButton>
            </div>
          </SurfaceCard>
        </div>
      </main>
    </AppShell>
  );
}

function PremiumChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--app-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_84%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2.5 py-1 text-[9px] font-medium tracking-[0.12em] text-[var(--app-text)] shadow-[0_0_14px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
      {children}
    </span>
  );
}
