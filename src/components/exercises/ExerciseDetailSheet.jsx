import { Activity, ChevronRight, Dumbbell, X } from "lucide-react";
import { useState } from "react";

export default function ExerciseDetailSheet({ exercise, onClose }) {
  const [failed, setFailed] = useState(false);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/65 px-2 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-md">
      <section className="max-h-[calc(100dvh-24px)] w-full max-w-[430px] overflow-hidden rounded-t-[1.25rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-18px_48px_rgba(0,0,0,0.42)]">
        <div className="flex max-h-[calc(100dvh-24px)] flex-col">
          <header className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--app-border)] px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                Ficha del ejercicio
              </p>
              <h2 className="mt-0.5 truncate text-[18px] font-black leading-none text-[var(--app-text)]">
                {exercise.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
              aria-label="Cerrar ficha"
            >
              <X size={14} />
            </button>
          </header>

          <div className="min-h-0 overflow-y-auto px-3 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="relative grid h-[150px] place-items-center overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)]">
              {!failed ? (
                <img
                  src={exercise.gif || exercise.image}
                  alt={exercise.name}
                  onError={() => setFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_0%,var(--app-primary-soft),transparent_54%),var(--app-surface)] text-[var(--app-primary)]">
                  <Dumbbell size={32} />
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <InfoPill>{exercise.muscle}</InfoPill>
              <InfoPill>{exercise.secondaryMuscles.join(" · ") || "Sin secundarios"}</InfoPill>
              <InfoPill>{exercise.equipment}</InfoPill>
              <InfoPill>{exercise.difficulty}</InfoPill>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <StatTile label="Series" value={exercise.sets} />
              <StatTile label="Reps" value={exercise.reps} />
              <StatTile label="Descanso" value={exercise.rest} />
            </div>

            <section className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Descripción
              </p>
              <p className="mt-1 text-[12px] leading-5 text-[var(--app-text)]">
                {exercise.description}
              </p>
            </section>

            <section className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Tips
              </p>
              <div className="mt-1 grid gap-1">
                {exercise.tips?.map((tip) => (
                  <MiniRow key={tip} icon={<Activity size={11} />} text={tip} />
                ))}
              </div>
            </section>

            <section className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Errores comunes
              </p>
              <div className="mt-1 grid gap-1">
                {exercise.mistakes?.map((mistake) => (
                  <MiniRow key={mistake} icon={<ChevronRight size={11} />} text={mistake} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPill({ children }) {
  return (
    <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
      {children}
    </span>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-center">
      <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-black text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function MiniRow({ icon, text }) {
  return (
    <div className="flex items-start gap-2 rounded-[0.8rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5">
      <span className="mt-0.5 text-[var(--app-primary)]">{icon}</span>
      <p className="text-[11px] leading-4 text-[var(--app-muted)]">{text}</p>
    </div>
  );
}

