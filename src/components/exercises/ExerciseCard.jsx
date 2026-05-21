import { ChevronRight, Dumbbell } from "lucide-react";
import { useState } from "react";

export default function ExerciseCard({ exercise, onClick }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-2 text-left shadow-[0_8px_20px_var(--app-glow)] transition active:scale-[0.99]"
    >
      <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-surface)]">
        {!failed ? (
          <img
            src={exercise.gif || exercise.image}
            alt={exercise.name}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_0%,var(--app-primary-soft),transparent_55%),var(--app-surface)] text-[var(--app-primary)]">
            <Dumbbell size={24} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
          {exercise.muscle}
        </p>
        <h3 className="truncate text-[13px] font-black text-[var(--app-text)]">
          {exercise.name}
        </h3>
        <p className="mt-0.5 truncate text-[9px] font-bold text-[var(--app-muted)]">
          {exercise.equipment}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-black uppercase tracking-[0.1em] text-[var(--app-muted)]">
          {exercise.difficulty}
        </p>
      </div>

      <ChevronRight size={14} className="shrink-0 text-[var(--app-primary)]" />
    </button>
  );
}

