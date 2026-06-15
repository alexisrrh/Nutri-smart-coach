import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardHeader({ loadingData, navigate }) {
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl" style={{ backgroundColor: "var(--app-primary-soft)", filter: "blur(1rem)" }} />

          <img
            src="/favicon.png"
            alt="NutriSmart Coach"
            className="relative h-12 w-12 rounded-2xl border object-cover p-1 shadow-[0_0_28px_var(--app-glow)]"
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
          />
        </div>

        <div className="min-w-0">
            <h1 className="truncate text-xl font-black leading-none tracking-tight text-[var(--app-text)]">
              Nutri<span className="text-[var(--app-primary)]">SmartCoach</span>
            </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: "var(--app-primary)", boxShadow: "0 0 12px var(--app-glow)" }} />

            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--app-muted)]">
              {loadingData ? t("dashboard.header.syncing") : t("dashboard.header.active")}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/perfil")}
        className="group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border backdrop-blur-xl transition active:scale-95 hover:bg-[var(--app-primary-soft)]"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
      >
        <Settings
          size={18}
          className="relative z-10 text-[var(--app-muted)] transition group-hover:text-[var(--app-primary)]"
        />
      </button>
    </header>
  );
}
