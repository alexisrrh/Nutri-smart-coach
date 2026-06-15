import { useTranslation } from "react-i18next";
import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";

export function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <LegalLayout
      eyebrow="NutriSmartCoach"
      title={t("settings.legal.privacy.title")}
      updatedAt="2026-05-27"
    >
      <LegalSection title={t("settings.legal.privacy.sections.responsible.title")}>
        <p>{t("settings.legal.privacy.sections.responsible.body", { email: contactEmail })}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.data.title")}>
        <LegalList
          items={[
            t("settings.legal.privacy.items.account"),
            t("settings.legal.privacy.items.profile"),
            t("settings.legal.privacy.items.food"),
            t("settings.legal.privacy.items.checkin"),
            t("settings.legal.privacy.items.diet"),
            t("settings.legal.privacy.items.workout"),
            t("settings.legal.privacy.items.technical"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.ai.title")}>
        <p>{t("settings.legal.privacy.sections.ai.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.purpose.title")}>
        <LegalList
          items={[
            t("settings.legal.privacy.purpose.account"),
            t("settings.legal.privacy.purpose.personalization"),
            t("settings.legal.privacy.purpose.history"),
            t("settings.legal.privacy.purpose.analysis"),
            t("settings.legal.privacy.purpose.security"),
            t("settings.legal.privacy.purpose.improvement"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.external.title")}>
        <p>{t("settings.legal.privacy.sections.external.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.retention.title")}>
        <p>{t("settings.legal.privacy.sections.retention.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.deletion.title")}>
        <p>
          {t("settings.legal.privacy.sections.deletion.body", { email: contactEmail })}
        </p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.security.title")}>
        <p>{t("settings.legal.privacy.sections.security.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.rights.title")}>
        <p>{t("settings.legal.privacy.sections.rights.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.privacy.sections.medical.title")}>
        <p>{t("settings.legal.privacy.sections.medical.body")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
