import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";
const subject = "Eliminar cuenta NutriSmartCoach";

export function DeleteAccount() {
  const { t } = useTranslation();
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;

  return (
    <LegalLayout
      eyebrow={t("settings.legal.delete.eyebrow")}
      title={t("settings.legal.delete.title")}
      updatedAt="2026-05-27"
    >
      <LegalSection title={t("settings.legal.delete.sections.how.title")}>
        <p>{t("settings.legal.delete.sections.how.body", { email: contactEmail })}</p>

        <a
          href={mailtoHref}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--app-surface)] shadow-[0_14px_32px_var(--app-glow)] transition active:scale-[0.98]"
        >
          <Mail size={15} />
          {t("settings.legal.delete.button")}
        </a>
      </LegalSection>

      <LegalSection title={t("settings.legal.delete.sections.data.title")}>
        <LegalList
          items={[
            t("settings.legal.delete.data.one"),
            t("settings.legal.delete.data.two"),
            t("settings.legal.delete.data.three"),
            t("settings.legal.delete.data.four"),
            t("settings.legal.delete.data.five"),
            t("settings.legal.delete.data.six"),
            t("settings.legal.delete.data.seven"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.delete.sections.timeline.title")}>
        <p>{t("settings.legal.delete.sections.timeline.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.delete.sections.retained.title")}>
        <p>{t("settings.legal.delete.sections.retained.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.delete.sections.profile.title")}>
        <p>{t("settings.legal.delete.sections.profile.body")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
