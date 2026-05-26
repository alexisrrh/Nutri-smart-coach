import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Play,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { EXERCISE_LIBRARY, MUSCLE_GROUPS } from "../data/exerciseLibrary";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/ui";
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

const SHARED_ROUTINE_BASE_URL = "https://nutrismartcoach.com/rutina";

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

  async function handleDeleteCustomRoutine(routineId) {
    if (!window.confirm("¿Eliminar esta rutina personalizada?")) return;

    try {
      await deleteCustomWorkoutRoutine(routineId);
      setCustomRoutines((current) =>
        current.filter((routine) => routine.id !== routineId)
      );
    } catch (error) {
      console.error("Error eliminando rutina personalizada:", error);
    }
  }

  async function handleShareWeeklyCollection() {
    if (!customRoutines.length) {
      toast.error("No hay rutinas para compartir.");
      return;
    }

    setSharingWeek(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        toast.error("Necesitas iniciar sesión para compartir esta semana.");
        return;
      }

      console.log("[WorkoutRoutines] share week user.id", user.id);
      const sharedWeek = await shareCustomWorkoutWeek(user.id, customRoutines);
      const shareUrl = buildSharedWeekUrl(sharedWeek.share_id);
      const payload = {
        title: "Mi semana de entrenamiento",
        text: "Mira mi semana de entrenamiento personalizada.",
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(payload);
        toast.success("Semana compartida.");
        return;
      }

      const copied = await copyTextToClipboard(shareUrl);
      if (!copied) {
        throw new Error("No se pudo copiar el enlace.");
      }

      toast.success("Enlace copiado. Comparte tu semana.");
    } catch (error) {
      console.error("Error compartiendo semana de rutinas:", error);
      toast.error(error.message || "No se pudo compartir la semana.");
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
      day: "Personalizada",
      name: routine.name,
      routineId: routine.id,
      routineName: routine.name,
      source: "custom",
      muscles: firstDay.muscles || [routine.focus || "General"],
      goal: routine.goal || selectedGoal,
      level: routine.level || selectedLevel,
      focus: routine.focus || firstDay.muscles?.[0] || "General",
      duration: "45 min",
      warmupItems: ["5 min cardio suave", "Movilidad articular", "Activación ligera"],
      finalItems: ["Estiramiento breve", "Respiración y recuperación"],
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
      hideBottomNav={Boolean(workoutMode || customWorkoutMode)}
      contentClassName="overflow-x-hidden px-3 pb-[var(--bottom-nav-space)] pt-1.5"
    >
      <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col gap-2 overflow-hidden overflow-x-hidden">
        <header className="w-full max-w-full shrink-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold transition hover:text-[var(--app-text)]"
            style={{
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-muted)",
            }}
          >
            <ArrowLeft size={11} />
            Dashboard
          </button>

          <section className="relative w-full max-w-full min-w-0 overflow-hidden rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1.5 shadow-[0_6px_18px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,var(--app-primary-soft),transparent_40%)]" />
            <div className="relative z-10 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  Entrenamientos
                </p>
                <h1 className="mt-0.5 text-[20px] font-black leading-none text-[var(--app-text)]">
                  Rutinas
                </h1>
                <p className="mt-1 text-[10px] font-bold text-[var(--app-muted)]">
                  Tu plan semanal de entrenamiento
                </p>
              </div>

              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]">
                <Dumbbell size={16} />
              </div>
            </div>
          </section>
        </header>

        <main className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-full max-w-full min-w-0 space-y-[5px] pb-2">
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

            {planConfirmed && workoutSessions.length ? (
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
          onClose={() => setShowCustomRoutines(false)}
          onDelete={handleDeleteCustomRoutine}
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

    </AppShell>
  );
}
function CustomRoutinesSection({
  routines,
  loading,
  onCreate,
  onOpen,
}) {
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
                Mis rutinas
              </span>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[7px] font-semibold tracking-[0.1em] text-[var(--app-muted)]">
                {count > 0
                  ? `${count} guardadas`
                  : "Sin rutinas"}
              </span>
            </div>

            <h2 className="mt-2.5 text-[18px] font-semibold leading-[1.02] text-[var(--app-text)]">
              Mis rutinas
            </h2>

            <p className="mt-1.5 max-w-[22rem] text-[10px] font-medium leading-4 text-[var(--app-muted)]">
              {loading
                ? "Sincronizando rutinas guardadas..."
                : count > 0
                  ? "Gestiona tus rutinas creadas y comparte tu semana completa."
                  : "Diseña tu primera rutina con los ejercicios de la biblioteca."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-[42px] w-auto items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_78%,#7df5ff))] px-4 text-[9px] font-semibold text-[var(--app-surface)] shadow-[0_10px_20px_rgba(0,196,255,0.16)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Crear rutina
          </button>

          {count > 0 ? (
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex h-[42px] w-auto items-center justify-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_10%,var(--app-border))] bg-[rgba(8,16,26,0.22)] px-3.5 text-[9px] font-semibold text-[var(--app-primary)] transition duration-150 hover:bg-[rgba(8,16,26,0.36)] active:scale-[0.98]"
            >
              Ver rutinas
              <ChevronRight size={11} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CustomRoutinesSheet({
  routines,
  onClose,
  onDelete,
  onEdit,
  onStart,
  onShareWeek,
  sharingWeek,
  workoutSessions,
}) {
  const count = routines.length;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 px-2 backdrop-blur-md"
      style={{
        paddingBottom:
          "calc(var(--bottom-nav-space) + env(safe-area-inset-bottom) + 20px)",
      }}
    >
      <section
        className="w-full max-w-[430px] overflow-hidden rounded-t-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,#08131b),var(--app-card))] shadow-[0_-18px_46px_rgba(0,0,0,0.5)]"
        style={{
          maxHeight:
            "calc(100dvh - var(--bottom-nav-space) - env(safe-area-inset-bottom) - 22px)",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[rgba(8,16,26,0.74)] px-2.5 py-1 text-[7px] font-bold tracking-[0.12em] text-[var(--app-primary)]">
                    Rutinas personalizadas
                  </span>
                  <span className="inline-flex rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[7px] font-semibold tracking-[0.1em] text-[var(--app-muted)]">
                    {routines.length > 0
                      ? `${routines.length} guardadas`
                      : "Sin rutinas"}
                  </span>
                </div>

                <h2 className="mt-2 text-[18px] font-semibold leading-none text-[var(--app-text)]">
                  Mis rutinas
                </h2>
                <p className="mt-1 max-w-[18rem] text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Guarda, abre o comparte tus rutinas sin mezclarla con la rutina semanal.
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
                  aria-label="Compartir semana"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-2.5">
              {routines.map((routine) => {
                const firstDay = Array.isArray(routine.days)
                  ? routine.days[0]
                  : null;

                const exerciseCount = firstDay?.exercises?.length || 0;
                const muscles =
                  firstDay?.muscles?.join(" + ") ||
                  routine.focus ||
                  "General";
                const lastUsedLabel = getRoutineLastUsedLabel(
                  routine,
                  workoutSessions
                );
                const routineName = formatRoutineDisplayName(
                  routine.name || "Rutina personalizada"
                );
                const publicLabel = routine.is_public ? "Pública" : "Privada";

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
                            Creada por ti
                          </p>
                          <h3 className="mt-1 text-[15px] font-semibold leading-[1.05] text-[var(--app-text)]">
                            {routineName}
                          </h3>
                          <p className="mt-1 text-[7px] font-semibold tracking-[0.1em] text-[var(--app-muted)]">
                            {publicLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <InfoChip label={muscles} />
                        <InfoChip label={routine.level || "Nivel libre"} />
                        <InfoChip label={`${exerciseCount} ejercicios`} />
                        {getRoutineEstimatedDurationLabel(routine) ? (
                          <InfoChip
                            label={getRoutineEstimatedDurationLabel(routine)}
                          />
                        ) : null}
                      </div>

                      <p className="mt-2 text-[8px] font-medium text-[var(--app-muted)]">
                        {lastUsedLabel || "Aún no usada"}
                      </p>

                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => onStart?.(routine)}
                          className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[linear-gradient(135deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_76%,#7df5ff))] text-[10px] font-semibold tracking-[0.01em] text-[var(--app-surface)] shadow-[0_10px_20px_rgba(0,196,255,0.2)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          <Play size={14} />
                          Iniciar entrenamiento
                        </button>
                      </div>

                      <div className="mt-[5px] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit?.(routine.id)}
                          className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[rgba(8,16,26,0.26)] px-3 text-[8px] font-semibold text-[var(--app-primary)] transition duration-150 hover:bg-[rgba(8,16,26,0.42)] active:scale-[0.98]"
                        >
                          Editar rutina
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete?.(routine.id)}
                          className="inline-flex h-7 items-center justify-center gap-1.5 rounded-full border border-transparent bg-transparent px-2 text-[8px] font-semibold tracking-[0.02em] text-[color:color-mix(in_srgb,#ff8a98_78%,var(--app-primary))] transition duration-150 hover:bg-[rgba(255,107,122,0.08)] active:scale-[0.98]"
                        >
                          <Trash2 size={11} />
                          Eliminar
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

function getRoutineLastUsedLabel(routine, sessions) {
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

  return `Último uso · ${parsedDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  })}`;
}

function getRoutineEstimatedDurationLabel(routine) {
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
  return `${estimatedMinutes} min aprox.`;
}

function formatRoutineDisplayName(name) {
  if (!name || typeof name !== "string") return "Rutina personalizada";

  return name
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length > 1
        ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
        : word.toUpperCase()
    )
    .join(" ");
}

function InfoChip({ label, icon }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
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
  const progress = planConfirmed ? planStats.weeklyProgress : 0;
  const remainingText = planConfirmed
    ? `${planStats.completedCount}/${daysPerWeek} completadas`
    : "Aún no generaste tu rutina automática";
  const primaryLabel = planConfirmed ? "Continuar rutina" : "Generar rutina IA";

  return (
    <section className="relative overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_90%,#08131b),var(--app-card))] p-3 shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,196,255,0.12),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2.5 py-1 text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                Generada con IA
              </span>
            </div>

            <h2 className="mt-2 text-[18px] font-semibold leading-[1.02] text-[var(--app-text)]">
              Rutina semanal IA
            </h2>

            <p className="mt-1.5 max-w-[22rem] text-[10px] font-medium leading-4 text-[var(--app-muted)]">
              La app crea una rutina semanal automáticamente según tu nivel, objetivo y progreso.
            </p>

            <div className="mt-3 grid gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                  Progreso semanal
                </p>
                <p className="text-[9px] font-semibold text-[var(--app-text)]">{remainingText}</p>
              </div>

              <div className="h-2 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_72%,#fff))] transition-all duration-300"
                  style={{ width: `${planConfirmed ? progress : 8}%` }}
                />
              </div>

              {planConfirmed ? (
                <p className="text-[9px] font-medium text-[var(--app-muted)]">
                  {planStats.planName || planMeta?.planName || "Tu rutina automática"}
                </p>
              ) : (
                <p className="text-[9px] font-medium text-[var(--app-muted)]">
                  La app creará tu rutina según tu nivel, objetivo y progreso.
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
                {selectedLevel}
              </span>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
                {selectedGoal}
              </span>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
                {selectedFocus}
              </span>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
                {daysPerWeek} días
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[var(--app-primary-soft)] p-2 text-[var(--app-primary)] shadow-[0_0_14px_rgba(0,196,255,0.14)]">
            <Dumbbell size={20} />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={planConfirmed ? onOpen : onGenerate}
            className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[0.9rem] bg-[var(--app-primary)] px-3 text-[9px] font-semibold tracking-[0.02em] text-[var(--app-surface)] shadow-[0_8px_16px_rgba(0,196,255,0.14)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Play size={14} />
            {primaryLabel}
          </button>

          <button
            type="button"
            onClick={onAdjust}
            className="h-[42px] rounded-[0.9rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.44)] px-3.5 text-[9px] font-semibold tracking-[0.02em] text-[var(--app-primary)] transition duration-150 hover:bg-[rgba(8,16,26,0.6)] active:scale-[0.98]"
          >
            Ajustar plan
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
  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/66 px-2 pb-[var(--bottom-nav-space)] backdrop-blur-md">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-14px_42px_rgba(0,0,0,0.48)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2 py-0.5 text-[7px] font-semibold tracking-[0.1em] text-[var(--app-primary)]">
                  Rutina IA semanal
                </span>
                <h2 className="mt-2 text-[20px] font-black leading-none text-[var(--app-text)]">
                  Tu semana completa
                </h2>
                <p className="mt-1 max-w-[20rem] text-[10px] font-bold leading-4 text-[var(--app-muted)]">
                  Revisa cada día y comienza tu siguiente entrenamiento cuando quieras.
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

            <div className="mt-2 grid gap-2 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                  Progreso semanal
                </p>
                <p className="text-[9px] font-semibold text-[var(--app-text)]">
                  {planStats.completedCount}/{days.length} completadas
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full border border-[var(--app-border)] bg-[rgba(8,16,26,0.62)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_72%,#fff))]"
                  style={{ width: `${planStats.weeklyProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    day={day}
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
  const complete = status === "completado";
  const statusLabel = getDayStatusLabel(status);

  return (
    <article
      className={[
        "relative overflow-hidden rounded-[1rem] border p-3 shadow-[0_10px_24px_var(--app-glow)] transition active:scale-[0.99]",
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
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-[var(--app-surface)] text-[var(--app-primary)]",
                  complete
                    ? "border-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]"
                    : "border-[var(--app-border)]",
                ].join(" ")}
              >
                {complete ? <CheckCircle2 size={16} /> : <span className="text-xs font-black">{day.day}</span>}
              </div>

              <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                    Día {day.day}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-[1.05] text-[var(--app-text)]">
                    {day.muscles.join(" + ")}
                  </h3>
                  <p className="mt-0.5 text-[9px] font-medium text-[var(--app-muted)]">
                    {day.duration}
                  </p>
              </div>
            </div>
          </button>

          <span
            className={[
              "shrink-0 rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em]",
              getDayStatusClass(status),
            ].join(" ")}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onStart}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[0.9rem] bg-[var(--app-primary)] text-[8px] font-semibold tracking-[0.02em] text-[var(--app-surface)] shadow-[0_8px_16px_rgba(0,196,255,0.14)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Play size={12} />
            Comenzar
          </button>

          <button
            type="button"
            onClick={onToggle}
            className="h-10 rounded-[0.9rem] border border-[var(--app-border)] bg-[rgba(8,16,26,0.46)] px-3.5 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)] transition duration-150 hover:bg-[rgba(8,16,26,0.58)] active:scale-[0.98]"
            aria-label={complete ? "Desmarcar entrenamiento" : "Marcar entrenamiento"}
          >
            {complete ? "Hecho" : "Marcar"}
          </button>
        </div>
      </div>
    </article>
  );
}

function WorkoutHistoryCard({ session, compact = false }) {
  const completedExercisesCount = getCompletedExercisesCount(session);
  const exerciseNames = getCompletedExerciseNames(session);

  return (
    <article className="w-full max-w-full min-w-0 overflow-hidden rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            {formatSessionDate(session)}
          </p>
          <h3 className="mt-0.5 truncate text-[13px] font-black text-[var(--app-text)]">
            {session.dayName || "Entrenamiento"}
          </h3>
          <p className="mt-0.5 truncate text-[9px] font-bold text-[var(--app-muted)]">
            {formatMuscles(session.muscles)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-black text-[var(--app-text)]">
            {session.duration} min
          </p>
          <p className="mt-0.5 text-[9px] font-black text-[var(--app-primary)]">
            {session.caloriesEstimate} kcal
          </p>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <HistoryPill>{completedExercisesCount} ejercicios</HistoryPill>
        <HistoryPill>{session.duration} min</HistoryPill>
      </div>

      {!compact && exerciseNames.length ? (
        <div className="mt-2 border-t border-[var(--app-border)] pt-2">
          <p className="line-clamp-2 text-[11px] leading-4 text-[var(--app-muted)]">
            {exerciseNames.join(" · ")}
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
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-2 pb-[var(--bottom-nav-space)] backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-12px_38px_rgba(0,0,0,0.42)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] flex-col">
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
                Saltar
              </button>
            </div>

            <p className="mt-2 text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
              Día {day.day} · {day.duration}
            </p>
            <h2 className="mt-0.5 break-words text-[20px] font-semibold leading-tight text-[var(--app-text)] line-clamp-2">
              {day.name}
            </h2>
          </div>

          <div className="min-h-0 overflow-y-auto px-2.5 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <RoutineBlock
              title="Calentamiento"
              items={day.warmupItems || getWarmupItems(day)}
            />

            <div className="mt-2.5">
              <p className="px-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Ejercicios
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
              title="Final"
              items={day.finalItems || ["Estiramiento breve", "Respiración y recuperación"]}
            />

            <button
              type="button"
              onClick={onStart}
              className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--app-primary)] px-4 text-[10px] font-semibold tracking-[0.02em] text-[var(--app-surface)] shadow-[0_8px_18px_rgba(0,196,255,0.14)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Play size={16} />
              Comenzar entrenamiento
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExerciseListItem({ exercise, goal, level, onClick }) {
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
          {exercise.name}
        </h3>
        <p className="mt-0.5 text-[9px] font-medium text-[var(--app-muted)]">
          {prescription.sets} x {prescription.reps}
        </p>
        <p className="mt-0.5 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
          Descanso {prescription.rest}
        </p>
      </div>
      <ChevronRight size={14} className="text-[var(--app-primary)]" />
    </button>
  );
}

function RoutineBlock({ title, items }) {
  return (
    <section className="mt-2.5 first:mt-0">
      <p className="px-0.5 text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-1 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5">
        <p className="truncate text-[11px] font-medium text-[var(--app-text)]">
          {items.join(" · ")}
        </p>
      </div>
    </section>
  );
}

function ExerciseSheet({ exercise, goal, level, onClose }) {
  const prescription = getExercisePrescription(exercise, level, goal);
  const visibleTips = (exercise.tips || []).slice(0, 2);
  const hiddenTipsCount = Math.max(0, (exercise.tips || []).length - visibleTips.length);
  const visibleMistakes = (exercise.mistakes || []).slice(0, 2);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 px-2 pb-[calc(var(--bottom-nav-space)+24px)] backdrop-blur-md">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-28px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-14px_42px_rgba(0,0,0,0.48)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-28px)] flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-primary)]">
                {exercise.muscle}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
                aria-label="Cerrar ejercicio"
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
              {exercise.name}
            </h2>
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[var(--app-muted)]">
              {exercise.description}
            </p>

            <div className="mt-2 flex gap-1.5">
              <SheetChip label="Series" value={prescription.sets} />
              <SheetChip label="Reps" value={prescription.reps} />
              <SheetChip label="Descanso" value={prescription.rest} />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <InfoPill>{exercise.muscle}</InfoPill>
              <InfoPill>{exercise.equipment}</InfoPill>
            </div>

            <CompactInfo title="Tips" items={visibleTips} />
            {hiddenTipsCount > 0 ? (
              <p className="mt-1 px-0.5 text-[10px] font-black text-[var(--app-primary)]">
                Ver más ({hiddenTipsCount})
              </p>
            ) : null}
            <CompactInfo title="Errores comunes" items={visibleMistakes} clamp />
          </div>
        </div>
      </section>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
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
            {option}
          </option>
        ))}
      </select>
    </label>
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
    <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-semibold tracking-[0.02em] text-[var(--app-muted)]">
      {children}
    </span>
  );
}

function CompactInfo({ title, items, clamp = false }) {
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
              "text-[11px] leading-4 text-[var(--app-muted)]",
              clamp ? "line-clamp-1" : "line-clamp-2",
            ].join(" ")}
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
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

function getWarmupItems(day) {
  const mainMuscle = day?.muscles?.[0] || "zona principal";

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

function formatSessionDate(session) {
  const date = new Date(session.completedAt || `${session.date}T00:00:00`);

  if (Number.isNaN(date.getTime())) return session.date || "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatMuscles(muscles) {
  if (!muscles?.length) return "Músculos no registrados";

  return muscles.join(" + ");
}

function getDayStatus({ completion, isToday, locked }) {
  if (completion) return "completado";
  if (isToday) return "iniciado";
  if (locked) return "bloqueado";
  return "pendiente";
}

function getDayStatusLabel(status) {
  if (status === "completado") return "Hecho";
  if (status === "iniciado") return "Hoy";
  if (status === "bloqueado") return "Bloqueado";
  return "Pendiente";
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
