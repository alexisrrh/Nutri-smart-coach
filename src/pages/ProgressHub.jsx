import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Dumbbell,
  Flame,
  Lock,
  Sparkles,
  Target,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import { AppShell, MetaBadge } from "../components/ui";
import { useProgressSummary } from "../hooks/progress/useProgressSummary";

export function ProgressHub() {
  const navigate = useNavigate();
  const { summary: progress, loading: loadingProgress } = useProgressSummary();

  const progressSnapshot = progress || DEFAULT_PROGRESS_SNAPSHOT;
  const counters = progressSnapshot.counters || DEFAULT_PROGRESS_SNAPSHOT.counters;
  const nextLevelGoals =
    progressSnapshot.nextLevelGoals || DEFAULT_PROGRESS_SNAPSHOT.nextLevelGoals;
  const unlockedAchievements = progressSnapshot.unlockedAchievements || [];
  const lockedAchievements = progressSnapshot.lockedAchievements || [];

  const missions = [
    {
      id: "meals",
      icon: UtensilsCrossed,
      label: "Comidas",
      current: nextLevelGoals.meals.current,
      required: nextLevelGoals.meals.required,
    },
    {
      id: "checkins",
      icon: Camera,
      label: "Check-ins",
      current: nextLevelGoals.checkins.current,
      required: nextLevelGoals.checkins.required,
    },
    {
      id: "workouts",
      icon: Dumbbell,
      label: "Entrenamientos",
      current: nextLevelGoals.workouts.current,
      required: nextLevelGoals.workouts.required,
    },
    {
      id: "diets",
      icon: Flame,
      label: "Dietas",
      current: nextLevelGoals.diets.current,
      required: nextLevelGoals.diets.required,
    },
  ];

  return (
    <AppShell
      contentClassName="!px-2 !pt-[calc(env(safe-area-inset-top)+16px)] !pb-0"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-28"
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
            <DecorativeParticles />

            <div className="relative z-10 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <MetaBadge variant="neutral" icon={<Sparkles size={11} />}>
                  CENTRO DE PROGRESO
                </MetaBadge>
                <h1 className="mt-1.5 text-[18px] font-black leading-none tracking-tight text-[var(--app-text)]">
                  Sala de evolución
                </h1>
                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Historial, misiones y logros con datos reales.
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

          <section className="relative overflow-hidden rounded-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-surface))] px-2.5 py-2.5 shadow-[0_18px_46px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 16%, color-mix(in srgb, var(--app-primary) 14%, transparent), transparent 28%), radial-gradient(circle at 86% 20%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 24%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 5%, transparent), transparent 30%)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_30%,rgba(0,0,0,0.12)_100%)]" />

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <MetaBadge variant="neutral" icon={<Target size={11} />}>
                    Nivel actual
                  </MetaBadge>
                  <h2 className="mt-1.5 text-[14px] font-semibold leading-tight tracking-tight text-[var(--app-text)]">
                    Nivel {progressSnapshot.level}
                  </h2>
                  <p className="mt-1 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
                    {loadingProgress
                      ? "Sincronizando progreso..."
                      : `${progressSnapshot.xp} XP acumulado`}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                  {progressSnapshot.percent}%
                </span>
              </div>

              <div className="flex items-center gap-2.5 rounded-[1.25rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="relative flex h-[6rem] w-[6rem] shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full progress-orb-pulse"
                    style={{
                      background: `conic-gradient(var(--app-primary) 0 ${progressSnapshot.percent}%, color-mix(in_srgb,var(--app-border)_75%,transparent) ${progressSnapshot.percent}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-[0.3rem] rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,transparent),color-mix(in_srgb,var(--app-surface)_92%,transparent))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
                  <div className="absolute inset-[0.86rem] rounded-full border border-[var(--app-primary)]/10 ai-core-ambient-breath" />
                  <div className="absolute inset-[1.08rem] rounded-full border border-[var(--app-primary)]/16 ai-core-orb-heartbeat bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.16),transparent_24%),linear-gradient(180deg,var(--app-primary-soft)_0%,color-mix(in_srgb,var(--app-primary)_14%,transparent)_100%)] shadow-[0_0_18px_var(--app-glow)]" />
                  <div className="absolute inset-[0.46rem] rounded-full border border-[var(--app-primary)]/7" />
                  <div className="absolute left-1/2 top-[10%] h-[58%] w-[1px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-70 progress-float" />
                  <div className="absolute left-[16%] top-1/2 h-[1px] w-[68%] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--app-primary)_28%,transparent),transparent)] opacity-80 progress-shine" />
                  <div className="absolute left-[19%] top-[24%] h-2 w-2 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)] ai-core-live-dot progress-particle" />
                  <div className="absolute right-[18%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/70 shadow-[0_0_10px_var(--app-glow)] progress-particle" />
                  <div className="absolute left-[26%] top-[20%] h-1 w-1 rounded-full bg-[var(--app-primary)]/80 progress-particle" />
                  <div className="absolute right-[24%] top-[18%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/60 progress-particle" />
                  <div className="absolute inset-[16%] rounded-full border border-white/5" />

                  <div className="relative z-10 text-center">
                    <div className="text-[18px] font-black leading-none text-[var(--app-text)] shadow-[0_0_12px_var(--app-glow)]">
                      {progressSnapshot.percent}%
                    </div>
                    <p className="mt-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      Nivel {progressSnapshot.level}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    Progreso hacia el siguiente nivel
                  </p>
                  <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]">
                    <div
                      className="relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_60%,white))] shadow-[0_0_12px_var(--app-glow)]"
                      style={{ width: `${Math.max(8, progressSnapshot.percent)}%` }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-[40%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-0 progress-shine" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Misiones para Nivel {progressSnapshot.nextLevel}
                </p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Completa objetivos para desbloquear el siguiente nivel.
                </p>
              </div>
              <Target size={14} className="text-[var(--app-primary)]" />
            </div>

           <div className="mt-2 grid grid-cols-1 gap-2">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Racha actual
                </p>
              <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                Cadena de días consecutivos con actividad.
              </p>
              </div>
              <Flame size={14} className="text-[var(--app-primary)]" />
            </div>

            <div className="mt-2 rounded-[1.2rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_12%,var(--app-surface)),var(--app-surface))] px-3 py-3 shadow-[0_0_24px_var(--app-glow)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[18px] font-black leading-none text-[var(--app-text)]">
                    {counters.streak} días
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    Tu racha actual está activa.
                  </p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-[1.1rem] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)] progress-trophy-glow">
                  <Flame size={18} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Logros desbloqueados
                </p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Recompensas ya ganadas dentro de tu historial.
                </p>
              </div>
              <BadgeCheck size={14} className="text-[var(--app-primary)]" />
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {unlockedAchievements.length > 0 ? (
                unlockedAchievements.slice(0, 4).map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked
                  />
                ))
              ) : (
                <LockedAchievementsEmptyState />
              )}
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Próximos logros
                </p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Recompensas futuras y bloqueadas hasta que completes objetivos.
                </p>
              </div>
              <Lock size={14} className="text-[var(--app-primary)]" />
            </div>

          <div className="mt-2 grid grid-cols-1 gap-2">
              {lockedAchievements.length > 0 ? (
                lockedAchievements.slice(0, 4).map((achievement) => (
                  <LockedRewardCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <LockedAchievementsEmptyState locked={false} />
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function DecorativeParticles() {
  return (
    <>
      <span className="pointer-events-none absolute left-[12%] top-[20%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/70 progress-particle" />
      <span className="pointer-events-none absolute left-[20%] top-[32%] h-1 w-1 rounded-full bg-[var(--app-primary)]/50 progress-particle" />
      <span className="pointer-events-none absolute right-[16%] top-[18%] h-2 w-2 rounded-full bg-[var(--app-primary)]/60 progress-particle" />
      <span className="pointer-events-none absolute right-[28%] top-[34%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/40 progress-particle" />
      <span className="pointer-events-none absolute left-[34%] bottom-[16%] h-1 w-1 rounded-full bg-[var(--app-primary)]/50 progress-particle" />
      <span className="pointer-events-none absolute right-[10%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/45 progress-particle" />
    </>
  );
}

function MissionCard({ mission }) {
  const required = Math.max(1, Number(mission.required) || 1);
  const current = Math.max(0, Number(mission.current) || 0);
  const completed = current >= required;
  const progress = Math.min(100, Math.round((current / required) * 100));
  const Icon = mission.icon;
  const remaining = Math.max(0, required - current);

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.15rem] border px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        completed
          ? "border-[var(--app-primary)]/20 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_12%,var(--app-surface)),var(--app-surface))] progress-trophy-glow"
          : "border-[var(--app-border)] bg-[var(--app-surface)]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-40 progress-shine" />

      <div className="relative z-10 flex items-start gap-2.5">
        <div
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border shadow-[0_0_14px_var(--app-glow)]",
            completed
              ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
              : "border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-muted)]",
          ].join(" ")}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-[11px] font-black leading-tight text-[var(--app-text)]">
              {mission.label}
            </p>
            <span
              className={[
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em]",
                completed
                  ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]",
              ].join(" ")}
            >
              {current}/{required}
              {completed ? <BadgeCheck size={10} /> : null}
            </span>
          </div>

          <p
            className={[
              "mt-0.5 text-[9px] font-medium leading-4",
              completed
                ? "text-[var(--app-primary)]"
                : "text-[var(--app-muted)]",
            ].join(" ")}
          >
            {completed ? "Completado" : `Faltan ${remaining}`}
          </p>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]">
  <div
    className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_55%,white))] shadow-[0_0_10px_var(--app-glow)] transition-all duration-700"
    style={{
      width: `${progress}%`,
    }}
  >
    <span className="absolute inset-y-0 right-0 w-6 bg-white/30 blur-[2px]" />
  </div>
</div>
          </div>
        </div>
      </div>

  );
}

function AchievementCard({ achievement, unlocked }) {
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((achievement.current / achievement.target) * 100))
  );
  const AchievementIcon = ACHIEVEMENT_ICON_MAP[achievement.metric] || Trophy;

  return (
    <div
      className={[
        "rounded-[1.1rem] border px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        unlocked
          ? "border-[var(--app-primary)]/20 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_10%,var(--app-surface)),var(--app-surface))]"
          : "border-[var(--app-border)] bg-[var(--app-surface)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <div
          className={[
            "grid h-8 w-8 shrink-0 place-items-center rounded-2xl border shadow-[0_0_12px_var(--app-glow)]",
            unlocked
              ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)] progress-trophy-glow"
              : "border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-muted)]",
          ].join(" ")}
        >
          <AchievementIcon size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-black leading-tight text-[var(--app-text)]">
                {achievement.label}
              </p>
              <p className="mt-0.5 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
                {achievement.description}
              </p>
            </div>

            <span
              className={[
                "inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em]",
                unlocked
                  ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]",
              ].join(" ")}
            >
              {unlocked ? "Desbloqueado" : `${achievement.current}/${achievement.target}`}
            </span>
          </div>

          {!unlocked ? (
            <div className="mt-1.5">
              <div className="h-1.5 rounded-full bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_55%,white))] shadow-[0_0_10px_var(--app-glow)]"
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                >
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-[38%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-0 progress-shine" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LockedRewardCard({ achievement }) {
  const AchievementIcon = ACHIEVEMENT_ICON_MAP[achievement.metric] || Trophy;
  const conditionLabel = getLockedRewardCondition(achievement);

  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_84%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_30%)] opacity-50" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-muted)] shadow-[0_0_12px_rgba(0,0,0,0.2)]">
          <Lock size={12} className="absolute -translate-y-[10px] translate-x-[10px] text-[var(--app-primary)]/90" />
          <AchievementIcon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-black leading-tight text-[var(--app-text)]">
                {achievement.label}
              </p>
              <p className="mt-0.5 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
                {conditionLabel}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
              Bloqueado
            </span>
          </div>

          <p className="mt-1 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function LockedAchievementsEmptyState({ locked = true }) {
  return (
    <div
      className={[
        "rounded-[1.1rem] border px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        locked
          ? "border-[var(--app-border)] bg-[var(--app-surface)]"
          : "border-[var(--app-primary)]/20 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_10%,var(--app-surface)),var(--app-surface))]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Lock size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black leading-tight text-[var(--app-text)]">
            Sin logros visibles todavía
          </p>
          <p className="mt-0.5 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
            Sigue acumulando actividad para ver nuevas recompensas.
          </p>
        </div>
      </div>
    </div>
  );
}

function getLockedRewardCondition(achievement) {
  if (achievement.metric === "level") {
    return `Alcanza Nivel ${achievement.target}`;
  }

  if (achievement.metric === "streak") {
    return `Completa ${achievement.target} días seguidos`;
  }

  if (achievement.metric === "mealsCount") {
    return `Analiza ${achievement.target} comidas`;
  }

  if (achievement.metric === "checkinsCount") {
    return `Completa ${achievement.target} check-ins`;
  }

  if (achievement.metric === "workoutsCount") {
    return `Termina ${achievement.target} entrenos`;
  }

  if (achievement.metric === "dietPlansCount") {
    return `Genera ${achievement.target} dietas`;
  }

  return "Bloqueado";
}

const ACHIEVEMENT_ICON_MAP = {
  mealsCount: UtensilsCrossed,
  checkinsCount: Camera,
  workoutsCount: Dumbbell,
  dietPlansCount: Flame,
  streak: Flame,
  level: Trophy,
};

const DEFAULT_PROGRESS_SNAPSHOT = {
  level: 1,
  nextLevel: 2,
  percent: 0,
  xp: 0,
  remainingXp: 250,
  counters: {
    mealsCount: 0,
    checkinsCount: 0,
    workoutsCount: 0,
    dietPlansCount: 0,
    streak: 0,
  },
  nextLevelGoals: {
    meals: { current: 0, required: 15 },
    checkins: { current: 0, required: 4 },
    workouts: { current: 0, required: 4 },
    diets: { current: 0, required: 2 },
  },
  unlockedAchievements: [],
  lockedAchievements: [],
};
