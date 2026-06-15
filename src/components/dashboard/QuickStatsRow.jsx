import AIStat from "./AIStat";
import { useTranslation } from "react-i18next";

export default function QuickStatsRow({ totals, todayMeals }) {
  const { t } = useTranslation();
  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      <AIStat
        title={t("dashboard.progress.quick.protein")}
        value={`${Math.round(totals.protein)}g`}
        color="text-[var(--app-primary)]"
      />

      <AIStat
        title={t("dashboard.progress.quick.kcal")}
        value={Math.round(totals.calories)}
        color="text-orange-400"
      />

      <AIStat
        title={t("dashboard.progress.quick.status")}
        value={
          todayMeals.length
            ? t("dashboard.progress.quick.active")
            : t("dashboard.progress.quick.pending")
        }
        color="text-cyan-400"
      />
    </div>
  );
}
