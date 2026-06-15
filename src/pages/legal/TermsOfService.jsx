import { useTranslation } from "react-i18next";
import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";

export function TermsOfService() {
  const { t } = useTranslation();

  return (
    <LegalLayout
      eyebrow="NutriSmartCoach"
      title={t("settings.legal.terms.title")}
      updatedAt="2026-05-27"
    >
      <LegalSection title={t("settings.legal.terms.sections.acceptance.title")}>
        <p>{t("settings.legal.terms.sections.acceptance.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.allowed.title")}>
        <LegalList
          items={[
            t("settings.legal.terms.allowed.one"),
            t("settings.legal.terms.allowed.two"),
            t("settings.legal.terms.allowed.three"),
            t("settings.legal.terms.allowed.four"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.responsibility.title")}>
        <p>{t("settings.legal.terms.sections.responsibility.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.ai.title")}>
        <p>{t("settings.legal.terms.sections.ai.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.limits.title")}>
        <p>{t("settings.legal.terms.sections.limits.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.security.title")}>
        <LegalList
          items={[
            t("settings.legal.terms.security.one"),
            t("settings.legal.terms.security.two"),
            t("settings.legal.terms.security.three"),
            t("settings.legal.terms.security.four"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.content.title")}>
        <p>{t("settings.legal.terms.sections.content.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.futurePremium.title")}>
        <p>{t("settings.legal.terms.sections.futurePremium.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.changes.title")}>
        <p>{t("settings.legal.terms.sections.changes.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.terms.sections.contact.title")}>
        <p>
          {t("settings.legal.terms.sections.contact.bodyStart")}{" "}
          <a className="font-black text-[var(--app-primary)]" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
