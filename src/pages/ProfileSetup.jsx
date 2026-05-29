import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Dumbbell,
  ChevronDown,
  Flame,
  KeyRound,
  Palette,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  UserRound,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useProgressSummary } from "../hooks/progress/useProgressSummary";
import { getProfile } from "../services/profileService";
import { AppShell, MetaBadge } from "../components/ui";

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { summary: progressSummary, loading: loadingProgress } =
    useProgressSummary();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);

      try {
        if (!user?.id) return;

        const nextProfile = await getProfile(user.id);
        if (active) setProfile(nextProfile);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const displayName = profile?.name || user?.email?.split("@")[0] || "Tu perfil";
  const goalLabel = getGoalLabel(profile?.goal);
  const statusLabel =
    loading || loadingProgress ? "Sincronizando..." : "Sincronizado";

  return (
    <AppShell
      contentClassName="!px-2 !pt-2 !pb-0"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-27"
    >
      <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-2 rounded-[32px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2 pb-8 pt-2 shadow-[0_18px_54px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 32%), radial-gradient(circle at 92% 24%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 26%)",
          }}
        />

        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.12)_100%)]" />

        <div className="relative z-10 flex w-full flex-col gap-2.5">
          <header className="relative overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-card))] p-2.5 shadow-[0_18px_54px_var(--app-glow)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 28%)",
              }}
            />

            <div className="relative z-10 flex items-start gap-2.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_24px_var(--app-glow)]">
                <BrainCircuit size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <MetaBadge variant="neutral" icon={<Sparkles size={11} />}>
                  AI Settings Hub
                </MetaBadge>

                <h1 className="mt-1.5 truncate text-[18px] font-black leading-none tracking-tight text-[var(--app-text)]">
                  {displayName}
                </h1>

                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <MetaBadge variant="neutral">{goalLabel}</MetaBadge>

                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-1">
            <SettingMetric
              label="Peso"
              value={profile?.weight ? `${profile.weight} kg` : "—"}
            />
            <SettingMetric
              label="Altura"
              value={profile?.height ? `${profile.height} cm` : "—"}
            />
            <SettingMetric
              label="Actividad"
              value={activityLabel(profile?.activity_level)}
            />
            <SettingMetric label="Comidas" value={profile?.meals_per_day || "4"} />
          </section>

          <ProgressAndAchievementsCard
            onOpenProgress={() => navigate("/progress")}
            progress={progressSummary}
            loading={loadingProgress}
          />

          <div className="space-y-2">
            <NavCard
              icon={<UserRound size={16} />}
              title="Mi perfil"
              description="Datos personales, objetivo, nivel y macros."
              onClick={() => navigate("/settings/profile")}
            />
            <NavCard
              icon={<Palette size={16} />}
              title="Personalización"
              description="Themes, apariencia y preview visual."
              onClick={() => navigate("/settings/theme")}
            />
            <NavCard
              icon={<BrainCircuit size={16} />}
              title="IA y nutrición"
              description="Límites, estado y expansión del sistema AI."
              onClick={() => navigate("/settings/ai")}
            />
            <NavCard
              icon={<ShieldCheck size={16} />}
              title="Privacidad y legal"
              description="Política, términos y eliminación de datos."
              onClick={() => navigate("/settings/legal")}
            />
            <NavCard
              icon={<KeyRound size={16} />}
              title="Cuenta y seguridad"
              description="Contraseña, proveedor y cierre de sesión."
              onClick={() => navigate("/settings/security")}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}


function NavCard({ description, icon, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-2.5 rounded-[1.2rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),var(--app-card))] px-2.5 py-3.5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition duration-200 active:scale-[0.985]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)] transition group-active:scale-[0.98]">
          {icon}
        </span>

        <span className="min-w-0">
          <span className="block text-[15px] font-black leading-tight text-[var(--app-text)]">
            {title}
          </span>
          <span className="mt-0.5 block text-[11px] font-medium leading-4 text-[var(--app-muted)]">
            {description}
          </span>
        </span>
      </span>

      <ChevronDown
        size={14}
        className="-rotate-90 shrink-0 text-[var(--app-primary)] transition-transform group-active:translate-x-0.5"
      />
    </button>
  );
}

function ProgressAndAchievementsCard({ loading, onOpenProgress, progress }) {
  const xp = progress?.xp ?? 0;
  const remainingXp = progress?.remainingXp ?? 0;
  const nextLevel = progress?.nextLevel ?? 5;
  const percent = progress?.percent ?? 0;
  const level = progress?.level ?? 1;
  const streak = progress?.streak ?? 0;
  const mealsCount = progress?.mealsCount ?? 0;
  const checkinsCount = progress?.checkinsCount ?? 0;
  const workoutsCount = progress?.workoutsCount ?? 0;

  return (
    <section className="relative mt-0.5 overflow-hidden rounded-[1.4rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-surface))] px-2.5 py-2 shadow-[0_18px_46px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 14% 16%, color-mix(in srgb, var(--app-primary) 14%, transparent), transparent 28%), radial-gradient(circle at 86% 20%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 24%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 5%, transparent), transparent 30%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_30%,rgba(0,0,0,0.12)_100%)]" />

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <MetaBadge variant="neutral" icon={<BrainCircuit size={11} />}>
              PROGRESO
            </MetaBadge>
            <h2 className="mt-1.5 text-[14px] font-semibold leading-tight tracking-tight text-[var(--app-text)]">
              Nivel {level}
            </h2>
            <p className="mt-1 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
              {loading
                ? "Sincronizando progreso..."
                : `${xp} XP · ${remainingXp} XP para Nivel ${nextLevel}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-[1.25rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <div className="relative flex h-[5.9rem] w-[5.9rem] shrink-0 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(var(--app-primary) 0 84%, color-mix(in_srgb,var(--app-border)_75%,transparent) 84% 100%)",
                boxShadow: "0 0 24px var(--app-glow)",
              }}
            />
            <div className="absolute inset-[0.28rem] rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,transparent),color-mix(in_srgb,var(--app-surface)_92%,transparent))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
            <div className="absolute inset-[0.78rem] rounded-full border border-[var(--app-primary)]/10 ai-core-ambient-breath" />
            <div className="absolute inset-[1.04rem] rounded-full border border-[var(--app-primary)]/16 ai-core-orb-heartbeat bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.16),transparent_24%),linear-gradient(180deg,var(--app-primary-soft)_0%,color-mix(in_srgb,var(--app-primary)_14%,transparent)_100%)] shadow-[0_0_18px_var(--app-glow)]" />
            <div className="absolute inset-[0.46rem] rounded-full border border-[var(--app-primary)]/7" />
            <div className="absolute left-1/2 top-[11%] h-[56%] w-[1px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.26),transparent)] opacity-70" />
            <div className="absolute left-[16%] top-1/2 h-[1px] w-[68%] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--app-primary)_28%,transparent),transparent)] opacity-80" />
            <div className="absolute left-[19%] top-[24%] h-2 w-2 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)] ai-core-live-dot" />
            <div className="absolute right-[18%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/70 shadow-[0_0_10px_var(--app-glow)]" />
            <div className="absolute inset-[16%] rounded-full border border-white/5" />

            <div className="relative z-10 text-center">
              <div className="text-[18px] font-black leading-none text-[var(--app-text)] shadow-[0_0_12px_var(--app-glow)]">
                {percent}%
              </div>
              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                Nivel {level}
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Próximo nivel
                </p>
                <p className="mt-1 text-[12px] font-black text-[var(--app-text)]">
                  Tu siguiente hito
                </p>
                <p className="mt-1 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
                  {remainingXp} XP para el siguiente nivel
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                {percent}%
              </span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_60%,white))] shadow-[0_0_12px_var(--app-glow)]"
                style={{ width: `${Math.max(8, percent)}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <ProgressStatChip icon={Flame} label={`Racha ${streak}`} />
              <ProgressStatChip
                icon={UtensilsCrossed}
                label={`${mealsCount} comidas`}
              />
              <ProgressStatChip
                icon={Camera}
                label={`${checkinsCount} check-ins`}
              />
              <ProgressStatChip
                icon={Dumbbell}
                label={`${workoutsCount} entrenos`}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenProgress}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_86%,transparent),color-mix(in_srgb,var(--app-card)_92%,transparent))] px-3 py-2 text-[10px] font-semibold tracking-[0.03em] text-[var(--app-text)] shadow-[0_8px_18px_color-mix(in_srgb,var(--app-primary)_18%,transparent),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_22px_color-mix(in_srgb,var(--app-primary)_22%,transparent),inset_0_1px_0_rgba(255,255,255,0.05)] active:scale-[0.985]"
        >
          <Sparkles size={12} className="text-[var(--app-primary)] items-center" />
          <span>Centro de progreso</span>
          <ChevronDown size={11} className="-rotate-90 text-[var(--app-primary)]" />
        </button>
      </div>
    </section>
  );
}

function SettingMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--app-border)]">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] font-black text-[var(--app-text)]">
        {value || "—"}
      </p>
    </div>
  );
}

function ProgressStatChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <Icon size={13} className="text-[var(--app-primary)]" />
      <span className="whitespace-nowrap text-[10px] font-semibold leading-none text-[var(--app-text)]">
        {label}
      </span>
    </div>
  );
}

function getGoalLabel(goal) {
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "Perder grasa";
}

function activityLabel(activity) {
  if (activity === "low") return "Sedentario";
  if (activity === "high") return "Alta";
  return "Moderada";
}
