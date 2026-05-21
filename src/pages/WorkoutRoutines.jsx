import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Play,
  Target,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell, MetaBadge } from "../components/ui";
import { WorkoutSession } from "../components/workout/WorkoutSession";
import {
  exercises,
  MUSCLE_GROUPS,
  WORKOUT_GOALS,
  WORKOUT_LEVELS,
} from "../data/exercises";
import {
  DAYS_PER_WEEK_OPTIONS,
  getWorkoutSplit,
} from "../data/workoutSplits";
import {
  completeWorkoutForToday,
  getLocalDateKey,
  getTodayWorkoutCompletion,
  getWorkoutCompletions,
  markWorkoutCompletion,
  unmarkWorkoutCompletion,
} from "../services/gamificationService";
import { getCachedProfile } from "../services/profileService";

const WORKOUT_FOCUS_OPTIONS = [
  "General",
  "Glúteos y piernas",
  "Torso y brazos",
  "Core/abdomen",
  "Fuerza completa",
];
const WORKOUT_CONFIG_KEYS = {
  level: "workout_level",
  goal: "workout_goal",
  focus: "workout_focus",
  daysPerWeek: "workout_days_per_week",
  completed: "workout_config_completed",
  generatedAt: "workout_config_generated_at",
};

export function WorkoutRoutines() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMuscle = getInitialMuscle(searchParams);
  const profile = getCachedProfile();
  const savedConfig = getSavedWorkoutConfig(profile);
  const [selectedLevel, setSelectedLevel] = useState(savedConfig.level);
  const [selectedGoal] = useState(savedConfig.goal);
  const [selectedFocus, setSelectedFocus] = useState(savedConfig.focus);
  const [daysPerWeek, setDaysPerWeek] = useState(savedConfig.daysPerWeek);
  const [showConfig, setShowConfig] = useState(!savedConfig.completed);
  const [planConfirmed, setPlanConfirmed] = useState(savedConfig.completed);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [activeDay, setActiveDay] = useState(null);
  const [workoutMode, setWorkoutMode] = useState(null);
  const [todayCompletion, setTodayCompletion] = useState(() =>
    getTodayWorkoutCompletion()
  );
  const [workoutCompletions, setWorkoutCompletions] = useState(() =>
    getWorkoutCompletions()
  );
  const [toggleMessage, setToggleMessage] = useState("");

  const weeklyPlan = useMemo(
    () =>
      getWorkoutSplit({
        level: selectedLevel,
        goal: selectedGoal,
        daysPerWeek,
        focus: selectedFocus,
      }),
    [daysPerWeek, selectedFocus, selectedGoal, selectedLevel]
  );
  const selectedDay =
    weeklyPlan.find((day) => day.id === selectedDayId) ||
    weeklyPlan.find((day) => day.muscles.includes(initialMuscle)) ||
    weeklyPlan[0];
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
    setSelectedDayId(day.id);
    setActiveDay(day);
    setWorkoutMode(null);
  }

  function handleStartWorkout() {
    const exercisesForDay = getExercisesForDay({
      day: activeDay || selectedDay,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
    });

    setWorkoutMode({
      day: activeDay || selectedDay,
      exercises: exercisesForDay,
    });
  }

  function handleStartDayWorkout(day) {
    const exercisesForDay = getExercisesForDay({
      day,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
    });

    setSelectedDayId(day.id);
    setActiveDay(day);
    setWorkoutMode({
      day,
      exercises: exercisesForDay,
    });
  }

  function handleCompleteWorkout() {
    const day = workoutMode?.day || activeDay || selectedDay;
    const result = completeWorkoutForToday({
      muscle: day.muscles.join(" + "),
      level: selectedLevel,
      goal: selectedGoal,
      dayId: day.id,
      dayName: day.name,
    });

    setTodayCompletion(result.completion);
    setWorkoutCompletions(getWorkoutCompletions());
    return result;
  }

  function handleCloseWorkoutSession() {
    setWorkoutMode(null);
    setActiveDay(null);
  }

  function handleToggleDayCompletion(day, index) {
    const dateKey = getPlanDayDateKey(index);
    const completion = getCompletionForPlanDay({
      completions: workoutCompletions,
      dateKey,
      dayId: day.id,
    });

    if (completion) {
      const nextCompletions = unmarkWorkoutCompletion(dateKey);
      setWorkoutCompletions(nextCompletions);
      setTodayCompletion(getTodayWorkoutCompletion());
      setToggleMessage("Entreno desmarcado");
    } else {
      markWorkoutCompletion({
        date: dateKey,
        dayId: day.id,
        dayName: day.name,
        muscle: day.muscles.join(" + "),
        level: selectedLevel,
        goal: selectedGoal,
      });
      setWorkoutCompletions(getWorkoutCompletions());
      setTodayCompletion(getTodayWorkoutCompletion());
      setToggleMessage("Entreno marcado");
    }

    window.setTimeout(() => setToggleMessage(""), 1800);
  }

  return (
    <AppShell contentClassName="px-2 pb-[112px] pt-2">
      <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
        <header className="shrink-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold transition hover:text-[var(--app-text)]"
            style={{
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-muted)",
            }}
          >
            <ArrowLeft size={11} />
            Dashboard
          </button>

          <section className="relative overflow-hidden rounded-[1.05rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 shadow-[0_12px_32px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,var(--app-primary-soft),transparent_40%)]" />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  Entrenamientos
                </p>
                <h1 className="mt-0.5 text-[22px] font-black leading-none text-[var(--app-text)]">
                  Rutinas
                </h1>
                <p className="mt-1 text-[11px] font-bold text-[var(--app-muted)]">
                  Plan claro para entrenar en móvil.
                </p>
              </div>

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_20px_var(--app-glow)]">
                <Dumbbell size={19} />
              </div>
            </div>
          </section>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2 pb-3">
            {showConfig ? (
              <WorkoutConfigCard
                daysPerWeek={daysPerWeek}
                onGenerate={handleGenerateWorkout}
                selectedFocus={selectedFocus}
                selectedLevel={selectedLevel}
                setDaysPerWeek={setDaysPerWeek}
                setSelectedFocus={setSelectedFocus}
                setSelectedLevel={setSelectedLevel}
              />
            ) : (
              <ActivePlanSummary
                daysPerWeek={daysPerWeek}
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

                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="text-[15px] font-black text-[var(--app-text)]">
                      Toda tu semana
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      {planStats.remaining} pendientes
                    </span>
                  </div>

                  <div className="grid gap-1.5">
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
                          onToggle={() => handleToggleDayCompletion(day, index)}
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
              </>
            ) : null}
          </div>
        </main>
      </div>

      {activeDay && !workoutMode ? (
        <DayDetailSheet
          day={activeDay}
          exercises={getExercisesForDay({
            day: activeDay,
            level: selectedLevel,
            goal: selectedGoal,
            focus: selectedFocus,
          })}
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

      {selectedExercise ? (
        <ExerciseSheet
          exercise={selectedExercise}
          goal={selectedGoal}
          level={selectedLevel}
          onClose={() => setSelectedExercise(null)}
        />
      ) : null}

      {toggleMessage ? (
        <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+92px)] left-1/2 z-[95] w-[88%] max-w-[360px] -translate-x-1/2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3 text-center text-[12px] font-black text-[var(--app-primary)] shadow-[0_18px_50px_var(--app-glow)]">
          {toggleMessage}
        </div>
      ) : null}

    </AppShell>
  );
}

function WorkoutConfigCard({
  daysPerWeek,
  onGenerate,
  selectedFocus,
  selectedLevel,
  setDaysPerWeek,
  setSelectedFocus,
  setSelectedLevel,
}) {
  return (
    <section className="rounded-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 shadow-[0_14px_38px_var(--app-glow)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Configuración del plan
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-[var(--app-muted)]">
            Define la base y ocultaremos este paso.
          </p>
        </div>
        <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
          Setup
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SelectFilter
          label="Nivel"
          value={selectedLevel}
          options={WORKOUT_LEVELS}
          onChange={setSelectedLevel}
        />
        <SelectFilter
          label="Enfoque principal"
          value={selectedFocus}
          options={WORKOUT_FOCUS_OPTIONS}
          onChange={setSelectedFocus}
        />
      </div>

      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-muted)]">
        ¿Cuántos días puedes entrenar?
      </p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {DAYS_PER_WEEK_OPTIONS.map((days) => (
          <button
            type="button"
            key={days}
            onClick={() => setDaysPerWeek(days)}
            className={[
              "h-10 rounded-2xl border text-[13px] font-black transition active:scale-[0.98]",
              daysPerWeek === days
                ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_18px_var(--app-glow)]"
                : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]",
            ].join(" ")}
          >
            {days}
          </button>
        ))}
      </div>

      <p className="mt-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] font-black text-[var(--app-primary)]">
        Recomendado para tu nivel: {getRecommendedDays(selectedLevel)} días
      </p>

      <button
        type="button"
        onClick={onGenerate}
        className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--app-primary)] bg-[var(--app-primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-surface)] shadow-[0_18px_42px_var(--app-glow)] transition active:scale-[0.98]"
      >
        <Dumbbell size={16} />
        Generar rutina
      </button>
    </section>
  );
}

function ActivePlanSummary({
  daysPerWeek,
  planStats,
  selectedFocus,
  selectedLevel,
  onAdjust,
}) {
  return (
    <section className="rounded-[1.05rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 shadow-[0_12px_32px_var(--app-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Plan semanal
          </p>
          <p className="mt-1 truncate text-[13px] font-black text-[var(--app-text)]">
            {selectedLevel} · {selectedFocus} · {daysPerWeek} días
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--app-surface)]">
              <div
                className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                style={{ width: `${planStats.weeklyProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-[var(--app-primary)]">
              {planStats.weeklyProgress}%
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdjust}
          className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)] transition active:scale-[0.98]"
        >
          Ajustar plan
        </button>
      </div>
    </section>
  );
}

function TodayWorkoutCard({ day, onStart, todayCompletion }) {
  return (
    <section className="relative overflow-hidden rounded-[1.15rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 shadow-[0_12px_34px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,var(--app-primary-soft),transparent_42%)]" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
              <Flame size={12} />
              Entrenamiento de hoy
            </p>
            <h2 className="mt-1 truncate text-[18px] font-black leading-none text-[var(--app-text)]">
              {day.name}
            </h2>
            <p className="mt-1 text-[11px] font-bold text-[var(--app-muted)]">
              {day.muscles.join(" + ")} · {day.duration}
            </p>
          </div>
          {todayCompletion ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
              <CheckCircle2 size={11} />
              Hoy
            </span>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[var(--app-primary)] px-3 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-surface)] shadow-[0_12px_28px_var(--app-glow)] transition active:scale-[0.98]"
            >
              <Play size={12} />
              Comenzar
            </button>
          )}
        </div>

        {todayCompletion ? (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[10px] font-black text-[var(--app-primary)]">
            <CheckCircle2 size={12} />
            Completado hoy
          </p>
        ) : null}
      </div>
    </section>
  );
}

function DayCard({ day, status, locked, onClick, onToggle }) {
  const complete = status === "completado";
  const progress = complete ? 100 : status === "iniciado" ? 35 : 0;

  return (
    <article
      className={[
        "rounded-[1rem] border px-2.5 py-2 text-left shadow-[0_8px_22px_var(--app-glow)] transition active:scale-[0.99]",
        complete
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] shadow-[0_0_22px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-primary-soft)]/40",
        locked ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div
          className={[
            "grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-[var(--app-surface)] text-[var(--app-primary)]",
            complete
              ? "border-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]"
              : "border-[var(--app-border)]",
          ].join(" ")}
        >
          {complete ? <CheckCircle2 size={18} /> : <span className="text-sm font-black">{day.day}</span>}
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onClick}
            className="block w-full text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  Día {day.day}
                </p>
                <h3 className="mt-0.5 truncate text-[14px] font-black leading-none text-[var(--app-text)]">
                  {day.muscles.join(" + ")}
                </h3>
                <p className="mt-1 truncate text-[10px] font-bold text-[var(--app-muted)]">
                  {day.duration}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
                  {status}
                </span>
                <ChevronRight size={15} className="text-[var(--app-primary)]" />
              </div>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--app-surface)]">
              <div
                className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={complete ? "Desmarcar entrenamiento" : "Marcar entrenamiento"}
          className={[
            "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition active:scale-[0.96]",
            complete
              ? "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-primary)]"
              : "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
          ].join(" ")}
        >
          <CheckCircle2 size={16} />
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 px-2 backdrop-blur-sm">
      <section className="max-h-[92dvh] w-full max-w-[430px] overflow-hidden rounded-t-[1.6rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-20px_70px_rgba(0,0,0,0.5)]">
        <div className="flex max-h-[92dvh] flex-col">
          <div className="shrink-0 border-b border-[var(--app-border)] p-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]"
              >
                Saltar
              </button>
            </div>

            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              Día {day.day} · {day.duration}
            </p>
            <h2 className="mt-1 text-[25px] font-black leading-none text-[var(--app-text)]">
              {day.name}
            </h2>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 pb-24 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <RoutineBlock
              title="Calentamiento"
              items={getWarmupItems(day)}
            />

            <div className="mt-3">
              <p className="px-1 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                Ejercicios
              </p>
              <div className="mt-2 grid gap-1.5">
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
              items={["Estiramiento breve", "Respiración y recuperación"]}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--app-border)] bg-[var(--app-card)] p-3">
            <button
              type="button"
              onClick={onStart}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--app-primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-surface)] shadow-[0_18px_42px_var(--app-glow)]"
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
  const prescription = getPrescription(exercise, level, goal);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-left"
    >
      <ExerciseImage exercise={exercise} className="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-black text-[var(--app-text)]">
          {exercise.name}
        </h3>
        <p className="mt-0.5 text-[10px] font-bold text-[var(--app-muted)]">
          {prescription.sets} x {prescription.reps}
        </p>
        <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
          Descanso {prescription.rest}
        </p>
      </div>
      <ChevronRight size={15} className="text-[var(--app-primary)]" />
    </button>
  );
}

function RoutineBlock({ title, items }) {
  return (
    <section className="mt-3 first:mt-0">
      <p className="px-1 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-2 overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)]">
        {items.map((item) => (
          <div
            className="flex min-h-10 items-center justify-between border-b border-[var(--app-border)] px-3 py-2 last:border-b-0"
            key={item}
          >
            <span className="text-[12px] font-bold text-[var(--app-text)]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExerciseSheet({ exercise, goal, level, onClose }) {
  const prescription = getPrescription(exercise, level, goal);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 px-2 backdrop-blur-sm">
      <section className="max-h-[88dvh] w-full max-w-[430px] overflow-hidden rounded-t-[1.6rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-20px_70px_rgba(0,0,0,0.5)]">
        <div className="flex max-h-[88dvh] flex-col">
          <div className="shrink-0 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <MetaBadge icon={<Dumbbell size={11} />} variant="neutral">
                {exercise.muscle}
              </MetaBadge>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
              >
                <X size={16} />
              </button>
            </div>
            <ExerciseImage exercise={exercise} className="h-[190px] w-full" />
          </div>

          <div className="min-h-0 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <h2 className="text-[25px] font-black leading-none text-[var(--app-text)]">
              {exercise.name}
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--app-muted)]">
              {exercise.description}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <SheetMetric icon={<Trophy size={13} />} label="Series" value={prescription.sets} />
              <SheetMetric icon={<Target size={13} />} label="Reps" value={prescription.reps} />
              <SheetMetric icon={<Timer size={13} />} label="Descanso" value={prescription.rest} />
            </div>

            <DetailBlock title="Músculo principal" items={[exercise.muscle]} />
            <DetailBlock title="Equipo" items={[exercise.equipment]} />
            <DetailBlock title="Tips" items={exercise.tips} />
            <DetailBlock title="Errores comunes" items={exercise.mistakes} />
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

function ExerciseImage({ exercise, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] ${className}`}
    >
      {!failed ? (
        <img
          src={exercise.gif || exercise.image}
          alt={exercise.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_30%,var(--app-primary-soft),transparent_52%)] text-[var(--app-primary)]">
          <Dumbbell size={28} />
        </div>
      )}
    </div>
  );
}

function SheetMetric({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
      <div className="mb-1 text-[var(--app-primary)]">{icon}</div>
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function DetailBlock({ title, items }) {
  return (
    <div className="mt-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-2 space-y-1.5">
        {items.map((item) => (
          <p key={item} className="text-xs leading-5 text-[var(--app-muted)]">
            {item}
          </p>
        ))}
      </div>
    </div>
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

function getExercisesForDay({ day, level, goal, focus = "General" }) {
  const relevantExercises = exercises.filter(
    (exercise) =>
      day.muscles.includes(exercise.muscle) &&
      (exercise.goals || []).includes(goal)
  );
  const levelMatches = relevantExercises.filter(
    (exercise) => exercise.level === level
  );
  const pool = levelMatches.length >= 4 ? levelMatches : relevantExercises;

  return sortExercisesForGoal(pool, goal, focus).slice(
    0,
    getExerciseCount(level, focus)
  );
}

function getWarmupItems(day) {
  const mainMuscle = day?.muscles?.[0] || "zona principal";

  return [
    "5 min cardio suave",
    `Movilidad de ${mainMuscle.toLowerCase()}`,
    "Activación ligera",
  ];
}

function sortExercisesForGoal(list, goal, focus) {
  const priorityMuscles = getFocusPriorityMuscles(focus);

  return [...list].sort((a, b) => {
    const aPriority = priorityMuscles.includes(a.muscle) ? 0 : 1;
    const bPriority = priorityMuscles.includes(b.muscle) ? 0 : 1;

    if (aPriority !== bPriority) return aPriority - bPriority;

    if (goal === "Fuerza" || focus === "Fuerza completa") {
      const aCompound = a.secondaryMuscles.length > 0 ? 0 : 1;
      const bCompound = b.secondaryMuscles.length > 0 ? 0 : 1;
      return aCompound - bCompound;
    }

    return 0;
  });
}

function getFocusPriorityMuscles(focus) {
  if (focus === "Glúteos y piernas") return ["Glúteos", "Piernas"];
  if (focus === "Torso y brazos") {
    return ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps"];
  }
  if (focus === "Core/abdomen") return ["Abdomen"];
  if (focus === "Fuerza completa") {
    return ["Pecho", "Espalda", "Piernas", "Glúteos", "Hombros"];
  }
  return [];
}

function getExerciseCount(level, focus = "General") {
  if (focus === "Fuerza completa") {
    if (level === "Avanzado") return 5;
    return 4;
  }
  if (level === "Avanzado") return 6;
  if (level === "Intermedio") return 5;
  return 4;
}

function getPrescription(exercise, level, goal) {
  return {
    sets: exercise.setsByLevel?.[level] || exercise.sets,
    reps: exercise.repsByGoal?.[goal] || exercise.reps,
    rest: exercise.restByGoal?.[goal] || exercise.rest,
  };
}

function getRecommendedDays(level) {
  if (level === "Avanzado") return 5;
  if (level === "Intermedio") return 4;
  return 3;
}

function getDayStatus({ completion, isToday, locked }) {
  if (completion) return "completado";
  if (isToday) return "iniciado";
  if (locked) return "bloqueado";
  return "pendiente";
}

function getCompletionForPlanDay({ completions, dateKey, dayId }) {
  return completions.find(
    (completion) =>
      completion.date === dateKey ||
      (completion.dayId && completion.dayId === dayId && isThisWeek(completion.date))
  );
}

function getPlanDayDateKey(index) {
  const weekStart = getWeekStartDate();
  weekStart.setDate(weekStart.getDate() + index);

  return getLocalDateKey(weekStart);
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

function getSavedWorkoutConfig(profile) {
  if (typeof localStorage === "undefined") {
    return getDefaultWorkoutConfig(profile);
  }

  const level = localStorage.getItem(WORKOUT_CONFIG_KEYS.level);
  const goal = localStorage.getItem(WORKOUT_CONFIG_KEYS.goal);
  const focus = localStorage.getItem(WORKOUT_CONFIG_KEYS.focus);
  const daysPerWeek = Number(
    localStorage.getItem(WORKOUT_CONFIG_KEYS.daysPerWeek)
  );
  const completed =
    localStorage.getItem(WORKOUT_CONFIG_KEYS.completed) === "true";
  const generatedAt = localStorage.getItem(WORKOUT_CONFIG_KEYS.generatedAt);

  const profileGoal = getWorkoutGoalFromProfile(profile);

  return {
    level: WORKOUT_LEVELS.includes(level) ? level : getSuggestedLevel(profile),
    goal:
      profileGoal || (WORKOUT_GOALS.includes(goal) ? goal : WORKOUT_GOALS[0]),
    focus: WORKOUT_FOCUS_OPTIONS.includes(focus)
      ? focus
      : getSuggestedFocus(profile),
    daysPerWeek: DAYS_PER_WEEK_OPTIONS.includes(daysPerWeek)
      ? daysPerWeek
      : getSuggestedDaysPerWeek(profile),
    completed: completed && Boolean(generatedAt),
  };
}

function saveWorkoutConfig(config) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(WORKOUT_CONFIG_KEYS.level, config.level);
  localStorage.setItem(WORKOUT_CONFIG_KEYS.goal, config.goal);
  localStorage.setItem(WORKOUT_CONFIG_KEYS.focus, config.focus);
  localStorage.setItem(
    WORKOUT_CONFIG_KEYS.daysPerWeek,
    String(config.daysPerWeek)
  );
  localStorage.setItem(WORKOUT_CONFIG_KEYS.completed, "true");
  localStorage.setItem(WORKOUT_CONFIG_KEYS.generatedAt, new Date().toISOString());
}

function getDefaultWorkoutConfig(profile) {
  return {
    level: getSuggestedLevel(profile),
    goal: getWorkoutGoalFromProfile(profile) || WORKOUT_GOALS[0],
    focus: getSuggestedFocus(profile),
    daysPerWeek: getSuggestedDaysPerWeek(profile),
    completed: false,
  };
}

function getWorkoutGoalFromProfile(profile) {
  const profileGoal =
    profile?.goal || profile?.objetivo || profile?.preferences?.goal || "";

  if (profileGoal === "perder_grasa" || profileGoal === "bajar") {
    return "Definir";
  }

  if (profileGoal === "ganar_musculo" || profileGoal === "subir") {
    return "Ganar músculo";
  }

  if (profileGoal === "fuerza" || profileGoal === "strength") {
    return "Fuerza";
  }

  if (profileGoal === "mantener_peso" || profileGoal === "mantener") {
    return "Ganar músculo";
  }

  return "";
}

function getSuggestedFocus(profile) {
  const savedPreference = profile?.preferences?.workout_focus;
  if (WORKOUT_FOCUS_OPTIONS.includes(savedPreference)) return savedPreference;

  const gender = profile?.gender || profile?.genero || profile?.preferences?.gender;

  if (gender === "female" || gender === "mujer") return "Glúteos y piernas";
  if (gender === "male" || gender === "hombre") return "General";

  return "General";
}

function getSuggestedLevel(profile) {
  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;
  const age = Number(profile?.age);

  if (age >= 55 || activity === "low" || activity === "sedentary") {
    return "Principiante";
  }

  if (activity === "high") return "Intermedio";

  return WORKOUT_LEVELS[1];
}

function getSuggestedDaysPerWeek(profile) {
  const preference = Number(
    profile?.preferences?.workout_days_per_week ||
      profile?.preferences?.training_days_per_week
  );

  if (DAYS_PER_WEEK_OPTIONS.includes(preference)) return preference;

  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;

  if (activity === "high") return 5;
  if (activity === "low" || activity === "sedentary") return 3;

  return 4;
}
