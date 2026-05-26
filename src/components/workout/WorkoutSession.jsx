import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Home,
  X,
} from "lucide-react";
import {
  saveWorkoutSession,
} from "../../services/workoutSessionService";
import {
  preloadExercise,
  preloadExercises,
} from "../../services/exerciseMediaService";
import {
  getLastExercisePerformance,
  getWeightRecommendation,
} from "../../services/strengthProgressService";
import { useAuth } from "../../context/useAuth";
import ExerciseMediaFrame from "../exercises/ExerciseMediaFrame";
import ConfirmDialog from "../ui/ConfirmDialog";

export function WorkoutSession({
  session,
  level,
  goal,
  historySessions = [],
  onClose,
  onFinish,
  onDashboard,
}) {
  const { user } = useAuth();
  const userId = user?.id || null;
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [setTracking, setSetTracking] = useState({});
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summary, setSummary] = useState(null);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const exercises = useMemo(() => session.exercises || [], [session.exercises]);
  const exercise = exercises[exerciseIndex];
  const prescription = getPrescription(exercise, level, goal);
  const completedForExercise = completedSets[exercise?.id] || [];
  const completedSeriesCount = completedForExercise.filter(Boolean).length;
  const totalSets = exercises.reduce(
    (total, item) => total + getPrescription(item, level, goal).sets,
    0
  );
  const completedSetCount = Object.values(completedSets).reduce(
    (total, sets) => total + sets.filter(Boolean).length,
    0
  );
  const exerciseTracking = useMemo(
    () => setTracking[exercise?.id] || [],
    [exercise?.id, setTracking]
  );
  const lastPerformance = useMemo(
    () => getLastExercisePerformance(exercise?.id || exercise?.name, historySessions),
    [exercise?.id, exercise?.name, historySessions]
  );
  const weightRecommendation = useMemo(
    () =>
      getWeightRecommendation({
        exercise,
        prescription,
        level,
        goal,
        sessions: historySessions,
      }),
    [exercise, goal, historySessions, level, prescription]
  );
  const recordFeedback = useMemo(
    () => getRecordFeedback(exerciseTracking, lastPerformance),
    [exerciseTracking, lastPerformance]
  );
  const hasProgress = completedSetCount > 0;
  const progress = totalSets ? Math.round((completedSetCount / totalSets) * 100) : 0;
  const restProgress = restTotal
    ? Math.max(0, Math.min(100, (restRemaining / restTotal) * 100))
    : 0;
  const calories = useMemo(
    () =>
      exercises.reduce(
        (total, item) => total + Number(item.estimatedCalories || 0),
        0
      ),
    [exercises]
  );

  const nextExercises = useMemo(
    () => exercises.slice(exerciseIndex, Math.min(exerciseIndex + 4, exercises.length)),
    [exerciseIndex, exercises]
  );

  useEffect(() => {
    preloadExercises(nextExercises);
    if (exercise) {
      preloadExercise(exercise);
    }
  }, [exercise, nextExercises]);

  useEffect(() => {
    if (summary) return undefined;

    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [summary]);

  useEffect(() => {
    if (restRemaining <= 0 || summary) return undefined;

    const interval = window.setInterval(() => {
      setRestRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [restRemaining, summary]);

  if (!exercise) return null;

  function toggleSet(setIndex) {
    const wasComplete = Boolean(completedForExercise[setIndex]);

    setCompletedSets((current) => {
      const nextSets = Array.from({ length: prescription.sets }, (_, index) =>
        Boolean(current[exercise.id]?.[index])
      );
      nextSets[setIndex] = !nextSets[setIndex];

      return {
        ...current,
        [exercise.id]: nextSets,
      };
    });

    setSetTracking((current) => {
      const currentSets = current[exercise.id] || [];
      const nextSets = Array.from({ length: prescription.sets }, (_, index) => ({
        ...(currentSets[index] || {}),
        setIndex: index,
      }));

      nextSets[setIndex] = {
        ...nextSets[setIndex],
        reps: nextSets[setIndex].reps || getDefaultReps(prescription.reps),
        completedAt: wasComplete ? null : new Date().toISOString(),
      };

      return {
        ...current,
        [exercise.id]: nextSets,
      };
    });

    if (!wasComplete) {
      const nextRest = getRestSeconds(prescription.rest);
      triggerHapticFeedback();
      setRestTotal(nextRest);
      setRestRemaining(nextRest);
    }
  }

  function updateSetTracking(setIndex, field, value) {
    const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");

    setSetTracking((current) => {
      const currentSets = current[exercise.id] || [];
      const nextSets = Array.from({ length: prescription.sets }, (_, index) => ({
        ...(currentSets[index] || {}),
        setIndex: index,
      }));

      nextSets[setIndex] = {
        ...nextSets[setIndex],
        [field]: normalizedValue,
      };

      return {
        ...current,
        [exercise.id]: nextSets,
      };
    });
  }

  function moveExercise(direction) {
    setExerciseIndex((current) =>
      Math.min(Math.max(current + direction, 0), exercises.length - 1)
    );
    setRestRemaining(0);
    setRestTotal(0);
  }

  async function finishWorkout() {
    if (!hasProgress) return;

    const completedAt = new Date().toISOString();
    const completedExercises = exercises.map((item) => {
      const trackedSets = buildTrackedSets({
        completed: completedSets[item.id] || [],
        prescription: getPrescription(item, level, goal),
        sets: setTracking[item.id] || [],
        completedAt,
      });

      return {
        id: item.id,
        exerciseId: item.id,
        name: item.name,
        muscle: item.muscle,
        equipmentType: item.equipmentType || item.equipment || "",
        type: item.type || "",
        completedSets: (completedSets[item.id] || []).filter(Boolean).length,
        targetSets: getPrescription(item, level, goal).sets,
        completedAt,
        sets: trackedSets,
        totalVolume: getCompletedSetVolume(trackedSets),
        bestSet: getBestTrackedSet(trackedSets),
      };
    });
    const workoutStats = getWorkoutWeightStats(completedExercises);
    const savedSession = await saveWorkoutSession(userId, {
      completedExercises,
      duration: elapsedSeconds / 60,
      completedAt,
      caloriesEstimate: calories,
      dayId: session.day?.id,
      dayName: session.day?.name,
      routineId: session.day?.routineId,
      routineName: session.day?.routineName,
      routineType:
        session.routineType ||
        session.source ||
        session.day?.source ||
        (session.day?.routineId ? "custom" : "ia"),
      source:
        session.source ||
        session.day?.source ||
        (session.day?.routineId ? "custom" : "ia"),
      muscles: session.day?.muscles,
      ...workoutStats,
    });
    const result = onFinish?.(savedSession);

    setRestRemaining(0);
    setRestTotal(0);
    setSummary({
      ...savedSession,
      xpAwarded: result?.xpAwarded || 0,
      streak: result?.snapshot?.currentStreak || 0,
      totalWeightMoved: workoutStats.totalWeightMoved,
      bestExercise: workoutStats.bestExercise,
      newRecords: workoutStats.newRecords,
    });
  }

  function requestClose() {
    if (hasProgress) {
      setConfirmExitOpen(true);
      return;
    }

    onClose?.();
  }

  function confirmClose() {
    setConfirmExitOpen(false);
    onClose?.();
  }

  if (summary) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[var(--app-surface)]">
        <div className="mx-auto flex h-[100dvh] max-w-[430px] flex-col px-3 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
          <div className="flex flex-1 flex-col justify-center">
            <section className="relative overflow-hidden rounded-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] p-4 text-center shadow-[0_14px_42px_var(--app-glow)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--app-primary-soft),transparent_48%)]" />
              <div className="relative z-10">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_30px_var(--app-glow)]">
                  <CheckCircle2 size={30} />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  Entreno completado
                </p>
                <h2 className="mt-1 text-[30px] font-black leading-none text-[var(--app-text)]">
                  Buen trabajo
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <SessionMetric label="XP" value={`+${summary.xpAwarded}`} />
                  <SessionMetric label="Ejercicios" value={exercises.length} />
                  <SessionMetric label="Duración" value={formatDuration(summary.duration * 60)} />
                  <SessionMetric label="Kcal" value={summary.caloriesEstimate} />
                  <SessionMetric label="Peso movido" value={`${summary.totalWeightMoved || 0} kg`} />
                  <SessionMetric label="Récords" value={summary.newRecords?.length || 0} />
                </div>

                {summary.bestExercise ? (
                  <p className="mt-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] font-black text-[var(--app-text)]">
                    Mejor ejercicio · {summary.bestExercise.name} · {summary.bestExercise.volume} kg
                  </p>
                ) : null}

                <p className="mt-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[12px] font-black text-[var(--app-primary)]">
                  {summary.streak > 0
                    ? `${summary.streak} días de racha`
                    : "Sesión guardada"}
                </p>
              </div>
            </section>
          </div>

          <button
            type="button"
            onClick={onDashboard}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--app-primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-surface)] shadow-[0_18px_42px_var(--app-glow)]"
          >
            <Home size={16} />
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--app-surface)]">
      <div className="mx-auto flex h-[100dvh] max-w-[430px] flex-col px-2.5 pt-2">
        <header className="flex max-h-[52px] shrink-0 items-center justify-between gap-2">
          <button
            type="button"
            onClick={requestClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)]"
            aria-label="Salir"
          >
            <X size={16} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              {exerciseIndex + 1}/{exercises.length} ejercicios
            </p>
            <p className="text-[10px] font-bold leading-none text-[var(--app-muted)]">
              {formatDuration(elapsedSeconds)}
            </p>
          </div>
          <div className="min-w-10 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5 text-center text-[10px] font-black text-[var(--app-primary)]">
            {progress}%
          </div>
        </header>

        <main className="min-h-0 overflow-y-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1">
            <div className="flex h-8 items-center gap-1 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2">
              <MetricChip label="Kcal" value={calories} />
              <MetricDivider />
              <MetricChip label="Tiempo" value={formatDuration(elapsedSeconds)} />
              <MetricDivider />
              <MetricChip label="Series" value={`${completedSetCount}/${totalSets}`} />
            </div>

            <ExerciseImage exercise={exercise} />

            <section className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <p className="min-w-0 truncate text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  {exercise.muscle} · {exercise.difficulty || level}
                </p>
                {exercise.mainLift ? (
                  <span className="shrink-0 rounded-full border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                    Principal
                  </span>
                ) : null}
              </div>
              <h1 className="mt-0.5 line-clamp-2 text-[21px] font-black leading-[1.05] text-[var(--app-text)]">
                {exercise.name}
              </h1>
              <PerformanceHint
                lastPerformance={lastPerformance}
                recordFeedback={recordFeedback}
              />
              {weightRecommendation.hasHistory ? (
                <StrengthRecommendationCard recommendation={weightRecommendation} />
              ) : null}
              <div className="mt-1 flex gap-1">
                <PrescriptionChip label="Series" value={prescription.sets} />
                <PrescriptionChip label="Reps" value={prescription.reps} />
                <PrescriptionChip label="Descanso" value={prescription.rest} />
              </div>
            </section>
            <QuickTechnique exercise={exercise} />

            {restRemaining > 0 ? (
              <>
                <div className="mt-0.5">
                  <RestPanel
                    compact
                    progress={restProgress}
                    remaining={restRemaining}
                    onSkip={() => {
                      setRestRemaining(0);
                      setRestTotal(0);
                    }}
                  />
                </div>
                <SeriesRestCoach
                  completedForExercise={completedForExercise}
                  completedSeriesCount={completedSeriesCount}
                  onToggleSet={toggleSet}
                  prescription={prescription}
                  recordFeedback={recordFeedback}
                  setTracking={exerciseTracking}
                  onTrackSet={updateSetTracking}
                />
              </>
            ) : (
              <SeriesRestCoach
                completedForExercise={completedForExercise}
                completedSeriesCount={completedSeriesCount}
                onToggleSet={toggleSet}
                prescription={prescription}
                recordFeedback={recordFeedback}
                setTracking={exerciseTracking}
                onTrackSet={updateSetTracking}
              />
            )}
          </div>
        </main>

        <section className="shrink-0 px-0 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="rounded-[1.35rem] border border-[color:color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[linear-gradient(180deg,rgba(7,12,18,0.86),rgba(8,16,26,0.76))] px-2.5 py-2.5 shadow-[0_-10px_28px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <FooterControls
              canFinish={hasProgress}
              canGoBack={exerciseIndex > 0}
              canGoNext={exerciseIndex < exercises.length - 1}
              onBack={() => moveExercise(-1)}
              onFinish={finishWorkout}
              onNext={() => moveExercise(1)}
            />
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmExitOpen}
        variant="danger"
        title="Salir del entreno"
        description="Se perdera el progreso no guardado de esta sesion."
        cancelLabel="Permanecer"
        confirmLabel="Salir"
        onCancel={() => setConfirmExitOpen(false)}
        onConfirm={confirmClose}
      />
    </div>
  );
}

function ExerciseImage({ exercise }) {
  return (
    <ExerciseMediaFrame
      key={exercise?.mediaKey || exercise?.id || exercise?.name}
      exercise={exercise}
      className={[
        "mt-1 aspect-[16/9] w-full",
        exercise.mainLift
          ? "shadow-[0_0_18px_var(--app-glow)]"
          : "",
      ].join(" ")}
    />
  );
}

function QuickTechnique({ exercise }) {
  const tip = exercise.tips?.[0] || "Mantén el control en todo el recorrido.";
  const mistake = exercise.mistakes?.[0] || "Evita compensar con impulso.";

  return (
    <section className="mt-1 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
        Técnica rápida
      </p>
      <p className="mt-0.5 line-clamp-1 text-[10px] font-bold leading-4 text-[var(--app-text)]">
        {exercise.description}
      </p>
      <p className="line-clamp-1 text-[10px] leading-4 text-[var(--app-muted)]">
        <span className="font-black text-[var(--app-text)]">Tip:</span> {tip} ·{" "}
        <span className="font-black text-[var(--app-text)]">Evita:</span> {mistake}
      </p>
    </section>
  );
}

function SeriesRestCoach({
  completedForExercise,
  completedSeriesCount,
  onToggleSet,
  onTrackSet,
  prescription,
  recordFeedback,
  setTracking,
}) {
  const [showAllSets, setShowAllSets] = useState(false);
  const nextSetIndex = Array.from(
    { length: prescription.sets },
    (_, index) => Boolean(completedForExercise[index])
  ).findIndex((complete) => !complete);
  const activeSetIndex = nextSetIndex === -1 ? prescription.sets - 1 : nextSetIndex;
  const activeTracking = setTracking[activeSetIndex] || {};
  const remainingSets = Math.max(0, prescription.sets - completedSeriesCount);
  const activeCompleted = Boolean(completedForExercise[activeSetIndex]);
  const activeSetNumber = Math.min(activeSetIndex + 1, prescription.sets);
  const activeReps = activeTracking.reps ?? "";
  const activeKg = activeTracking.kg ?? "";

  return (
    <section className="overflow-hidden rounded-[1.1rem] border border-[var(--app-border)] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--app-primary)_10%,var(--app-card)),var(--app-card)_42%,var(--app-surface))] p-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.22)]">
      <div className="rounded-[0.95rem] border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_8%,var(--app-card)),var(--app-surface))] px-2.5 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              Serie actual
            </p>
            <h3 className="mt-0.5 text-[14px] font-black leading-none text-[var(--app-text)]">
              Serie {activeSetNumber} de {prescription.sets}
            </h3>
            <p className="mt-1 text-[10px] font-semibold text-[var(--app-muted)]">
              {completedSeriesCount} completadas · {remainingSets} restantes
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
            {prescription.reps}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="rounded-[0.8rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5">
            <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
              Reps
            </p>
            <input
              inputMode="numeric"
              value={activeReps}
              onChange={(event) =>
                onTrackSet(activeSetIndex, "reps", event.target.value)
              }
              placeholder={getDefaultReps(prescription.reps)}
              className="mt-0.5 w-full bg-transparent text-center text-[11px] font-black text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
            />
          </div>
          <div className="rounded-[0.8rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5">
            <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
              Peso
            </p>
            <div className="mt-0.5 flex items-center gap-0.5">
              <input
                inputMode="decimal"
                value={activeKg}
                onChange={(event) =>
                  onTrackSet(activeSetIndex, "kg", event.target.value)
                }
                placeholder="0"
                className="w-full min-w-0 bg-transparent text-center text-[11px] font-black text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              />
              <span className="shrink-0 text-[10px] font-black text-[var(--app-primary)]">
                kg
              </span>
            </div>
          </div>
          <div className="rounded-[0.8rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5">
            <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
              Objetivo
            </p>
            <p className="mt-0.5 truncate text-[11px] font-black text-[var(--app-primary)]">
              {prescription.reps}
            </p>
          </div>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-card)_82%,var(--app-primary-soft))]">
          <div
            className="h-full rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)] transition-all duration-300"
            style={{ width: `${prescription.sets ? (completedSeriesCount / prescription.sets) * 100 : 0}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => onToggleSet(activeSetIndex)}
          disabled={activeCompleted}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--app-primary)] px-3 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-surface)] shadow-[0_10px_22px_var(--app-glow)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-default disabled:opacity-60"
        >
          <Check size={14} />
          Completar serie
        </button>

        <button
          type="button"
          onClick={() => setShowAllSets((current) => !current)}
          className="mt-1.5 w-full rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] transition duration-150 hover:bg-[var(--app-card)] active:scale-[0.98]"
        >
          {showAllSets ? "Ocultar todas las series" : "Ver todas las series"}
        </button>
      </div>

      {showAllSets ? (
        <div className="mt-1.5 grid gap-1">
          {Array.from({ length: prescription.sets }, (_, index) => {
          const complete = Boolean(completedForExercise[index]);
          const active = !complete && (nextSetIndex === index || nextSetIndex === -1);
          const tracking = setTracking[index] || {};
          const isRecord = recordFeedback?.recordSetIndex === index;

          return (
            <div
              key={`set-${index + 1}`}
              className={[
                "relative flex min-h-[46px] items-center gap-2 overflow-hidden rounded-[14px] border px-2 py-1 transition",
                isRecord
                  ? "border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_14%,var(--app-card))] shadow-[0_0_14px_var(--app-glow)]"
                  : complete
                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]"
                    : active
                      ? "border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_9%,var(--app-surface))] text-[var(--app-text)]"
                      : "border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-text)]",
              ].join(" ")}
            >
              {active || isRecord ? (
                <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                  Serie {index + 1}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <label className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 focus-within:border-[var(--app-primary)]">
                    <input
                      inputMode="numeric"
                      value={tracking.reps || ""}
                      onChange={(event) => onTrackSet(index, "reps", event.target.value)}
                      placeholder="10"
                      className="w-8 bg-transparent text-center text-[10px] font-black text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
                    />
                    <span className="text-[7px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
                      reps
                    </span>
                  </label>
                  <label className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 focus-within:border-[var(--app-primary)]">
                    <input
                      inputMode="decimal"
                      value={tracking.kg || ""}
                      onChange={(event) => onTrackSet(index, "kg", event.target.value)}
                      placeholder="15"
                      className="w-8 bg-transparent text-center text-[10px] font-black text-[var(--app-primary)] outline-none placeholder:text-[var(--app-muted)]"
                    />
                    <span className="text-[7px] font-black uppercase tracking-[0.08em] text-[var(--app-primary)]">
                      kg
                    </span>
                  </label>
                  <span className="text-[8px] font-bold text-[var(--app-muted)]">
                    {prescription.reps}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleSet(index)}
                className={[
                  "ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full border transition active:scale-90",
                  complete
                    ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)]"
                    : active
                      ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                      : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)]",
                ].join(" ")}
                aria-label={`Completar serie ${index + 1}`}
              >
                {complete ? <Check size={11} /> : null}
              </button>

              {isRecord ? (
                <span className="absolute bottom-0.5 right-9 text-[7px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)]">
                  Nuevo récord
                </span>
              ) : null}
            </div>
          );
        })}
        </div>
      ) : null}

      {recordFeedback?.progressKg > 0 ? (
        <p className="mt-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
          ↑ +{formatKgValue(recordFeedback.progressKg)}kg desde la última sesión
        </p>
      ) : null}
    </section>
  );
}

function PerformanceHint({ lastPerformance, recordFeedback }) {
  if (!lastPerformance?.maxKg) {
    return (
      <p className="mt-1 inline-flex rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
        Nuevo ejercicio
      </p>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[9px] font-black text-[var(--app-muted)]">
        Última sesión: {formatKgValue(lastPerformance.maxKg)}kg
        {lastPerformance.reps ? ` x ${lastPerformance.reps}` : ""}
      </span>
      {recordFeedback?.progressKg > 0 ? (
        <span className="rounded-full border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-black text-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]">
          Nuevo récord
        </span>
      ) : null}
    </div>
  );
}

function StrengthRecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  return (
    <section className="mt-1 rounded-[0.95rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_8%,var(--app-card)),var(--app-card))] px-2.5 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Última vez
          </p>
          <p className="mt-0.5 text-[11px] font-black text-[var(--app-text)]">
            {recommendation.lastText || "Sin datos"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
          {recommendation.recommendationTitle}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Hoy recomendado
          </p>
          <p className="mt-0.5 text-[16px] font-black leading-none text-[var(--app-primary)]">
            {recommendation.recommendationValue}
          </p>
        </div>
        <p className="min-w-0 flex-1 text-right text-[10px] font-semibold leading-4 text-[var(--app-muted)]">
          {recommendation.recommendationText}
        </p>
      </div>
    </section>
  );
}

function RestPanel({ compact = false, progress, remaining, onSkip }) {
  const active = remaining > 0;
  const orbProgress = active ? progress : 0;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.15rem] border border-[var(--app-border)] bg-[radial-gradient(circle_at_50%_34%,var(--app-primary-soft),transparent_42%),radial-gradient(circle_at_88%_0%,color-mix(in_srgb,var(--app-primary)_8%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_6%,var(--app-card)),var(--app-surface)_58%,var(--app-card))] px-3 text-center shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
        active ? (compact ? "py-1" : "py-1.5") : "py-1",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--app-primary),transparent)] opacity-45" />
      <div
        className={[
          "relative z-10 mx-auto flex flex-col items-center justify-center",
          active ? (compact ? "min-h-[132px]" : "min-h-[160px]") : "min-h-[84px]",
        ].join(" ")}
      >
        <div
          className={[
            "relative grid shrink-0 place-items-center rounded-full",
            active
              ? compact
                ? "h-[88px] w-[88px] shadow-[0_0_18px_var(--app-glow)] [animation:restOrbPulse_2.8s_ease-in-out_infinite]"
                : "h-[100px] w-[100px] shadow-[0_0_20px_var(--app-glow)] [animation:restOrbPulse_2.8s_ease-in-out_infinite]"
              : "h-[48px] w-[48px] opacity-[0.82]",
          ].join(" ")}
        >
          <span className="absolute inset-[-12px] rounded-full bg-[radial-gradient(circle,var(--app-primary-soft),transparent_68%)] opacity-80" />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: active
                ? `conic-gradient(var(--app-primary) ${orbProgress}%, var(--app-primary-soft) ${orbProgress}% 100%)`
                : "conic-gradient(var(--app-border) 0% 100%)",
            }}
          />
          <span className="absolute inset-[4px] rounded-full bg-[var(--app-card)]" />
          <span className="absolute inset-[9px] rounded-full border border-[var(--app-border)] bg-[radial-gradient(circle_at_50%_0%,var(--app-primary-soft),transparent_38%),var(--app-surface)]" />
          <div className="relative z-10 grid place-items-center">
            {active ? (
              <span className="text-[32px] font-black leading-none text-[var(--app-primary)] tabular-nums">
                {remaining}s
              </span>
            ) : (
              <Check size={18} className="text-[var(--app-primary)]" />
            )}
          </div>
          {active ? (
            <>
              <span className="absolute inset-[-3px] rounded-full border border-[var(--app-primary)] opacity-10" />
              <span className="absolute inset-[-8px] rounded-full border border-[var(--app-primary)] opacity-10 [animation:restRingSpin_9s_linear_infinite]" />
            </>
          ) : null}
        </div>

        <div className={active ? "mt-1.5" : "mt-1"}>
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[var(--app-primary)]">
            {active ? "Descanso activo" : "Listo para la siguiente serie"}
          </p>
          <p className="mt-0.5 text-[10px] font-black leading-4 text-[var(--app-text)]">
            {active ? "Recuperación inteligente" : "Siguiente serie lista"}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[8px] font-bold text-[var(--app-muted)] opacity-75">
            {active
              ? "Respira y prepara la siguiente serie"
              : "Marca una serie para iniciar el coach"}
          </p>
        </div>

        <div className="mt-1 w-full max-w-[210px]">
          <div className="relative h-[2px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-card)_82%,var(--app-primary-soft))]">
            <div
              className={[
                "relative h-full rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)] transition-all duration-500",
                active ? "after:absolute after:inset-y-0 after:w-6 after:rounded-full after:bg-white/35 after:blur-[2px] after:[animation:restBeam_1.8s_ease-in-out_infinite]" : "",
              ].join(" ")}
              style={{ width: `${active ? progress : 18}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSkip}
          disabled={!active}
          className="mt-1.5 h-8 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_68%,transparent)] px-3 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)] backdrop-blur transition duration-150 hover:-translate-y-0.5 active:scale-95 disabled:text-[var(--app-muted)] disabled:opacity-45"
        >
          Saltar
        </button>
      </div>
    </div>
  );
}

function FooterControls({
  canFinish,
  canGoBack,
  canGoNext,
  onBack,
  onFinish,
  onNext,
}) {
  return (
    <footer className="space-y-1">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="flex h-10 items-center justify-center gap-1 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)] shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-45"
        >
          <ChevronLeft size={14} />
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex h-10 items-center justify-center gap-1 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-45"
        >
          Siguiente
          <ChevronRight size={14} />
        </button>
      </div>
      <button
        type="button"
        onClick={onFinish}
        disabled={!canFinish}
        className={[
          "flex h-11 w-full items-center justify-center gap-2 rounded-[1rem] px-4 text-[9px] font-black uppercase tracking-[0.14em] transition duration-150 active:scale-[0.98]",
          canFinish
            ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_10px_24px_var(--app-glow)] hover:-translate-y-0.5"
            : "border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] opacity-75",
        ].join(" ")}
      >
        <Flame size={16} />
        Finalizar entreno
      </button>
    </footer>
  );
}

function MetricChip({ label, value }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
      <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </span>
      <span className="truncate text-[10px] font-black text-[var(--app-text)]">
        {value}
      </span>
    </div>
  );
}

function MetricDivider() {
  return <span className="h-3 w-px shrink-0 bg-[var(--app-border)]" />;
}

function PrescriptionChip({ label, value }) {
  return (
    <div className="min-w-0 flex-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-center">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="truncate text-[10px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function SessionMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function getPrescription(exercise, level, goal) {
  return {
    sets: exercise?.setsByLevel?.[level] || exercise?.sets || 3,
    reps: exercise?.repsByGoal?.[goal] || exercise?.reps || "8-12",
    rest: exercise?.restByGoal?.[goal] || exercise?.rest || "60s",
  };
}

function getRestSeconds(rest) {
  const values = String(rest)
    .match(/\d+/g)
    ?.map(Number) || [60];
  const average = values.reduce((total, value) => total + value, 0) / values.length;

  if (average <= 45) return 30;
  if (average <= 90) return 60;
  return 90;
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds || 0)));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function buildTrackedSets({ completed, completedAt, prescription, sets }) {
  return Array.from({ length: prescription.sets }, (_, index) => {
    const tracking = sets[index] || {};
    const complete = Boolean(completed[index]);

    return {
      setIndex: index,
      kg: normalizeTrackingNumber(tracking.kg),
      reps: normalizeTrackingNumber(tracking.reps) || (complete ? getDefaultReps(prescription.reps) : null),
      completedAt: complete ? tracking.completedAt || completedAt : null,
    };
  });
}

function getWorkoutWeightStats(completedExercises) {
  const exerciseStats = completedExercises.map((exercise) => {
    const volume = getCompletedSetVolume(exercise.sets);
    const bestSet = getBestTrackedSet(exercise.sets);
    const previous = getLastExercisePerformance(exercise.name);
    const isRecord = previous?.maxKg ? bestSet.kg > previous.maxKg : bestSet.kg > 0;

    return {
      id: exercise.id,
      name: exercise.name,
      bestKg: bestSet.kg,
      bestReps: bestSet.reps,
      isRecord,
      previousKg: previous?.maxKg || 0,
      volume: Math.round(volume),
    };
  });
  const bestExercise = exerciseStats.reduce(
    (best, item) => (item.volume > (best?.volume || 0) ? item : best),
    null
  );

  return {
    bestExercise: bestExercise?.volume ? bestExercise : null,
    newRecords: exerciseStats.filter((item) => item.isRecord),
    totalWeightMoved: exerciseStats.reduce((total, item) => total + item.volume, 0),
  };
}

function getCompletedSetVolume(sets) {
  if (!Array.isArray(sets) || !sets.length) return 0;

  const countedSetIndexes = new Set();

  return sets.reduce((total, set) => {
    if (!set?.completedAt) return total;

    const setIndex = Number(set?.setIndex);
    if (Number.isFinite(setIndex)) {
      if (countedSetIndexes.has(setIndex)) {
        return total;
      }
      countedSetIndexes.add(setIndex);
    }

    const kg = Number(set?.kg);
    const reps = Number(set?.reps);
    if (!Number.isFinite(kg) || !Number.isFinite(reps)) {
      return total;
    }

    return total + kg * reps;
  }, 0);
}

function getRecordFeedback(sets, lastPerformance) {
  const previousKg = Number(lastPerformance?.maxKg) || 0;
  const bestSet = getBestTrackedSet(sets);

  if (!bestSet.kg || !previousKg || bestSet.kg <= previousKg) {
    return null;
  }

  return {
    progressKg: bestSet.kg - previousKg,
    recordSetIndex: bestSet.setIndex,
  };
}

function getBestTrackedSet(sets) {
  return (sets || []).reduce(
    (best, set, index) => {
      const kg = normalizeTrackingNumber(set?.kg) || 0;
      const reps = normalizeTrackingNumber(set?.reps) || 0;

      if (kg > best.kg || (kg === best.kg && reps > best.reps)) {
        return {
          kg,
          reps,
          setIndex: Number(set?.setIndex ?? index),
        };
      }

      return best;
    },
    { kg: 0, reps: 0, setIndex: -1 }
  );
}

function getDefaultReps(reps) {
  return String(reps).match(/\d+/)?.[0] || "";
}

function normalizeTrackingNumber(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}

function formatKgValue(value) {
  const number = Number(value) || 0;

  return Number.isInteger(number) ? number : number.toFixed(1);
}

function triggerHapticFeedback() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(12);
  }
}
