import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  KeyRound,
  Palette,
  ShieldCheck,
  Sparkles,
  UserRound,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getProfile } from "../services/profileService";
import { AppShell, MetaBadge } from "../components/ui";
import { SettingsFrame } from "./settings/SettingsShared";

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);

      try {
        if (!user?.id) {
          return;
        }

        const nextProfile = await getProfile(user.id);
        if (active) {
          setProfile(nextProfile);
        }
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
  const statusLabel = loading ? "Sincronizando..." : "Sincronizado";

  return (
    <AppShell contentClassName="!px-2 !pt-2 !pb-[calc(120px+env(safe-area-inset-bottom))]">
      <main className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SettingsFrame className="pb-2">
          <header className="relative overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-card))] p-3 shadow-[0_18px_54px_var(--app-glow)]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 28%)",
            }}
          />
          <div className="relative z-10 flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_28px_var(--app-glow)]">
              <BrainCircuit size={24} />
            </div>

            <div className="min-w-0 flex-1">
              <MetaBadge variant="neutral" icon={<Sparkles size={11} />}>
                AI Settings Hub
              </MetaBadge>
              <h1 className="mt-2 truncate text-[21px] font-black leading-none tracking-tight text-[var(--app-text)]">
                {displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <MetaBadge variant="neutral">{goalLabel}</MetaBadge>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-1.5">
          <SettingMetric label="Peso" value={profile?.weight ? `${profile.weight} kg` : "—"} />
          <SettingMetric label="Altura" value={profile?.height ? `${profile.height} cm` : "—"} />
          <SettingMetric label="Actividad" value={activityLabel(profile?.activity_level)} />
          <SettingMetric label="Comidas" value={profile?.meals_per_day || "4"} />
        </section>

        <div className="space-y-2.5 pb-2">
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
        </SettingsFrame>
      </main>
    </AppShell>
  );
}

function NavCard({ description, icon, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),var(--app-card))] px-3 py-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition duration-200 active:scale-[0.985]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)] transition group-active:scale-[0.98]">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-black leading-tight text-[var(--app-text)]">
            {title}
          </span>
          <span className="mt-0.5 block text-[10px] font-medium leading-4 text-[var(--app-muted)]">
            {description}
          </span>
        </span>
      </span>

      <ChevronDown
        size={15}
        className="-rotate-90 shrink-0 text-[var(--app-primary)] transition-transform group-active:translate-x-0.5"
      />
    </button>
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
