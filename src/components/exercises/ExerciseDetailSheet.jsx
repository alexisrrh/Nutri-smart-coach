import { useEffect } from "react";
import { Check, TriangleAlert, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ExerciseMediaFrame from "./ExerciseMediaFrame";
import { getExerciseMedia } from "../../services/exerciseMediaService";
import {
  getWorkoutLanguage,
  translateEquipmentLabel,
  translateExerciseDescription,
  translateExerciseName,
  translateLevelLabel,
  translateMuscleLabel,
  translateWorkoutText,
} from "../../utils/workoutI18n";

export default function ExerciseDetailSheet({ exercise, onClose }) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const media = getExerciseMedia(exercise);
  const hasRealMedia = Boolean(media?.localGif);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.body.classList.add("exercise-sheet-active");

    return () => {
      document.body.classList.remove("exercise-sheet-active");
    };
  }, []);

  const tips = exercise?.tips || [];
  const mistakes = exercise?.mistakes || [];

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/72 px-2 pb-[calc(var(--bottom-nav-space)+24px)] backdrop-blur-md">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-24px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.15rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-18px_48px_rgba(0,0,0,0.42)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-24px)] flex-col">
          <header className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--app-border)] px-3 py-[7px]">
            <div className="min-w-0">
              <p className="text-[7px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                {t("exercises.detail.badge")}
              </p>
              <h2 className="mt-0.5 line-clamp-2 text-[16px] font-black leading-[1.05] text-[var(--app-text)]">
                {translateExerciseName(exercise, language)}
              </h2>
              <p className="mt-1 line-clamp-1 text-[9px] font-semibold text-[var(--app-muted)]">
                {translateMuscleLabel(exercise.muscle, language)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
              aria-label={t("exercises.detail.close")}
            >
              <X size={13} />
            </button>
          </header>

          <div className="min-h-0 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ExerciseMediaFrame
              key={media?.mediaKey || exercise?.mediaKey || exercise?.id || exercise?.name}
              exercise={exercise}
              className={
                hasRealMedia
                  ? "aspect-[16/9] w-full min-h-[220px] max-h-[260px]"
                  : "aspect-[16/10] w-full min-h-[190px] max-h-[220px]"
              }
            />

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <TinyChip>{translateMuscleLabel(exercise.muscle, language)}</TinyChip>
              <TinyChip>{translateEquipmentLabel(exercise.equipment, language)}</TinyChip>
              <TinyChip>{translateLevelLabel(exercise.difficulty, language)}</TinyChip>
            </div>

            <div className="mt-2 rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-[7px]">
              <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                {t("exercises.detail.prescription")}
              </p>
              <p className="mt-[3px] text-[11px] font-semibold leading-4 text-[var(--app-text)]">
                {t("exercises.detail.prescriptionValue", {
                  sets: exercise.sets,
                  reps: exercise.reps,
                  rest: exercise.rest,
                })}
              </p>
            </div>

            <section className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-[7px]">
              <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {t("exercises.detail.description")}
              </p>
              <p className="mt-[3px] line-clamp-2 text-[10.5px] leading-4 text-[var(--app-text)]">
                {translateExerciseDescription(exercise, language)}
              </p>
            </section>

            <section className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-[7px]">
              <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {t("exercises.detail.tips")}
              </p>
              <div className="mt-1 grid gap-1">
                {tips.map((tip) => (
                  <MiniRow key={tip} icon={<Check size={10} />} text={tip} tone="tip" language={language} />
                ))}
              </div>
            </section>

            <section className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-[7px]">
              <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {t("exercises.detail.mistakes")}
              </p>
              <div className="mt-1 grid gap-1">
                {mistakes.map((mistake) => (
                  <MiniRow key={mistake} icon={<TriangleAlert size={10} />} text={mistake} tone="error" language={language} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function TinyChip({ children }) {
  return (
    <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
      {children}
    </span>
  );
}

function MiniRow({ icon, text, tone = "tip", language }) {
  const toneClasses =
    tone === "error"
      ? "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
      : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)]";
  return (
    <div className={`flex items-start gap-2 rounded-[0.8rem] border px-2 py-1 ${toneClasses}`}>
      <span className="mt-0.5 shrink-0 text-[var(--app-primary)]">{icon}</span>
      <p className="text-[10px] leading-4">{translateWorkoutText(text, language)}</p>
    </div>
  );
}
