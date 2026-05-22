import { ChevronRight } from "lucide-react";
import ExerciseMediaFrame from "./ExerciseMediaFrame";

export default function ExerciseCard({ exercise, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-2 text-left shadow-[0_8px_20px_var(--app-glow)] transition active:scale-[0.99]"
    >
      <ExerciseMediaFrame
        key={exercise?.mediaKey || exercise?.id || exercise?.name}
        exercise={exercise}
        className="h-14 w-14 shrink-0"
      />

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
