import { CalendarDays, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PremiumEmptyState } from "../ui";

export function Empty({ onClick }) {
  const { t } = useTranslation();

  return (
    <PremiumEmptyState
      icon={CalendarDays}
      title={t("meals.empty.title")}
      description={t("meals.empty.description")}
      actionLabel={
        <span className="inline-flex items-center gap-2">
          <Camera size={15} />
          {t("meals.empty.action")}
        </span>
      }
      onAction={onClick}
    />
  );
}
