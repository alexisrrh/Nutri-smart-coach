import { useMemo, useState } from "react";
import { ArrowLeft, Activity, ChevronRight, Dumbbell } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/ui";
import ExerciseCard from "../components/exercises/ExerciseCard";
import ExerciseDetailSheet from "../components/exercises/ExerciseDetailSheet";
import { EXERCISE_LIBRARY, EXERCISE_MUSCLES } from "../data/exerciseLibrary";

const MUSCLE_DESCRIPTIONS = {
  Pecho: "Press, aperturas y fondos",
  Espalda: "Remo, jalones y dominadas",
  Piernas: "Cuádriceps, femoral y básicos",
  Glúteos: "Hip thrust, bisagra y aislantes",
  Hombros: "Press y deltoides",
  Bíceps: "Curl, martillo y variantes",
  Tríceps: "Empuje y extensiones",
  Abdomen: "Core, anti-extensión y control",
};

export function ExercisesLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMuscle = searchParams.get("muscle");
  const [selectedMuscle, setSelectedMuscle] = useState(
    EXERCISE_MUSCLES.includes(initialMuscle) ? initialMuscle : ""
  );
  const [selectedExercise, setSelectedExercise] = useState(null);

  const muscleCards = useMemo(
    () =>
      EXERCISE_MUSCLES.map((muscle) => ({
        muscle,
        count: EXERCISE_LIBRARY.filter((exercise) => exercise.muscle === muscle).length,
        description: MUSCLE_DESCRIPTIONS[muscle] || "Selecciona un grupo muscular",
      })),
    []
  );

  const selectedExercises = useMemo(() => {
    if (!selectedMuscle) return [];

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
            {!selectedMuscle ? (
              <section className="grid gap-1.5">
                {muscleCards.map((item) => (
                  <MuscleCard
                    key={item.muscle}
                    count={item.count}
                    description={item.description}
                    muscle={item.muscle}
                    onClick={() => setSelectedMuscle(item.muscle)}
                  />
                ))}
              </section>
            ) : (
              <section className="flex min-h-0 flex-col gap-2">
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMuscle("")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]"
                  >
                    <ArrowLeft size={12} />
                    Volver
                  </button>
                  <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                    {selectedExercises.length} ejercicios
                  </span>
                </div>

                <section className="relative overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_8px_24px_var(--app-glow)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,var(--app-primary-soft),transparent_42%)]" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                      <Activity size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                        {selectedMuscle}
                      </p>
                      <h2 className="mt-0.5 text-[18px] font-black leading-none text-[var(--app-text)]">
                        {selectedExercises.length} ejercicios
                      </h2>
                      <p className="mt-1 text-[10px] font-bold text-[var(--app-muted)]">
                        {MUSCLE_DESCRIPTIONS[selectedMuscle]}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-1.5">
                  {selectedExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => setSelectedExercise(exercise)}
                    />
                  ))}
                </div>
              </section>
            )}
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

function MuscleCard({ muscle, count, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 text-left shadow-[0_8px_24px_var(--app-glow)] transition active:scale-[0.99]"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
        <Dumbbell size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-black text-[var(--app-text)]">
          {muscle}
        </h3>
        <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
          {count} ejercicios
        </p>
        <p className="mt-0.5 truncate text-[10px] font-bold text-[var(--app-muted)]">
          {description}
        </p>
      </div>

      <ChevronRight size={14} className="shrink-0 text-[var(--app-primary)]" />
    </button>
  );
}
