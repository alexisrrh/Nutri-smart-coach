import { useTheme } from "../../context/themeContext";
import { MetaBadge, SurfaceCard } from "../../components/ui";
import { Check, Palette, Sparkles } from "lucide-react";
import { SettingsCard, SettingsScreenShell } from "./SettingsShared";
import { useNavigate } from "react-router-dom";

const THEMES = [
  {
    id: "emerald",
    label: "Emerald",
    tone: "Activo",
    preview: {
      bg: "linear-gradient(180deg,#07170f 0%,#0b2117 100%)",
      surface: "#07170f",
      card: "#0b2117",
      primary: "#10b981",
      soft: "rgba(16, 185, 129, 0.14)",
      border: "rgba(16, 185, 129, 0.18)",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.62)",
      glow: "rgba(16, 185, 129, 0.24)",
      ambient: "radial-gradient(circle at 18% 12%, rgba(16,185,129,0.22), transparent 32%), radial-gradient(circle at 82% 16%, rgba(16,185,129,0.12), transparent 24%)",
    },
  },
  {
    id: "dark",
    label: "Dark",
    tone: "Sobrio",
    preview: {
      bg: "linear-gradient(180deg,#060b0a 0%,#0a1412 100%)",
      surface: "#0a1412",
      card: "#111b18",
      primary: "#9be3c1",
      soft: "rgba(155,227,193,0.08)",
      border: "rgba(155,227,193,0.12)",
      text: "#eff8f4",
      muted: "rgba(239,248,244,0.66)",
      glow: "rgba(155,227,193,0.16)",
      ambient: "radial-gradient(circle at 18% 12%, rgba(155,227,193,0.16), transparent 30%), radial-gradient(circle at 82% 16%, rgba(155,227,193,0.08), transparent 24%)",
    },
  },
  {
    id: "white",
    label: "White",
    tone: "Claro",
    preview: {
      bg: "linear-gradient(180deg,#eef2f1 0%,#ffffff 100%)",
      surface: "#ffffff",
      card: "#f7f9f8",
      primary: "#0f172a",
      soft: "rgba(15,23,42,0.06)",
      border: "rgba(15,23,42,0.08)",
      text: "#0f172a",
      muted: "rgba(15,23,42,0.62)",
      glow: "rgba(15,23,42,0.08)",
      ambient: "radial-gradient(circle at 18% 12%, rgba(15,23,42,0.08), transparent 32%), radial-gradient(circle at 82% 16%, rgba(15,23,42,0.04), transparent 24%)",
    },
  },
  {
    id: "rose",
    label: "Rose",
    tone: "Futurista",
    preview: {
      bg: "linear-gradient(180deg,#120611 0%,#1d0b1b 100%)",
      surface: "#1d0b1b",
      card: "#2a1028",
      primary: "#fb6fbd",
      soft: "rgba(251,111,189,0.12)",
      border: "rgba(251,111,189,0.17)",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.62)",
      glow: "rgba(251,111,189,0.18)",
      ambient: "radial-gradient(circle at 18% 12%, rgba(251,111,189,0.18), transparent 30%), radial-gradient(circle at 82% 16%, rgba(251,111,189,0.1), transparent 24%)",
    },
  },
  {
    id: "blue",
    label: "Blue",
    tone: "Tech",
    preview: {
      bg: "linear-gradient(180deg,#04111c 0%,#0a1b2c 100%)",
      surface: "#0a1b2c",
      card: "#10253a",
      primary: "#38bdf8",
      soft: "rgba(56,189,248,0.16)",
      border: "rgba(56,189,248,0.22)",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.62)",
      glow: "rgba(56,189,248,0.2)",
      ambient: "radial-gradient(circle at 18% 12%, rgba(56,189,248,0.18), transparent 30%), radial-gradient(circle at 82% 16%, rgba(56,189,248,0.1), transparent 24%)",
    },
  },
  {
    id: "purple",
    label: "Purple",
    tone: "Pro",
    preview: {
      bg: "linear-gradient(180deg,#0d0818 0%,#171028 100%)",
      surface: "#171028",
      card: "#21163a",
      primary: "#a855f7",
      soft: "rgba(168,85,247,0.16)",
      border: "rgba(168,85,247,0.22)",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.62)",
      glow: "rgba(168,85,247,0.2)",
      ambient: "radial-gradient(circle at 18% 12%, rgba(168,85,247,0.18), transparent 30%), radial-gradient(circle at 82% 16%, rgba(168,85,247,0.1), transparent 24%)",
    },
  },
];

export function SettingsTheme() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const activeTheme = THEMES.find((item) => item.id === theme) || THEMES[0];

  return (
    <SettingsScreenShell
      badge="Theme"
      title="Personalización"
      subtitle="Personaliza la apariencia de NutriSmartCoach."
      onBack={() => navigate("/perfil")}
    >
      <div className="space-y-2 pb-23">
        <ThemeHero activeTheme={activeTheme} />

        <SettingsCard
          icon={<Palette size={16} />}
          title="Colección de temas"
          description="Elige una piel visual con materiales vivos, no cajas planas."
          right={<MetaBadge variant="neutral">{activeTheme.label}</MetaBadge>}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {THEMES.map((item) => {
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`group relative overflow-hidden rounded-[1.35rem] border px-2.5 py-2.5 text-left transition duration-300 active:scale-[0.985] touch-manipulation ${
                    active
                      ? "border-[var(--app-primary)] shadow-[0_16px_34px_var(--app-glow),inset_0_0_0_1px_color-mix(in_srgb,var(--app-primary)_18%,transparent)] ring-1 ring-[var(--app-primary)]/20 -translate-y-[1px]"
                      : "border-[var(--app-border)] hover:-translate-y-[1px] active:bg-[var(--app-primary-soft)]/30"
                  }`}
                  style={{
                    background: item.preview.bg,
                    boxShadow: active ? `0 16px 34px ${item.preview.glow}` : "0 10px 22px rgba(0,0,0,0.12)",
                  }}
                  aria-pressed={active}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-90"
                    style={{ backgroundImage: item.preview.ambient }}
                  />
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: item.preview.text }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em]"
                        style={{ color: item.preview.muted }}
                      >
                        {item.tone}
                      </p>
                    </div>

                    <span
                      className="relative h-4 w-4 shrink-0 rounded-full border border-white/10"
                      style={{
                        background: item.preview.primary,
                        boxShadow: `0 0 16px ${item.preview.glow}`,
                      }}
                    >
                      {active ? (
                        <span
                          className="absolute inset-[-3px] rounded-full border"
                          style={{ borderColor: item.preview.border }}
                        />
                      ) : null}
                    </span>
                  </div>

                  <ThemeTilePreview item={item} active={active} />

                  {active ? (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] backdrop-blur-md"
                      style={{
                        borderColor: item.preview.border,
                        backgroundColor: "rgba(255,255,255,0.04)",
                        color: item.preview.primary,
                      }}
                    >
                      <Check size={9} />
                      Activo
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Sparkles size={16} />}
          title="Live preview"
          description="Una interfaz miniatura para validar materiales, contraste y profundidad."
        >
          <ThemeLivePreview themeData={activeTheme.preview} themeLabel={activeTheme.label} />
        </SettingsCard>
      </div>
    </SettingsScreenShell>
  );
}

function ThemeHero({ activeTheme }) {
  const p = activeTheme.preview;

  return (
    <SurfaceCard
      radius="xl"
      className="relative overflow-hidden border border-[var(--app-border)]/80 p-3 shadow-[0_22px_64px_var(--app-glow)]"
      style={{
        background: p.bg,
        color: p.text,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ backgroundImage: p.ambient }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_28%,rgba(0,0,0,0.14)_100%)]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MetaBadge variant="neutral" icon={<Palette size={11} />}>
            Theme activo
          </MetaBadge>
          <h2 className="mt-2 text-[20px] font-semibold leading-tight tracking-tight">
            {activeTheme.label}
          </h2>
          <p className="mt-2 max-w-[24rem] text-[13px] font-medium leading-5" style={{ color: p.muted }}>
            Ajusta la piel visual sin perder la lectura premium ni la jerarquía del sistema.
          </p>
        </div>

        <div
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border backdrop-blur-sm"
          style={{
            borderColor: p.border,
            backgroundColor: "rgba(255,255,255,0.04)",
            boxShadow: `0 0 28px ${p.glow}`,
          }}
        >
          <span
            className="absolute inset-3 rounded-full"
            style={{
              background: p.primary,
              boxShadow: `0 0 24px ${p.glow}`,
            }}
          />
          <span className="absolute inset-0 rounded-[1.4rem] border border-white/5" />
        </div>
      </div>

      <div className="relative z-10 mt-4 overflow-hidden rounded-[1.35rem] border p-3 backdrop-blur-md transition duration-500 ease-out"
        style={{
          borderColor: p.border,
          backgroundColor: "rgba(255,255,255,0.04)",
          boxShadow: `0 0 28px ${p.glow}`,
        }}
      >
        <ThemeMaterialFrame themeData={p} />
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-1.5">
        <PreviewMetric label="Actual" value={activeTheme.label} />
        <PreviewMetric label="Estado" value="Sincronizado" accent />
      </div>
    </SurfaceCard>
  );
}

function ThemeTilePreview({ item, active }) {
  const p = item.preview;
  return (
    <div
      className="relative mt-3 overflow-hidden rounded-[1.1rem] border p-2.5 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255,255,255,0.045)",
        borderColor: p.border,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="h-5 w-12 rounded-full border"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: p.border,
          }}
        />
        <span
          className="h-5 w-5 rounded-full"
          style={{
            background: p.primary,
            boxShadow: `0 0 12px ${p.glow}`,
          }}
        />
      </div>

      <div className="mt-2 grid grid-cols-[1.2fr_0.8fr] gap-2">
        <div
          className="rounded-[0.9rem] border p-2"
          style={{
            backgroundColor: p.card,
            borderColor: p.border,
          }}
        >
          <div
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: p.primary }}
          />
          <div
            className="mt-2 h-8 rounded-[0.7rem] border"
            style={{
              backgroundColor: p.surface,
              borderColor: p.border,
            }}
          />
        </div>

        <div
          className="flex flex-col justify-between rounded-[0.9rem] border p-2"
          style={{
            backgroundColor: p.surface,
            borderColor: p.border,
          }}
        >
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[8px] font-bold"
            style={{
              color: p.primary,
              borderColor: p.border,
              backgroundColor: p.card,
            }}
          >
            {active ? <Check size={8} /> : "•"}
          </span>
          <span className="mt-2 h-2 w-full rounded-full" style={{ backgroundColor: p.soft }} />
          <span className="mt-1 h-6 w-full rounded-[0.65rem] border" style={{ backgroundColor: p.card, borderColor: p.border }} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className="rounded-full border px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em]"
          style={{
            color: p.muted,
            borderColor: p.border,
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          Material
        </span>
        <span
          className="rounded-full border px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em]"
          style={{
            color: p.primary,
            borderColor: p.border,
            backgroundColor: p.soft,
          }}
        >
          Preview
        </span>
      </div>
    </div>
  );
}

function ThemeMaterialFrame({ themeData }) {
  const p = themeData;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className="h-2.5 w-16 rounded-full"
          style={{ backgroundColor: p.soft }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: p.primary, boxShadow: `0 0 14px ${p.glow}` }}
        />
      </div>

      <div
        className="rounded-[1rem] border p-3"
        style={{
          backgroundColor: p.card,
          borderColor: p.border,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="h-2.5 w-20 rounded-full" style={{ backgroundColor: p.soft }} />
          <span className="rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em]"
            style={{
              color: p.primary,
              borderColor: p.border,
              backgroundColor: p.surface,
            }}
          >
            Live
          </span>
        </div>
        <div className="mt-3 grid grid-cols-[1.2fr_0.8fr] gap-2">
          <div
            className="rounded-[0.9rem] border p-2.5"
            style={{
              backgroundColor: p.surface,
              borderColor: p.border,
            }}
          >
            <div
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: p.primary, boxShadow: `0 0 10px ${p.glow}` }}
            />
            <div className="mt-2 h-3 w-24 rounded-full" style={{ backgroundColor: p.soft }} />
            <div className="mt-2 h-8 rounded-[0.7rem] border" style={{ backgroundColor: p.card, borderColor: p.border }} />
          </div>
          <div
            className="rounded-[0.9rem] border p-2.5"
            style={{
              backgroundColor: p.surface,
              borderColor: p.border,
            }}
          >
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.primary }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.soft }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.border }} />
            </div>
            <div className="mt-3 h-10 rounded-[0.8rem] border" style={{ backgroundColor: p.card, borderColor: p.border }} />
          </div>
        </div>
      </div>

    </div>
  );
}

function ThemeLivePreview({ themeData, themeLabel }) {
  const p = themeData;

  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border p-3"
      style={{
        backgroundColor: p.card,
        borderColor: p.border,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: p.ambient }}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: p.muted }}>
            {themeLabel}
          </p>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight" style={{ color: p.text }}>
            Sistema visual vivo
          </h3>
          <p className="mt-2 max-w-[22rem] text-[13px] font-medium leading-5" style={{ color: p.muted }}>
            Materiales, contraste y profundidad alineados para una experiencia más nativa.
          </p>
        </div>
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border"
          style={{
            backgroundColor: p.surface,
            borderColor: p.border,
            boxShadow: `0 0 22px ${p.glow}`,
          }}
        >
          <span className="absolute inset-3 rounded-full" style={{ backgroundColor: p.primary, boxShadow: `0 0 18px ${p.glow}` }} />
        </div>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
        <div
          className="rounded-[1rem] border p-2.5"
          style={{
            backgroundColor: p.surface,
            borderColor: p.border,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full" style={{ backgroundColor: p.primary, boxShadow: `0 0 12px ${p.glow}` }} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold" style={{ color: p.text }}>
                Control Hub
              </p>
              <p className="text-[9px] font-medium" style={{ color: p.muted }}>
                Visual adaptada
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-[1rem] border p-2.5"
          style={{
            backgroundColor: p.surface,
            borderColor: p.border,
          }}
        >
          <div className="h-2 w-10 rounded-full" style={{ backgroundColor: p.soft }} />
          <div className="mt-2 h-7 rounded-[0.7rem] border" style={{ backgroundColor: p.card, borderColor: p.border }} />
        </div>
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-2">
        <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: p.soft }} />
        <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: p.primary }} />
        <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: p.soft }} />
      </div>
    </div>
  );
}

function PreviewMetric({ label, value, accent = false }) {
  return (
    <div
      className="rounded-[1.05rem] border px-2.5 py-2.5 shadow-[inset_0_0_0_1px_var(--app-border)]"
      style={{
        backgroundColor: accent ? "var(--app-primary-soft)" : "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-[var(--app-text)]">{value}</p>
    </div>
  );
}
