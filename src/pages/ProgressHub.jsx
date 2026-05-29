import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Medal,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { AppShell, MetaBadge, SurfaceCard } from "../components/ui";

const weeklyStats = [
  { label: "Racha", value: "7", icon: Sparkles },
  { label: "Comidas", value: "43", icon: CalendarDays },
  { label: "Check-ins", value: "12", icon: CheckCircle2 },
  { label: "Rutinas", value: "18", icon: TrendingUp },
];

const recentActivity = [
  { label: "Comida analizada", xp: "+5 XP", tone: "food" },
  { label: "Check-in completado", xp: "+10 XP", tone: "checkin" },
  { label: "Rutina completada", xp: "+15 XP", tone: "routine" },
  { label: "Dieta semanal activa", xp: "+20 XP", tone: "diet" },
];

export function ProgressHub() {
  const navigate = useNavigate();

  const progress = useMemo(
    () => ({
      level: 4,
      xp: 840,
      percent: 84,
      remaining: 160,
      nextLevel: 5,
      nextAchievement: 76,
    }),
    []
  );

  return (
    <AppShell
      contentClassName="!px-2 !pt-2 !pb-0"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-[calc(var(--bottom-nav-space)+56px+env(safe-area-inset-bottom))]"
    >
      <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-2 rounded-[32px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2 pb-3 pt-2 shadow-[0_18px_54px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 14% 10%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 25%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.12)_100%)]" />

        <div className="relative z-10 flex flex-col gap-2.5">
          <header className="relative overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-card))] p-2.5 shadow-[0_18px_54px_var(--app-glow)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 28%)",
              }}
            />

            <div className="relative z-10 flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <MetaBadge variant="neutral" icon={<Sparkles size={11} />}>
                  PROGRESS HUB
                </MetaBadge>
                <h1 className="mt-1.5 text-[18px] font-black leading-none tracking-tight text-[var(--app-text)]">
                  Tu evolución
                </h1>
                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Rachas, logros y progreso inteligente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_86%,transparent),color-mix(in_srgb,var(--app-card)_92%,transparent))] px-2.5 py-1 text-[9px] font-semibold tracking-[0.03em] text-[var(--app-text)] shadow-[0_8px_18px_color-mix(in_srgb,var(--app-primary)_14%,transparent)] transition duration-200 hover:-translate-y-[1px] active:scale-[0.985]"
              >
                <ArrowLeft size={11} className="text-[var(--app-primary)]" />
                Volver
              </button>
            </div>
          </header>

          <SurfaceCard className="relative overflow-hidden rounded-[1.4rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-surface))] px-2.5 py-2.5 shadow-[0_18px_46px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 16%, color-mix(in srgb, var(--app-primary) 14%, transparent), transparent 28%), radial-gradient(circle at 86% 20%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 24%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 5%, transparent), transparent 30%)",
              }}
            />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <MetaBadge variant="neutral" icon={<Target size={11} />}>
                    XP Core
                  </MetaBadge>
                  <h2 className="mt-1.5 text-[14px] font-semibold leading-tight tracking-tight text-[var(--app-text)]">
                    Nivel {progress.level}
                  </h2>
                  <p className="mt-1 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
                    {progress.xp} XP · {progress.remaining} XP para Nivel {progress.nextLevel}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                  {progress.percent}%
                </span>
              </div>

              <div className="flex items-center gap-2.5 rounded-[1.25rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="relative flex h-[6rem] w-[6rem] shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(var(--app-primary) 0 84%, color-mix(in_srgb,var(--app-border)_75%,transparent) 84% 100%)",
                      boxShadow: "0 0 26px var(--app-glow)",
                    }}
                  />
                  <div className="absolute inset-[0.3rem] rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,transparent),color-mix(in_srgb,var(--app-surface)_92%,transparent))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
                  <div className="absolute inset-[0.84rem] rounded-full border border-[var(--app-primary)]/10 ai-core-ambient-breath" />
                  <div className="absolute inset-[1.08rem] rounded-full border border-[var(--app-primary)]/16 ai-core-orb-heartbeat bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.16),transparent_24%),linear-gradient(180deg,var(--app-primary-soft)_0%,color-mix(in_srgb,var(--app-primary)_14%,transparent)_100%)] shadow-[0_0_18px_var(--app-glow)]" />
                  <div className="absolute left-1/2 top-[11%] h-[56%] w-[1px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.26),transparent)] opacity-70" />
                  <div className="absolute left-[16%] top-1/2 h-[1px] w-[68%] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--app-primary)_28%,transparent),transparent)] opacity-80" />
                  <div className="absolute left-[19%] top-[24%] h-2 w-2 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)] ai-core-live-dot" />
                  <div className="absolute right-[18%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/70 shadow-[0_0_10px_var(--app-glow)]" />
                  <div className="absolute inset-[16%] rounded-full border border-white/5" />

                  <div className="relative z-10 text-center">
                    <div className="text-[18px] font-black leading-none text-[var(--app-text)] shadow-[0_0_12px_var(--app-glow)]">
                      {progress.percent}%
                    </div>
                    <p className="mt-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      Nivel {progress.level}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                    XP Core
                  </p>
                  <p className="mt-1 text-[13px] font-black leading-none text-[var(--app-text)]">
                    {progress.xp} XP
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    {progress.remaining} XP restantes para Nivel {progress.nextLevel}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_60%,white))] shadow-[0_0_12px_var(--app-glow)]"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <section className="grid grid-cols-2 gap-1.5">
            {weeklyStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <SurfaceCard
                  key={stat.label}
                  className="rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-[19px] font-black leading-none text-[var(--app-text)]">
                        {stat.value}
                      </p>
                    </div>
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]">
                      <Icon size={14} />
                    </div>
                  </div>
                </SurfaceCard>
              );
            })}
          </section>

          <section className="grid gap-1.5">
            <SurfaceCard className="rounded-[1.2rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    Último logro
                  </p>
                  <p className="mt-1 text-[13px] font-black text-[var(--app-text)]">
                    Nutri Explorer
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    Desbloqueado recientemente
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                  <Medal size={10} />
                  Reciente
                </span>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-[1.2rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    Próximo logro
                  </p>
                  <p className="mt-1 text-[13px] font-black text-[var(--app-text)]">
                    Nutri Master
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    10 comidas restantes
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                  {progress.nextAchievement}%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_60%,white))] shadow-[0_0_12px_var(--app-glow)]"
                  style={{ width: `${progress.nextAchievement}%` }}
                />
              </div>
            </SurfaceCard>
          </section>

          <section className="rounded-[1.3rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Actividad reciente
                </p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  XP acumulado en las últimas acciones.
                </p>
              </div>
              <Clock3 size={14} className="text-[var(--app-primary)]" />
            </div>

            <div className="mt-2 space-y-1.5">
              {recentActivity.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 rounded-[1rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold leading-tight text-[var(--app-text)]">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium text-[var(--app-muted)]">
                      NutriSmartCoach
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-[var(--app-primary)]">
                    {item.xp}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.3rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Estado IA
                </p>
                <p className="mt-1 text-[12px] font-black text-[var(--app-text)]">
                  Progreso sincronizado
                </p>
              </div>
              <Sparkles size={14} className="text-[var(--app-primary)]" />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-text)]">
                Datos seguros
              </span>
              <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-text)]">
                Coach IA activo
              </span>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
