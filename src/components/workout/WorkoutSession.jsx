import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  X,
} from "lucide-react";
import { saveWorkoutSession } from "../../services/workoutSessionService";

export function WorkoutSession({
  session,
  level,
  goal,
  onClose,
  onFinish,
  onDashboard,
}) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summary, setSummary] = useState(null);
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

    if (!completedForExercise[setIndex]) {
      const nextRest = getRestSeconds(prescription.rest);
      triggerHapticFeedback();
      setRestTotal(nextRest);
      setRestRemaining(nextRest);
    }
  }

  function moveExercise(direction) {
    setExerciseIndex((current) =>
      Math.min(Math.max(current + direction, 0), exercises.length - 1)
    );
    setRestRemaining(0);
    setRestTotal(0);
  }

  function finishWorkout() {
    if (!hasProgress) return;

    const completedExercises = exercises.map((item) => ({
      id: item.id,
      name: item.name,
      muscle: item.muscle,
      completedSets: (completedSets[item.id] || []).filter(Boolean).length,
      targetSets: getPrescription(item, level, goal).sets,
    }));
    const savedSession = saveWorkoutSession({
      completedExercises,
      duration: elapsedSeconds / 60,
      completedAt: new Date().toISOString(),
      caloriesEstimate: calories,
      dayName: session.day?.name,
      muscles: session.day?.muscles,
    });
    const result = onFinish?.(savedSession);

    setRestRemaining(0);
    setRestTotal(0);
    setSummary({
      ...savedSession,
      xpAwarded: result?.xpAwarded || 0,
      streak: result?.snapshot?.currentStreak || 0,
    });
  }

  function requestClose() {
    if (
      hasProgress &&
      typeof window !== "undefined" &&
      !window.confirm("¿Salir del entrenamiento? Se perderá el progreso no guardado.")
    ) {
      return;
    }

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
                </div>

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

        <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+94px)] pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1.5">
            <div className="flex h-8 items-center gap-1.5 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2">
              <MetricChip label="Kcal" value={calories} />
              <MetricDivider />
              <MetricChip label="Tiempo" value={formatDuration(elapsedSeconds)} />
              <MetricDivider />
              <MetricChip label="Series" value={`${completedSetCount}/${totalSets}`} />
            </div>

            <ExerciseImage exercise={exercise} />

            <section>
              <p className="min-w-0 truncate text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {exercise.muscle} · {exercise.difficulty || level}
              </p>
              <h1 className="mt-0.5 line-clamp-2 text-[21px] font-black leading-[1.05] text-[var(--app-text)]">
                {exercise.name}
              </h1>
              <div className="mt-1.5 flex gap-1">
                <PrescriptionChip label="Series" value={prescription.sets} />
                <PrescriptionChip label="Reps" value={prescription.reps} />
                <PrescriptionChip label="Descanso" value={prescription.rest} />
              </div>
            </section>
            <QuickTechnique exercise={exercise} />

            <section>
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  Series
                </p>
                <span className="text-[9px] font-black text-[var(--app-muted)]">
                  {completedSeriesCount}/{prescription.sets}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {Array.from({ length: prescription.sets }, (_, index) => {
                  const complete = Boolean(completedForExercise[index]);

                  return (
                    <button
                      type="button"
                      key={`${exercise.id}-set-${index + 1}`}
                      onClick={() => toggleSet(index)}
                      className={[
                        "grid h-9 grid-cols-[1fr_18px] items-center rounded-[0.85rem] border px-2 text-left transition active:scale-[0.98]",
                        complete
                          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                          : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]",
                      ].join(" ")}
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] font-black leading-none">
                          {index + 1}
                        </span>
                        <span className="mt-0.5 block truncate text-[8px] font-bold leading-none text-[var(--app-muted)]">
                          {prescription.reps}
                        </span>
                      </span>
                      <span className="grid h-[18px] w-[18px] place-items-center rounded-full border border-[var(--app-border)]">
                        {complete ? <Check size={11} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <RestPanel
              progress={restProgress}
              remaining={restRemaining}
              onSkip={() => {
                setRestRemaining(0);
                setRestTotal(0);
              }}
            />
          </div>
        </main>

        <footer className="fixed inset-x-0 bottom-0 z-[10000] mx-auto w-full max-w-[430px] border-t border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => moveExercise(-1)}
              disabled={exerciseIndex === 0}
              className="flex h-10 items-center justify-center gap-1.5 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)] disabled:opacity-45"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => moveExercise(1)}
              disabled={exerciseIndex === exercises.length - 1}
              className="flex h-10 items-center justify-center gap-1.5 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] disabled:opacity-45"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={finishWorkout}
            disabled={!hasProgress}
            className={[
              "mt-1.5 flex h-10 w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 text-[10px] font-black uppercase tracking-[0.14em] transition active:scale-[0.98]",
              hasProgress
                ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_10px_24px_var(--app-glow)]"
                : "border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] opacity-75",
            ].join(" ")}
          >
            <Flame size={16} />
            Finalizar entreno
          </button>
        </footer>
      </div>
    </div>
  );
}

function ExerciseImage({ exercise }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative mt-1.5 grid h-[clamp(105px,16dvh,125px)] w-full place-items-center overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)]">
      {!failed ? (
        <img
          src={exercise.gif || exercise.image}
          alt={exercise.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[var(--app-surface)] text-[var(--app-primary)]">
          <Dumbbell size={30} />
        </div>
      )}
    </div>
  );
}

function QuickTechnique({ exercise }) {
  const tip = exercise.tips?.[0] || "Mantén el control en todo el recorrido.";
  const mistake = exercise.mistakes?.[0] || "Evita compensar con impulso.";

  return (
    <section className="mt-1.5 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
        Técnica rápida
      </p>
      <p className="mt-1 line-clamp-1 text-[10px] font-bold leading-4 text-[var(--app-text)]">
        {exercise.description}
      </p>
      <p className="line-clamp-1 text-[10px] leading-4 text-[var(--app-muted)]">
        <span className="font-black text-[var(--app-text)]">Tip:</span> {tip}
      </p>
      <p className="line-clamp-1 text-[10px] leading-4 text-[var(--app-muted)]">
        <span className="font-black text-[var(--app-text)]">Evita:</span> {mistake}
      </p>
    </section>
  );
}

function RestPanel({ progress, remaining, onSkip }) {
  const active = remaining > 0;

  return (
    <section className="mb-2 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-2 shadow-[0_10px_30px_var(--app-glow)]">
      <div className="flex h-[66px] items-center gap-3">
        <div
          className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full p-[2px] shadow-[0_0_24px_var(--app-glow)]"
          style={{
            background: active
              ? `conic-gradient(var(--app-primary) ${progress}%, var(--app-primary-soft) ${progress}% 100%)`
              : "linear-gradient(135deg, var(--app-primary-soft), transparent)",
          }}
        >
          <div className="grid h-full w-full place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]">
            <span className="text-[16px] font-black leading-none text-[var(--app-primary)]">
              {active ? `${remaining}s` : "OK"}
            </span>
          </div>
          {active ? (
            <span className="absolute inset-[-3px] rounded-full border border-[var(--app-primary)] opacity-25" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {active ? "Descanso activo" : "Listo"}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-bold text-[var(--app-muted)]">
            {active ? "recuperación inteligente" : "preparado para la siguiente serie"}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface)]">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)] transition-all"
              style={{ width: `${active ? progress : 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSkip}
          disabled={!active}
          className="h-8 shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] disabled:text-[var(--app-muted)] disabled:opacity-55"
        >
          Saltar
        </button>
      </div>
    </section>
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

function triggerHapticFeedback() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(12);
  }
}
