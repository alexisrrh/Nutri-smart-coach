import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, ShieldPlus, Trash2 } from "lucide-react";
import { SettingsCard, SettingsRow, SettingsScreenShell } from "./SettingsShared";

export function SettingsLegal() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <SettingsScreenShell
      badge={t("settings.legal.badge")}
      title={t("settings.legal.title")}
      subtitle={t("settings.legal.subtitle")}
      onBack={() => navigate("/perfil")}
    >
      <div className="space-y-3 pb-2">
        <SettingsCard
          icon={<ShieldCheck size={16} />}
          title={t("settings.legal.trust.title")}
          description={t("settings.legal.trust.desc")}
          right={
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--app-primary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
              {t("settings.legal.trust.protected")}
            </span>
          }
        >
          <div className="grid gap-2">
            <div className="grid gap-1.5 rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <MiniTrustRow icon={<ShieldCheck size={13} />} label={t("settings.legal.trust.policies")} />
              <MiniTrustRow icon={<ShieldPlus size={13} />} label={t("settings.legal.trust.management")} />
              <MiniTrustRow icon={<FileText size={13} />} label={t("settings.legal.trust.transparency")} />
            </div>

            <div className="grid gap-1.5">
              <SettingsRow
                icon={<ShieldCheck size={15} />}
                label={t("settings.legal.privacy.title")}
                description={t("settings.legal.privacyDesc")}
                to="/privacy"
              />
              <SettingsRow
                icon={<FileText size={15} />}
                label={t("settings.legal.terms.title")}
                description={t("settings.legal.termsDesc")}
                to="/terms"
              />
              <SettingsRow
                icon={<Trash2 size={15} />}
                label={t("settings.legal.delete.title")}
                description={t("settings.legal.deleteDesc")}
                to="/delete-account"
              />
            </div>
          </div>
        </SettingsCard>

        <div className="mb-2">
          <SettingsCard
            icon={<ShieldCheck size={16} />}
            title={t("settings.legal.control.title")}
            description={t("settings.legal.control.desc")}
          >
            <div className="space-y-1.5 text-[12px] leading-5 text-[var(--app-muted)]">
              <p>{t("settings.legal.control.line1")}</p>
              <p>{t("settings.legal.control.line2")}</p>
            </div>
          </SettingsCard>
        </div>
      </div>
    </SettingsScreenShell>
  );
}

function MiniTrustRow({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]">
        {icon}
      </span>
      <span className="min-w-0 text-[12px] font-medium text-[var(--app-text)]">{label}</span>
    </div>
  );
}
