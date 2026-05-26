import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/ui";
import { supabase } from "../lib/supabase";
import {
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  WORKOUT_GOALS,
  WORKOUT_LEVELS,
} from "../data/exerciseLibrary";
import {
  createCustomWorkoutRoutine,
  getCustomWorkoutRoutineById,
  updateCustomWorkoutRoutine,
} from "../services/customWorkoutService";
import ExerciseMediaFrame from "../components/exercises/ExerciseMediaFrame";
export function CreateRoutine() {
  const navigate = useNavigate();
  const { id: routineId } = useParams();
  const isEditing = Boolean(routineId);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState(WORKOUT_GOALS[0]);
  const [level, setLevel] = useState(WORKOUT_LEVELS[0]);
  const [selectedMuscle, setSelectedMuscle] = useState(MUSCLE_GROUPS[0]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingRoutine, setLoadingRoutine] = useState(false);

  useEffect(() => {
    if (!isEditing) return undefined;

    let cancelled = false;

    async function loadRoutine() {
      setLoadingRoutine(true);
      setError("");

      try {
        const routine = await getCustomWorkoutRoutineById(routineId);

        if (!routine || cancelled) return;

        const firstDay = Array.isArray(routine.days) ? routine.days[0] : null;
        const routineMuscle =
          routine.focus ||
          firstDay?.muscles?.[0] ||
          MUSCLE_GROUPS[0];
        const exercises = Array.isArray(firstDay?.exercises)
          ? firstDay.exercises.map((exercise) => {
              const libraryExercise = EXERCISE_LIBRARY.find(
                (item) => item.id === exercise.exerciseId
              );

              return {
                id: exercise.exerciseId,
                name: exercise.name || libraryExercise?.name || exercise.exerciseId,
                muscle: exercise.muscle || libraryExercise?.muscle || routineMuscle,
                sets: exercise.sets ?? libraryExercise?.sets ?? 3,
                reps: exercise.reps ?? libraryExercise?.reps ?? "8-12",
                rest: exercise.rest ?? libraryExercise?.rest ?? "90s",
              };
            })
          : [];

        setName(routine.name || "");
        setGoal(routine.goal || WORKOUT_GOALS[0]);
        setLevel(routine.level || WORKOUT_LEVELS[0]);
        setSelectedMuscle(
          MUSCLE_GROUPS.includes(routineMuscle) ? routineMuscle : MUSCLE_GROUPS[0]
        );
        setSelectedExercises(exercises);
      } catch (routineError) {
        if (!cancelled) {
          setError(routineError?.message || "No pudimos cargar la rutina.");
        }
      } finally {
        if (!cancelled) {
          setLoadingRoutine(false);
        }
      }
    }

    void loadRoutine();

    return () => {
      cancelled = true;
    };
  }, [isEditing, routineId]);

  const muscleExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter(
      (exercise) => exercise.muscle === selectedMuscle
    );
  }, [selectedMuscle]);

  function toggleExercise(exercise) {
    const exists = selectedExercises.some((item) => item.id === exercise.id);

    if (exists) {
      setSelectedExercises((current) =>
        current.filter((item) => item.id !== exercise.id)
      );
      return;
    }

    setSelectedExercises((current) => [
      ...current,
      {
        id: exercise.id,
        name: exercise.name,
        muscle: exercise.muscle,
        sets: 3,
        reps: "8-12",
        rest: "90s",
      },
    ]);
  }

  function updateSelectedExercise(exerciseId, field, value) {
    setSelectedExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  async function handleSave() {
    setError("");

    if (!name.trim()) {
      setError("Ponle un nombre a la rutina.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Selecciona al menos un ejercicio.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        setError("Sesión no válida. Vuelve a iniciar sesión.");
        return;
      }

      const payload = {
        name: name.trim(),
        goal,
        level,
        focus: selectedMuscle,
        days: [
          {
            id: "custom-day-1",
            name: name.trim(),
            muscles: [selectedMuscle],
            exercises: selectedExercises.map((exercise) => ({
              exerciseId: exercise.id,
              name: exercise.name,
              muscle: exercise.muscle,
              sets: Number(exercise.sets) || 3,
              reps: exercise.reps || "8-12",
              rest: exercise.rest || "90s",
            })),
          },
        ],
      };

      if (isEditing) {
        await updateCustomWorkoutRoutine(routineId, payload);
      } else {
        await createCustomWorkoutRoutine(user.id, payload);
      }

      navigate("/rutinas");
    } catch (err) {
      setError(err?.message || "No pudimos guardar la rutina.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell contentClassName="overflow-x-hidden px-3 pb-[var(--bottom-nav-space)] pt-1.5">
      {loadingRoutine ? (
        <div className="flex h-[calc(100svh-var(--bottom-nav-space)-1rem)] min-h-0 items-center justify-center">
          <div className="rounded-[1.1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_88%,#08131b),var(--app-card))] px-4 py-4 text-center shadow-[0_12px_30px_var(--app-glow)]">
            <div className="mx-auto mb-2 h-10 w-10 animate-pulse rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)]" />
            <p className="text-[9px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
              Cargando rutina...
            </p>
          </div>
        </div>
      ) : (
      <div className="flex h-full min-h-0 flex-col gap-2">
        <header>
          <button
            type="button"
            onClick={() => navigate("/rutinas")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.62)] px-2.5 py-1 text-[9px] font-semibold text-[var(--app-muted)] shadow-[0_0_14px_var(--app-glow)]"
            style={{
              backgroundColor: "rgba(8,16,26,0.62)",
              color: "var(--app-muted)",
            }}
          >
            <ArrowLeft size={11} />
            Rutinas
          </button>

          <section className="relative overflow-hidden rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_88%,#08131b),var(--app-card))] px-3 py-3 shadow-[0_12px_30px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,196,255,0.16),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.12),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  {isEditing ? "Editar rutina" : "Rutina personalizada"}
                </span>
                <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[var(--app-muted)]">
                  Biblioteca visual
                </span>
              </div>
              <h1 className="mt-2 text-[24px] font-black leading-[0.96] text-[var(--app-text)]">
                {isEditing ? "Editar rutina" : "Crear mi rutina"}
              </h1>
              <p className="mt-1.5 max-w-[20rem] text-[11px] font-bold leading-4 text-[var(--app-muted)]">
                {isEditing
                  ? "Ajusta ejercicios, series y repeticiones para guardar la nueva versión."
                  : "Selecciona ejercicios, ajusta la prescripción y guarda tu rutina en tu cuenta."}
              </p>
            </div>
          </section>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2 pb-3">
            <section className="relative overflow-hidden rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_92%,#08131b),var(--app-surface))] p-2.5 shadow-[0_10px_24px_var(--app-glow)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,196,255,0.08),transparent_34%)]" />
              <div className="relative z-10">
              <label className="block">
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  Nombre
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Pecho + tríceps"
                  className="mt-1 h-11 w-full rounded-[0.95rem] border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[rgba(8,16,26,0.62)] px-3 text-[12px] font-bold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
                />
              </label>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select value={goal} onChange={setGoal} options={WORKOUT_GOALS} label="Objetivo" />
                <Select value={level} onChange={setLevel} options={WORKOUT_LEVELS} label="Nivel" />
              </div>

              <div className="mt-2">
                <Select
                  value={selectedMuscle}
                  onChange={setSelectedMuscle}
                  options={MUSCLE_GROUPS}
                  label="Músculo"
                />
              </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_90%,#08131b),var(--app-surface))] p-2.5 shadow-[0_10px_24px_var(--app-glow)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.08),transparent_34%)]" />
              <div className="relative z-10">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[13px] font-black text-[var(--app-text)]">
                  Ejercicios
                </h2>
                <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.62)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]">
                  {selectedExercises.length} seleccionados
                </span>
              </div>

              <div className="grid gap-1.5">
                {muscleExercises.map((exercise) => {
                  const selected = selectedExercises.some(
                    (item) => item.id === exercise.id
                  );

                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => toggleExercise(exercise)}
                      className={[
                        "group flex min-h-[54px] items-center justify-between gap-2 rounded-[0.95rem] border px-2.5 py-2 text-left transition duration-200 active:scale-[0.985]",
                        selected
                          ? "border-[color:color-mix(in_srgb,var(--app-primary)_34%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary-soft)_42%,var(--app-surface)),var(--app-surface))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--app-primary)_24%,transparent),0_10px_24px_var(--app-glow)]"
                          : "border-[var(--app-border)] bg-[rgba(8,16,26,0.58)] hover:border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] hover:bg-[rgba(8,16,26,0.76)]",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <ExerciseMediaFrame
                          exercise={exercise}
                          variant="thumb"
                          className={[
                            "h-11 w-11 shrink-0 rounded-[0.8rem] border",
                            selected
                              ? "border-[color:color-mix(in_srgb,var(--app-primary)_36%,var(--app-border))] shadow-[0_0_14px_var(--app-glow)]"
                              : "border-[var(--app-border)]",
                          ].join(" ")}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-black text-[var(--app-text)]">
                            {exercise.name}
                          </p>
                          <p className="mt-0.5 text-[9px] font-bold text-[var(--app-muted)]">
                            {exercise.equipment}
                          </p>
                        </div>
                      </div>
                      <span
                        className={[
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition",
                          selected
                            ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_14px_var(--app-glow)]"
                            : "border-[var(--app-border)] bg-[rgba(8,16,26,0.58)] text-[var(--app-muted)] group-active:scale-95",
                        ].join(" ")}
                      >
                        {selected ? <Check size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              </div>
            </section>

            {selectedExercises.length ? (
              <section className="relative overflow-hidden rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_90%,#08131b),var(--app-surface))] p-2.5 shadow-[0_10px_24px_var(--app-glow)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(0,196,255,0.08),transparent_34%)]" />
                <div className="relative z-10">
                <h2 className="mb-2 text-[13px] font-black text-[var(--app-text)]">
                  Configurar selección
                </h2>

                <div className="grid gap-1.5">
                  {selectedExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[rgba(8,16,26,0.58)] p-2.5 shadow-[0_8px_18px_var(--app-glow)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-[12px] font-black text-[var(--app-text)]">
                          {exercise.name}
                        </p>

                        <button
                          type="button"
                          onClick={() => toggleExercise(exercise)}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] transition active:scale-95"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <SmallInput
                          label="Series"
                          value={exercise.sets}
                          onChange={(value) =>
                            updateSelectedExercise(exercise.id, "sets", value)
                          }
                        />
                        <SmallInput
                          label="Reps"
                          value={exercise.reps}
                          onChange={(value) =>
                            updateSelectedExercise(exercise.id, "reps", value)
                          }
                        />
                        <SmallInput
                          label="Descanso"
                          value={exercise.rest}
                          onChange={(value) =>
                            updateSelectedExercise(exercise.id, "rest", value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </section>
            ) : null}

            {error ? (
              <p className="rounded-[0.95rem] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.08)]">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[var(--app-primary)] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-surface)] shadow-[0_12px_28px_var(--app-glow)] transition active:scale-[0.98] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar rutina"}
            </button>
          </div>
        </main>
      </div>
      )}
    </AppShell>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-[0.95rem] border border-[color:color-mix(in_srgb,var(--app-primary)_16%,var(--app-border))] bg-[rgba(8,16,26,0.62)] px-2.5 text-[10px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
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

function SmallInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-[0.8rem] border border-[color:color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[rgba(8,16,26,0.58)] px-2 text-[10px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
      />
    </label>
  );
}
