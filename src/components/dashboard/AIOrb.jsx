import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AIOrb() {
  const { t } = useTranslation();
  return (
    <div className="relative flex h-[150px] w-[150px] items-center justify-center">
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      <div
        className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-5 border-t-[var(--app-primary)]"
        style={{
          borderColor: "var(--app-border)",
          borderTopColor: "var(--app-primary)",
          boxShadow: "0 0 32px var(--app-glow)",
        }}
      />

      <div
        className="absolute inset-[20px] animate-[spin_4s_linear_infinite_reverse] rounded-full border-15"
        style={{
          borderColor: "var(--app-border)",
          borderBottomColor: "color-mix(in srgb, var(--app-primary) 58%, white)",
        }}
      />

      <div
        className="absolute inset-[20px] rounded-full border backdrop-blur-xl"
        style={{
          borderColor: "var(--app-border)",
          backgroundColor: "color-mix(in srgb, var(--app-surface) 72%, transparent)",
        }}
      />

      <div
        className="absolute inset-[40px] rounded-full shadow-[0_0_50px_var(--app-glow)]"
        style={{
          background:
            "linear-gradient(135deg, var(--app-primary) 0%, color-mix(in srgb, var(--app-primary) 65%, white) 48%, color-mix(in srgb, #38bdf8 70%, white) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <Sparkles size={20} className="text-[var(--app-surface)]" />

        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-[var(--app-surface)]/70">
          {t("dashboard.ai.orbLabel")}
        </p>
      </div>

      <span className="absolute left-3 top-6 h-2 w-3 animate-pulse rounded-full" style={{ backgroundColor: "var(--app-primary)" }} />
      <span className="absolute bottom-4 right-4 h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
      <span className="absolute right-3 top-1/2 h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: "var(--app-primary)" }} />
    </div>
  );
}
