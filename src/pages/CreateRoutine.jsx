import { useMemo, useState } from "react";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/ui";
import { supabase } from "../lib/supabase";
import {
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  WORKOUT_GOALS,
  WORKOUT_LEVELS,
} from "../data/exerciseLibrary";
import { createCustomWorkoutRoutine } from "../services/customWorkoutService";
import ExerciseMediaFrame from "../components/exercises/ExerciseMediaFrame";
export function CreateRoutine() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [goal, setGoal] = useState(WORKOUT_GOALS[0]);
  const [level, setLevel] = useState(WORKOUT_LEVELS[0]);
  const [selectedMuscle, setSelectedMuscle] = useState(MUSCLE_GROUPS[0]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

      await createCustomWorkoutRoutine(user.id, {
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
      });

      navigate("/rutinas");
    } catch (err) {
      setError(err?.message || "No pudimos guardar la rutina.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell contentClassName="overflow-x-hidden px-3 pb-[var(--bottom-nav-space)] pt-1.5">
      <div className="flex h-full min-h-0 flex-col gap-2">
        <header>
          <button
            type="button"
            onClick={() => navigate("/rutinas")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-muted)",
            }}
          >
            <ArrowLeft size={11} />
            Rutinas
          </button>

          <section className="rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 shadow-[0_6px_18px_var(--app-glow)]">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              Rutina personalizada
            </p>
            <h1 className="mt-0.5 text-[22px] font-black text-[var(--app-text)]">
              Crear mi rutina
            </h1>
            <p className="mt-1 text-[11px] font-bold text-[var(--app-muted)]">
              Selecciona ejercicios y guarda tu rutina en tu cuenta.
            </p>
          </section>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2 pb-3">
            <section className="rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2">
              <label className="block">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Nombre
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Pecho + tríceps"
                  className="mt-1 h-10 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[12px] font-bold text-[var(--app-text)] outline-none"
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
            </section>

            <section className="rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[13px] font-black text-[var(--app-text)]">
                  Ejercicios
                </h2>
                <span className="text-[9px] font-black text-[var(--app-primary)]">
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
                      className="flex min-h-[46px] items-center justify-between gap-2 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-left"
                    >
                <div className="flex min-w-0 flex-1 items-center gap-2">
  <ExerciseMediaFrame
    exercise={exercise}
    variant="thumb"
    className="h-10 w-10 shrink-0 rounded-xl"
  />

  <div className="min-w-0">
    <p className="truncate text-[12px] font-black text-[var(--app-text)]">
      {exercise.name}
    </p>
    <p className="text-[9px] font-bold text-[var(--app-muted)]">
      {exercise.equipment}
    </p>
  </div>
</div>        
    <span
                        className={[
                          "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                          selected
                            ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)]"
                            : "border-[var(--app-border)] text-[var(--app-muted)]",
                        ].join(" ")}
                      >
                        {selected ? <Check size={13} /> : <Plus size={13} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedExercises.length ? (
              <section className="rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2">
                <h2 className="mb-2 text-[13px] font-black text-[var(--app-text)]">
                  Configurar selección
                </h2>

                <div className="grid gap-1.5">
                  {selectedExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-[12px] font-black text-[var(--app-text)]">
                          {exercise.name}
                        </p>

                        <button
                          type="button"
                          onClick={() => toggleExercise(exercise)}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--app-border)] text-[var(--app-muted)]"
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
              </section>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--app-primary)] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-surface)] shadow-[0_10px_26px_var(--app-glow)] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar rutina"}
            </button>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 text-[10px] font-black text-[var(--app-text)] outline-none"
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
      <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-8 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-2 text-[10px] font-black text-[var(--app-text)] outline-none"
      />
    </label>
  );
}