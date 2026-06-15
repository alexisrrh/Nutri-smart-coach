import { useTranslation } from "react-i18next";
import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";

export function CreatorTerms() {
  const { t } = useTranslation();

  return (
    <LegalLayout
      eyebrow={t("settings.legal.creator.eyebrow")}
      title={t("settings.legal.creator.title")}
      updatedAt="2026-06-05"
    >
      <LegalSection title={t("settings.legal.creator.sections.commission.title")}>
        <p>{t("settings.legal.creator.sections.commission.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.trial.title")}>
        <p>{t("settings.legal.creator.sections.trial.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.eligible.title")}>
        <LegalList
          items={[
            t("settings.legal.creator.eligible.one"),
            t("settings.legal.creator.eligible.two"),
            t("settings.legal.creator.eligible.three"),
            t("settings.legal.creator.eligible.four"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.payoutLimit.title")}>
        <p>{t("settings.legal.creator.sections.payoutLimit.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.fraud.title")}>
        <LegalList
          items={[
            t("settings.legal.creator.fraud.one"),
            t("settings.legal.creator.fraud.two"),
            t("settings.legal.creator.fraud.three"),
            t("settings.legal.creator.fraud.four"),
          ]}
        />
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.suspension.title")}>
        <p>{t("settings.legal.creator.sections.suspension.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.cancellations.title")}>
        <p>{t("settings.legal.creator.sections.cancellations.body")}</p>
      </LegalSection>

      <LegalSection title={t("settings.legal.creator.sections.responsibilities.title")}>
        <LegalList
          items={[
            t("settings.legal.creator.responsibilities.one"),
            t("settings.legal.creator.responsibilities.two"),
            t("settings.legal.creator.responsibilities.three"),
            t("settings.legal.creator.responsibilities.four"),
            t("settings.legal.creator.responsibilities.five", { email: contactEmail }),
          ]}
        />
      </LegalSection>
    </LegalLayout>
  );
}

export default CreatorTerms;
