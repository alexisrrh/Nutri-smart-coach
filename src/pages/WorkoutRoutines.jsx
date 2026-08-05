import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Play,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { EXERCISE_LIBRARY, MUSCLE_GROUPS } from "../data/exerciseLibrary";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell, ConfirmDialog, PremiumEmptyState } from "../components/ui";
import ExerciseMediaFrame from "../components/exercises/ExerciseMediaFrame";
import { WorkoutSession } from "../components/workout/WorkoutSession";

import {
  buildWeeklyWorkoutPlan,
  buildWorkoutDay,
  getExercisePrescription,
  getRecommendedDaysForProfile,
  selectExercisesForDay,
} from "../services/workoutPlannerService";
import {
  preloadCriticalExerciseMedia,
  preloadExerciseMedia,
  preloadRoutineExerciseMedia,
} from "../services/exercisePreloadService";
import { getLocalDateKey } from "../services/gamificationService";
import { getCachedProfile } from "../services/profileService";
import { getStrengthProgressSummary } from "../services/strengthProgressService";
import { useWorkoutConfig } from "../hooks/workouts/useWorkoutConfig";
import {
  getCompletionForPlanDay,
  getPlanDayDateKey,
  useWorkoutHistory,
} from "../hooks/workouts/useWorkoutHistory";
import { useWorkoutSessionLauncher } from "../hooks/workouts/useWorkoutSessionLauncher";
import { WorkoutConfigCard } from "../components/workouts/WorkoutConfigCard";
import { WorkoutHistoryPreview } from "../components/workouts/WorkoutHistoryPreview";
import { WorkoutHistorySheet } from "../components/workouts/WorkoutHistorySheet";
import { useToast } from "../components/ui";
import {
  deleteCustomWorkoutRoutine,
  listCustomWorkoutRoutines,
  shareCustomWorkoutWeek,
} from "../services/customWorkoutService";
import { supabase } from "../lib/supabase";
import {
  getWorkoutLanguage,
  translateEquipmentLabel,
  translateFocusLabel,
  translateGoalLabel,
  translateLevelLabel,
  translateMuscleLabel,
  translateRoutineDay,
  translateWorkoutText,
} from "../utils/workoutI18n";

const SHARED_ROUTINE_BASE_URL = "https://nutrismartcoach.com/rutina";
const routineActionBaseClass =
  "inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 py-3 text-[10px] font-bold leading-none tracking-[0.01em] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
const routinePrimaryActionClass = `${routineActionBaseClass} bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_10px_22px_var(--app-glow)]`;
const routineSecondaryActionClass = `${routineActionBaseClass} border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_74%,transparent)] text-[var(--app-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)]`;
const routineSubtitleClass =
  "text-[12px] font-semibold leading-[1.55] text-[color:color-mix(in_srgb,var(--app-text)_76%,var(--app-muted))] sm:text-[12.5px]";
const routineSecondaryTextClass =
  "text-[10.5px] font-medium leading-[1.45] text-[color:color-mix(in_srgb,var(--app-text)_68%,var(--app-muted))]";
const routinePillClass =
  "rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_12%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_72%,transparent)] px-[9px] py-[5px] text-[8px] font-medium leading-none tracking-[0.01em] text-[color:color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]";

function buildSharedWeekUrl(shareId) {
  return `${SHARED_ROUTINE_BASE_URL.replace("/rutina", "/rutinas/semana")}/${shareId}`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

export function WorkoutRoutines() {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMuscle = getInitialMuscle(searchParams);
  const profile = getCachedProfile();
  const {
    daysPerWeek,
    saveWorkoutConfig,
    savedConfig,
    selectedFocus,
    selectedGoal,
    selectedLevel,
    setDaysPerWeek,
    setSelectedFocus,
    setSelectedLevel,
    setShowConfig,
    showConfig,
  } = useWorkoutConfig(profile);
  const [planConfirmed, setPlanConfirmed] = useState(savedConfig.completed);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [customRoutines, setCustomRoutines] = useState([]);
  const [loadingCustomRoutines, setLoadingCustomRoutines] = useState(false);
  const [sharingWeek, setSharingWeek] = useState(false);
  const [showCustomRoutines, setShowCustomRoutines] = useState(false);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [customWorkoutMode, setCustomWorkoutMode] = useState(null);
  const [routinePendingDelete, setRoutinePendingDelete] = useState(null);
  const toast = useToast();
  const {
    handleCompleteWorkout: recordWorkoutCompletion,
    handleToggleDayCompletion,
    setShowHistory,
    showHistory,
    toggleMessage,
    workoutCompletions,
    workoutSessions,
  } = useWorkoutHistory();

  const workoutPlan = useMemo(
    () =>
      buildWeeklyWorkoutPlan({
        profile,
        level: selectedLevel,
        goal: selectedGoal,
        daysPerWeek,
        focus: selectedFocus,
      }),
    [
      daysPerWeek,
      profile,
      selectedFocus,
      selectedGoal,
      selectedLevel,
    ]
  );
  const weeklyPlan = workoutPlan.days;
  const selectedDay =
    weeklyPlan.find((day) => day.id === selectedDayId) ||
    weeklyPlan.find((day) => day.muscles.includes(initialMuscle)) ||
    weeklyPlan[0];
  const {
    activeDay,
    handleCloseWorkoutSession,
    handleStartDayWorkout,
    handleStartWorkout,
    setActiveDay,
    setWorkoutMode,
    workoutMode,
  } = useWorkoutSessionLauncher({
    profile,
    selectedDay,
    selectedFocus,
    selectedGoal,
    selectedLevel,
  });
  const planStats = useMemo(
    () =>
      getPlanStats({
        weeklyPlan,
        level: selectedLevel,
        goal: selectedGoal,
        focus: selectedFocus,
        daysPerWeek,
        completions: workoutCompletions,
      }),
    [daysPerWeek, selectedFocus, selectedGoal, selectedLevel, weeklyPlan, workoutCompletions]
  );
  const todayPlanDay = useMemo(
    () => getTodayPlanDay({ weeklyPlan, planStats }),
    [planStats, weeklyPlan]
  );
  const selectedDayExercises = useMemo(() => {
    if (!selectedDay) return [];

    return selectExercisesForDay({
      day: selectedDay,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
      profile,
    });
  }, [profile, selectedDay, selectedFocus, selectedGoal, selectedLevel]);
  const todayPlanExercises = useMemo(() => {
    if (!todayPlanDay) return [];

    return selectExercisesForDay({
      day: todayPlanDay,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
      profile,
    });
  }, [profile, selectedFocus, selectedGoal, selectedLevel, todayPlanDay]);

  useEffect(() => {
    if (!selectedExercise || typeof document === "undefined") return undefined;

    document.body.classList.add("exercise-sheet-active");

    return () => {
      document.body.classList.remove("exercise-sheet-active");
    };
  }, [selectedExercise]);

  useEffect(() => {
    preloadCriticalExerciseMedia();
  }, []);

  useEffect(() => {
    setShowConfig(false);
  }, [setShowConfig]);

  useEffect(() => {
    preloadExerciseMedia(todayPlanExercises.slice(0, 4));
  }, [todayPlanExercises]);

  useEffect(() => {
    preloadRoutineExerciseMedia(selectedDayExercises);
  }, [selectedDayExercises]);

  useEffect(() => {
    if (!selectedExercise) return undefined;

    preloadExerciseMedia(selectedExercise);
    return undefined;
  }, [selectedExercise]);
  useEffect(() => {
    async function loadCustomRoutines() {
      setLoadingCustomRoutines(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) return;

        const routines = await listCustomWorkoutRoutines(user.id);
        setCustomRoutines(routines);
      } catch (error) {
        console.error("Error cargando rutinas personalizadas:", error);
      } finally {
        setLoadingCustomRoutines(false);
      }
    }

    void loadCustomRoutines();
  }, []);

  function handleRequestDeleteCustomRoutine(routine) {
    setRoutinePendingDelete(routine);
  }

  function handleCancelDeleteCustomRoutine() {
    setRoutinePendingDelete(null);
  }

  async function handleConfirmDeleteCustomRoutine() {
    if (!routinePendingDelete?.id) return;

    try {
      await deleteCustomWorkoutRoutine(routinePendingDelete.id);
      setCustomRoutines((current) =>
        current.filter((routine) => routine.id !== routinePendingDelete.id)
      );
    } catch (error) {
      console.error("Error eliminando rutina personalizada:", error);
    } finally {
      setRoutinePendingDelete(null);
    }
  }

  async function handleShareWeeklyCollection() {
    if (!customRoutines.length) {
      toast.error(translateWorkoutText("No hay rutinas para compartir.", language));
      return;
    }

    setSharingWeek(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        toast.error(
          translateWorkoutText("Necesitas iniciar sesión para compartir esta semana.", language)
        );
        return;
      }

      console.log("[WorkoutRoutines] share week user.id", user.id);
      const sharedWeek = await shareCustomWorkoutWeek(user.id, customRoutines);
      const shareUrl = buildSharedWeekUrl(sharedWeek.share_id);
      const payload = {
        title: translateWorkoutText("Mi semana de entrenamiento", language),
        text: translateWorkoutText("Mira mi semana de entrenamiento personalizada.", language),
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(payload);
        toast.success(translateWorkoutText("Semana compartida.", language));
        return;
      }

      const copied = await copyTextToClipboard(shareUrl);
      if (!copied) {
        throw new Error(translateWorkoutText("No se pudo copiar el enlace.", language));
      }

      toast.success(translateWorkoutText("Enlace copiado. Comparte tu semana.", language));
    } catch (error) {
      console.error("Error compartiendo semana de rutinas:", error);
      toast.error(error.message || translateWorkoutText("No se pudo compartir la semana.", language));
    } finally {
      setSharingWeek(false);
    }
  }

  function handleGenerateWorkout() {
    saveWorkoutConfig({
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
      daysPerWeek,
      completed: true,
    });
    setPlanConfirmed(true);
    setShowConfig(false);
    setSelectedDayId("");
  }

  function handleOpenWeeklyPlan() {
    setShowWeeklyPlan(true);
  }

  function handleOpenDay(day) {
    const workoutDay = buildWorkoutDay({
      day,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
      profile,
    });

    setSelectedDayId(day.id);
    setActiveDay(workoutDay);
    setWorkoutMode(null);
  }
  function handleStartCustomRoutine(routine) {
    const firstDay = Array.isArray(routine.days) ? routine.days[0] : null;

    if (!firstDay) return;

    const customDay = {
      id: routine.id,
      day: translateWorkoutText("Personalizada", language),
      name: routine.name,
      routineId: routine.id,
      routineName: routine.name,
      source: "custom",
      muscles: firstDay.muscles || [routine.focus || "General"],
      goal: routine.goal || selectedGoal,
      level: routine.level || selectedLevel,
      focus: routine.focus || firstDay.muscles?.[0] || "General",
      duration: translateWorkoutText("45 min", language),
      warmupItems: [
        translateWorkoutText("5 min cardio suave", language),
        translateWorkoutText("Movilidad articular", language),
        translateWorkoutText("Activación ligera", language),
      ],
      finalItems: [
        translateWorkoutText("Estiramiento breve", language),
        translateWorkoutText("Respiración y recuperación", language),
      ],
      exercises: (firstDay.exercises || []).map((customExercise) => {
        const fullExercise = EXERCISE_LIBRARY.find(
          (exercise) => exercise.id === customExercise.exerciseId
        );

        return {
          ...(fullExercise || {}),
          ...customExercise,
          id: customExercise.exerciseId,
          name: customExercise.name || fullExercise?.name,
          muscle: customExercise.muscle || fullExercise?.muscle,
          sets: Number(customExercise.sets) || fullExercise?.sets || 3,
          reps: customExercise.reps || fullExercise?.reps || "8-12",
          rest: customExercise.rest || fullExercise?.rest || "90s",
        };
      }),
    };

    setCustomWorkoutMode({
      type: "custom",
      day: customDay,
      exercises: customDay.exercises,
      source: "custom",
      routineType: "custom",
    });

    setShowCustomRoutines(false);
  }
  function handleCompleteWorkout() {
    return recordWorkoutCompletion({
      day: workoutMode?.day || activeDay || selectedDay,
      selectedLevel,
      selectedGoal,
      activeDay,
      selectedDay,
    });
  }

  function handleCompleteCustomWorkout() {
    const result = recordWorkoutCompletion({
      day: customWorkoutMode?.day,
      selectedLevel: customWorkoutMode?.day?.level || selectedLevel,
      selectedGoal: customWorkoutMode?.day?.goal || selectedGoal,
      activeDay: customWorkoutMode?.day,
      selectedDay: customWorkoutMode?.day,
    });

    return result;
  }

  return (
   <AppShell
      className="overflow-hidden"
      contentClassName="px-2 pt-2"
  scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
     <div className="flex w-full max-w-full min-w-0 flex-col gap-2 overflow-x-hidden">
        <header className="w-full max-w-full shrink-0">
          <section className="relative w-full max-w-full min-w-0 overflow-hidden rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1.5 shadow-[0_6px_18px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,var(--app-primary-soft),transparent_40%)]" />
            <div className="relative z-10 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  {t("workouts.hero.badge")}
                </p>
                <h1 className="mt-0.5 text-[20px] font-black leading-none text-[var(--app-text)]">
                  {t("workouts.hero.title")}
                </h1>
                <p className={`mt-1 ${routineSubtitleClass}`}>
                  {t("workouts.hero.subtitle")}
                </p>
              </div>

              <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.16),transparent_28%),var(--app-primary-soft)] shadow-[0_0_18px_var(--app-glow)]">
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--app-primary-soft),transparent_62%)]" />
                <img
                  src="/logo.png"
                  alt=""
                  className="relative z-10 h-7 w-7 rounded-full object-cover"
                  aria-hidden="true"
                />
              </div>
            </div>
          </section>
        </header>

   <main className="w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full min-w-0 space-y-[5px] pb-2">
            <AIPerformanceCore
              planStats={planStats}
              workoutCompletions={workoutCompletions}
              workoutSessions={workoutSessions}
            />

            <IAWeeklyRoutineCard
              daysPerWeek={daysPerWeek}
              onAdjust={() => setShowConfig(true)}
              onGenerate={handleGenerateWorkout}
              onOpen={handleOpenWeeklyPlan}
              planConfirmed={planConfirmed}
              planMeta={workoutPlan.meta}
              planStats={planStats}
              selectedFocus={selectedFocus}
              selectedGoal={selectedGoal}
              selectedLevel={selectedLevel}
            />

            {showConfig ? (
              <WorkoutConfigCard
                SelectFilter={SelectFilter}
                daysPerWeek={daysPerWeek}
                getRecommendedDaysForProfile={getRecommendedDaysForProfile}
                onGenerate={handleGenerateWorkout}
                profile={profile}
                selectedFocus={selectedFocus}
                selectedLevel={selectedLevel}
                setDaysPerWeek={setDaysPerWeek}
                setSelectedFocus={setSelectedFocus}
                setSelectedLevel={setSelectedLevel}
              />
            ) : null}

            <CustomRoutinesSection
              routines={customRoutines}
              loading={loadingCustomRoutines}
              onCreate={() => navigate("/crear-rutina")}
              onOpen={() => setShowCustomRoutines(true)}
            />

            {planConfirmed ? (
              <WorkoutHistoryPreview
                WorkoutHistoryCard={WorkoutHistoryCard}
                sessions={workoutSessions}
                onOpen={() => setShowHistory(true)}
              />
            ) : null}
          </div>
        </main>
      </div>

      {activeDay && !workoutMode ? (
        <DayDetailSheet
          day={activeDay}
          exercises={selectedDayExercises}
          goal={selectedGoal}
          level={selectedLevel}
          onClose={() => setActiveDay(null)}
          onExerciseClick={setSelectedExercise}
          onStart={handleStartWorkout}
          onSkip={() => setActiveDay(null)}
        />
      ) : null}

      {workoutMode ? (
      <WorkoutSession
        session={workoutMode}
        goal={selectedGoal}
        level={selectedLevel}
        historySessions={workoutSessions}
        onClose={handleCloseWorkoutSession}
        onDashboard={() => navigate("/dashboard")}
        onFinish={handleCompleteWorkout}
      />
      ) : null}
{customWorkoutMode ? (
  <div className="fixed inset-0 z-[9999] bg-[var(--app-surface)]">
    <WorkoutSession
      session={customWorkoutMode}
      goal={customWorkoutMode.day?.goal || selectedGoal}
      level={customWorkoutMode.day?.level || selectedLevel}
      historySessions={workoutSessions}
      onClose={() => setCustomWorkoutMode(null)}
      onDashboard={() => {
        setCustomWorkoutMode(null);
        navigate("/dashboard");
      }}
      onFinish={handleCompleteCustomWorkout}
    />
  </div>
) : null}

      {selectedExercise ? (
        <ExerciseSheet
          key={selectedExercise.mediaKey || selectedExercise.id || selectedExercise.name}
          exercise={selectedExercise}
          goal={selectedGoal}
          level={selectedLevel}
          onClose={() => setSelectedExercise(null)}
        />
      ) : null}

      {showHistory ? (
        <WorkoutHistorySheet
          WorkoutHistoryCard={WorkoutHistoryCard}
          sessions={workoutSessions}
          onClose={() => setShowHistory(false)}
        />
      ) : null}
      {showWeeklyPlan ? (
        <WeeklyRoutineSheet
          days={weeklyPlan}
          onClose={() => setShowWeeklyPlan(false)}
          onOpenDay={handleOpenDay}
          onStartDayWorkout={handleStartDayWorkout}
          onToggleDayCompletion={handleToggleDayCompletion}
          planStats={planStats}
          completions={workoutCompletions}
          selectedGoal={selectedGoal}
          selectedLevel={selectedLevel}
        />
      ) : null}
      {showCustomRoutines ? (
        <CustomRoutinesSheet
          routines={customRoutines}
          onCreate={() => navigate("/crear-rutina")}
          onClose={() => setShowCustomRoutines(false)}
          onDelete={handleRequestDeleteCustomRoutine}
          onEdit={(routineId) => navigate(`/editar-rutina/${routineId}`)}
          onStart={handleStartCustomRoutine}
          onShareWeek={handleShareWeeklyCollection}
          sharingWeek={sharingWeek}
          workoutSessions={workoutSessions}
        />
      ) : null}

      {toggleMessage ? (
        <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+92px)] left-3 right-3 z-[95] mx-auto max-w-[360px] rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3 text-center text-[12px] font-black text-[var(--app-primary)] shadow-[0_18px_50px_var(--app-glow)]">
          {toggleMessage}
        </div>
      ) : null}

      <div className="relative z-[100]">
        <ConfirmDialog
          open={Boolean(routinePendingDelete)}
      title={translateWorkoutText("Eliminar rutina", language)}
      description={translateWorkoutText(
        "Esta acción eliminará tu rutina personalizada y no se puede deshacer.",
        language
      )}
      confirmLabel={translateWorkoutText("Eliminar rutina", language)}
      cancelLabel={translateWorkoutText("Cancelar", language)}
      variant="danger"
          onCancel={handleCancelDeleteCustomRoutine}
          onConfirm={handleConfirmDeleteCustomRoutine}
        />
      </div>

    </AppShell>
  );
}
function CustomRoutinesSection({
  routines,
  loading,
  onCreate,
  onOpen,
}) {
  const { t } = useTranslation();
  const count = routines.length;

  return (
    <section className="relative overflow-hidden rounded-[1.2rem] border border-[color:color-mix(in_srgb,var(--app-primary)_10%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_93%,#08131b),var(--app-card))] p-4 shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,196,255,0.1),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.05),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/4" />

      <div className="relative z-10 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.74)] px-2.5 py-1 text-[7px] font-semibold tracking-[0.12em] text-[var(--app-primary)]">
                {t("workouts.custom.badge")}
              </span>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[8px] font-semibold tracking-[0.08em] text-[color:color-mix(in_srgb,var(--app-text)_62%,var(--app-muted))]">
                {count > 0
                  ? t("workouts.custom.savedCount", { count })
                  : t("workouts.custom.emptyBadge")}
              </span>
            </div>

            <h2 className="mt-2.5 text-[18px] font-semibold leading-[1.02] text-[var(--app-text)]">
              {t("workouts.custom.title")}
            </h2>

            <p className={`mt-1.5 max-w-[22rem] ${routineSubtitleClass}`}>
              {loading
                ? t("workouts.custom.loading")
                : count > 0
                  ? t("workouts.custom.savedSummary", { count })
                  : t("workouts.custom.emptyDescription")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCreate}
            className={routinePrimaryActionClass}
          >
            {t("workouts.custom.create")}
          </button>

          <button
            type="button"
            onClick={onOpen}
            className={routineSecondaryActionClass}
          >
            {t("workouts.custom.open")}
            <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </section>
  );
}

function AIPerformanceCore({
  planStats,
  workoutCompletions,
  workoutSessions,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const coreStats = useMemo(
    () =>
      getAIPerformanceCoreStats({
        planStats,
        workoutCompletions,
        workoutSessions,
        language,
      }),
    [language, planStats, workoutCompletions, workoutSessions]
  );
  const active = coreStats.hasData;

  return (
    <section
      className={[
        "group relative overflow-hidden rounded-[1.4rem] border p-4 transition duration-200 active:scale-[0.99]",
        active
          ? "border-[color:color-mix(in_srgb,var(--app-primary)_28%,var(--app-border))] bg-[radial-gradient(circle_at_34%_22%,color-mix(in_srgb,var(--app-primary)_24%,transparent),transparent_35%),radial-gradient(circle_at_86%_0%,rgba(125,245,255,0.1),transparent_33%),linear-gradient(145deg,color-mix(in_srgb,var(--app-card)_86%,#03130d),var(--app-surface))] shadow-[0_20px_48px_rgba(0,0,0,0.3),0_0_44px_color-mix(in_srgb,var(--app-glow)_68%,transparent)]"
          : "border-[color:color-mix(in_srgb,var(--app-primary)_12%,var(--app-border))] bg-[radial-gradient(circle_at_34%_22%,color-mix(in_srgb,var(--app-primary)_7%,transparent),transparent_34%),linear-gradient(145deg,color-mix(in_srgb,var(--app-card)_92%,#06110e),var(--app-surface))] shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.05)_42%,transparent_56%),radial-gradient(circle_at_12%_18%,rgba(45,255,185,0.08),transparent_26%),radial-gradient(circle_at_92%_8%,rgba(125,245,255,0.07),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      <span className={["pointer-events-none absolute left-[11%] top-6 h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]", active ? "animate-ping" : "opacity-45"].join(" ")} />
      <span className={["pointer-events-none absolute right-[16%] top-10 h-1.5 w-1.5 rounded-full bg-[color:color-mix(in_srgb,var(--app-primary)_70%,#7df5ff)] shadow-[0_0_12px_var(--app-glow)]", active ? "animate-[restOrbPulse_2.8s_ease-in-out_infinite]" : "opacity-40"].join(" ")} />
      <span className="pointer-events-none absolute bottom-10 left-[19%] h-1 w-1 rounded-full bg-white/45" />
      <span className="pointer-events-none absolute bottom-16 right-[28%] h-1 w-1 rounded-full bg-[var(--app-primary)] opacity-55 shadow-[0_0_10px_var(--app-glow)]" />

      <div className="relative z-10 grid gap-3">
        <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
        <div className="relative grid h-[132px] w-[132px] shrink-0 place-items-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--app-primary)_28%,transparent),transparent_64%)] blur-md" />
          <div
            className={[
              "absolute inset-1 rounded-full border",
              active
                ? "border-[color:color-mix(in_srgb,var(--app-primary)_34%,transparent)] shadow-[0_0_42px_var(--app-glow)] animate-[restOrbPulse_2.8s_ease-in-out_infinite]"
                : "border-[color:color-mix(in_srgb,var(--app-primary)_13%,transparent)] shadow-[0_0_14px_rgba(0,0,0,0.18)]",
            ].join(" ")}
          />
          <div className="absolute inset-[12px] rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_12%,transparent)]" />
          <div
            className={[
              "absolute inset-[22px] rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_36%,transparent)]",
              active ? "animate-[restRingSpin_10s_linear_infinite]" : "",
            ].join(" ")}
            style={{
              borderLeftColor: "transparent",
              borderBottomColor: "transparent",
            }}
          />
          <div
            className={[
              "absolute inset-[38px] rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_30%,transparent)]",
              active ? "animate-[restRingSpin_7s_linear_infinite_reverse]" : "",
            ].join(" ")}
            style={{
              borderRightColor: "transparent",
              borderTopColor: "transparent",
            }}
          />
          <span className={["absolute left-3 top-9 h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]", active ? "animate-[restOrbPulse_2.2s_ease-in-out_infinite]" : "opacity-45"].join(" ")} />
          <span className={["absolute bottom-7 right-4 h-1 w-1 rounded-full bg-white/70", active ? "animate-ping" : "opacity-40"].join(" ")} />
          <div
            className={[
              "relative grid h-[72px] w-[80px] place-items-center rounded-full border bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.24),transparent_20%),radial-gradient(circle_at_50%_72%,color-mix(in_srgb,var(--app-primary)_34%,transparent),transparent_50%),linear-gradient(145deg,color-mix(in_srgb,var(--app-primary)_38%,#06110e),#06110e)]",
              active
                ? "ai-core-orb-heartbeat border-[color:color-mix(in_srgb,var(--app-primary)_52%,var(--app-border))] shadow-[0_0_44px_var(--app-glow),inset_0_0_22px_color-mix(in_srgb,var(--app-primary)_26%,transparent)]"
                : "border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] shadow-[0_0_16px_rgba(0,0,0,0.22)]",
            ].join(" ")}
          >
            <img
              src="/logo-rutinas.png"
              alt=""
              aria-hidden="true"
              className={[
                "ai-core-heartbeat h-20 w-48 object-cover drop-shadow-[0_0_14px_var(--app-glow)]",
                active ? "opacity-100" : "opacity-90",
              ].join(" ")}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_72%,transparent)] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--app-primary)]">
              {t("workouts.core.badge")}
            </span>
            <span
              className={[
                "h-2 w-2 rounded-full",
                active
                  ? "bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]"
                  : "bg-[color:color-mix(in_srgb,var(--app-text)_36%,var(--app-muted))]",
              ].join(" ")}
            />
          </div>

          <h2 className="mt-2 text-[18px] font-semibold leading-tight text-[var(--app-text)]">
            {t("workouts.core.title")}
          </h2>
          <p className={`mt-1 max-w-[17.5rem] ${routineSubtitleClass}`}>
            {active
              ? t("workouts.core.active")
              : t("workouts.core.inactive")}
          </p>
        </div>
      </div>

        <div className="relative h-7 overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_10%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_58%,transparent)] px-3">
          <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--app-primary)_42%,transparent),transparent)]" />
          <span
            className={[
              "absolute top-1/2 h-[2px] w-20 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,var(--app-primary),transparent)] shadow-[0_0_14px_var(--app-glow)]",
              active ? "animate-[restBeam_2.5s_ease-in-out_infinite]" : "left-[34%] opacity-35",
            ].join(" ")}
          />
          <div className="relative z-10 flex h-full items-center justify-between">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  active
                    ? "bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)] animate-[restOrbPulse_2.6s_ease-in-out_infinite]"
                    : "bg-[color:color-mix(in_srgb,var(--app-text)_32%,var(--app-muted))]",
                ].join(" ")}
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        </div>

      <div className="relative z-10 grid grid-cols-4 gap-1.5 opacity-90">
        {coreStats.metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-[0.75rem] border border-white/[0.035] bg-[color-mix(in_srgb,var(--app-surface)_42%,transparent)] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur"
          >
            <p className="truncate text-[6px] font-semibold uppercase tracking-[0.08em] text-[color:color-mix(in_srgb,var(--app-primary)_74%,var(--app-muted))]">
              {metric.label}
            </p>
            <p className="mt-1 truncate text-[10px] font-semibold leading-tight text-[color:color-mix(in_srgb,var(--app-text)_88%,var(--app-muted))]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

function CustomRoutinesSheet({
  routines,
  onCreate,
  onClose,
  onDelete,
  onEdit,
  onStart,
  onShareWeek,
  sharingWeek,
  workoutSessions,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const count = routines.length;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60  px-2 py-3 backdrop-blur-md"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        paddingBottom:
          "calc(env(safe-area-inset-bottom) + 12px)",
      }}
    >
      <section
        className="flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,#08131b),var(--app-card))] shadow-[0_-18px_46px_rgba(0,0,0,0.5)]"
        style={{
          maxHeight:
            "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)",
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[rgba(8,16,26,0.74)] px-2.5 py-1 text-[7px] font-bold tracking-[0.12em] text-[var(--app-primary)]">
                    {t("workouts.customSheet.badge")}
                  </span>
                  <span className="inline-flex rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[8px] font-semibold tracking-[0.08em] text-[color:color-mix(in_srgb,var(--app-text)_62%,var(--app-muted))]">
                    {routines.length > 0
                      ? t("workouts.customSheet.savedCount", { count: routines.length })
                      : t("workouts.customSheet.emptyBadge")}
                  </span>
                </div>

                <h2 className="mt-2 text-[18px] font-semibold leading-none text-[var(--app-text)]">
                  {t("workouts.customSheet.title")}
                </h2>
                <p className={`mt-1 max-w-[18rem] ${routineSubtitleClass}`}>
                  {t("workouts.customSheet.subtitle")}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] shadow-[0_0_10px_rgba(0,0,0,0.12)] transition duration-150 hover:text-[var(--app-text)] active:scale-[0.96]"
                >
                  <X size={15} />
                </button>

                <button
                  type="button"
                  onClick={onShareWeek}
                  disabled={!count || sharingWeek}
                  className="mt-1 grid h-10 w-10 place-items-center rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[rgba(8,16,26,0.52)] text-[var(--app-primary)] shadow-[0_0_14px_rgba(0,196,255,0.12)] transition duration-150 hover:bg-[rgba(8,16,26,0.7)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t("workouts.customSheet.shareAria")}
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-28 pt-2.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-2.5">
              {routines.length === 0 ? (
                <PremiumEmptyState
                  icon={Sparkles}
                  title={t("workouts.customSheet.emptyTitle")}
                  description={t("workouts.customSheet.emptyDescription")}
                  actionLabel={t("workouts.customSheet.create")}
                  onAction={onCreate}
                />
              ) : routines.map((routine) => {
                const firstDay = Array.isArray(routine.days)
                  ? routine.days[0]
                  : null;

                const exerciseCount = firstDay?.exercises?.length || 0;
                const muscles =
                  firstDay?.muscles?.join(" + ") ||
                  routine.focus ||
                  t("workouts.common.general");
                const lastUsedLabel = getRoutineLastUsedLabel(
                  routine,
                  workoutSessions,
                  t,
                  language
                );
                const routineName = formatRoutineDisplayName(
                  translateWorkoutText(routine.name || t("workouts.common.customRoutine"), language),
                  language
                );
                const publicLabel = routine.is_public ? t("workouts.common.public") : t("workouts.common.private");

                return (
                  <article
                    key={routine.id}
                    className="relative overflow-hidden rounded-[1.05rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_95%,#08131b),var(--app-surface))] p-2.75 shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,196,255,0.06),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(60,255,182,0.03),transparent_30%)]" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
                    <div className="relative z-10">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[7px] font-semibold tracking-[0.12em] text-[var(--app-primary)]">
                            {t("workouts.customSheet.createdByYou")}
                          </p>
                          <h3 className="mt-1 text-[15px] font-semibold leading-[1.05] text-[var(--app-text)]">
                            {routineName}
                          </h3>
                          <p className="mt-1 text-[8px] font-semibold tracking-[0.08em] text-[color:color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
                            {translateWorkoutText(publicLabel, language)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <InfoChip label={translateWorkoutText(muscles, language)} />
                        <InfoChip label={translateWorkoutText(routine.level || "Nivel libre", language)} />
                        <InfoChip label={translateWorkoutText(`${exerciseCount} ejercicios`, language)} />
                        {getRoutineEstimatedDurationLabel(routine) ? (
                          <InfoChip
                            label={translateWorkoutText(getRoutineEstimatedDurationLabel(routine, language), language)}
                          />
                        ) : null}
                      </div>

                      <p className={`mt-2 ${routineSecondaryTextClass}`}>
                        {lastUsedLabel || translateWorkoutText("Aún no usada", language)}
                      </p>

                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => onStart?.(routine)}
                          className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[linear-gradient(135deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_76%,#7df5ff))] text-[10px] font-semibold tracking-[0.01em] text-[var(--app-surface)] shadow-[0_10px_20px_rgba(0,196,255,0.2)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          <Play size={14} />
                          {t("workouts.customSheet.start")}
                        </button>
                      </div>

                      <div className="mt-[5px] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit?.(routine.id)}
                          className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[rgba(8,16,26,0.26)] px-3 text-[8px] font-semibold text-[var(--app-primary)] transition duration-150 hover:bg-[rgba(8,16,26,0.42)] active:scale-[0.98]"
                        >
                          {t("workouts.customSheet.edit")}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete?.(routine)}
                          className="inline-flex h-7 items-center justify-center gap-1.5 rounded-full border border-transparent bg-transparent px-2 text-[8px] font-semibold tracking-[0.02em] text-[color:color-mix(in_srgb,#ff8a98_78%,var(--app-primary))] transition duration-150 hover:bg-[rgba(255,107,122,0.08)] active:scale-[0.98]"
                        >
                          <Trash2 size={11} />
                          {t("workouts.customSheet.delete")}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getRoutineLastUsedLabel(routine, sessions, t, language) {
  const lastSession = (sessions || []).find((session) => {
    const routineId =
      session?.routineId || session?.routine_id || session?.day?.routineId;
    const routineName =
      session?.routineName || session?.routine_name || session?.day?.routineName;
    const routineType = String(
      session?.routineType || session?.routine_type || session?.source || ""
    ).toLowerCase();

    return (
      routineType === "custom" &&
      (routineId === routine.id || routineName === routine.name)
    );
  });

  const rawDate =
    lastSession?.completedAt ||
    lastSession?.completed_at ||
    lastSession?.date ||
    lastSession?.createdAt ||
    lastSession?.created_at;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return getWorkoutLanguage(language) === "en"
    ? `Last used · ${parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })}`
    : `Último uso · ${parsedDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      })}`;
}

function getRoutineEstimatedDurationLabel(routine, language) {
  const firstDay = Array.isArray(routine?.days) ? routine.days[0] : null;
  const explicitDuration = firstDay?.duration || routine?.duration;

  if (typeof explicitDuration === "string" && explicitDuration.trim()) {
    return explicitDuration;
  }

  const exerciseCount = Array.isArray(firstDay?.exercises)
    ? firstDay.exercises.length
    : 0;

  if (!exerciseCount) return null;

  const estimatedMinutes = Math.max(20, Math.min(90, exerciseCount * 8));
  return getWorkoutLanguage(language) === "en"
    ? `${estimatedMinutes} min approx.`
    : `${estimatedMinutes} min aprox.`;
}

function formatRoutineDisplayName(name, language) {
  if (!name || typeof name !== "string") {
    return getWorkoutLanguage(language) === "en" ? "Custom routine" : "Rutina personalizada";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (/^[A-Z0-9/.-]+$/.test(word)) return word;

      return word.length > 1
        ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
        : word.toUpperCase();
    })
    .join(" ");
}

function InfoChip({ label, icon }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[color:color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
      {icon ? <span className="text-[var(--app-primary)]">{icon}</span> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

function IAWeeklyRoutineCard({
  daysPerWeek,
  onAdjust,
  onGenerate,
  onOpen,
  planConfirmed,
  planMeta,
  planStats,
  selectedFocus,
  selectedGoal,
  selectedLevel,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const progress = planConfirmed ? planStats.weeklyProgress : 0;
  const remainingText = planConfirmed
    ? translateWorkoutText(`${planStats.completedCount}/${daysPerWeek} completadas`, language)
    : translateWorkoutText("Aún no generaste tu rutina automática", language);
  const primaryLabel = planConfirmed
    ? translateWorkoutText("Continuar rutina", language)
    : translateWorkoutText("Generar rutina IA", language);

  return (
    <section className="relative overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_90%,#08131b),var(--app-card))] p-3 shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,196,255,0.12),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2.5 py-1 text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                {translateWorkoutText("Generada con IA", language)}
              </span>
            </div>

            <h2 className="mt-2 text-[18px] font-semibold leading-[1.02] text-[var(--app-text)]">
              {translateWorkoutText("Rutina semanal IA", language)}
            </h2>

            <p className={`mt-1.5 max-w-[22rem] ${routineSubtitleClass}`}>
              {translateWorkoutText("La app crea una rutina semanal automáticamente según tu nivel, objetivo y progreso.", language)}
            </p>

            <div className="mt-3 grid gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                  {translateWorkoutText("Progreso semanal", language)}
                </p>
                <p className="text-[10px] font-semibold leading-tight text-[var(--app-text)]">{remainingText}</p>
              </div>

              <div className="h-2 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_72%,#fff))] transition-all duration-300"
                  style={{ width: `${planConfirmed ? progress : 8}%` }}
                />
              </div>

              {planConfirmed ? (
                <p className={routineSecondaryTextClass}>
                  {translateWorkoutText(planStats.planName || planMeta?.planName || "Tu rutina automática", language)}
                </p>
              ) : (
                <p className={routineSecondaryTextClass}>
                  {translateWorkoutText("La app creará tu rutina según tu nivel, objetivo y progreso.", language)}
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={routinePillClass}>
                {translateWorkoutText(selectedLevel, language)}
              </span>
              <span className={routinePillClass}>
                {translateWorkoutText(selectedGoal, language)}
              </span>
              <span className={routinePillClass}>
                {translateWorkoutText(selectedFocus, language)}
              </span>
              <span className={routinePillClass}>
                {translateWorkoutText(`${daysPerWeek} días`, language)}
              </span>
            </div>
          </div>

          <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.14),transparent_28%),var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--app-primary-soft),transparent_66%)]" />
            <img
              src="/icons/rutinas.png"
              alt=""
              aria-hidden="true"
              className="relative z-10 h-9 w-9 object-contain drop-shadow-[0_0_9px_var(--app-glow)]"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={planConfirmed ? onOpen : onGenerate}
            className={routinePrimaryActionClass}
          >
            <Play size={14} />
            {primaryLabel}
          </button>

          <button
            type="button"
            onClick={onAdjust}
            className={routineSecondaryActionClass}
          >
            {t("workouts.plan.adjust")}
          </button>
        </div>
      </div>
    </section>
  );
}

function WeeklyRoutineSheet({
  days,
  onClose,
  onOpenDay,
  onStartDayWorkout,
  onToggleDayCompletion,
  planStats,
  completions,
  selectedGoal,
  selectedLevel,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  return (
   <div className="fixed inset-0 z-[85] overflow-hidden bg-black/66 px-2 pb-[calc(var(--bottom-nav-space)+8px)] pt-[calc(env(safe-area-inset-top)_+_8px)] backdrop-blur-md">
      <section className="mx-auto flex max-h-[calc(100dvh_-_var(--bottom-nav-space)_-_env(safe-area-inset-top)_-_16px)] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-14px_42px_rgba(0,0,0,0.48)]">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2 max-sm:px-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2 py-0.5 text-[7px] font-semibold tracking-[0.1em] text-[var(--app-primary)]">
                  {t("workouts.weekly.badge")}
                </span>
                <h2 className="mt-2 text-[20px] font-black leading-none text-[var(--app-text)]">
                  {t("workouts.weekly.title")}
                </h2>
                <p className={`mt-1 max-w-[20rem] ${routineSubtitleClass}`}>
                  {t("workouts.weekly.subtitle")}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] shadow-[0_0_10px_rgba(0,0,0,0.12)] transition duration-150 hover:text-[var(--app-text)] active:scale-[0.96]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-2 grid gap-2 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2 shadow-[0_0_18px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                  {t("workouts.weekly.progress")}
                </p>
                <p className="text-[9px] font-semibold text-[var(--app-text)]">
                  {t("workouts.weekly.completed", {
                    count: planStats.completedCount,
                    completed: planStats.completedCount,
                    total: days.length,
                  })}
                </p>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full border border-[var(--app-border)] bg-[rgba(8,16,26,0.62)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_72%,#fff))]"
                  style={{ width: `${planStats.weeklyProgress}%` }}
                />
              </div>
            </div>
            
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2 max-sm:px-2.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-2">
              {days.map((day, index) => {
                const dateKey = getPlanDayDateKey(index);
                const completion = getCompletionForPlanDay({
                  completions,
                  dateKey,
                  dayId: day.id,
                });
                const locked = !completion && index > planStats.completedCount + 1;
                const status = getDayStatus({
                  completion,
                  isToday: dateKey === getLocalDateKey(),
                  locked,
                });

                return (
                  <WeeklyRoutineDayCard
                    key={day.id}
                    day={translateRoutineDay(day, language)}
                    locked={locked}
                    onOpen={() => onOpenDay(day)}
                    onStart={() => onStartDayWorkout(day)}
                    onToggle={() =>
                      onToggleDayCompletion(day, index, {
                        selectedGoal,
                        selectedLevel,
                      })
                    }
                    status={status}
                  />
                );
              })}
            </div>
          </div>
          </section>
        </div>
   
  );
}

function WeeklyRoutineDayCard({
  day,
  locked,
  onOpen,
  onStart,
  onToggle,
  status,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const complete = status === "completado";
  const statusLabel = getDayStatusLabel(status, t, language);

  return (
    <article
      className={[
        "relative overflow-hidden rounded-[1rem] border p-2.5 shadow-[0_10px_24px_var(--app-glow)] transition active:scale-[0.99] sm:p-3",
        complete
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
          : "border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_86%,#08131b),var(--app-surface))]",
        locked ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,196,255,0.08),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.05),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
            <div className="flex min-w-0 items-start gap-2">
              <div
                className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-[var(--app-surface)] text-[var(--app-primary)] sm:h-9 sm:w-9",
                  complete
                    ? "border-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]"
                    : "border-[var(--app-border)]",
                ].join(" ")}
              >
                {complete ? <CheckCircle2 size={16} /> : <span className="text-xs font-black">{day.day}</span>}
              </div>

              <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                    {t("workouts.weekly.dayLabel", { day: day.day })}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-[1.08] text-[var(--app-text)]">
                    {Array.isArray(day.muscles)
                      ? day.muscles.map((muscle) => translateMuscleLabel(muscle, language)).join(" + ")
                      : day.muscles}
                  </h3>
                  <p className={`mt-0.5 ${routineSecondaryTextClass}`}>
                    {translateWorkoutText(day.duration, language)}
                  </p>
              </div>
            </div>
          </button>

          <span
            className={[
              "max-w-[88px] shrink-0 rounded-full border px-1.5 py-0.5 text-center text-[7px] font-black uppercase leading-tight tracking-[0.08em] sm:px-2 sm:tracking-[0.12em]",
              getDayStatusClass(status),
            ].join(" ")}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-2 flex gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onStart}
            className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[0.9rem] bg-[var(--app-primary)] px-2 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-surface)] shadow-[0_8px_16px_rgba(0,196,255,0.14)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Play size={12} />
            {translateWorkoutText("Comenzar", language)}
          </button>

          <button
            type="button"
            onClick={onToggle}
            className="min-h-10 rounded-[0.9rem] border border-[var(--app-border)] bg-[rgba(8,16,26,0.46)] px-3 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)] transition duration-150 hover:bg-[rgba(8,16,26,0.58)] active:scale-[0.98] sm:px-3.5"
            aria-label={
              complete
                ? translateWorkoutText("Desmarcar entrenamiento", language)
                : translateWorkoutText("Marcar entrenamiento", language)
            }
          >
            {complete ? t("workouts.weekly.done") : t("workouts.weekly.mark")}
          </button>
        </div>
      </div>
    </article>
  );
}

function WorkoutHistoryCard({ session, compact = false }) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const completedExercisesCount = getCompletedExercisesCount(session);
  const exerciseNames = getCompletedExerciseNames(session);

  return (
    <article className="w-full max-w-full min-w-0 overflow-hidden rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            {formatSessionDate(session, language)}
          </p>
          <h3 className="mt-0.5 truncate text-[13px] font-black text-[var(--app-text)]">
            {translateWorkoutText(session.dayName || t("workouts.history.card.sessionFallback"), language)}
          </h3>
          <p className={`mt-0.5 truncate ${routineSecondaryTextClass}`}>
            {formatMuscles(session.muscles, language, t)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-black text-[var(--app-text)]">
            {translateWorkoutText(`${session.duration} min`, language)}
          </p>
          <p className="mt-0.5 text-[9px] font-black text-[var(--app-primary)]">
            {translateWorkoutText(`${session.caloriesEstimate} kcal`, language)}
          </p>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <HistoryPill>{translateWorkoutText(`${completedExercisesCount} ejercicios`, language)}</HistoryPill>
        <HistoryPill>{translateWorkoutText(`${session.duration} min`, language)}</HistoryPill>
      </div>

      {!compact && exerciseNames.length ? (
        <div className="mt-2 border-t border-[var(--app-border)] pt-2">
          <p className={`line-clamp-2 ${routineSecondaryTextClass}`}>
            {translateWorkoutText(exerciseNames.join(" · "), language)}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function HistoryPill({ children }) {
  return (
    <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
      {children}
    </span>
  );
}

function DayDetailSheet({
  day,
  exercises,
  goal,
  level,
  onClose,
  onExerciseClick,
  onStart,
  onSkip,
}) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-2 pb-[var(--bottom-nav-space)] backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-12px_38px_rgba(0,0,0,0.42)]">
      <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
              >
                <ArrowLeft size={14} />
              </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)] transition duration-150 hover:text-[var(--app-text)]"
            >
                {t("workouts.day.skip")}
            </button>
            </div>

            <p className="mt-2 text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
              {t("workouts.day.dayDuration", { day: day.day, duration: day.duration })}
            </p>
            <h2 className="mt-0.5 break-words text-[20px] font-semibold leading-tight text-[var(--app-text)] line-clamp-2">
              {translateWorkoutText(day.name, language)}
            </h2>
          </div>

          <div className="min-h-0 overflow-y-auto px-2.5 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <RoutineBlock
              title={t("workouts.day.warmup")}
              items={day.warmupItems || getWarmupItems(day, language)}
              language={language}
            />

            <div className="mt-2.5">
              <p className="px-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {t("workouts.day.exercises")}
              </p>
              <div className="mt-1.5 grid gap-1">
                {exercises.map((exercise) => (
                  <ExerciseListItem
                    exercise={exercise}
                    goal={goal}
                    key={exercise.id}
                    level={level}
                    onClick={() => onExerciseClick(exercise)}
                  />
                ))}
              </div>
            </div>

            <RoutineBlock
              title={t("workouts.day.finish")}
              items={day.finalItems || [t("workouts.day.finishItems.one"), t("workouts.day.finishItems.two")]}
              language={language}
            />

            <button
              type="button"
              onClick={onStart}
              className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--app-primary)] px-4 text-[10px] font-semibold tracking-[0.02em] text-[var(--app-surface)] shadow-[0_8px_18px_rgba(0,196,255,0.14)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Play size={16} />
              {t("workouts.day.start")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExerciseListItem({ exercise, goal, level, onClick }) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const prescription = getExercisePrescription(exercise, level, goal);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[62px] items-center gap-2 rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-left transition duration-150 hover:bg-[rgba(8,16,26,0.48)] active:scale-[0.99]"
    >
        <ExerciseMediaFrame exercise={exercise} variant="thumb" className="h-11 w-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13px] font-semibold text-[var(--app-text)]">
          {translateWorkoutText(exercise.name, language)}
        </h3>
        <p className={`mt-0.5 ${routineSecondaryTextClass}`}>
          {t("workouts.day.setsReps", { sets: prescription.sets, reps: prescription.reps })}
        </p>
        <p className="mt-0.5 text-[9px] font-medium tracking-[0.01em] text-[color:color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
          {t("workouts.day.rest", { rest: prescription.rest })}
        </p>
      </div>
      <ChevronRight size={14} className="text-[var(--app-primary)]" />
    </button>
  );
}

function RoutineBlock({ title, items }) {
  const { i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  return (
    <section className="mt-2.5 first:mt-0">
      <p className="px-0.5 text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-1 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5">
        <p className="truncate text-[11px] font-medium text-[var(--app-text)]">
          {translateWorkoutText(items.join(" · "), language)}
        </p>
      </div>
    </section>
  );
}

function ExerciseSheet({ exercise, goal, level, onClose }) {
  const { t, i18n } = useTranslation();
  const language = getWorkoutLanguage(i18n.resolvedLanguage || i18n.language);
  const prescription = getExercisePrescription(exercise, level, goal);
  const visibleTips = (exercise.tips || []).slice(0, 2);
  const hiddenTipsCount = Math.max(0, (exercise.tips || []).length - visibleTips.length);
  const visibleMistakes = (exercise.mistakes || []).slice(0, 2);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-2 pb-[calc(var(--bottom-nav-space)+24px)] backdrop-blur-md">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-28px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-14px_42px_rgba(0,0,0,0.48)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-28px)] flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-primary)]">
                {translateMuscleLabel(exercise.muscle, language)}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
                aria-label={t("workouts.exercise.close")}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ExerciseMediaFrame
              exercise={exercise}
              variant="thumb"
              className="h-[140px] w-full rounded-[0.95rem]"
            />

            <h2 className="mt-2 line-clamp-2 text-[22px] font-black leading-[1.05] text-[var(--app-text)]">
              {translateWorkoutText(exercise.name, language)}
            </h2>
            <p className={`mt-1 line-clamp-2 ${routineSubtitleClass}`}>
              {translateWorkoutText(exercise.description, language)}
            </p>

            <div className="mt-2 flex gap-1.5">
              <SheetChip label={t("workouts.exercise.sets")} value={prescription.sets} />
              <SheetChip label={t("workouts.exercise.reps")} value={prescription.reps} />
              <SheetChip label={t("workouts.exercise.rest")} value={prescription.rest} />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <InfoPill>{translateMuscleLabel(exercise.muscle, language)}</InfoPill>
              <InfoPill>{translateEquipmentLabel(exercise.equipment, language)}</InfoPill>
            </div>

            <CompactInfo title={t("workouts.exercise.tips")} items={visibleTips} language={language} />
            {hiddenTipsCount > 0 ? (
              <p className="mt-1 px-0.5 text-[10px] font-black text-[var(--app-primary)]">
                {t("workouts.exercise.more", { count: hiddenTipsCount })}
              </p>
            ) : null}
            <CompactInfo title={t("workouts.exercise.mistakes")} items={visibleMistakes} clamp language={language} />
          </div>
        </div>
      </section>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange, language }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-semibold tracking-[0.08em] text-[var(--app-muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 text-[10px] font-semibold text-[var(--app-text)] outline-none transition duration-150 focus:border-[var(--app-primary)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {translateOption(option, language)}
          </option>
        ))}
      </select>
    </label>
  );
}

function translateOption(option, language) {
  return (
    translateLevelLabel(option, language) ||
    translateGoalLabel(option, language) ||
    translateFocusLabel(option, language) ||
    option
  );
}

function SheetChip({ label, value }) {
  return (
    <div className="min-w-0 flex-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-center">
      <p className="text-[8px] font-semibold tracking-[0.06em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="truncate text-[10px] font-semibold text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function InfoPill({ children }) {
  return (
    <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-semibold tracking-[0.02em] text-[color:color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
      {children}
    </span>
  );
}

function CompactInfo({ title, items, clamp = false, language }) {
  if (!items?.length) return null;

  return (
    <section className="mt-2">
      <p className="px-0.5 text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-1 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2">
        {items.map((item) => (
          <p
            key={item}
            className={[
              "text-[11.5px] font-medium leading-[1.45] text-[color:color-mix(in_srgb,var(--app-text)_68%,var(--app-muted))]",
              clamp ? "line-clamp-1" : "line-clamp-2",
            ].join(" ")}
          >
            {translateWorkoutText(item, language)}
          </p>
        ))}
      </div>
    </section>
  );
}

function getAIPerformanceCoreStats({
  planStats,
  workoutCompletions,
  workoutSessions,
  language,
}) {
  const sessions = Array.isArray(workoutSessions) ? workoutSessions : [];
  const completions = Array.isArray(workoutCompletions) ? workoutCompletions : [];
  const completedDateKeys = getCompletedWorkoutDateKeys({ completions, sessions });
  const weeklySessions = getWeeklyCompletedSessions({
    completions,
    planStats,
    sessions,
  });
  const totalVolume = sessions.reduce(
    (total, session) => total + Number(session?.totalWeightMoved || 0),
    0
  );
  const strengthSummary = getStrengthProgressSummary(sessions, 6);
  const bestImprovement = strengthSummary.items.find(
    (item) => Number(item.difference || 0) > 0
  );
  const currentStreak = getCurrentWorkoutStreak(completedDateKeys);
  const hasData = sessions.length > 0 || completions.length > 0;

  return {
    hasData,
    metrics: [
      {
        label: getWorkoutLanguage(language) === "en" ? "Current streak" : "Racha actual",
        value: hasData
          ? formatStreakValue(currentStreak, language)
          : (getWorkoutLanguage(language) === "en" ? "Inactive" : "Sin activar"),
      },
      {
        label: getWorkoutLanguage(language) === "en" ? "This week" : "Esta semana",
        value: hasData
          ? translateWorkoutText(`${weeklySessions} sesiones`, language)
          : (getWorkoutLanguage(language) === "en" ? "0 sessions" : "0 sesiones"),
      },
      {
        label: getWorkoutLanguage(language) === "en" ? "Total volume" : "Volumen total",
        value: totalVolume > 0
          ? formatVolumeValue(totalVolume, language)
          : (getWorkoutLanguage(language) === "en" ? "No kg" : "Sin kg"),
      },
      {
        label: getWorkoutLanguage(language) === "en" ? "Best improvement" : "Mejor mejora",
        value: bestImprovement
          ? `${translateWorkoutText(bestImprovement.name, language)} +${formatCompactNumber(bestImprovement.difference)} kg`
          : (getWorkoutLanguage(language) === "en" ? "No PR yet" : "Sin PR aún"),
      },
    ],
  };
}

function getCompletedWorkoutDateKeys({ completions, sessions }) {
  const keys = new Set();

  for (const session of sessions) {
    const dateKey = getWorkoutDateKey(session?.date || session?.completedAt);
    if (dateKey) keys.add(dateKey);
  }

  for (const completion of completions) {
    const dateKey = getWorkoutDateKey(completion?.date || completion?.completedAt);
    if (dateKey) keys.add(dateKey);
  }

  return keys;
}

function getWeeklyCompletedSessions({ completions, planStats, sessions }) {
  const weekStart = getCurrentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const sessionsThisWeek = sessions.filter((session) => {
    const date = getWorkoutDate(session?.date || session?.completedAt);
    return date && date >= weekStart && date < weekEnd;
  });

  if (sessionsThisWeek.length > 0) return sessionsThisWeek.length;

  const completionsThisWeek = completions.filter((completion) => {
    const date = getWorkoutDate(completion?.date || completion?.completedAt);
    return date && date >= weekStart && date < weekEnd;
  });

  return completionsThisWeek.length || Number(planStats?.completedCount || 0);
}

function getCurrentWorkoutStreak(dateKeys) {
  if (!dateKeys?.size) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dateKeys.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  if (streak > 0) return streak;

  cursor.setTime(Date.now());
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - 1);

  while (dateKeys.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getWorkoutDateKey(value) {
  const date = getWorkoutDate(value);
  return date ? getLocalDateKey(date) : "";
}

function getWorkoutDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
}

function getCurrentWeekStart() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function formatStreakValue(value, language) {
  if (getWorkoutLanguage(language) === "en") {
    return value === 1 ? "1 day" : `${value} days`;
  }

  return value === 1 ? "1 día" : `${value} días`;
}

function formatVolumeValue(value) {
  if (value >= 1000) {
    return `${formatCompactNumber(value / 1000)} t`;
  }

  return `${formatCompactNumber(value)} kg`;
}

function formatCompactNumber(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: number >= 10 ? 0 : 1,
  }).format(number);
}

function getInitialMuscle(searchParams) {
  const requestedMuscle = searchParams.get("muscle");
  if (!requestedMuscle) return MUSCLE_GROUPS[0];

  const normalizedRequest = normalizeQueryValue(requestedMuscle);

  return (
    MUSCLE_GROUPS.find(
      (muscle) => normalizeQueryValue(muscle) === normalizedRequest
    ) || MUSCLE_GROUPS[0]
  );
}

function normalizeQueryValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getWarmupItems(day, language) {
  const mainMuscle = day?.muscles?.[0] || "zona principal";

  if (getWorkoutLanguage(language) === "en") {
    return [
      "5 min light cardio",
      `Mobility for ${translateWorkoutText(mainMuscle.toLowerCase(), language)}`,
      "Light activation",
    ];
  }

  return [
    "5 min cardio suave",
    `Movilidad de ${mainMuscle.toLowerCase()}`,
    "Activación ligera",
  ];
}

function getCompletedExercisesCount(session) {
  return session.completedExercises.filter(
    (exercise) => Number(exercise.completedSets || 0) > 0
  ).length;
}

function getCompletedExerciseNames(session) {
  return session.completedExercises
    .filter((exercise) => Number(exercise.completedSets || 0) > 0)
    .map((exercise) => exercise.name)
    .filter(Boolean);
}

function formatSessionDate(session, language) {
  const date = new Date(session.completedAt || `${session.date}T00:00:00`);

  if (Number.isNaN(date.getTime())) return session.date || (getWorkoutLanguage(language) === "en" ? "No date" : "Sin fecha");

  return new Intl.DateTimeFormat(getWorkoutLanguage(language) === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatMuscles(muscles, language) {
  if (!muscles?.length) {
    return getWorkoutLanguage(language) === "en" ? "Muscles not recorded" : "Músculos no registrados";
  }

  return muscles.map((muscle) => translateMuscleLabel(muscle, language)).join(" + ");
}

function getDayStatus({ completion, isToday, locked }) {
  if (completion) return "completado";
  if (isToday) return "iniciado";
  if (locked) return "bloqueado";
  return "pendiente";
}

function getDayStatusLabel(status, t, language) {
  if (status === "completado") return translateWorkoutText("Hecho", language);
  if (status === "iniciado") return translateWorkoutText("Hoy", language);
  if (status === "bloqueado") return translateWorkoutText("Bloqueado", language);
  return translateWorkoutText("Pendiente", language);
}

function getDayStatusClass(status) {
  if (status === "completado") {
    return "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]";
  }

  if (status === "iniciado") {
    return "border-[var(--app-primary)] bg-[var(--app-card)] text-[var(--app-primary)]";
  }

  if (status === "bloqueado") {
    return "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] opacity-70";
  }

  return "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]";
}

function getTodayPlanDay({ weeklyPlan, planStats }) {
  if (!weeklyPlan.length) return null;

  return weeklyPlan[Math.min(planStats.completedCount, weeklyPlan.length - 1)];
}

function getPlanStats({ weeklyPlan, level, goal, focus, daysPerWeek, completions }) {
  const completedCount = Math.min(
    daysPerWeek,
    completions.filter((completion) => isThisWeek(completion.date)).length
  );
  const weeklyProgress = Math.round((completedCount / daysPerWeek) * 100);
  const durations = weeklyPlan.map((day) => Number.parseInt(day.duration, 10) || 45);
  const averageDuration = `${Math.round(
    durations.reduce((total, duration) => total + duration, 0) / durations.length
  )} min`;

  return {
    planName: getPlanName({ level, goal, focus, daysPerWeek }),
    level,
    goal,
    daysPerWeek,
    completedCount,
    weeklyProgress,
    averageDuration,
    remaining: Math.max(0, daysPerWeek - completedCount),
  };
}

function getPlanName({ level, goal, focus, daysPerWeek }) {
  if (focus && focus !== "General") return `${focus} · ${daysPerWeek} días`;
  if (goal === "Fuerza") return `${level} fuerza estructurada`;
  if (daysPerWeek >= 5) return "Hipertrofia split avanzado";
  if (daysPerWeek === 4) return "Hipertrofia Upper/Lower";
  return "Base atlética semanal";
}

function isThisWeek(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const weekStart = getWeekStartDate();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return date >= weekStart && date < weekEnd;
}

function getWeekStartDate() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}
