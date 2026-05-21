import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  Timer,
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
      triggerHapticFeedback();
      setRestRemaining(getRestSeconds(prescription.rest));
    }
  }

  function moveExercise(direction) {
    setExerciseIndex((current) =>
      Math.min(Math.max(current + direction, 0), exercises.length - 1)
    );
    setRestRemaining(0);
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
      <div className="fixed inset-0 z-[90] bg-[var(--app-surface)]">
        <div className="mx-auto flex h-full max-w-[430px] flex-col px-3 pb-5 pt-3">
          <div className="flex flex-1 flex-col justify-center">
            <section className="relative overflow-hidden rounded-[1.6rem] border border-[var(--app-border)] bg-[var(--app-card)] p-4 text-center shadow-[0_24px_70px_var(--app-glow)]">
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
    <div className="fixed inset-0 z-[90] bg-[var(--app-surface)]">
      <div className="mx-auto flex h-full max-w-[430px] flex-col px-3 pb-3 pt-3">
        <header className="shrink-0">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={requestClose}
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)]"
              aria-label="Salir"
            >
              <X size={17} />
            </button>
            <div className="min-w-0 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                {exerciseIndex + 1}/{exercises.length} ejercicios
              </p>
              <p className="text-[10px] font-bold text-[var(--app-muted)]">
                {formatDuration(elapsedSeconds)}
              </p>
            </div>
            <div className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-[10px] font-black text-[var(--app-primary)]">
              {progress}%
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--app-card)]">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <SessionMetric label="Kcal" value={calories} />
            <SessionMetric label="Tiempo" value={formatDuration(elapsedSeconds)} />
            <SessionMetric label="Series" value={`${completedSetCount}/${totalSets}`} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <section className="relative overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_18px_54px_var(--app-glow)]">
            <ExerciseImage exercise={exercise} />
            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              {exercise.muscle} · {exercise.difficulty || level}
            </p>
            <h1 className="mt-1 text-[28px] font-black leading-none text-[var(--app-text)]">
              {exercise.name}
            </h1>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <SessionMetric label="Series" value={prescription.sets} />
              <SessionMetric label="Reps" value={prescription.reps} />
              <SessionMetric label="Descanso" value={prescription.rest} />
            </div>
          </section>

          <section className="mt-3 rounded-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                Series
              </p>
              <span className="text-[10px] font-black text-[var(--app-muted)]">
                {completedSeriesCount}/{prescription.sets}
              </span>
            </div>
            <div className="mt-2 grid gap-1.5">
              {Array.from({ length: prescription.sets }, (_, index) => {
                const complete = Boolean(completedForExercise[index]);

                return (
                  <button
                    type="button"
                    key={`${exercise.id}-set-${index + 1}`}
                    onClick={() => toggleSet(index)}
                    className={[
                      "flex items-center justify-between rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98]",
                      complete
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]",
                    ].join(" ")}
                  >
                    <span className="text-[12px] font-black">
                      Serie {index + 1}
                    </span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--app-border)]">
                      {complete ? <Check size={15} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {restRemaining > 0 ? (
            <section className="mt-3 rounded-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 text-center shadow-[0_14px_38px_var(--app-glow)]">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_28px_var(--app-glow)]">
                <div>
                  <Timer size={18} className="mx-auto mb-1" />
                  <p className="text-[26px] font-black leading-none">
                    {restRemaining}s
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] font-bold text-[var(--app-muted)]">
                Descanso antes de la siguiente serie
              </p>
              <button
                type="button"
                onClick={() => setRestRemaining(0)}
                className="mt-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]"
              >
                Saltar descanso
              </button>
            </section>
          ) : null}

          <section className="mt-3 rounded-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3">
            <InfoBlock title="Técnica" items={[exercise.description]} />
            <InfoBlock title="Tips" items={(exercise.tips || []).slice(0, 2)} />
            <InfoBlock title="Errores comunes" items={(exercise.mistakes || []).slice(0, 2)} />
          </section>
        </main>

        <footer className="shrink-0 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => moveExercise(-1)}
            disabled={exerciseIndex === 0}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)] disabled:opacity-45"
          >
            <ChevronLeft size={15} />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => moveExercise(1)}
            disabled={exerciseIndex === exercises.length - 1}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] disabled:opacity-45"
          >
            Siguiente
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={finishWorkout}
            disabled={!hasProgress}
            className={[
              "col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition active:scale-[0.98]",
              hasProgress
                ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_18px_42px_var(--app-glow)]"
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
    <div className="relative grid h-[245px] w-full place-items-center overflow-hidden rounded-[1.15rem] border border-[var(--app-border)] bg-[var(--app-surface)]">
      {!failed ? (
        <img
          src={exercise.gif || exercise.image}
          alt={exercise.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_30%,var(--app-primary-soft),transparent_52%)] text-[var(--app-primary)]">
          <Dumbbell size={34} />
        </div>
      )}
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

function InfoBlock({ title, items }) {
  return (
    <div className="mt-2 first:mt-0">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
        {title}
      </p>
      <div className="mt-1 space-y-1">
        {items.map((item) => (
          <p key={item} className="text-[12px] leading-5 text-[var(--app-muted)]">
            {item}
          </p>
        ))}
      </div>
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
