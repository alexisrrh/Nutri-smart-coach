import { useMemo, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/ui";
import ExerciseCard from "../components/exercises/ExerciseCard";
import ExerciseDetailSheet from "../components/exercises/ExerciseDetailSheet";
import { EXERCISE_LIBRARY, EXERCISE_MUSCLES } from "../data/exerciseLibrary";

const ALL_MUSCLES = ["Todos", ...EXERCISE_MUSCLES];

export function ExercisesLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMuscle = searchParams.get("muscle");
  const [selectedMuscle, setSelectedMuscle] = useState(
    ALL_MUSCLES.includes(initialMuscle) ? initialMuscle : "Todos"
  );
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filteredExercises = useMemo(() => {
    if (selectedMuscle === "Todos") return EXERCISE_LIBRARY;

    return EXERCISE_LIBRARY.filter(
      (exercise) =>
        exercise.muscle === selectedMuscle ||
        exercise.secondaryMuscles.includes(selectedMuscle)
    );
  }, [selectedMuscle]);

  return (
    <AppShell contentClassName="px-2 pt-2 pb-[calc(var(--bottom-nav-space)+8px)]">
      <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
        <header className="shrink-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]"
          >
            <ArrowLeft size={12} />
            Dashboard
          </button>

          <section className="relative overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_8px_24px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,var(--app-primary-soft),transparent_42%)]" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                <Dumbbell size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  Biblioteca de ejercicios
                </p>
                <h1 className="mt-0.5 text-[18px] font-black leading-none text-[var(--app-text)]">
                  Explora ejercicios por músculo
                </h1>
                <p className="mt-1 text-[10px] font-bold text-[var(--app-muted)]">
                  Fichas compactas para entrenar y reutilizar en Rutinas.
                </p>
              </div>
            </div>
          </section>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2">
            <section className="overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ALL_MUSCLES.map((muscle) => (
                  <button
                    type="button"
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.12em] transition",
                      selectedMuscle === muscle
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_14px_var(--app-glow)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]",
                    ].join(" ")}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between px-0.5">
                <h2 className="text-[13px] font-black text-[var(--app-text)]">
                  {selectedMuscle === "Todos" ? "Todos los ejercicios" : selectedMuscle}
                </h2>
                <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                  {filteredExercises.length} ejercicios
                </span>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onClick={() => setSelectedExercise(exercise)}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {selectedExercise ? (
        <ExerciseDetailSheet
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      ) : null}
    </AppShell>
  );
}
