import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, CircleSlash2, Sparkles, TimerReset } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { SettingsCard, SettingsScreenShell } from "./SettingsShared";
import { getProfile } from "../../services/profileService";
import { getAiUsagePlanLabel, isPremiumUser } from "../../services/aiUsageService";

export function SettingsAi() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const provider = getProviderLabel(user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        if (!user?.id) {
          return;
        }

        const nextProfile = await getProfile(user.id, { fallbackToCache: false });

        if (!active) return;

        setProfile(nextProfile);
      } catch (error) {
        console.warn("No se pudo refrescar IA en Settings:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const premium = isPremiumUser(profile);
  const planLabel = getAiUsagePlanLabel(profile);
  const usageRows = [
    {
      label: "Análisis de comida",
      free: "3/día",
      premium: "20/día",
    },
    {
      label: "Dietas IA",
      free: "1/semana",
      premium: "5/día",
    },
    {
      label: "Check-ins IA",
      free: "1/semana",
      premium: "1/día",
    },
  ];

  return (
    <SettingsScreenShell
      badge="AI"
      title="IA y nutrición"
      subtitle="Núcleo vivo, recursos asignados y capas futuras del sistema."
      onBack={() => navigate("/perfil")}
    >
      <div className="space-y-2.5 pb-5">
        <AiCorePanel
          loading={loading}
          planLabel={planLabel}
          premium={premium}
          provider={provider}
          usageRows={usageRows}
        />

        <SettingsCard
          icon={<TimerReset size={16} />}
          title="Límites y control"
          description="Asignación oficial de recursos por plan para estabilidad, coste y respuesta consistente."
        >
          <div className="relative overflow-hidden rounded-[1.2rem] border border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent)_0%,color-mix(in_srgb,var(--app-card)_92%,transparent)_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_14px_34px_rgba(0,0,0,0.12)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 30%), radial-gradient(circle at 82% 24%, color-mix(in srgb, var(--app-primary) 5%, transparent), transparent 24%)",
              }}
            />
            <div className="relative grid gap-1.5">
              {usageRows.map((row) => (
                <AllocationRow
                  key={row.label}
                  label={row.label}
                  value={premium ? row.premium : row.free}
                  active={premium}
                />
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Sparkles size={16} />}
          title="Futuras capas"
          description="Evolución prevista sin romper la base actual ni la lectura premium."
        >
          <div className="relative overflow-hidden rounded-[1.2rem] border border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_86%,transparent)_0%,color-mix(in_srgb,var(--app-card)_94%,transparent)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_18px_40px_rgba(0,0,0,0.12)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-65"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 30%), radial-gradient(circle at 82% 24%, color-mix(in srgb, var(--app-primary) 5%, transparent), transparent 24%), radial-gradient(circle at 50% 92%, color-mix(in srgb, var(--app-primary) 4%, transparent), transparent 28%)",
              }}
            />
            <div className="relative z-10 grid gap-2">
              <RoadmapLine label="Motor adaptativo" copy="Más contexto con la misma base de datos y la misma seguridad." />
              <RoadmapLine label="Análisis contextual" copy="Recomendaciones más precisas sin añadir ruido visual." />
              <RoadmapLine label="Capas futuras" copy="La UI ya respira como un sistema extensible y vivo." />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<CircleSlash2 size={16} />}
          title="Plataforma"
          description="La arquitectura actual permanece intacta: misma cuenta, misma seguridad, misma base."
        >
          <div className="flex flex-wrap gap-1.5">
            <InfoChip>{planLabel}</InfoChip>
            <InfoChip>{premium ? "Límites ampliados" : "Límites Free"}</InfoChip>
            <InfoChip>Proveedor {provider}</InfoChip>
          </div>
        </SettingsCard>
      </div>
    </SettingsScreenShell>
  );
}

function getProviderLabel(user) {
  const provider = user?.app_metadata?.provider;
  if (provider === "google") return "Google";
  if (provider === "facebook") return "Facebook";
  if (provider === "email") return "Email";
  return provider || "Local";
}

function AiCorePanel({ loading, planLabel, premium, provider, usageRows }) {
  return (
    <SettingsCard
      icon={<BrainCircuit size={16} />}
      title="Núcleo IA"
      description="Estado vivo del motor nutricional con materiales suaves y sincronización estable."
      right={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--app-border)_80%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_92%,transparent)_0%,transparent_100%)] px-2.5 py-1 text-[9px] font-medium tracking-[0.12em] text-[var(--app-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <span className="ai-core-live-dot h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]" />
          Live
        </span>
      }
    >
      <div className="relative overflow-hidden rounded-[1.4rem] border border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_88%,transparent)_0%,color-mix(in_srgb,var(--app-surface)_92%,transparent)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_18px_48px_rgba(0,0,0,0.14)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 30%), radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 24%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 6%, transparent), transparent 28%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_30%,rgba(0,0,0,0.14)_100%)]" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--app-muted)]">
              {loading ? "Sincronizando perfil..." : planLabel}
            </p>
            <h3 className="mt-2 text-[21px] font-semibold tracking-tight text-[var(--app-text)]">
              {premium ? "Premium activo" : "Plan Free activo"}
            </h3>
            <p className="mt-2 max-w-[23rem] text-[13px] font-medium leading-5 text-[var(--app-muted)]">
              {premium
                ? "Tu perfil refleja los límites Premium oficiales y una cola prioritaria para una experiencia más ágil."
                : "Tu perfil refleja los límites oficiales del plan Free con la misma base estable."}
            </p>
          </div>

          <div className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.5rem] border border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] shadow-[0_0_30px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="ai-core-ambient-breath absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--app-primary)_18%,transparent),transparent_56%)] opacity-70" />
            <div className="absolute inset-1.5 rounded-full border border-[var(--app-primary)]/12 ai-core-heartbeat" />
            <div className="absolute inset-3 rounded-full border border-[var(--app-primary)]/20 ai-core-orb-heartbeat" />
            <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,var(--app-primary-soft)_0%,color-mix(in_srgb,var(--app-primary)_10%,transparent)_100%)] shadow-[0_0_24px_var(--app-glow)] ai-core-orb-heartbeat" />
            <div className="absolute inset-[18%] rounded-full border border-white/5" />
          </div>
        </div>

        <div className="relative z-10 mt-4 grid gap-1.5 sm:grid-cols-3">
          <AiStat label="Motor" value={premium ? "Premium" : "Free"} accent={premium} />
          <AiStat label="Sincronización" value="Estable" />
          <AiStat label="Análisis" value={premium ? "Prioritarios" : "Preparados"} accent />
        </div>

        <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5">
          {usageRows.map((row) => (
            <InfoChip key={row.label}>{premium ? row.premium : row.free}</InfoChip>
          ))}
          <InfoChip>Proveedor {provider}</InfoChip>
        </div>
      </div>
    </SettingsCard>
  );
}

function AllocationRow({ active = false, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-[color-mix(in_srgb,var(--app-border)_78%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_97%,transparent)_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`relative h-2.5 w-2.5 shrink-0 rounded-full ${
            active
              ? "bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)] ai-core-live-dot"
              : "bg-[color-mix(in_srgb,var(--app-muted)_62%,transparent)]"
          }`}
        >
          {active ? (
            <span className="absolute -inset-2 rounded-full border border-[var(--app-primary)]/10 ai-core-ambient-breath" />
          ) : null}
        </span>
        <span className="truncate text-[12px] font-medium text-[var(--app-text)]">{label}</span>
      </span>

      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-medium tracking-[0.12em] ${
          active
            ? "border-[color-mix(in_srgb,var(--app-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_92%,transparent)_0%,transparent_100%)] text-[var(--app-primary)]"
            : "border-[color-mix(in_srgb,var(--app-border)_76%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_96%,transparent)_0%,transparent_100%)] text-[var(--app-muted)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function AiStat({ label, value, accent = false }) {
  return (
    <div
      className="rounded-[1rem] border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition duration-300 ease-out hover:-translate-y-[1px]"
      style={{
        background: accent
          ? "linear-gradient(180deg, color-mix(in srgb, var(--app-primary-soft) 92%, transparent) 0%, color-mix(in srgb, var(--app-card) 94%, transparent) 100%)"
          : "linear-gradient(180deg, color-mix(in srgb, var(--app-surface) 92%, transparent) 0%, color-mix(in srgb, var(--app-card) 96%, transparent) 100%)",
        borderColor: accent ? "color-mix(in srgb, var(--app-border) 82%, transparent)" : "var(--app-border)",
      }}
    >
      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--app-muted)]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold tracking-tight text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function RoadmapLine({ label, copy }) {
  return (
    <div className="relative flex items-start gap-3 overflow-hidden rounded-[1rem] border border-[color-mix(in_srgb,var(--app-border)_76%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_94%,transparent)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <span className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]">
        <span className="ai-core-ambient-breath absolute -inset-2 rounded-full border border-[var(--app-primary)]/10" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold tracking-tight text-[var(--app-text)]">{label}</p>
        <p className="mt-0.5 text-[12px] font-medium leading-5 text-[var(--app-muted)]">{copy}</p>
      </div>
    </div>
  );
}

function InfoChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--app-border)_76%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_94%,transparent)_100%)] px-2.5 py-1 text-[9px] font-medium tracking-[0.12em] text-[var(--app-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      {children}
    </span>
  );
}
