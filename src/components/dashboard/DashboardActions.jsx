import ActionCard from "./ActionCard";
import { useTranslation } from "react-i18next";
import {
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  ScanLine,
  UserRoundSearch,
} from "lucide-react";
import { exercises } from "../../data/exercises";
import { preloadExercises } from "../../services/exerciseMediaService";

export default function DashboardActions({ navigate }) {
  const { t } = useTranslation();
  const preloadAllExercises = () => {
    if (!Array.isArray(exercises) || exercises.length === 0) return;
    preloadExercises(exercises);
  };

  return (
    <section className="flex flex-col">
      <div className="flex items-end justify-between px-1 pb-1 justify-center pl-9">
        <div>
          <p
            className="pb-1 text-center text-[15px] font-black uppercase tracking-[0.2em]"
            style={{ color: "var(--app-primary)", opacity: 0.55 }}
          >
            {t("dashboard.actions.moreTools")}
          </p>

          <h2 className="mt-0.5 pb-1 text-[14px] font-black leading-none text-[var(--app-text)] text-center">
            {t("dashboard.actions.continuePlan")}
          </h2>
        </div>

        <div
          className="rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em]"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-primary-soft)",
            color: "var(--app-primary)",
          }}
        >
          {t("dashboard.tools.badge")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 ">
        <ActionCard
          icon="/icons/scan-comida-icon.png"
          fallbackIcon={ClipboardList}
          label={t("dashboard.actions.planDiet")}
          description={t("dashboard.actions.planDietDesc")}
          onClick={() => navigate("/plan-comidas")}
        />

        <ActionCard
          icon="/icons/bodyscan-icon.png"
          fallbackIcon={UserRoundSearch}
          label={t("dashboard.actions.checkinPhoto")}
          description={t("dashboard.actions.checkinPhotoDesc")}
          onClick={() => navigate("/checkin")}
        />

        <ActionCard
          icon="/icons/rutinas.png"
          fallbackIcon={ClipboardList}
          label={t("dashboard.actions.routines")}
          description={t("dashboard.actions.routinesDesc")}
          onClick={() => navigate("/rutinas")}
          imageClassName="scale-[1.15] "
        />

        <ActionCard
          icon="/icons/ejercicios.png"
          fallbackIcon={ClipboardList}
          label={t("dashboard.actions.exercises")}
          description={t("dashboard.actions.exercisesDesc")}
          onClick={() => {
            preloadAllExercises();
            navigate("/ejercicios");
          }}
          imageClassName="scale-[1.12] "
        />

        <ActionCard
          icon="/icons/historial-icon.png"
          fallbackIcon={ScanLine}
          label={t("dashboard.actions.history")}
          description={t("dashboard.actions.historyDesc")}
          onClick={() => navigate("/comidas")}
        />

        <ActionCard
          icon="/icons/progreso-icon.png"
          fallbackIcon={ChartNoAxesColumnIncreasing}
          label={t("dashboard.actions.progress")}
          description={t("dashboard.actions.progressDesc")}
          onClick={() => navigate("/progreso")}
        />
      </div>
    </section>
  );
}
