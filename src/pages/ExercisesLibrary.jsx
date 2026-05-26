import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Dumbbell } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/ui";
import ExerciseCard from "../components/exercises/ExerciseCard";
import ExerciseDetailSheet from "../components/exercises/ExerciseDetailSheet";
import { EXERCISE_LIBRARY, EXERCISE_MUSCLES } from "../data/exerciseLibrary";
import {
  preloadExercise,
  preloadExercises,
} from "../services/exerciseMediaService";
import {
  preloadCriticalExerciseMedia,
} from "../services/exercisePreloadService";

const MUSCLE_ICONS = {
  Pecho: "/icons/biblioteca/pecho.png",
  Espalda: "/icons/biblioteca/espalda.png",
  Piernas: "/icons/biblioteca/piernas.png",
  Glúteos: "/icons/biblioteca/gluteo.png",
  Hombros: "/icons/biblioteca/hombros.png",
  Bíceps: "/icons/biblioteca/biceps.png",
  Tríceps: "/icons/biblioteca/triceps.png",
  Abdomen: "/icons/biblioteca/abdomen.png",
};

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
  const recommendedMuscle = EXERCISE_MUSCLES.includes(initialMuscle) ? initialMuscle : "";
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);

  const muscleCards = useMemo(() => {
    const baseCards = EXERCISE_MUSCLES.map((muscle) => ({
      muscle,
      description: MUSCLE_DESCRIPTIONS[muscle] || "Selecciona un grupo muscular",
    }));

    if (!recommendedMuscle) {
      return baseCards;
    }

    const recommended = baseCards.find((item) => item.muscle === recommendedMuscle);
    if (!recommended) {
      return baseCards;
    }

    return [recommended, ...baseCards.filter((item) => item.muscle !== recommendedMuscle)];
  }, [recommendedMuscle]);

  const selectedExercises = useMemo(() => {
    if (!selectedMuscle) return [];

    return EXERCISE_LIBRARY.filter(
      (exercise) => exercise.muscle === selectedMuscle
    );
  }, [selectedMuscle]);

  useEffect(() => {
    preloadCriticalExerciseMedia();
  }, []);

  useEffect(() => {
    if (!selectedExercises.length) return;

    preloadExercises(selectedExercises.slice(0, 4));
  }, [selectedExercises]);

  useEffect(() => {
    if (!selectedExercise) return;

    preloadExercise(selectedExercise);
  }, [selectedExercise]);

  return (
    <AppShell contentClassName="px-2 pt-2 pb-[calc(var(--bottom-nav-space)+120px)]">
      <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,rgba(0,196,255,0.04),transparent_28%),radial-gradient(circle_at_20%_18%,rgba(60,255,182,0.03),transparent_22%)]">
        <header className="shrink-0">
          {!selectedMuscle ? (
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]"
            >
              <ArrowLeft size={12} />
              Dashboard
            </button>
          ) : null}

          {!selectedMuscle ? (
            <section className="relative overflow-hidden rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_86%,#08101a),var(--app-card))] px-3 py-4 shadow-[0_12px_30px_var(--app-glow)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,196,255,0.16),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(60,255,182,0.14),transparent_28%),radial-gradient(circle_at_50%_-10%,rgba(0,196,255,0.08),transparent_58%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.03)_48%,transparent_100%)] opacity-35" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:38px_38px] opacity-12" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.58)] px-2 py-0.5 text-[8px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                    Biblioteca fitness
                  </span>
                  <h1 className="mt-1.5 max-w-[15rem] text-[24px] font-semibold leading-[0.96] text-[var(--app-text)] sm:text-[28px]">
                    Entrena por zona muscular
                  </h1>
                  <p className="mt-1.5 max-w-[16rem] text-[11px] font-medium leading-4 text-[var(--app-muted)]">
                    Explora ejercicios visuales y mejora tu técnica.
                  </p>
                </div>

                <div className="relative -mr-3 -mt-1 shrink-0 opacity-70">
                  <div className="pointer-events-none absolute inset-0 " />
                  <MediaIcon
                    src="/icons/biblioteca/fitness.png"
                    alt="Fitness"
                    className="relative grid h-[112px] w-[112px] place-items-center"
                  />
                </div>
              </div>
            </section>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedMuscle("")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]"
            >
              <ArrowLeft size={12} />
              Volver
            </button>
          )}
        </header>

        <main className={`min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${selectedMuscle ? "pb-[calc(var(--bottom-nav-space)+120px)]" : "pb-1"}`}>
          <div className="space-y-2">
            {!selectedMuscle ? (
              <>
                <section className="relative overflow-hidden rounded-[1.1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_88%,#08131b),var(--app-card))] p-3 shadow-[0_12px_30px_var(--app-glow)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,196,255,0.16),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(60,255,182,0.12),transparent_30%)]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_22%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2.5 py-1 text-[7px] font-semibold tracking-[0.08em] text-[var(--app-primary)]">
                        Mis rutinas
                      </span>
                      <h2 className="mt-2 text-[17px] font-semibold leading-[1.02] text-[var(--app-text)]">
                        Crea tu rutina
                      </h2>
                      <p className="mt-1.5 max-w-[18rem] text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                        Selecciona ejercicios de la biblioteca y crea un entrenamiento a tu medida.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/crear-rutina")}
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[0.85rem] bg-[var(--app-primary)] px-3 text-[9px] font-semibold tracking-[0.02em] text-[var(--app-surface)] shadow-[0_8px_14px_rgba(0,196,255,0.12)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Crear rutina
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/rutinas")}
                      className="h-9 rounded-[0.85rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.44)] px-3.5 text-[9px] font-semibold tracking-[0.02em] text-[var(--app-primary)] transition duration-150 hover:bg-[rgba(8,16,26,0.6)] active:scale-[0.98]"
                    >
                      Ver mis rutinas
                    </button>
                  </div>
                </section>

                <section data-muscle-grid className="grid grid-cols-1 gap-2">
                  {muscleCards.map((item, index) => (
                    <MuscleCard
                      key={item.muscle}
                      description={item.description}
                      featured={item.muscle === recommendedMuscle && index === 0}
                      muscle={item.muscle}
                      onClick={() => setSelectedMuscle(item.muscle)}
                    />
                  ))}
                </section>
              </>
            ) : (
              <section className="flex min-h-0 flex-col gap-1.5">
                <section className="relative overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_8px_24px_var(--app-glow)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,var(--app-primary-soft),transparent_42%)]" />
                  <div className="relative z-10 flex items-center gap-3">
                    <MediaIcon
                      src={MUSCLE_ICONS[selectedMuscle] || "/icons/biblioteca/fitness.png"}
                      alt={selectedMuscle}
                      className="grid h-[60px] w-[60px] shrink-0 place-items-center"
                    />
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                        {selectedMuscle}
                      </p>
                      <h2 className="mt-0.5 text-[18px] font-black leading-none text-[var(--app-text)]">
                        Ejercicios visuales
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
          key={selectedExercise.mediaKey || selectedExercise.id || selectedExercise.name}
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      ) : null}
    </AppShell>
  );
}

function MuscleCard({ muscle, description, featured = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex min-h-[80px] w-full items-center gap-3 overflow-hidden rounded-[1.1rem] border text-left shadow-[0_8px_24px_var(--app-glow)] transition duration-300 ease-out hover:shadow-[0_0_0_1px_rgba(0,196,255,0.14),0_8px_24px_var(--app-glow)] active:opacity-90",
        featured
          ? "border-[color:color-mix(in_srgb,var(--app-primary)_32%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary-soft)_52%,var(--app-card)),var(--app-card))]"
          : "border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_92%,#09101a),var(--app-card))]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(0,196,255,0.12),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(60,255,182,0.12),transparent_28%),linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
      {featured ? (
        <span className="absolute left-3 top-2 inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[var(--app-surface)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
          Recomendado hoy
        </span>
      ) : null}

      <MediaIcon
        src={MUSCLE_ICONS[muscle] || "/icons/biblioteca/fitness.png"}
        alt={muscle}
        className={[
          "relative ml-2 grid h-[75px] w-[75px] shrink-0 place-items-center ",
          featured
            ? "border-[color:color-mix(in_srgb,var(--app-primary)_32%,var(--app-border))] bg-[radial-gradient(circle_at_35%_30%,rgba(60,255,182,0.24),rgba(0,196,255,0.12)),var(--app-primary-soft)]"
            : "border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[radial-gradient(circle_at_35%_30%,rgba(0,196,255,0.18),rgba(60,255,182,0.1)),var(--app-surface)]",
        ].join(" ")}
      />

      <div className="relative z-10 min-w-0 flex-1">
        <h3 className="text-[15px] font-black text-[var(--app-text)]">
          {muscle}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-[10px] font-bold leading-4 text-[var(--app-muted)]">
          {description}
        </p>
      </div>

      <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]">
        <ChevronRight size={14} />
      </span>
    </button>
  );
}

function MediaIcon({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={className}>
        <Dumbbell size={20} />
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
