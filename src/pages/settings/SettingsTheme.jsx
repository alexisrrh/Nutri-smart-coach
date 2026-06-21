import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/themeContext";
import { useAuth } from "../../context/useAuth";
import { MetaBadge, SurfaceCard } from "../../components/ui";
import { Check, Globe, Palette } from "lucide-react";
import { SettingsCard, SettingsScreenShell } from "./SettingsShared";
import { useNavigate } from "react-router-dom";
import { getProfile, saveProfile } from "../../services/profileService";
import {
  getInitialAppLanguage,
  getPreferredLanguageFromProfile,
  getStoredLanguage,
  setAppLanguage,
} from "../../i18n";

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

const LANGUAGES = [
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "en", label: "English", flag: "🇺🇸" },
];

export function SettingsTheme() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const activeTheme = THEMES.find((item) => item.id === theme) || THEMES[0];
  const [language, setLanguage] = useState(() => getInitialAppLanguage());

  useEffect(() => {
    let active = true;

    async function loadLanguage() {
      const storedLanguage = getStoredLanguage();
      const fallbackLanguage = storedLanguage || getInitialAppLanguage();

      if (!user?.id) {
        await setAppLanguage(fallbackLanguage);
        if (active) setLanguage(fallbackLanguage);
        return;
      }

      try {
        const profile = await getProfile(user.id, { fallbackToCache: false });
        const nextLanguage =
          storedLanguage ||
          getPreferredLanguageFromProfile(profile) ||
          fallbackLanguage;

        if (!active) return;
        setLanguage(nextLanguage === "en" ? "en" : "es");
        await setAppLanguage(nextLanguage);
      } catch {
        if (!active) return;
        setLanguage(fallbackLanguage === "en" ? "en" : "es");
        await setAppLanguage(fallbackLanguage);
      }
    }

    void loadLanguage();

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function handleLanguageChange(nextLanguage) {
    const normalized = nextLanguage === "en" ? "en" : "es";
    setLanguage(normalized);
    await setAppLanguage(normalized);

    if (!user?.id) return;

    try {
      const profile = await getProfile(user.id, { fallbackToCache: false });

      if (!profile?.id) return;

      await saveProfile({
        ...profile,
        preferences: {
          ...(profile.preferences || {}),
          language: normalized,
        },
      });
    } catch (error) {
      console.warn("No se pudo guardar el idioma en el perfil:", error);
    }
  }

  return (
    <SettingsScreenShell
      badge={t("settings.theme.badge")}
      title={t("settings.theme.title")}
      subtitle={t("settings.theme.subtitle")}
      onBack={() => navigate("/perfil")}
    >
      <div className="space-y-2 pb-16">
        <ThemeHero activeTheme={activeTheme} />

        <SettingsCard
          icon={<Palette size={16} />}
          title={t("settings.theme.themesTitle")}
          description={t("settings.theme.themesDesc")}
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
                  <div className="relative z-10 flex min-h-[78px] flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="text-[12px] font-bold leading-tight"
                          style={{ color: item.preview.text }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em]"
                          style={{ color: item.preview.muted }}
                        >
                          {t(`settings.theme.themeTones.${item.id}`)}
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

                    <div className="flex items-end justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] backdrop-blur-md"
                        style={{
                          borderColor: item.preview.border,
                          backgroundColor: "rgba(255,255,255,0.04)",
                          color: item.preview.primary,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: item.preview.primary }}
                        />
                        {item.preview.primary}
                      </span>

                          {active ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] backdrop-blur-md"
                              style={{
                                borderColor: item.preview.border,
                                backgroundColor: "rgba(255,255,255,0.04)",
                                color: item.preview.text,
                              }}
                            >
                              <Check size={9} />
                          {t("common.active")}
                            </span>
                          ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Globe size={16} />}
          title={t("settings.theme.languageTitle")}
          description={t("settings.theme.languageDesc")}
          right={<MetaBadge variant="neutral">{language === "en" ? "English" : "Español"}</MetaBadge>}
        >
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((item) => {
              const active = item.id === language;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleLanguageChange(item.id)}
                  className={`flex items-center justify-between gap-3 rounded-[1.15rem] border px-3 py-2.5 text-left transition active:scale-[0.985] ${
                    active
                      ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] shadow-[0_12px_28px_var(--app-glow)]"
                      : "border-[var(--app-border)] bg-[var(--app-surface)]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[var(--app-text)]">
                      {item.flag} {item.label}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--app-muted)]">
                      {active ? t("common.active") : t("common.available")}
                    </p>
                  </div>

                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)]"
                        : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)]"
                    }`}
                  >
                    {active ? <Check size={12} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingsCard>
      </div>
    </SettingsScreenShell>
  );
}

function ThemeHero({ activeTheme }) {
  const { t } = useTranslation();
  const p = activeTheme.preview;

  return (
    <SurfaceCard
      radius="xl"
      className="relative overflow-hidden border border-[var(--app-border)]/80 p-2.5 shadow-[0_18px_48px_var(--app-glow)]"
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
            {t("settings.theme.activeTheme")}
          </MetaBadge>
          <h2 className="mt-2 text-[18px] font-semibold leading-tight tracking-tight">
            {activeTheme.label}
          </h2>
          <p className="mt-1.5 max-w-[24rem] text-[12px] font-medium leading-5" style={{ color: p.muted }}>
            {t("settings.theme.hero.title")}
          </p>
        </div>

        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.3rem] border backdrop-blur-sm"
          style={{
            borderColor: p.border,
            backgroundColor: "rgba(255,255,255,0.04)",
            boxShadow: `0 0 28px ${p.glow}`,
          }}
        >
          <span
            className="absolute inset-[11px] rounded-full"
            style={{
              background: p.primary,
              boxShadow: `0 0 24px ${p.glow}`,
            }}
          />
          <span className="absolute inset-0 rounded-[1.4rem] border border-white/5" />
        </div>
      </div>

      <div className="relative z-10 mt-3 overflow-hidden rounded-[1.2rem] border p-2.5 backdrop-blur-md transition duration-500 ease-out"
        style={{
          borderColor: p.border,
          backgroundColor: "rgba(255,255,255,0.04)",
          boxShadow: `0 0 28px ${p.glow}`,
        }}
      >
        <ThemeMaterialFrame themeData={p} />
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-2 gap-1.5">
        <PreviewMetric label={t("settings.theme.current")} value={activeTheme.label} />
        <PreviewMetric label={t("settings.theme.status")} value={t("settings.theme.synced")} accent />
      </div>
    </SurfaceCard>
  );
}

function ThemeMaterialFrame({ themeData }) {
  const { t } = useTranslation();
  const p = themeData;
  return (
    <div className="space-y-1.5">
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
        className="rounded-[0.95rem] border p-2.5"
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
            {t("settings.theme.live")}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-[1.2fr_0.8fr] gap-2">
          <div
            className="rounded-[0.9rem] border p-2"
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
            className="rounded-[0.9rem] border p-2"
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
