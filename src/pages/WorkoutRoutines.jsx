import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Play,
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
import { ActivePlanSummary } from "../components/workouts/ActivePlanSummary";
import { TodayWorkoutCard } from "../components/workouts/TodayWorkoutCard";
import { WorkoutHistoryPreview } from "../components/workouts/WorkoutHistoryPreview";
import { WorkoutHistorySheet } from "../components/workouts/WorkoutHistorySheet";
import {
  listCustomWorkoutRoutines
} from "../services/customWorkoutService";
import { supabase } from "../lib/supabase";

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
  const [showCustomRoutines, setShowCustomRoutines] = useState(false);
  const [customWorkoutMode, setCustomWorkoutMode] = useState(null);
  const {
    handleCompleteWorkout: recordWorkoutCompletion,
    handleToggleDayCompletion,
    setShowHistory,
    showHistory,
    todayCompletion,
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
    muscles: firstDay.muscles || [routine.focus || "General"],
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

  return (
    <AppShell contentClassName="overflow-x-hidden px-3 pb-[var(--bottom-nav-space)] pt-1.5">
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
            ) : (
              <ActivePlanSummary
                daysPerWeek={daysPerWeek}
                planMeta={workoutPlan.meta}
                planStats={planStats}
                selectedFocus={selectedFocus}
                selectedLevel={selectedLevel}
                onAdjust={() => {
                  setShowConfig(true);
                  setPlanConfirmed(false);
                }}
              />
            )}

            {planConfirmed ? (
              <>
                <TodayWorkoutCard
                  day={getTodayPlanDay({ weeklyPlan, planStats })}
                  onStart={() =>
                    handleStartDayWorkout(getTodayPlanDay({ weeklyPlan, planStats }))
                  }
                  todayCompletion={todayCompletion}
                />
     <CustomRoutinesSection
  routines={customRoutines}
  loading={loadingCustomRoutines}
  onCreate={() => navigate("/crear-rutina")}
  onOpen={() => setShowCustomRoutines(true)}
/>

                <section>
                  <div className="mb-1 flex min-w-0 items-center justify-between gap-2 px-1">
                    <h2 className="min-w-0 text-[14px] font-black text-[var(--app-text)]">
                      Toda tu semana
                    </h2>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                      {planStats.remaining} pendientes
                    </span>
                  </div>

                  <div className="grid w-full max-w-full min-w-0 gap-1">
                    {weeklyPlan.map((day, index) => {
                      const dateKey = getPlanDayDateKey(index);
                      const completion = getCompletionForPlanDay({
                        completions: workoutCompletions,
                        dateKey,
                        dayId: day.id,
                      });
                      const locked = !completion && index > planStats.completedCount + 1;

                      return (
                        <DayCard
                          day={day}
                          key={day.id}
                          locked={locked}
                          onClick={() => handleOpenDay(day)}
                          onToggle={() =>
                            handleToggleDayCompletion(day, index, {
                              selectedGoal,
                              selectedLevel,
                            })
                          }
                          status={getDayStatus({
                            completion,
                            isToday: dateKey === getLocalDateKey(),
                            locked,
                          })}
                        />
                      );
                    })}
                  </div>
                </section>

                {workoutSessions.length ? (
                  <WorkoutHistoryPreview
                    WorkoutHistoryCard={WorkoutHistoryCard}
                    sessions={workoutSessions}
                    onOpen={() => setShowHistory(true)}
                  />
                ) : null}
              </>
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
      onClose={() => setCustomWorkoutMode(null)}
      onDashboard={() => navigate("/dashboard")}
      onFinish={() => {
        setCustomWorkoutMode(null);
        return true;
      }}
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
      {showCustomRoutines ? (
  <CustomRoutinesSheet
    routines={customRoutines}
    onClose={() => setShowCustomRoutines(false)}
    onCreate={() => navigate("/crear-rutina")}
   onStart={handleStartCustomRoutine}
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
function CustomRoutinesSection({ routines, loading, onCreate, onOpen }) {
  const count = routines.length;

  return (
    <section className="relative overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 shadow-[0_10px_28px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,var(--app-primary-soft),transparent_38%)]" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Creadas por ti
          </p>

          <h2 className="mt-0.5 text-[16px] font-black leading-none text-[var(--app-text)]">
            Mis rutinas personalizadas
          </h2>

          <p className="mt-1 text-[10px] font-bold leading-4 text-[var(--app-muted)]">
            {loading
              ? "Cargando tus rutinas..."
              : count > 0
                ? `${count} rutina${count === 1 ? "" : "s"} guardada${count === 1 ? "" : "s"}`
                : "Crea rutinas con tus propios ejercicios."}
          </p>
        </div>

        <button
          type="button"
          onClick={count > 0 ? onOpen : onCreate}
          className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-primary)] px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-surface)] shadow-[0_8px_18px_var(--app-glow)] transition active:scale-[0.96]"
        >
          {count > 0 ? "Ver" : "Crear"}
        </button>
      </div>

      {count > 0 ? (
        <button
          type="button"
          onClick={onCreate}
          className="relative z-10 mt-2 w-full rounded-[0.85rem] border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)] transition active:scale-[0.99]"
        >
          + Crear nueva rutina
        </button>
      ) : null}
    </section>
  );
}

function CustomRoutinesSheet({ routines, onClose, onCreate, onStart }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 px-2 pb-[var(--bottom-nav-space)] backdrop-blur-md">
      <section className="max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-14px_42px_rgba(0,0,0,0.48)]">
        <div className="flex max-h-[calc(100dvh-var(--bottom-nav-space)-10px)] flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  Creadas por ti
                </p>
                <h2 className="mt-0.5 text-[20px] font-black text-[var(--app-text)]">
                  Mis rutinas
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
              >
                <X size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={onCreate}
              className="mt-2 w-full rounded-[0.9rem] border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]"
            >
              + Crear nueva rutina
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-2">
              {routines.map((routine) => {
                const firstDay = Array.isArray(routine.days)
                  ? routine.days[0]
                  : null;

                const exerciseCount = firstDay?.exercises?.length || 0;
                const muscles =
                  firstDay?.muscles?.join(" + ") ||
                  routine.focus ||
                  "General";

                return (
                  <article
                    key={routine.id}
                    className="relative overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-[0_8px_22px_var(--app-glow)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,var(--app-primary-soft),transparent_36%)]" />

                    <div className="relative z-10">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                          Personalizada
                        </span>
                        <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                          {exerciseCount} ejercicios
                        </span>
                      </div>

                      <h3 className="text-[16px] font-black text-[var(--app-text)]">
                        {routine.name}
                      </h3>

                      <p className="mt-1 text-[10px] font-bold text-[var(--app-muted)]">
                        {muscles} · {routine.level || "Nivel libre"}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onStart?.(routine)}
                          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[0.9rem] bg-[var(--app-primary)] text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-surface)] shadow-[0_8px_18px_var(--app-glow)]"
                        >
                          <Play size={14} />
                          Iniciar
                        </button>

                        <button
                          type="button"
                          className="h-10 rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]"
                        >
                          Editar
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

function DayCard({ day, status, locked, onClick, onToggle }) {
  const complete = status === "completado";
  const statusLabel = getDayStatusLabel(status);

  return (
    <article
      className={[
        "w-full max-w-full min-w-0 overflow-hidden rounded-[0.9rem] border px-2 py-1.5 text-left shadow-[0_5px_14px_var(--app-glow)] transition active:scale-[0.99]",
        complete
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] shadow-[0_0_14px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-primary-soft)]/40",
        locked ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="grid min-h-[56px] w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <div
          className={[
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-[var(--app-surface)] text-[var(--app-primary)]",
            complete
              ? "border-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]"
              : "border-[var(--app-border)]",
          ].join(" ")}
        >
          {complete ? <CheckCircle2 size={15} /> : <span className="text-xs font-black">{day.day}</span>}
        </div>

        <div className="min-w-0">
          <button
            type="button"
            onClick={onClick}
            className="block w-full min-w-0 text-left"
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                  Día {day.day}
                </p>
                <h3 className="mt-0.5 break-words text-[13px] font-black leading-tight text-[var(--app-text)] line-clamp-2">
                  {day.muscles.join(" + ")}
                </h3>
                <p className="mt-0.5 min-w-0 truncate text-[9px] font-bold text-[var(--app-muted)]">
                  {day.duration}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span
                  className={[
                    "shrink-0 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em]",
                    getDayStatusClass(status),
                  ].join(" ")}
                >
                  {statusLabel}
                </span>
                <ChevronRight size={14} className="text-[var(--app-primary)]" />
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={complete ? "Desmarcar entrenamiento" : "Marcar entrenamiento"}
          className={[
            "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition active:scale-[0.96]",
            complete
              ? "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-primary)] opacity-90"
              : "border-[var(--app-border)] bg-transparent text-[var(--app-muted)] opacity-75",
          ].join(" ")}
        >
          <CheckCircle2 size={13} />
        </button>
      </div>
    </article>
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
                className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]"
              >
                Saltar
              </button>
            </div>

            <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              Día {day.day} · {day.duration}
            </p>
            <h2 className="mt-0.5 break-words text-[20px] font-black leading-tight text-[var(--app-text)] line-clamp-2">
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
              className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--app-primary)] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-surface)] shadow-[0_10px_26px_var(--app-glow)] transition active:scale-[0.98]"
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
      className="flex min-h-[62px] items-center gap-2 rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-left"
    >
      <ExerciseMediaFrame exercise={exercise} variant="thumb" className="h-11 w-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13px] font-black text-[var(--app-text)]">
          {exercise.name}
        </h3>
        <p className="mt-0.5 text-[9px] font-bold text-[var(--app-muted)]">
          {prescription.sets} x {prescription.reps}
        </p>
        <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
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
      <p className="px-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-1 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5">
        <p className="truncate text-[11px] font-bold text-[var(--app-text)]">
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
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
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
      <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 text-[10px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
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
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="truncate text-[10px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function InfoPill({ children }) {
  return (
    <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
      {children}
    </span>
  );
}

function CompactInfo({ title, items, clamp = false }) {
  if (!items?.length) return null;

  return (
    <section className="mt-2">
      <p className="px-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
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
